/**
 * 사용자 활동 로깅 유틸리티
 * 다른 JavaScript 파일에서 사용자 활동을 로그로 기록할 때 사용
 */

// 현재 user_id를 가져오는 함수
function getCurrentUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    
    // URL 파라미터에 user_id가 없으면 null 반환 (페이지에서 리다이렉트 처리)
    if (!userId) {
        console.warn('URL에서 user_id를 찾을 수 없습니다.');
        return null;
    }
    
    return userId;
}

class ActivityLogger {
    constructor() {
        this.apiUrl = '/django/api/user-logs/';
        this.userId = getCurrentUserId(); // 기관별 사용자 ID 가져오기
        this.isEnabled = this.userId ? true : false; // user_id가 없으면 로깅 비활성화
        
        if (!this.userId) {
            console.warn('user_id가 없어 ActivityLogger를 비활성화합니다.');
        }
    }

    /**
     * 활동 로그 기록
     * @param {string} actionType - 액션 타입 (agent_create, agent_delete, tool_register, tool_delete, chat_query, session_create, session_delete)
     * @param {string} message - 로그 메시지
     * @param {string} level - 로그 레벨 (INFO, WARNING, ERROR, DEBUG)
     * @param {object} details - 추가 세부 정보
     */
    async logActivity(actionType, message, level = 'INFO', details = {}) {
        if (!this.isEnabled) {
            console.log('Activity logging is disabled');
            return;
        }

        try {
            const logData = {
                action_type: actionType,
                message: message,
                level: level,
                details: details,
                user_id: this.userId
            };

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(logData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Activity logged:', result);
            return result;

        } catch (error) {
            console.error('Failed to log activity:', error);
            // 로깅 실패 시에도 원래 기능은 계속 동작하도록 에러를 다시 throw하지 않음
        }
    }

    /**
     * 에이전트 생성 로그
     */
    async logAgentCreate(agentName, details = {}) {
        return this.logActivity(
            'agent_create',
            `"${agentName}" 에이전트를 생성했습니다.`,
            'INFO',
            { agent_name: agentName, ...details }
        );
    }

    /**
     * 에이전트 삭제 로그
     */
    async logAgentDelete(agentName, details = {}) {
        return this.logActivity(
            'agent_delete',
            `"${agentName}" 에이전트를 삭제했습니다.`,
            'INFO',
            { agent_name: agentName, ...details }
        );
    }

    /**
     * 도구 등록 로그
     */
    async logToolRegister(toolName, details = {}) {
        return this.logActivity(
            'tool_register',
            `"${toolName}" 도구를 등록했습니다.`,
            'INFO',
            { tool_name: toolName, ...details }
        );
    }

    /**
     * 도구 삭제 로그
     */
    async logToolDelete(toolName, details = {}) {
        return this.logActivity(
            'tool_delete',
            `"${toolName}" 도구를 삭제했습니다.`,
            'INFO',
            { tool_name: toolName, ...details }
        );
    }

    /**
     * 자연어 질의 로그
     */
    async logChatQuery(query, details = {}) {
        return this.logActivity(
            'chat_query',
            `자연어 질의: "${query.length > 100 ? query.substring(0, 100) + '...' : query}"`,
            'INFO',
            { query: query, query_length: query.length, ...details }
        );
    }

    /**
     * AI 응답 로그
     * @param {string} response - 응답 메시지
     * @param {object|string} details - 추가 세부 정보 또는 에러 타입
     */
    async logChatResponse(response, details = {}) {
        // details가 문자열인 경우 에러 타입으로 처리
        let actionType = 'chat_response';
        let level = 'INFO';
        let message = `AI 응답 생성됨 (길이: ${response.length}자)`;
        let logDetails = {};
        
        if (typeof details === 'string') {
            // 에러 타입별 처리 (문자열로 전달된 경우)
            const errorType = details;
            level = 'ERROR';
            
            switch (errorType) {
                case 'orchestrate_error':
                    actionType = 'orchestrate_error';
                    message = `Orchestrate API 연결 실패: ${response}`;
                    break;
                case 'agent_error':
                    actionType = 'agent_error';
                    message = `Agent 통신 실패: ${response}`;
                    break;
                case 'general_error':
                    actionType = 'general_error';
                    message = `AI 응답 생성 실패: ${response}`;
                    break;
                case 'session_error':
                    actionType = 'session_error';
                    message = `세션 처리 실패: ${response}`;
                    break;
                case 'request_error':
                    actionType = 'request_error';
                    message = `HTTP 요청 실패: ${response}`;
                    break;
                default:
                    actionType = 'system_error';
                    message = `시스템 오류: ${response}`;
                    break;
            }
            
            logDetails = { error_type: errorType };
        } else if (details && details.response_type) {
            // 객체로 전달되고 response_type이 있는 경우 (에러 처리)
            const errorType = details.response_type;
            level = 'ERROR';
            
            switch (errorType) {
                case 'orchestrate_error':
                    actionType = 'orchestrate_error';
                    message = `Orchestrate API 연결 실패: ${response}`;
                    break;
                case 'agent_error':
                    actionType = 'agent_error';
                    message = `Agent 통신 실패: ${response}`;
                    break;
                case 'general_error':
                    actionType = 'general_error';
                    message = `AI 응답 생성 실패: ${response}`;
                    break;
                case 'session_error':
                    actionType = 'session_error';
                    message = `세션 처리 실패: ${response}`;
                    break;
                case 'request_error':
                    actionType = 'request_error';
                    message = `HTTP 요청 실패: ${response}`;
                    break;
                default:
                    actionType = 'system_error';
                    message = `시스템 오류: ${response}`;
                    break;
            }
            
            logDetails = { 
                error_type: errorType,
                ...details 
            };
        } else {
            // 정상 응답인 경우
            logDetails = { 
                response: response.length > 1000 ? response.substring(0, 1000) + '...' : response,
                response_length: response.length,
                full_response: response,
                ...details 
            };
        }

        return this.logActivity(
            actionType,
            message,
            level,
            logDetails
        );
    }

    /**
     * 채팅 세션 생성 로그
     */
    async logSessionCreate(sessionId, details = {}) {
        return this.logActivity(
            'session_create',
            '새로운 채팅 세션을 시작했습니다.',
            'INFO',
            { session_id: sessionId, ...details }
        );
    }

    /**
     * 채팅 세션 삭제 로그
     */
    async logSessionDelete(sessionId, sessionTitle, details = {}) {
        return this.logActivity(
            'session_delete',
            `"${sessionTitle || '채팅 세션'}"을 삭제했습니다.`,
            'INFO',
            { session_id: sessionId, session_title: sessionTitle, ...details }
        );
    }

    /**
     * 채팅 세션 이름 변경 로그
     */
    async logSessionRename(sessionId, oldTitle, newTitle, details = {}) {
        return this.logActivity(
            'session_rename',
            `채팅방 이름을 "${oldTitle || '새 채팅'}"에서 "${newTitle}"로 변경했습니다.`,
            'INFO',
            { session_id: sessionId, old_title: oldTitle, new_title: newTitle, ...details }
        );
    }

    /**
     * 오류 로그
     */
    async logError(message, error, details = {}) {
        return this.logActivity(
            'system',
            message,
            'ERROR',
            { 
                error_message: error.message,
                error_stack: error.stack,
                ...details 
            }
        );
    }

    /**
     * CSRF 토큰 가져오기
     */
    getCsrfToken() {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            return csrfInput.value;
        }
        
        const csrfCookie = document.cookie.split(';')
            .find(cookie => cookie.trim().startsWith('csrftoken='));
        if (csrfCookie) {
            return csrfCookie.split('=')[1];
        }
        
        return '';
    }

    /**
     * 로깅 활성화/비활성화
     */
    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}

// 전역 인스턴스 생성
window.activityLogger = new ActivityLogger();

// 편의 함수들을 전역으로 노출
window.logAgentCreate = (name, details) => window.activityLogger.logAgentCreate(name, details);
window.logAgentDelete = (name, details) => window.activityLogger.logAgentDelete(name, details);
window.logToolRegister = (name, details) => window.activityLogger.logToolRegister(name, details);
window.logToolDelete = (name, details) => window.activityLogger.logToolDelete(name, details);
window.logChatQuery = (query, details) => window.activityLogger.logChatQuery(query, details);
window.logChatResponse = (response, details) => window.activityLogger.logChatResponse(response, details);
window.logSessionCreate = (id, details) => window.activityLogger.logSessionCreate(id, details);
window.logSessionDelete = (id, title, details) => window.activityLogger.logSessionDelete(id, title, details);
window.logSessionRename = (id, oldTitle, newTitle, details) => window.activityLogger.logSessionRename(id, oldTitle, newTitle, details);
window.logError = (message, error, details) => window.activityLogger.logError(message, error, details);

console.log('Activity Logger initialized');
