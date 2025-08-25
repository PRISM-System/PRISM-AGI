/**
 * 사용자 활동 로깅 유틸리티
 * 다른 JavaScript 파일에서 사용자 활동을 로그로 기록할 때 사용
 */

class ActivityLogger {
    constructor() {
        this.apiUrl = '/api/user-logs/';
        this.userId = 'user_1234'; // 테스트용 고정 사용자
        this.isEnabled = true; // 로깅 활성화 여부
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
     */
    async logChatResponse(response, details = {}) {
        return this.logActivity(
            'chat_response',
            `AI 응답 생성됨 (길이: ${response.length}자)`,
            'INFO',
            { 
                response: response.length > 1000 ? response.substring(0, 1000) + '...' : response,
                response_length: response.length,
                full_response: response,
                ...details 
            }
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
window.logError = (message, error, details) => window.activityLogger.logError(message, error, details);

console.log('🎯 Activity Logger initialized');
