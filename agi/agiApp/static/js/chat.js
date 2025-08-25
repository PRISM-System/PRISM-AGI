// ===============================
// 환경 설정(필요에 맞게 바꿔 사용)
// ===============================
console.log('🔧 chat.js 파일 로드됨');

const API_BASE = 'http://127.0.0.1:8000'; // 로컬 프록시 서버
const USE_PROXY = true;                   // 항상 프록시 사용 (로컬 API 제거됨)
const USE_GET_FOR_LIST = false;           // true면 GET으로 목록 우래(프리플라이트 줄이기)
const USE_CREDENTIALS = false;            // 세션/쿠키 사용 시 true + 서버 CORS allow_credentials 필요
const ACCESS_TOKEN_KEY = 'access_token';  // 로컬스토리지 토큰 키 이름

// 선택된 에이전트 관리
let selectedAgent = null;                 // 현재 선택된 에이전트

// 토큰 가져오기(필요 없으면 비워 둬도 됨)
function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
    } catch (_) {
        return '';
    }
}

// ===============================
// 채팅 세션 관리
// ===============================
class ChatSessionManager {
    constructor() {
        this.currentSessionId = null;
        this.userId = 'user_1234'; // 테스트용 고정 사용자
        this.sessions = [];
        
        // 초기 환영 메시지 표시
        this.showWelcomeMessage();
        
        this.loadSessions();
        this.initEventListeners();
    }

    initEventListeners() {
        // 새 채팅 버튼
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.createNewSession());
        }
    }

    async loadSessions() {
        try {
            const loadingEl = document.getElementById('loadingSessions');
            if (loadingEl) loadingEl.style.display = 'flex';

            const response = await fetch(`${API_BASE}/api/chat/sessions/?user_id=${this.userId}`);
            const sessions = await response.json();
            
            this.sessions = sessions;
            this.renderSessions();
        } catch (error) {
            console.error('채팅 세션 로드 실패:', error);
        } finally {
            const loadingEl = document.getElementById('loadingSessions');
            if (loadingEl) loadingEl.style.display = 'none';
        }
    }

    renderSessions() {
        const sessionsList = document.getElementById('chatSessionsList');
        if (!sessionsList) return;

        // 기존 세션 아이템들 제거 (로딩 요소 제외)
        const existingSessions = sessionsList.querySelectorAll('.chat-session-item');
        existingSessions.forEach(item => item.remove());

        this.sessions.forEach(session => {
            const sessionElement = this.createSessionElement(session);
            sessionsList.appendChild(sessionElement);
        });
    }

    createSessionElement(session) {
        const div = document.createElement('div');
        div.className = `chat-item chat-session-item ${session.id === this.currentSessionId ? 'active' : ''}`;
        div.dataset.sessionId = session.id;
        
        const lastUpdate = new Date(session.updated_at);
        const timeAgo = this.getTimeAgo(lastUpdate);
        
        div.innerHTML = `
            <div class="session-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                </svg>
                <div class="session-info">
                    <span class="session-title">${session.title || '새 채팅'}</span>
                    <span class="session-time">${timeAgo}</span>
                </div>
            </div>
            <button class="session-delete-btn" title="채팅 삭제">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
            </button>
        `;
        
        // 세션 클릭 이벤트 (삭제 버튼 제외)
        div.addEventListener('click', (e) => {
            if (!e.target.closest('.session-delete-btn')) {
                window.location.href = `/?session=${session.id}`;
            }
        });
        
        // 삭제 버튼 이벤트
        const deleteBtn = div.querySelector('.session-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSession(session.id, session.title);
        });
        
        return div;
    }

    async createNewSession() {
        try {
            const response = await fetch(`${API_BASE}/api/chat/sessions/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    title: ''
                })
            });

            const newSession = await response.json();
            
            // 현재 세션 설정
            this.currentSessionId = newSession.id;
            
            // URL 업데이트
            window.history.pushState({}, '', `/?session=${newSession.id}`);
            
            // 사용자 활동 로그 기록
            if (window.logSessionCreate) {
                window.logSessionCreate(newSession.id, {
                    title: newSession.title || '새 채팅',
                    user_id: this.userId
                });
            }
            
            // 채팅 화면 초기화
            this.clearChatArea();
            
            // 세션 목록 새로고침
            await this.loadSessions();
            
            console.log('새 채팅 세션 생성됨:', newSession.id);
        } catch (error) {
            console.error('새 채팅 세션 생성 실패:', error);
        }
    }

    async loadSession(sessionId) {
        try {
            // 현재 세션 설정
            this.currentSessionId = sessionId;
            
            // URL 업데이트 (클릭으로 오지 않은 경우만)
            const currentUrl = new URL(window.location);
            if (currentUrl.searchParams.get('session') !== sessionId) {
                window.history.pushState({}, '', `/?session=${sessionId}`);
            }
            
            // UI 업데이트
            this.updateActiveSession();
            
            // 메시지 로드
            const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/messages/`);
            const data = await response.json();
            
            // 채팅 화면에 메시지들 표시
            this.displayMessages(data.messages);
            
            console.log('채팅 세션 로드됨:', sessionId);
        } catch (error) {
            console.error('채팅 세션 로드 실패:', error);
        }
    }

    updateActiveSession() {
        // 모든 세션 아이템에서 active 클래스 제거
        const sessionItems = document.querySelectorAll('.chat-session-item');
        sessionItems.forEach(item => item.classList.remove('active'));
        
        // 현재 세션에 active 클래스 추가
        const currentItem = document.querySelector(`[data-session-id="${this.currentSessionId}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
        }
    }

    clearChatArea() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            this.showWelcomeMessage();
        }
    }

    displayMessages(messages) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // 항상 초기화하고 시작
        chatMessages.innerHTML = '';

        // 메시지가 있으면 메시지들 표시
        if (messages && messages.length > 0) {
            chatMessages.classList.remove('empty');
            
            messages.forEach(message => {
                const messageElement = this.createChatMessageElement(message.role, message.content);
                chatMessages.appendChild(messageElement);
            });
            
            // 스크롤을 맨 아래로
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 하단 입력창이 활성화되도록 이벤트를 발생시킴
            this.ensureBottomInputActive();
        } else {
            // 메시지가 없으면 항상 환영 메시지 표시
            this.showWelcomeMessage();
        }
    }

    createChatMessageElement(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${role}-avatar`;
        avatarDiv.textContent = role === 'user' ? 'U' : 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        return messageDiv;
    }

    showWelcomeMessage() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        chatMessages.classList.add('empty');
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <h2 class="welcome-title">무엇을 도와드릴까요?</h2>
                
                <div class="welcome-input-area">
                    <div class="chat-input-container">
                        <textarea 
                            class="chat-input" 
                            id="chatInput" 
                            placeholder="PRISM-AGI Assistant에게 무엇이든 물어보세요."
                            rows="1"
                        ></textarea>
                        <button class="send-button" id="sendButton">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // 새로 생성된 입력창과 버튼에 이벤트 리스너 재등록
        this.reinitializeInputs();
    }

    reinitializeInputs() {
        // 새로 생성된 환영 메시지의 입력창과 버튼에 이벤트 리스너 등록
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        
        if (chatInput && sendButton) {
            // 전송 버튼 클릭 이벤트
            sendButton.addEventListener('click', () => {
                if (window.sendMessage) {
                    window.sendMessage();
                } else {
                    console.error('sendMessage not found in window');
                }
            });
            
            // 입력창 Enter 키 이벤트
            chatInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (window.sendMessage) {
                        window.sendMessage();
                    } else {
                        console.error('sendMessage not found in window');
                    }
                }
            });
            
            // 입력창 자동 높이 조절
            chatInput.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
            
            // 입력창 포커스
            chatInput.focus();
        }
        
        // 커스텀 이벤트도 발생시켜서 다른 곳에서도 반응할 수 있도록
        window.dispatchEvent(new CustomEvent('chatInputsRecreated'));
    }

    ensureBottomInputActive() {
        // 하단 입력창이 제대로 활성화되도록 보장
        const bottomChatInput = document.getElementById('bottomChatInput');
        const bottomSendButton = document.getElementById('bottomSendButton');
        
        console.log('ensureBottomInputActive called:', {
            bottomChatInput: !!bottomChatInput,
            bottomSendButton: !!bottomSendButton,
            sendMessage: typeof window.sendMessage
        });
        
        if (bottomChatInput && bottomSendButton) {
            // 기존 이벤트 리스너가 있는지 확인하고 제거
            if (!bottomSendButton.hasAttribute('data-listener-added')) {
                // 전송 버튼 클릭 이벤트
                const sendClickHandler = () => {
                    console.log('Bottom send button clicked');
                    if (window.sendMessage) {
                        window.sendMessage();
                    } else {
                        console.error('sendMessage not found in window');
                    }
                };
                bottomSendButton.addEventListener('click', sendClickHandler);
                bottomSendButton.setAttribute('data-listener-added', 'true');
            }
            
            if (!bottomChatInput.hasAttribute('data-listener-added')) {
                // Enter 키 이벤트
                const keyPressHandler = function (e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        console.log('Bottom input Enter pressed');
                        if (window.sendMessage) {
                            window.sendMessage();
                        } else {
                            console.error('sendMessage not found in window');
                        }
                    }
                };
                bottomChatInput.addEventListener('keypress', keyPressHandler);
                
                // 입력창 자동 높이 조절
                const inputHandler = function () {
                    this.style.height = 'auto';
                    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
                };
                bottomChatInput.addEventListener('input', inputHandler);
                
                bottomChatInput.setAttribute('data-listener-added', 'true');
            }
            
            // 입력창 포커스
            bottomChatInput.focus();
        } else {
            console.error('Bottom input elements not found:', {
                bottomChatInput: !!bottomChatInput,
                bottomSendButton: !!bottomSendButton
            });
        }
    }

    async saveMessage(content, role, additionalMetadata = {}) {
        if (!this.currentSessionId) {
            await this.createNewSession();
        }

        try {
            // 기본 메타데이터와 추가 메타데이터 병합
            const metadata = {
                timestamp: new Date().toISOString(),
                ...additionalMetadata
            };

            const response = await fetch(`${API_BASE}/api/chat/sessions/${this.currentSessionId}/messages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: role,
                    content: content,
                    metadata: metadata
                })
            });

            const savedMessage = await response.json();
            
            // 세션 제목이 업데이트되었다면 UI도 업데이트
            if (savedMessage.session_title) {
                await this.loadSessions();
            }
            
            console.log('💾 메시지 저장 완료:', {
                role: role,
                content_length: content.length,
                metadata: metadata
            });
            
            return savedMessage;
        } catch (error) {
            console.error('메시지 저장 실패:', error);
            return null;
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}일 전`;
        if (hours > 0) return `${hours}시간 전`;
        if (minutes > 0) return `${minutes}분 전`;
        return '방금 전';
    }

    async deleteSession(sessionId, sessionTitle) {
        // 삭제 확인
        const confirmed = confirm(`"${sessionTitle || '새 채팅'}" 채팅을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/api/chat/sessions/${sessionId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                // 사용자 활동 로그 기록
                if (window.logSessionDelete) {
                    window.logSessionDelete(sessionId, sessionTitle, {
                        user_id: this.userId,
                        was_current_session: this.currentSessionId === sessionId
                    });
                }

                // 현재 세션이 삭제된 경우 초기화
                if (this.currentSessionId === sessionId) {
                    this.currentSessionId = null;
                    this.clearChatArea();
                }

                // 세션 목록 새로고침
                await this.loadSessions();
                
                console.log('채팅 세션 삭제됨:', sessionId);
            } else {
                throw new Error('삭제 요청 실패');
            }
        } catch (error) {
            console.error('채팅 세션 삭제 실패:', error);
            alert('채팅 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    }
}

// 전역 채팅 세션 매니저 인스턴스
let chatSessionManager;

// ===============================
// 공정 진행 상태 관리
// ===============================
class ProcessManager {
    constructor() {
        this.processSidebar = document.getElementById('processSidebar');
        this.processStatus = document.getElementById('processStatus');
        this.processSteps = document.getElementById('processSteps');
        this.processDetails = document.getElementById('processDetails');
        this.processCloseBtn = document.getElementById('processCloseBtn');
        this.resizeHandle = document.querySelector('.resize-handle');
        this.chatLayout = document.querySelector('.chat-layout');
        
        // 에이전트 상태 관리
        this.agentElements = {
            prediction: document.getElementById('predictionAgent'),
            monitoring: document.getElementById('monitoringAgent'),
            control: document.getElementById('controlAgent')
        };
        
        this.currentSteps = [];
        this.currentStepIndex = 0;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        
        this.initEventListeners();
        this.initializeAgentStatus();
    }
    
    initEventListeners() {
        console.log('Initializing event listeners');
        console.log('Process close button:', this.processCloseBtn);
        console.log('Resize handle:', this.resizeHandle);
        
        if (this.processCloseBtn) {
            this.processCloseBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                this.hideSidebar();
            });
        }
        
        // 크기 조절 핸들 이벤트
        if (this.resizeHandle) {
            this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        }
        
        // 전역 마우스 이벤트
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
    }
    
    startResize(e) {
        this.isResizing = true;
        this.startX = e.clientX;
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.processSidebar).width, 10);
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
    }
    
    handleResize(e) {
        if (!this.isResizing) return;
        
        const dx = this.startX - e.clientX; // 좌측으로 드래그할 때 양수
        const newWidth = this.startWidth + dx;
        
        // 최소/최대 너비 제한
        const minWidth = 400;  // 최소 너비 증가
        const maxWidth = window.innerWidth * 0.9;  // 최대 너비도 증가
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            this.processSidebar.style.width = newWidth + 'px';
        }
    }
    
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            document.body.style.cursor = '';
        }
    }
    
    showSidebar() {
        console.log('Showing sidebar');
        this.processSidebar.classList.add('active');
        this.chatLayout.classList.add('process-active');
        // 스타일 초기화 (CSS 클래스가 적용되도록)
        this.processSidebar.style.width = '';
    }
    
    hideSidebar() {
        console.log('Hiding sidebar');
        this.processSidebar.classList.remove('active');
        this.chatLayout.classList.remove('process-active');
        // 강제로 width를 0으로 설정
        this.processSidebar.style.width = '0px';
    }
    
    updateStatus(text, type = 'processing') {
        const indicator = this.processStatus.querySelector('.status-indicator');
        const statusText = this.processStatus.querySelector('span');
        
        indicator.className = `status-indicator ${type}`;
        statusText.textContent = text;
    }
    
    initializeSteps(query) {
        // 제조 공정 관련 키워드 감지하여 적절한 단계 설정
        let steps = [];
        
        if (query.includes('품질') || query.includes('검사') || query.includes('불량')) {
            steps = [
                { title: '품질 데이터 분석', description: '품질 관리 시스템에서 데이터 수집' },
                { title: '불량 패턴 감지', description: '머신러닝 모델로 불량 패턴 분석' },
                { title: '원인 분석', description: '공정 파라미터와 품질 결과 상관관계 분석' },
                { title: '개선안 도출', description: '최적화된 공정 조건 제안' },
                { title: '보고서 생성', description: '종합 분석 결과 정리' }
            ];
        } else if (query.includes('생산') || query.includes('스케줄') || query.includes('계획')) {
            steps = [
                { title: '생산 현황 조회', description: '실시간 생산 데이터 수집' },
                { title: '자원 가용성 확인', description: '설비 및 인력 현황 분석' },
                { title: '수요 예측 분석', description: 'AI 모델로 수요량 예측' },
                { title: '최적 스케줄 계산', description: '제약 조건을 고려한 스케줄링' },
                { title: '실행 계획 수립', description: '상세 작업 지시서 생성' }
            ];
        } else if (query.includes('설비') || query.includes('장비') || query.includes('유지보수')) {
            steps = [
                { title: '설비 상태 진단', description: '센서 데이터로 설비 상태 확인' },
                { title: '예측 정비 분석', description: '고장 예측 모델 실행' },
                { title: '부품 수명 평가', description: '핵심 부품 잔여 수명 계산' },
                { title: '정비 계획 수립', description: '예방 정비 스케줄 최적화' },
                { title: '비용 효과 분석', description: '정비 비용 대비 효과 평가' }
            ];
        } else {
            // 기본 AI 처리 단계
            steps = [
                { title: '요청 분석', description: '사용자 질문 의도 파악' },
                { title: '데이터 수집', description: '관련 정보 및 데이터 검색' },
                { title: 'AI 모델 실행', description: '최적 AI 모델로 분석 처리' },
                { title: '결과 검증', description: '생성된 답변의 정확성 검토' },
                { title: '응답 생성', description: '사용자 친화적 형태로 결과 정리' }
            ];
        }
        
        this.currentSteps = steps;
        this.currentStepIndex = 0;
        
        // 에이전트 활성화
        this.activateAgents();
        
        this.renderSteps();
        this.updateDetails(query);
    }
    
    renderSteps() {
        this.processSteps.innerHTML = '';
        
        // 가로 진행바 생성
        const progressBar = document.createElement('div');
        progressBar.className = 'process-progress-bar';
        
        this.currentSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'progress-step';
            
            // 현재 진행 상태에 따라 클래스와 내용 설정
            let indicatorContent = index + 1;
            let stepClass = '';
            let indicatorClass = 'progress-indicator';
            let labelClass = 'progress-label';
            
            if (index < this.currentStepIndex) {
                // 완료된 단계
                stepClass = 'completed';
                indicatorClass += ' completed';
                labelClass += ' completed';
                indicatorContent = '✓';
            } else if (index === this.currentStepIndex) {
                // 현재 진행 중인 단계
                stepClass = 'active';
                indicatorClass += ' active';
                labelClass += ' active';
            }
            
            stepElement.className = `progress-step ${stepClass}`;
            stepElement.innerHTML = `
                <div class="${indicatorClass}">${indicatorContent}</div>
                <div class="${labelClass}">${step.title}</div>
            `;
            progressBar.appendChild(stepElement);
        });
        
        // 진행바만 추가
        this.processSteps.appendChild(progressBar);
    }
    
    nextStep() {
        if (this.currentStepIndex < this.currentSteps.length) {
            const progressBar = this.processSteps.querySelector('.process-progress-bar');
            
            // 이전 단계 완료 처리
            if (this.currentStepIndex > 0) {
                const prevStep = progressBar.children[this.currentStepIndex - 1];
                prevStep.classList.add('completed');
                prevStep.classList.remove('active');
                const prevIndicator = prevStep.querySelector('.progress-indicator');
                const prevLabel = prevStep.querySelector('.progress-label');
                prevIndicator.classList.add('completed');
                prevIndicator.classList.remove('active');
                prevIndicator.innerHTML = '✓';
                prevLabel.classList.add('completed');
                prevLabel.classList.remove('active');
                
                // 라이브 대시보드에서 이전 단계 완료 처리
                this.addStepToLiveDashboard(this.currentSteps[this.currentStepIndex - 1], this.currentStepIndex - 1, 'completed');
            }
            
            // 현재 단계 활성화
            if (this.currentStepIndex < this.currentSteps.length) {
                const currentStep = progressBar.children[this.currentStepIndex];
                
                currentStep.classList.add('active');
                const currentIndicator = currentStep.querySelector('.progress-indicator');
                const currentLabel = currentStep.querySelector('.progress-label');
                currentIndicator.classList.add('active');
                currentLabel.classList.add('active');
                
                // 단계별 에이전트 통신 상태 시뮬레이션
                this.simulateAgentCommunication(this.currentStepIndex);
                
                // 현재 단계의 상세 정보 표시
                this.updateStepDetails(this.currentSteps[this.currentStepIndex]);
            }
            
            this.currentStepIndex++;
        }
    }
    
    completeProcess() {
        // 마지막 단계 완료 처리
        if (this.currentStepIndex > 0 && this.currentStepIndex <= this.currentSteps.length) {
            const lastStepIndex = this.currentStepIndex - 1;
            this.addStepToLiveDashboard(this.currentSteps[lastStepIndex], lastStepIndex, 'completed');
        }
        
        // currentStepIndex를 모든 단계 완료로 설정
        this.currentStepIndex = this.currentSteps.length;
        
        const progressBar = this.processSteps.querySelector('.process-progress-bar');
        
        // 모든 단계 완료 표시
        for (let i = 0; i < this.currentSteps.length; i++) {
            const step = progressBar.children[i];
            step.classList.add('completed');
            step.classList.remove('active');
            const indicator = step.querySelector('.progress-indicator');
            const label = step.querySelector('.progress-label');
            indicator.classList.add('completed');
            indicator.classList.remove('active');
            indicator.innerHTML = '✓';
            label.classList.add('completed');
            label.classList.remove('active');
        }
        
        this.updateStatus('처리 완료', 'success');
        
        // 모든 에이전트 비활성화
        this.deactivateAgents();
        
        this.finalizeLiveDashboard();
    }
    
    finalizeLiveDashboard() {
        const liveBadge = this.processDetails.querySelector('.live-badge');
        if (liveBadge) {
            liveBadge.textContent = '완료';
            liveBadge.className = 'completion-badge';
        }
        
        const dashboardTitle = this.processDetails.querySelector('.dashboard-title');
        if (dashboardTitle) {
            dashboardTitle.textContent = '🎯 작업 완료 대시보드';
        }
    }
    
    handleProcessError(errorMessage, failedStepIndex = null) {
        // 현재 진행 중인 단계를 실패로 표시
        if (failedStepIndex !== null && failedStepIndex < this.currentSteps.length) {
            this.addStepToLiveDashboard(this.currentSteps[failedStepIndex], failedStepIndex, 'failed');
        }
        
        // 상태를 에러로 업데이트
        this.updateStatus('처리 실패', 'error');
        
        // 관련 에이전트를 오류 상태로 표시
        const agents = ['prediction', 'monitoring', 'control'];
        const errorAgent = agents[failedStepIndex % agents.length] || 'monitoring';
        this.setAgentError(errorAgent);
        
        // 잠시 후 모든 에이전트 비활성화
        setTimeout(() => {
            this.deactivateAgents();
        }, 2000);
        
        // 에러 대시보드 표시
        this.showErrorDashboard(errorMessage, failedStepIndex);
    }
    
    showErrorDashboard(errorMessage, failedStepIndex) {
        const failedTime = new Date().toLocaleTimeString('ko-KR');
        const failedStep = failedStepIndex !== null ? this.currentSteps[failedStepIndex] : null;
        
        // 기존 라이브 대시보드가 있으면 에러 상태로 전환
        const liveBadge = this.processDetails.querySelector('.live-badge');
        if (liveBadge) {
            liveBadge.textContent = '실패';
            liveBadge.className = 'error-badge';
        }
        
        const dashboardTitle = this.processDetails.querySelector('.dashboard-title');
        if (dashboardTitle) {
            dashboardTitle.textContent = '❌ 처리 실패';
        }
        
        // 에러 정보 섹션 추가
        const liveSteps = this.processDetails.querySelector('#liveSteps');
        if (liveSteps) {
            const errorSection = document.createElement('div');
            errorSection.className = 'error-section';
            errorSection.innerHTML = `
                <div class="error-header">
                    <h5 class="error-title">오류 정보</h5>
                    <div class="error-time">${failedTime}</div>
                </div>
                <div class="error-details">
                    <div class="error-item">
                        <span class="error-label">오류 메시지</span>
                        <span class="error-value">${errorMessage}</span>
                    </div>
                    ${failedStep ? `
                        <div class="error-item">
                            <span class="error-label">실패 단계</span>
                            <span class="error-value">${failedStep.title}</span>
                        </div>
                    ` : ''}
                    <div class="error-item">
                        <span class="error-label">권장 조치</span>
                        <span class="error-value">잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의하세요.</span>
                    </div>
                </div>
                <div class="retry-section">
                    <button class="retry-button" onclick="location.reload()">다시 시도</button>
                </div>
            `;
            liveSteps.appendChild(errorSection);
        }
    }
    
    updateDetails(query) {
        const startTime = new Date().toLocaleTimeString();
        this.processDetails.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">요청 내용</span>
                <span class="detail-value">${query.substring(0, 30)}${query.length > 30 ? '...' : ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">시작 시간</span>
                <span class="detail-value">${startTime}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">진행 상태</span>
                <span class="detail-value">처리 중...</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">예상 소요 시간</span>
                <span class="detail-value">15-30초</span>
            </div>
        `;
    }
    
    updateStepDetails(step) {
        const now = new Date();
        const startTime = now.toLocaleTimeString('ko-KR');
        
        // 기존 대시보드에 현재 단계 추가 또는 초기화
        if (!this.processDetails.querySelector('.live-dashboard')) {
            this.initializeLiveDashboard();
        }
        
        this.addStepToLiveDashboard(step, this.currentStepIndex, 'processing');
    }
    
    initializeLiveDashboard() {
        this.processDetails.innerHTML = `
            <div class="live-dashboard">
                <div class="dashboard-header">
                    <h4 class="dashboard-title">📋 실시간 작업 진행</h4>
                    <div class="live-badge">진행중</div>
                </div>
                <div class="live-steps" id="liveSteps">
                    <!-- 단계별 작업이 실시간으로 추가됩니다 -->
                </div>
            </div>
        `;
    }
    
    addStepToLiveDashboard(step, stepIndex, status = 'processing') {
        const liveSteps = this.processDetails.querySelector('#liveSteps');
        
        // liveSteps가 없으면 먼저 라이브 대시보드를 초기화
        if (!liveSteps) {
            this.initializeLiveDashboard();
            // 다시 liveSteps를 찾아봄
            const newLiveSteps = this.processDetails.querySelector('#liveSteps');
            if (!newLiveSteps) {
                console.error('라이브 대시보드 초기화 실패');
                return;
            }
        }
        
        const targetLiveSteps = liveSteps || this.processDetails.querySelector('#liveSteps');
        const stepId = `live-step-${stepIndex}`;
        
        // 이미 존재하는 단계인지 확인
        let stepElement = document.getElementById(stepId);
        
        if (!stepElement) {
            // 새로운 단계 요소 생성
            stepElement = document.createElement('div');
            stepElement.id = stepId;
            stepElement.className = 'live-step';
            targetLiveSteps.appendChild(stepElement);
        }
        
        const currentTime = new Date().toLocaleTimeString('ko-KR');
        const stepResult = this.getStepResult(step, stepIndex);
        
        if (status === 'processing') {
            stepElement.innerHTML = `
                <div class="step-header processing">
                    <div class="step-number processing">${stepIndex + 1}</div>
                    <div class="step-info">
                        <div class="step-name">${step.title}</div>
                        <div class="step-status">
                            <div class="thinking-animation">
                                <span></span><span></span><span></span>
                            </div>
                            <span class="status-text">작업 중...</span>
                        </div>
                    </div>
                </div>
                <div class="step-description">${step.description}</div>
                <div class="step-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">처리 중...</div>
                </div>
            `;
            
            // 프로그레스 바 애니메이션 시작
            setTimeout(() => {
                const progressFill = stepElement.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = '100%';
                }
            }, 100);
            
        } else if (status === 'completed') {
            stepElement.innerHTML = `
                <div class="step-header completed">
                    <div class="step-number completed">✓</div>
                    <div class="step-info">
                        <div class="step-name">${step.title}</div>
                        <div class="step-time">${currentTime} - 완료</div>
                    </div>
                </div>
                <div class="step-description">${step.description}</div>
                <div class="step-result completed">
                    ${stepResult}
                </div>
            `;
            
            stepElement.classList.add('completed');
        } else if (status === 'failed') {
            stepElement.innerHTML = `
                <div class="step-header failed">
                    <div class="step-number failed">✗</div>
                    <div class="step-info">
                        <div class="step-name">${step.title}</div>
                        <div class="step-time">${currentTime} - 실패</div>
                    </div>
                </div>
                <div class="step-description">${step.description}</div>
                <div class="step-result failed">
                    ❌ 처리 중 오류가 발생했습니다.
                </div>
            `;
            
            stepElement.classList.add('failed');
        }
    }
    
    showCompletedDashboard() {
        const completedTime = new Date().toLocaleTimeString('ko-KR');
        const totalDuration = Math.floor(Math.random() * 15) + 10; // 10-25초 랜덤
        
        this.processDetails.innerHTML = `
            <div class="dashboard-header">
                <h4 class="dashboard-title">🎯 처리 완료 대시보드</h4>
                <div class="completion-badge">성공</div>
            </div>
            
            <div class="dashboard-summary">
                <div class="summary-item">
                    <span class="summary-label">총 처리 시간</span>
                    <span class="summary-value">${totalDuration}초</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">완료 시각</span>
                    <span class="summary-value">${completedTime}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">처리 단계</span>
                    <span class="summary-value">${this.currentSteps.length}단계</span>
                </div>
            </div>
            
            <div class="dashboard-steps">
                <h5 class="steps-title">단계별 상세 작업 내역</h5>
                ${this.currentSteps.map((step, index) => {
                    const stepDuration = Math.floor(Math.random() * 5) + 2; // 2-7초 랜덤
                    const stepTime = new Date(Date.now() - (this.currentSteps.length - index) * stepDuration * 1000).toLocaleTimeString('ko-KR');
                    
                    return `
                        <div class="dashboard-step">
                            <div class="step-header">
                                <div class="step-number">✓</div>
                                <div class="step-info">
                                    <div class="step-name">${step.title}</div>
                                    <div class="step-time">${stepTime} (${stepDuration}초 소요)</div>
                                </div>
                            </div>
                            <div class="step-description">${step.description}</div>
                            <div class="step-result">
                                ${this.getStepResult(step, index)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    getStepResult(step, index) {
        // 단계별로 다른 결과 표시
        const results = [
            "📊 데이터 수집 완료: 1,247개 레코드 처리",
            "🔍 패턴 분석 완료: 3개 주요 패턴 발견",
            "⚙️ AI 모델 실행 완료: 95.3% 신뢰도",
            "✅ 검증 완료: 모든 조건 충족",
            "📝 보고서 생성 완료: 상세 분석 결과 포함"
        ];
        
        return results[index] || "✅ 처리 완료";
    }
    
    // ===============================
    // 에이전트 상태 관리
    // ===============================
    initializeAgentStatus() {
        // 모든 에이전트를 오프라인 상태로 초기화
        Object.keys(this.agentElements).forEach(agentType => {
            this.updateAgentStatus(agentType, 'offline');
        });
    }
    
    updateAgentStatus(agentType, status) {
        const agentElement = this.agentElements[agentType];
        if (!agentElement) return;
        
        const indicator = agentElement.querySelector('.agent-indicator');
        const statusText = agentElement.querySelector('.agent-status-text');
        if (!indicator) return;
        
        // 모든 상태 클래스 제거 (agentElement와 indicator 모두)
        agentElement.classList.remove('offline', 'online', 'communicating', 'error');
        indicator.classList.remove('offline', 'online', 'communicating', 'error');
        
        // 새 상태 적용 (agentElement와 indicator 모두)
        agentElement.classList.add(status);
        indicator.classList.add(status);
        
        // 상태 텍스트 업데이트
        const statusTexts = {
            offline: '오프라인',
            online: '온라인',
            communicating: '통신중',
            error: '오류'
        };
        
        if (statusText) {
            statusText.textContent = statusTexts[status];
        }
        
        // 툴팁 업데이트
        agentElement.title = `${this.getAgentDisplayName(agentType)}: ${statusTexts[status]}`;
        
        // 통신 중일 때 추가 시각적 효과
        if (status === 'communicating') {
            this.addCommunicationEffect(agentElement);
        }
    }
    
    addCommunicationEffect(agentElement) {
        // 이미 효과가 있으면 제거
        const existingEffect = agentElement.querySelector('.comm-effect');
        if (existingEffect) {
            existingEffect.remove();
        }
        
        // 새로운 통신 효과 요소 생성
        const commEffect = document.createElement('div');
        commEffect.className = 'comm-effect';
        commEffect.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid #3b82f6;
            border-radius: inherit;
            animation: comm-pulse 1s infinite;
            pointer-events: none;
            z-index: 0;
        `;
        
        agentElement.appendChild(commEffect);
        
        // 3초 후 효과 제거
        setTimeout(() => {
            if (commEffect.parentNode) {
                commEffect.remove();
            }
        }, 3000);
    }
    
    getAgentDisplayName(agentType) {
        const displayNames = {
            prediction: '예측 에이전트',
            monitoring: '모니터링 에이전트',
            control: '제어 에이전트'
        };
        return displayNames[agentType] || agentType;
    }
    
    // 공정 시작 시 에이전트들을 온라인 상태로 변경
    activateAgents() {
        this.updateAgentStatus('prediction', 'online');
        this.updateAgentStatus('monitoring', 'online');
        this.updateAgentStatus('control', 'online');
    }
    
    // 특정 에이전트를 통신 중 상태로 변경
    setAgentCommunicating(agentType) {
        this.updateAgentStatus(agentType, 'communicating');
    }
    
    // 에이전트 오류 상태 표시
    setAgentError(agentType) {
        this.updateAgentStatus(agentType, 'error');
    }
    
    // 공정 완료 시 모든 에이전트를 오프라인으로
    deactivateAgents() {
        Object.keys(this.agentElements).forEach(agentType => {
            this.updateAgentStatus(agentType, 'offline');
        });
    }
    
    // 단계별 에이전트 통신 시뮬레이션
    simulateAgentCommunication(stepIndex) {
        const agents = ['prediction', 'monitoring', 'control'];
        
        // 단계별로 다른 에이전트가 통신
        const agentCycle = stepIndex % agents.length;
        const communicatingAgent = agents[agentCycle];
        
        // 선택된 에이전트를 통신 중으로 설정
        this.setAgentCommunicating(communicatingAgent);
        
        // 1-3초 후 다시 온라인 상태로 복귀
        setTimeout(() => {
            this.updateAgentStatus(communicatingAgent, 'online');
        }, Math.random() * 2000 + 1000);
    }
}

// ===============================
// 사이드바 토글 기능
// ===============================
function initSidebarToggle() {
    const sidebar = document.getElementById('chatSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    let isCollapsed = false;

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        if (isCollapsed) sidebar.classList.add('collapsed');
        else sidebar.classList.remove('collapsed');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

// ===============================
// 메시지 전송 (전역 함수)
// ===============================
async function sendMessage() {
    // 실행 횟수 카운터
    if (!window.sendMessageCallCount) {
        window.sendMessageCallCount = 0;
    }
    window.sendMessageCallCount++;
    
    console.log(`📤 sendMessage 함수 시작 (실행 횟수: ${window.sendMessageCallCount})`);
    
    // DOM 요소들을 함수 내에서 직접 가져오기
    const chatInput = document.getElementById('chatInput');
    const bottomChatInput = document.getElementById('bottomChatInput');
    const chatMessages = document.getElementById('chatMessages');
    
    console.log('DOM 요소 확인:', {
        chatInput: !!chatInput,
        bottomChatInput: !!bottomChatInput,
        chatMessages: !!chatMessages,
        isEmpty: chatMessages?.classList.contains('empty')
    });
    
    if (!chatMessages) {
        console.error('chatMessages 요소를 찾을 수 없습니다');
        return;
    }

    // 현재 활성 입력창에서 메시지 가져오기
    let message = '';
    let activeInput = null;

    if (!chatMessages.classList.contains('empty')) {
        // 환영 상태가 아니면 하단 입력창 사용
        if (bottomChatInput) {
            message = bottomChatInput.value.trim();
            activeInput = bottomChatInput;
            console.log('하단 입력창 사용:', message);
        }
    } else if (chatInput) {
        // 환영 상태면 상단 입력창 사용
        message = chatInput.value.trim();
        activeInput = chatInput;
        console.log('상단 입력창 사용:', message);
    } else if (bottomChatInput) {
        // 상단 입력창이 없으면 하단 입력창 사용
        message = bottomChatInput.value.trim();
        activeInput = bottomChatInput;
        console.log('대체 하단 입력창 사용:', message);
    }

    if (!message) {
        console.log('메시지가 비어있어서 전송하지 않음');
        return;
    }

    console.log('📝 메시지 전송 시작:', message);

    // 사용자 활동 로그 기록
    if (window.logChatQuery) {
        window.logChatQuery(message, {
            session_id: chatSessionManager?.currentSessionId,
            message_length: message.length,
            timestamp: new Date().toISOString()
        });
    }

    // 채팅 세션에 사용자 메시지 저장
    if (chatSessionManager) {
        console.log('💾 메시지 저장 중...');
        await chatSessionManager.saveMessage(message, 'user');
        console.log('✅ 메시지 저장 완료');
    } else {
        console.error('chatSessionManager가 없습니다');
    }

    // 빈 상태 해제 및 환영 메시지 제거
    chatMessages.classList.remove('empty');
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage) {
        console.log('환영 메시지 제거');
        welcomeMessage.remove();
        
        // 환영 메시지가 제거되었으므로 하단 입력창 활성화
        if (chatSessionManager) {
            chatSessionManager.ensureBottomInputActive();
        }
    }

    // 사용자 메시지 출력
    console.log('🎨 사용자 메시지 UI 생성 중...');
    const userMessage = createUserMessage(message);
    chatMessages.appendChild(userMessage);

    // 입력창 초기화
    if (activeInput) {
        activeInput.value = '';
        activeInput.style.height = 'auto';
    }

    // 스크롤 하단
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 즉시 "생각하는 중..." 메시지 표시
    const thinkingMessageId = showThinkingMessage();

    // 공정 사이드바 활성화 및 단계 초기화
    if (window.processManager) {
        window.processManager.showSidebar();
        window.processManager.updateStatus('요청 분석 중...', 'processing');
        window.processManager.initializeSteps(message);
    }

    // 사용자 메시지를 기반으로 텍스트 생성 요청
    if (selectedAgent) {
        // 선택된 에이전트가 있는 경우 해당 에이전트로 직접 요청
        console.log(`🎯 선택된 에이전트 "${selectedAgent}"로 메시지 전송`);
        await sendMessageToSelectedAgent(message, selectedAgent, thinkingMessageId);
    } else {
        // 기본 AI 응답 처리 (/api/generate/ 호출)
        console.log('🤖 기본 AI로 메시지 전송');
        await sendMessageToDefaultAI(message, thinkingMessageId);
    }
}

// 사용자 메시지 생성 (간단한 버전)
function createUserMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar user-avatar';
    avatarDiv.textContent = 'U';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    return messageDiv;
}

// 기본 AI로 메시지 전송 (/api/generate/)
async function sendMessageToDefaultAI(message, thinkingMessageId) {
    try {
        console.log('🚀 기본 AI로 메시지 전송 시작');
        
        // 요청 본문 구성 (/api/generate/ 전용)
        const requestBody = {
            prompt: message,
            max_tokens: 1024,
            temperature: 0.7,
            stop: [""],
            client_id: "user_1234",
            use_tools: false,
            max_tool_calls: 3
        };

        // 기본 AI 엔드포인트로 POST 요청
        const response = await fetch('/api/generate/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log(`📡 기본 AI 응답 상태: ${response.status}`);

        if (response.ok) {
            const responseData = await response.json();
            console.log('✅ 기본 AI 응답 수신:', responseData);
            
            // "생각하는 중..." 메시지 제거
            const thinkingMessage = document.getElementById(thinkingMessageId);
            if (thinkingMessage) {
                thinkingMessage.remove();
            }
            
            // 프로세스 매니저 완료 처리
            if (window.processManager) {
                window.processManager.completeProcess();
                window.processManager.updateStatus('처리 완료', 'completed');
            }
            
            // </think> 뒷부분만 추출
            const basicResponseText = responseData.response || responseData.content || '응답을 받았습니다.';
            const finalBasicText = extractTextAfterThink(basicResponseText);
            
            // AI 응답 메시지 표시 (타이핑 효과 포함)
            const chatMessages = document.getElementById('chatMessages');
            const aiMessage = createAIMessageWithTyping(finalBasicText, 10);
            chatMessages.appendChild(aiMessage);
            
            // 채팅 세션에 AI 응답 저장 (기본 AI - </think> 뒷부분만 저장)
            if (chatSessionManager && basicResponseText) {
                const artifactData = extractArtifactData(responseData);
                
                await chatSessionManager.saveMessage(finalBasicText, 'assistant', {
                    original_response: basicResponseText,
                    artifacts: artifactData,
                    response_type: 'default_ai'
                });
                
                // AI 응답 로그 기록
                if (window.logChatResponse) {
                    window.logChatResponse(finalBasicText, {
                        session_id: chatSessionManager.currentSessionId,
                        response_type: 'default_ai',
                        original_length: basicResponseText.length,
                        processed_length: finalBasicText.length
                    });
                }
            }
            
            // 스크롤 하단으로
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } else {
            throw new Error(`기본 AI 응답 오류: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ 기본 AI 호출 실패:', error);
        
        // "생각하는 중..." 메시지 제거
        const thinkingMessage = document.getElementById(thinkingMessageId);
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
        
        // 오류 로깅
        console.error(`기본 AI 호출 중 오류가 발생했습니다: ${error.message}`);
        
        // 오류 메시지 표시
        const chatMessages = document.getElementById('chatMessages');
        const errorMessage = createAIMessage('죄송합니다. AI와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 선택된 에이전트로 메시지 전송
async function sendMessageToSelectedAgent(message, agentName, thinkingMessageId) {
    try {
        console.log(`🚀 에이전트 "${agentName}"로 메시지 전송 시작`);
        
        // 요청 본문 구성 (/api/agents/{agent_name}/invoke/ 전용)
        const requestBody = {
            prompt: message,
            max_tokens: 1024,
            temperature: 0.7,
            stop: ["string"],
            use_tools: true,
            max_tool_calls: 3,
            extra_body: {
                additionalProp1: {}
            },
            user_id: "user_1234"
        };

        // 에이전트별 invoke 엔드포인트로 POST 요청
        const response = await fetch(`/api/agents/${agentName}/invoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log(`📡 에이전트 응답 상태: ${response.status}`);

        if (response.ok) {
            const responseData = await response.json();
            console.log('✅ 에이전트 응답 수신:', responseData);
            console.log('✅ 응답 데이터 구조:', JSON.stringify(responseData, null, 2));
            
            // "생각하는 중..." 메시지 제거
            const thinkingMessage = document.getElementById(thinkingMessageId);
            if (thinkingMessage) {
                thinkingMessage.remove();
            }
            
            // 응답 텍스트 추출 (여러 가능한 필드 확인)
            let responseText = '';
            if (responseData.output && responseData.output.content) {
                responseText = responseData.output.content;
            } else if (responseData.response) {
                responseText = responseData.response;
            } else if (responseData.content) {
                responseText = responseData.content;
            } else if (responseData.text) {
                responseText = responseData.text;
            } else if (responseData.message) {
                responseText = responseData.message;
            } else if (typeof responseData === 'string') {
                responseText = responseData;
            } else {
                responseText = '에이전트 응답을 받았습니다.';
                console.warn('⚠️ 알 수 없는 응답 형식:', responseData);
            }
            
            console.log('📝 추출된 응답 텍스트:', responseText);
            
            // </think> 뒷부분만 추출
            const finalText = extractTextAfterThink(responseText);
            console.log('✂️ </think> 뒷부분 추출:', finalText);
            
            // AI 응답 메시지 표시 (타이핑 효과 포함)
            const chatMessages = document.getElementById('chatMessages');
            const aiMessage = createAIMessageWithTyping(finalText, 10); // 10ms 간격으로 타이핑 (2배 빠르게)
            chatMessages.appendChild(aiMessage);
            
            // 채팅 세션에 AI 응답 저장 (에이전트 응답 - </think> 뒷부분만 저장)
            if (chatSessionManager && responseText) {
                console.log('💾 에이전트 응답을 채팅 세션에 저장:', finalText);
                
                // 아티팩트 정보 추출
                const artifactData = extractArtifactData(responseData);
                
                // </think> 뒷부분과 아티팩트 정보를 함께 저장
                await chatSessionManager.saveMessage(finalText, 'assistant', {
                    agent_name: agentName,
                    original_response: responseText,
                    artifacts: artifactData,
                    response_type: 'agent_invoke'
                });
                
                // AI 응답 로그 기록 (에이전트 응답)
                if (window.logChatResponse) {
                    window.logChatResponse(finalText, {
                        session_id: chatSessionManager.currentSessionId,
                        response_type: 'agent_invoke',
                        agent_name: agentName,
                        original_length: responseText.length,
                        processed_length: finalText.length
                    });
                }
            }
            
            // 스크롤 하단으로
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
        } else {
            throw new Error(`에이전트 응답 오류: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.error(`❌ 에이전트 "${agentName}" 호출 실패:`, error);
        
        // "생각하는 중..." 메시지 제거
        const thinkingMessage = document.getElementById(thinkingMessageId);
        if (thinkingMessage) {
            thinkingMessage.remove();
        }
        
        // 오류 로깅
        console.error(`에이전트 "${agentName}" 호출 중 오류가 발생했습니다: ${error.message}`);
        
        // 오류 메시지 표시
        const chatMessages = document.getElementById('chatMessages');
        const errorMessage = createAIMessage(`죄송합니다. "${agentName}" 에이전트와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.`);
        chatMessages.appendChild(errorMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 아티팩트 데이터 추출 함수
function extractArtifactData(responseData) {
    const artifacts = [];
    
    try {
        // 응답 데이터에서 아티팩트 정보 추출
        if (responseData.artifacts && Array.isArray(responseData.artifacts)) {
            artifacts.push(...responseData.artifacts);
        }
        
        // output.artifacts에서도 확인
        if (responseData.output && responseData.output.artifacts && Array.isArray(responseData.output.artifacts)) {
            artifacts.push(...responseData.output.artifacts);
        }
        
        // 기타 가능한 아티팩트 위치에서 추출
        if (responseData.metadata && responseData.metadata.artifacts) {
            artifacts.push(...responseData.metadata.artifacts);
        }
        
        console.log('🎨 추출된 아티팩트:', artifacts);
        return artifacts;
        
    } catch (error) {
        console.warn('⚠️ 아티팩트 추출 중 오류:', error);
        return [];
    }
}

// </think> 뒷부분 텍스트 추출 함수
function extractTextAfterThink(text) {
    if (!text || typeof text !== 'string') {
        return text;
    }
    
    // </think> 태그를 찾아서 뒷부분만 추출
    const thinkEndIndex = text.lastIndexOf('</think>');
    if (thinkEndIndex !== -1) {
        // </think> 뒷부분 추출
        let afterThink = text.substring(thinkEndIndex + '</think>'.length).trim();
        console.log('🤔 </think> 태그 발견, 뒷부분만 추출');
        return afterThink || '응답을 처리했습니다.';
    }
    
    // </think> 태그가 없으면 원본 텍스트 반환
    return text;
}

// AI 응답 메시지 생성 (타이핑 효과 포함)
function createAIMessageWithTyping(content, typingSpeed = 30) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar ai-avatar';
    avatarDiv.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<span class="typing-cursor">|</span>'; // 초기 커서

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    // 타이핑 효과 시작
    startTypingEffect(contentDiv, content, typingSpeed);

    return messageDiv;
}

// 타이핑 효과 함수
function startTypingEffect(contentDiv, text, speed = 30) {
    let index = 0;
    let displayText = '';
    
    // 커서 스타일 추가
    if (!document.getElementById('typing-cursor-style')) {
        const style = document.createElement('style');
        style.id = 'typing-cursor-style';
        style.textContent = `
            .typing-cursor {
                animation: blink 1s infinite;
                color: #007bff;
            }
            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    const typeChar = () => {
        if (index < text.length) {
            displayText += text[index];
            contentDiv.innerHTML = displayText + '<span class="typing-cursor">|</span>';
            index++;
            
            // 채팅창 스크롤 자동 조정
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            setTimeout(typeChar, speed);
        } else {
            // 타이핑 완료 - 커서 제거
            contentDiv.innerHTML = displayText;
        }
    };

    typeChar();
}

// AI 응답 메시지 생성 (기존 함수 - 타이핑 효과 없음)
function createAIMessage(content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar ai-avatar';
    avatarDiv.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = new Date().toLocaleTimeString();

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);

    return messageDiv;
}

// 생각하는 중 메시지 (간단한 버전)
function showThinkingMessage() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant';
    
    const thinkingId = 'thinking-message-' + Date.now();
    messageDiv.id = thinkingId;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar assistant-avatar';
    avatarDiv.textContent = 'AI';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content thinking-message';
    
    contentDiv.innerHTML = `
        <div class="thinking-content">
            <div class="thinking-animation">
                <span></span><span></span><span></span>
            </div>
            <span class="thinking-text">생각하는 중...</span>
        </div>
    `;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return thinkingId;
}

// ===============================
// 채팅 기능
// ===============================
function initChatFeatures() {
    // 공정 관리자 초기화
    const processManager = new ProcessManager();
    
    // 재바인딩이 필요하므로 let 사용
    let chatInput = document.getElementById('chatInput');
    let sendButton = document.getElementById('sendButton');

    const bottomChatInput = document.getElementById('bottomChatInput');
    const bottomSendButton = document.getElementById('bottomSendButton');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChatBtn');

    // ---------------------------
    // 생각하는 중 메시지 표시
    // ---------------------------
    function showThinkingMessage() {
        // 빈 메시지 요소 생성
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        // 유니크한 ID 생성 (타임스탬프 기반)
        const thinkingId = 'thinking-message-' + Date.now();
        messageDiv.id = thinkingId;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar assistant-avatar';
        avatarDiv.textContent = 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content thinking-message';
        
        // 생각하는 중 애니메이션 표시
        contentDiv.innerHTML = `
            <div class="thinking-content">
                <div class="thinking-animation">
                    <span></span><span></span><span></span>
                </div>
                <span class="thinking-text">생각하는 중...</span>
            </div>
        `;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // 스크롤 하단으로
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 생성된 메시지의 ID 반환
        return thinkingId;
    }

    // ---------------------------
    // AI 응답 생성 요청
    // ---------------------------
    async function generateResponse(userMessage, processManager, thinkingMessageId = null) {
        let stepInterval; // 스코프를 함수 전체로 확장
        
        try {
            // 단계별 진행 시뮬레이션
            stepInterval = setInterval(() => {
                processManager.nextStep();
            }, 1500); // 1.5초마다 다음 단계로

            const token = getAccessToken();

            // 공통 헤더
            const headers = { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // fetch 옵션
            const fetchOpts = {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    prompt: userMessage,
                    max_tokens: 1024,
                    temperature: 0.7,
                    stop: [],
                    client_id: "user_1234",
                    use_tools: false,
                    max_tool_calls: 3
                })
            };
            if (USE_CREDENTIALS) fetchOpts.credentials = 'include';

            // /api/generate/로 요청 (슬래시 추가)
            const endpoint = '/api/generate/';
            const url = `${API_BASE}${endpoint}`;
            
            console.log(`Sending POST request to ${url} with prompt: "${userMessage}"`);
            const response = await fetch(url, fetchOpts);

            // 상태 체크
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const data = await response.json();
            
            // 단계 진행 중지 및 완료 처리
            clearInterval(stepInterval);
            processManager.completeProcess();
            
            // AI 응답을 타이핑 효과로 표시
            const aiResponseText = data.response || data.text || data.content || '응답을 생성했습니다.';
            displayTypingResponse(aiResponseText, processManager, thinkingMessageId);
            
        } catch (error) {
            console.error('AI 응답 생성 실패:', error);
            
            // 단계 진행 중지
            if (stepInterval) {
                clearInterval(stepInterval);
            }
            
            // 현재 진행 중인 단계 인덱스 계산
            const currentFailedStep = Math.min(processManager.currentStepIndex, processManager.currentSteps.length - 1);
            
            // 에러 메시지 생성
            let errorMessage = 'AI 서버와의 연결에 실패했습니다.';
            if (error.message.includes('HTTP 500')) {
                errorMessage = '서버 내부 오류가 발생했습니다.';
            } else if (error.message.includes('HTTP 404')) {
                errorMessage = '요청한 서비스를 찾을 수 없습니다.';
            } else if (error.message.includes('HTTP 429')) {
                errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
            }
            
            // ProcessManager를 통한 에러 처리
            if (processManager) {
                processManager.handleProcessError(errorMessage, currentFailedStep);
            }
            
            // 에러 메시지 표시
            displayTypingResponse(`❌ ${errorMessage}`, processManager, thinkingMessageId);
        }
    }

    // ---------------------------
    // 타이핑 효과로 응답 표시
    // ---------------------------
    function displayTypingResponse(text, processManager = null, thinkingMessageId = null) {
        let thinkingMessage = null;
        
        if (thinkingMessageId) {
            // 특정 ID의 메시지를 찾음
            thinkingMessage = document.getElementById(thinkingMessageId);
        } else {
            // 가장 최근의 "생각하는 중..." 메시지를 찾아서 업데이트
            const thinkingMessages = document.querySelectorAll('[id^="thinking-message-"]');
            thinkingMessage = thinkingMessages.length > 0 ? thinkingMessages[thinkingMessages.length - 1] : null;
        }
        
        if (thinkingMessage) {
            // 기존 메시지의 콘텐츠 부분을 찾아서 교체
            const contentDiv = thinkingMessage.querySelector('.message-content');
            contentDiv.className = 'message-content typing';
            contentDiv.textContent = '';
            
            // ID 제거하여 다음 메시지에서 재사용되지 않도록 함
            thinkingMessage.removeAttribute('id');
            
            // 타이핑 효과 시작
            typeText(contentDiv, text, 0, processManager);
        } else {
            // 기존 메시지가 없으면 새로 생성 (폴백)
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar assistant-avatar';
            avatarDiv.textContent = 'AI';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content typing';
            contentDiv.textContent = '';

            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);

            // 타이핑 효과 시작
            typeText(contentDiv, text, 0, processManager);
        }
    }

    // ---------------------------
    // 텍스트 타이핑 효과
    // ---------------------------
    async function typeText(element, text, index, processManager = null) {
        if (index < text.length) {
            const char = text.charAt(index);
            element.textContent += char;
            
            // 스크롤을 하단으로 유지
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 문자 타입에 따라 다른 딜레이 적용
            let delay;
            if (char === ' ' || char === '\n') {
                // 공백이나 줄바꿈은 빠르게
                delay = 10;
            } else if (char === '.' || char === ',' || char === '!' || char === '?') {
                // 구두점은 약간 긴 딜레이
                delay = Math.random() * 15 + 25;
            } else {
                // 일반 문자는 빠른 타이핑 (10-25ms)
                delay = Math.random() * 15 + 10;
            }
            
            setTimeout(() => typeText(element, text, index + 1, processManager), delay);
        } else {
            // 타이핑 완료 후 커서 제거
            element.classList.remove('typing');
            
            // 채팅 세션에 응답 메시지 저장
            if (chatSessionManager) {
                await chatSessionManager.saveMessage(text, 'assistant');
                
                // AI 응답 로그 기록 (타이핑 완료 후)
                if (window.logChatResponse) {
                    window.logChatResponse(text, {
                        session_id: chatSessionManager.currentSessionId,
                        response_type: 'typing_complete',
                        response_length: text.length
                    });
                }
            }
            
            // 공정 진행 상태 아티팩트 추가
            if (processManager && processManager.currentSteps.length > 0) {
                addProcessArtifact(element, processManager);
            }
            
            // 마지막 스크롤
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // ---------------------------
    // 메시지 요소 생성
    // ---------------------------
    function createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${type}-avatar`;
        avatarDiv.textContent = type === 'user' ? 'U' : 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (typeof content === 'string' && content.includes('현재 사용 가능한 AI 에이전트 목록입니다:')) {
            contentDiv.innerHTML = formatAgentList(content);
        } else if (typeof content === 'string') {
            contentDiv.textContent = content;
        } else {
            contentDiv.textContent = JSON.stringify(content, null, 2);
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        return messageDiv;
    }

    // ---------------------------
    // 에이전트 목록 포맷팅
    // ---------------------------
    function formatAgentList(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/(\d+\.) /g, '<br><strong>$1</strong> ');
    }

    // ---------------------------
    // 새 채팅 시작
    // ---------------------------
    function startNewChat() {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <h2 class="welcome-title">무엇을 도와드릴까요?</h2>
                <p class="welcome-subtitle">PRISM-AGI Assistant에게 무엇이든 물어보세요.</p>

                <div class="welcome-input-area">
                    <div class="chat-input-container">
                        <textarea
                            class="chat-input"
                            id="chatInput"
                            placeholder="메시지를 보내주세요..."
                            rows="1"
                        ></textarea>
                        <button class="send-button" id="sendButton">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        chatMessages.classList.add('empty');

        // 새로 생긴 입력 요소들에 이벤트 재연결
        reinitializeInputEvents();
    }

    // ---------------------------
    // 이벤트 리스너 재연결 (기존 리스너 제거 후 새로 등록)
    // ---------------------------
    function reinitializeInputEvents() {
        const newChatInput = document.getElementById('chatInput');
        const newSendButton = document.getElementById('sendButton');

        // 기존 이벤트 리스너 제거를 위해 복제된 요소로 교체
        if (newSendButton) {
            const clonedSendButton = newSendButton.cloneNode(true);
            newSendButton.parentNode.replaceChild(clonedSendButton, newSendButton);
            clonedSendButton.addEventListener('click', sendMessage);
        }

        if (newChatInput) {
            const clonedChatInput = newChatInput.cloneNode(true);
            newChatInput.parentNode.replaceChild(clonedChatInput, newChatInput);
            
            clonedChatInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            clonedChatInput.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }

        console.log('🔄 입력 이벤트 리스너 재초기화 완료');
    }

    // 전역 함수 등록
    window.generateResponse = generateResponse;
}

// 입력창 이벤트 리스너 설정 함수 (중복 방지)
function setupInputEventListeners() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');

    // 기존 이벤트 리스너 제거를 위해 복제된 요소로 교체
    if (sendButton) {
        const clonedSendButton = sendButton.cloneNode(true);
        sendButton.parentNode.replaceChild(clonedSendButton, sendButton);
        clonedSendButton.addEventListener('click', sendMessage);
        console.log('🔄 Send 버튼 이벤트 리스너 재설정');
    }

    if (chatInput) {
        const clonedChatInput = chatInput.cloneNode(true);
        chatInput.parentNode.replaceChild(clonedChatInput, chatInput);
        
        clonedChatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        clonedChatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
        console.log('🔄 Chat Input 이벤트 리스너 재설정');
    }
}

// ---------------------------
// 공정 진행 상태 아티팩트 추가
// ---------------------------
function addProcessArtifact(messageElement, processManager) {
    // processManager나 currentSteps가 없으면 아티팩트를 추가하지 않음
    if (!processManager || !processManager.currentSteps || processManager.currentSteps.length === 0) {
        console.log('ProcessManager or steps not available, skipping artifact');
        return;
    }
    
    const artifactDiv = document.createElement('div');
    artifactDiv.className = 'process-artifact';
    
    // 완료된 단계 수 계산
    const completedCount = processManager.currentSteps.filter((_, index) => index <= processManager.currentStepIndex).length;
    
    artifactDiv.innerHTML = `
        <div class="artifact-header">
            <span class="artifact-title">공정 진행 상태</span>
            <span class="artifact-subtitle">${completedCount}/${processManager.currentSteps.length}단계 완료</span>
        </div>
        <div class="artifact-preview">
            ${processManager.currentSteps.slice(0, 3).map((step, index) => {
                let status = 'pending';
                if (index <= processManager.currentStepIndex) {
                    status = 'completed';
                } else if (index === processManager.currentStepIndex + 1) {
                    status = 'active';
                }
                return `<div class="preview-step ${status}">${step.title || '단계'}</div>`;
            }).join('')}
            ${processManager.currentSteps.length > 3 ? '<div class="preview-more">...</div>' : ''}
        </div>
        <button class="artifact-button">진행 상태 확인</button>
    `;

    // 클릭 이벤트 추가
    const button = artifactDiv.querySelector('.artifact-button');
    button.addEventListener('click', () => {
        // 저장된 단계 정보로 사이드바 다시 표시
        processManager.showSidebar();
        processManager.renderSteps();
    });

    messageElement.appendChild(artifactDiv);
}

// ===============================
// 초기화
// ===============================
document.addEventListener('DOMContentLoaded', function () {
    initSidebarToggle();
    initChatFeatures();
    
    // ProcessManager 초기화
    window.processManager = new ProcessManager();
    console.log('ProcessManager initialized:', window.processManager);
    
    // 사이드바 메뉴 이벤트 리스너 추가
    initSidebarMenuEvents();
});

// ===============================
// 사이드바 메뉴 이벤트 처리
// ===============================
function initSidebarMenuEvents() {
    const createAgentMenu = document.getElementById('createAgentMenu');
    const manageAgentsMenu = document.getElementById('manageAgentsMenu');
    const registerToolMenu = document.getElementById('registerToolMenu');
    
    if (createAgentMenu) {
        createAgentMenu.addEventListener('click', () => {
            window.location.href = '/create-agent/';
        });
    }
    
    if (manageAgentsMenu) {
        manageAgentsMenu.addEventListener('click', () => {
            window.location.href = '/manage-agents/';
        });
    }
    
    if (registerToolMenu) {
        registerToolMenu.addEventListener('click', () => {
            window.location.href = '/register-tool/';
        });
    }
}

function getAgentStatusIcon(status) {
    switch (status) {
        case 'active':
            return '<svg width="12" height="12" viewBox="0 0 24 24" fill="#4ade80"><circle cx="12" cy="12" r="8"/></svg>';
        case 'inactive':
            return '<svg width="12" height="12" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="12" r="8"/></svg>';
        case 'error':
            return '<svg width="12" height="12" viewBox="0 0 24 24" fill="#ef4444"><circle cx="12" cy="12" r="8"/></svg>';
        default:
            return '<svg width="12" height="12" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="12" r="8"/></svg>';
    }
}

function getLanguageIcon(language) {
    switch (language) {
        case 'python':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#3776ab"><path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.26-.02.2-.01h4.22l.15-.02.28-.07.32-.14.33-.23.31-.32.26-.41.2-.5.13-.58.05-.65V5.71l-.05-.66-.15-.56-.26-.47-.32-.39-.36-.32-.4-.26-.42-.2-.42-.14-.4-.1-.35-.07-.32-.04-.25-.02-.16-.01-.06.01h-4.22l-.69-.05-.59-.14-.5-.22-.41-.27-.33-.32-.27-.35-.2-.36-.15-.37-.1-.35-.07-.32-.04-.27-.02-.21V2.5l.03-.21.07-.28.12-.32.18-.35.26-.36.36-.36.46-.35.59-.32.73-.28.88-.21 1.05-.14 1.23-.05 1.22.06 1.04.16.87.24.71.32.57.36.44.4.33.42.24.42.16.4.1.36.05.32.02.26.01.2v4.22l.02.15.07.28.14.32.23.33.32.31.41.26.5.2.58.13.65.05H15.38l.66-.05.56-.15.47-.26.39-.32.32-.36.26-.4.2-.42.14-.42.1-.4.07-.35.04-.32.02-.25.01-.16.01-.06v-4.22l-.05-.69-.14-.59-.22-.5-.27-.41-.32-.33-.35-.27-.36-.2-.37-.15-.35-.1-.32-.07-.27-.04-.21-.02H16.59l-.21.03-.28.07-.32.12-.35.18-.36.26-.36.36-.35.46-.32.59-.28.73-.21.88-.14 1.05-.05 1.23.06 1.22.16 1.04.24.87.32.71.36.57.4.44.42.33.42.24.4.16.36.1.32.05.26.02.2.01h4.22l.15-.02.28-.07.32-.14.33-.23.31-.32.26-.41.2-.5.13-.58.05-.65V5.71l-.05-.66-.15-.56-.26-.47-.32-.39-.36-.32-.4-.26-.42-.2-.42-.14-.4-.1-.35-.07-.32-.04-.25-.02-.16-.01-.06.01z"/></svg>';
            break;
        case 'javascript':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#f7df1e"><path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/></svg>';
            break;
        case 'java':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ed8b00"><path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892M17.116 17.584c4.503-2.34 2.421-4.589.968-4.285-.355.074-.515.138-.515.138s.132-.207.385-.297c2.875-1.011 5.086 2.981-.928 4.562 0-.001.07-.062.09-.118M14.401 0s2.494 2.494-2.365 6.33c-3.896 3.077-.888 4.832-.001 6.836-2.274-2.053-3.943-3.858-2.824-5.539 1.644-2.469 6.197-3.665 5.19-7.627M9.734 23.924c4.322.277 10.959-.153 11.116-2.198 0 0-.302.775-3.572 1.391-3.688.694-8.239.613-10.937.168 0-.001.553.457 3.393.639"/></svg>';
            break;
        case 'cpp':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#00599c"><path d="M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.109-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79V11.61h-.79v.785h-.79v.79h.79v.785h.79v-.785h.79zm2.962 0h-.79V11.61h-.79v.785h-.79v.79h.79v.785h.79v-.785h.79z"/></svg>';
            break;
        case 'csharp':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#239120"><path d="M1.194 7.543v8.913c0 1.103.588 2.122 1.544 2.674l7.756 4.456c.956.552 2.132.552 3.088 0l7.756-4.456c.956-.552 1.544-1.571 1.544-2.674V7.543c0-1.103-.588-2.122-1.544-2.674L13.582.413c-.956-.552-2.132-.552-3.088 0L2.738 4.869C1.782 5.421 1.194 6.44 1.194 7.543zM12 3.297l7.268 4.185v8.428L12 20.095 4.732 15.91V7.482L12 3.297z"/><path d="M12 5.784L6.279 8.97v6.372L12 18.529l5.721-3.187V8.97L12 5.784zm3.063 7.623c-.711.711-1.659 1.103-2.672 1.103s-1.961-.392-2.672-1.103c-.711-.711-1.103-1.659-1.103-2.672s.392-1.961 1.103-2.672c.711-.711 1.659-1.103 2.672-1.103s1.961.392 2.672 1.103c.184.184.34.391.465.615l1.415-.817c-.26-.449-.594-.857-.989-1.203-1.183-1.034-2.729-1.604-4.353-1.604s-3.17.57-4.353 1.604c-1.183 1.034-1.837 2.436-1.837 3.947s.654 2.913 1.837 3.947c1.183 1.034 2.729 1.604 4.353 1.604s3.17-.57 4.353-1.604c.395-.346.729-.754.989-1.203l-1.415-.817c-.125.224-.281.431-.465.615z"/><path d="M16.5 11.5h.5v1h-.5zm1.5 0h.5v1h-.5zm-1.5-1h.5v1h-.5zm1.5 0h.5v1h-.5z"/></svg>';
            break;
        case 'go':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#00add8"><path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zM2.828 12.386c-.047 0-.058-.024-.035-.059l.163-.292c.023-.035.070-.059.117-.059h2.337c.047 0 .070.036.070.082l-.023.257c0 .047-.047.082-.094.082zM21.918 12.386c-1.434 0-2.234-.71-2.234-1.888 0-1.177.8-1.887 2.234-1.887 1.433 0 2.234.71 2.234 1.887 0 1.178-.8 1.888-2.234 1.888zm0-3.088c-.862 0-1.411.491-1.411 1.2 0 .709.549 1.2 1.411 1.2.862 0 1.411-.491 1.411-1.2 0-.709-.549-1.2-1.411-1.2zM18.489 12.386c-.862 0-1.411-.491-1.411-1.2 0-.709.549-1.2 1.411-1.2.303 0 .549.082.757.234l-.269.421c-.128-.094-.291-.141-.488-.141-.491 0-.8.268-.8.686 0 .418.309.686.8.686.197 0 .36-.047.488-.141l.269.421c-.208.152-.454.234-.757.234zM14.978 9.962c.303 0 .549.082.757.234l-.269.421c-.128-.094-.291-.141-.488-.141-.491 0-.8.268-.8.686 0 .418.309.686.8.686.197 0 .36-.047.488-.141l.269.421c-.208.152-.454.234-.757.234-.862 0-1.411-.491-1.411-1.2 0-.709.549-1.2 1.411-1.2zM11.724 12.268h-.776V9.257h.526l1.06 1.294V9.257h.776v3.011h-.526l-1.06-1.294z"/></svg>';
            break;
        case 'rust':
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ce422b"><path d="M23.86 11.43a.77.77 0 0 0-.26-.54L21.05 8.34a.75.75 0 0 0-1.06 0l-.53.53-1.85-1.85.53-.53a.75.75 0 0 0 0-1.06L15.6 2.88a.78.78 0 0 0-.54-.26h-6.1a.78.78 0 0 0-.54.26L5.87 5.43a.75.75 0 0 0 0 1.06l.53.53-1.85 1.85-.53-.53a.75.75 0 0 0-1.06 0L.4 10.89a.78.78 0 0 0-.26.54v6.1c0 .2.1.4.26.54l2.55 2.55c.14.16.34.26.54.26h6.1c.2 0 .4-.1.54-.26l2.55-2.55c.16-.14.26-.34.26-.54v-6.1zm-7.07 6.19c-2.77 0-5-2.23-5-5s2.23-5 5-5 5 2.23 5 5-2.23 5-5 5zm0-8.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z"/></svg>';
            break;
        default:
            return '<svg width="16" height="16" viewBox="0 0 24 24" fill="#64748b"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 4h7v5h5v11H6V4z"/></svg>';
    }
}

function getStatusText(status) {
    switch (status) {
        case 'active':
            return '활성';
        case 'inactive':
            return '비활성';
        case 'error':
            return '오류';
        default:
            return '알 수 없음';
    }
}

// ===============================
// Sidebar 에이전트 목록 관리
// ===============================
class SidebarAgentManager {
    constructor() {
        this.agentsListContainer = document.getElementById('agentsList');
        this.loadAgents();
    }

    async loadAgents() {
        if (!this.agentsListContainer) {
            console.warn('❌ agentsList 컨테이너를 찾을 수 없습니다');
            return;
        }

        try {
            console.log('🔄 에이전트 목록 로딩 시작...');
            console.log('🌐 요청 URL: /api/agents/');
            this.showLoading();

            // API에서 에이전트 목록 가져오기
            const response = await fetch('/api/agents/');
            console.log('📡 응답 상태:', response.status, response.statusText);
            console.log('📡 응답 헤더:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const agents = await response.json();
                console.log('✅ 에이전트 목록 로딩 완료:', agents);
                console.log('📊 에이전트 수:', Array.isArray(agents) ? agents.length : 'Not an array');
                this.renderAgents(agents);
            } else {
                const errorText = await response.text();
                console.error('❌ 에이전트 목록 로딩 실패:', response.status, response.statusText);
                console.error('❌ 오류 응답:', errorText);
                this.renderError(`에이전트 목록을 불러올 수 없습니다. (${response.status})`);
            }
        } catch (error) {
            console.error('❌ 에이전트 목록 로딩 실패:', error);
            console.error('❌ 오류 스택:', error.stack);
            this.renderError('에이전트 목록을 불러올 수 없습니다.');
        }
    }

    renderAgents(agents) {
        if (!this.agentsListContainer) return;

        console.log('🖼️ 에이전트 렌더링 시작, 에이전트 수:', agents.length);

        if (!agents || agents.length === 0) {
            console.log('📭 에이전트 없음, 빈 상태 메시지 표시');
            this.agentsListContainer.innerHTML = `
                <div class="chat-item agent-refresh-btn" style="cursor: pointer;" title="클릭하여 새로고침">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12S7.58 20 12 20 20 16.42 20 12H18C18 15.31 15.31 18 12 18S6 15.31 6 12 8.69 6 12 6Z"/>
                    </svg>
                    <span>등록된 에이전트가 없습니다</span>
                </div>
            `;
            
            // 클릭 이벤트 추가
            const refreshBtn = this.agentsListContainer.querySelector('.agent-refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    console.log('🔄 에이전트 목록 새로고침 요청');
                    this.loadAgents();
                });
            }
            
            return;
        }

        console.log('🎨 에이전트 카드 생성 중...');
        const agentElements = agents.map(agent => `
            <div class="chat-item agent-item" data-agent-name="${agent.name}" title="${agent.description || agent.name}">
                <div class="agent-checkbox">
                    <input type="checkbox" value="${agent.name}" id="agent-${agent.name}" class="agent-select-checkbox">
                    <label for="agent-${agent.name}" class="agent-label">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span class="agent-name">${agent.name}</span>
                    </label>
                </div>
            </div>
        `).join('');

        this.agentsListContainer.innerHTML = agentElements;
        console.log('✨ 에이전트 카드 렌더링 완료');

        // 에이전트 선택 이벤트 추가 (체크박스)
        this.agentsListContainer.querySelectorAll('.agent-select-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const agentName = e.target.value;
                
                if (e.target.checked) {
                    // 다른 체크박스 모두 해제 (단일 선택)
                    this.agentsListContainer.querySelectorAll('.agent-select-checkbox').forEach(otherCheckbox => {
                        if (otherCheckbox !== e.target) {
                            otherCheckbox.checked = false;
                        }
                    });
                    
                    this.selectAgent(agentName);
                } else {
                    // 체크박스 해제 시 선택 해제
                    clearAgentSelection();
                }
            });
        });

        // 기존 선택된 에이전트가 있다면 체크박스 체크
        if (selectedAgent) {
            const checkbox = this.agentsListContainer.querySelector(`input[value="${selectedAgent}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    }

    renderError(message) {
        if (!this.agentsListContainer) return;

        this.agentsListContainer.innerHTML = `
            <div class="chat-item error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>${message}</span>
            </div>
        `;
    }

    showLoading() {
        if (!this.agentsListContainer) return;

        this.agentsListContainer.innerHTML = `
            <div class="loading-agents">
                <div class="chat-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2v20"/>
                    </svg>
                    <span>에이전트 로딩 중...</span>
                </div>
            </div>
        `;
    }

    selectAgent(agentName) {
        // 모든 에이전트 항목에서 active 클래스 제거
        this.agentsListContainer.querySelectorAll('.agent-item').forEach(item => {
            item.classList.remove('active');
        });

        // 선택된 에이전트에 active 클래스 추가
        const selectedItem = this.agentsListContainer.querySelector(`[data-agent-name="${agentName}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // 체크박스 체크
        const checkbox = this.agentsListContainer.querySelector(`input[value="${agentName}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }

        // 전역 변수 업데이트
        selectedAgent = agentName;

        // 채팅 입력창 플레이스홀더 업데이트
        const chatInput = document.querySelector('.chat-input textarea');
        if (chatInput) {
            chatInput.placeholder = `${agentName} 에이전트에게 메시지를 보내세요...`;
        }

        // 하단 입력창도 업데이트
        const bottomChatInput = document.getElementById('bottomChatInput');
        if (bottomChatInput) {
            bottomChatInput.placeholder = `${agentName} 에이전트에게 메시지를 보내세요...`;
        }

        // 선택 상태를 사용자에게 알림
        console.log(`🤖 에이전트 "${agentName}" 선택됨`);
        
        // 선택된 에이전트 표시 (옵션)
        this.showSelectedAgentNotification(agentName);
    }

    showSelectedAgentNotification(agentName) {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.agent-selection-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = 'agent-selection-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>${agentName} 에이전트 선택됨</span>
                <button class="clear-selection" onclick="clearAgentSelection()">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>
        `;

        // 채팅 헤더에 추가
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.appendChild(notification);
        }
    }

    // 에이전트 목록 새로고침 (에이전트 생성/삭제 후 호출)
    refresh() {
        this.loadAgents();
    }
}

// ===============================
// 에이전트 선택 관리 함수
// ===============================
function clearAgentSelection() {
    selectedAgent = null;
    
    // 모든 에이전트 항목에서 active 클래스 제거
    document.querySelectorAll('.agent-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // 체크박스 체크 해제
    document.querySelectorAll('.agent-select-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // 입력창 플레이스홀더 초기화
    const chatInput = document.querySelector('.chat-input textarea');
    if (chatInput) {
        chatInput.placeholder = '메시지를 입력하세요...';
    }
    
    // 하단 입력창도 초기화
    const bottomChatInput = document.getElementById('bottomChatInput');
    if (bottomChatInput) {
        bottomChatInput.placeholder = '메시지를 입력하세요...';
    }
    
    // 알림 제거
    const notification = document.querySelector('.agent-selection-notification');
    if (notification) {
        notification.remove();
    }
    
    console.log('🔄 에이전트 선택 해제됨');
}

// 페이지 로드 시 SidebarAgentManager와 ChatSessionManager 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM 로드 완료, 매니저들 생성 중...');
    window.sidebarAgentManager = new SidebarAgentManager();
    chatSessionManager = new ChatSessionManager();
    
    // 하단 입력창 미리 활성화 (페이지 로드 시)
    setTimeout(() => {
        if (chatSessionManager) {
            chatSessionManager.ensureBottomInputActive();
        }
    }, 100);
    
    // URL 파라미터에서 세션 ID 확인하고 로드
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    if (sessionId && chatSessionManager) {
        setTimeout(() => {
            chatSessionManager.loadSession(sessionId);
        }, 500); // 세션 목록 로드 후 실행
    }
});

// 즉시 실행으로도 테스트
console.log('🎯 즉시 실행 테스트...');
if (document.readyState === 'loading') {
    console.log('📄 문서 로딩 중...');
} else {
    console.log('📄 문서 로드 완료, 즉시 실행');
    window.sidebarAgentManager = new SidebarAgentManager();
    chatSessionManager = new ChatSessionManager();
}

// 전역에서 사용할 수 있도록 함수 노출
window.sendMessage = sendMessage;
window.refreshSidebarAgents = () => {
    if (window.sidebarAgentManager) {
        window.sidebarAgentManager.refresh();
    }
};

// 페이지 네비게이션 함수들
function goToManageTools() {
    window.location.href = '/manage-tools/';
}

function goToUserLogs() {
    window.location.href = '/user-logs/';
}

function goToServerLogs() {
    window.location.href = '/server-logs/';
}

function goToManageTools() {
    window.location.href = '/manage-tools/';
}
