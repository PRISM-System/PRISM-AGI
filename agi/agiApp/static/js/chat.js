// ===============================
// 환경 설정(필요에 맞게 바꿔 사용)
// ===============================
const API_BASE = 'http://127.0.0.1:8000'; // 로컬 서버 (프록시 서버)
const USE_PROXY = true;                   // 항상 프록시 사용 (로컬 API 제거됨)
const USE_GET_FOR_LIST = false;           // true면 GET으로 목록 우회(프리플라이트 줄이기)
const USE_CREDENTIALS = false;            // 세션/쿠키 사용 시 true + 서버 CORS allow_credentials 필요
const ACCESS_TOKEN_KEY = 'access_token';  // 로컬스토리지 토큰 키 이름

// 토큰 가져오기(필요 없으면 비워 둬도 됨)
function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
    } catch (_) {
        return '';
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
// 채팅 기능
// ===============================
function initChatFeatures() {
    // 재바인딩이 필요하므로 let 사용
    let chatInput = document.getElementById('chatInput');
    let sendButton = document.getElementById('sendButton');

    const bottomChatInput = document.getElementById('bottomChatInput');
    const bottomSendButton = document.getElementById('bottomSendButton');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChatBtn');

    // ---------------------------
    // 메시지 전송
    // ---------------------------
    function sendMessage() {
        // 현재 활성 입력창에서 메시지 가져오기
        let message = '';
        let activeInput = null;

        if (chatInput && !chatMessages.classList.contains('empty')) {
            // 환영 상태가 아니면 하단 입력창 사용
            message = bottomChatInput ? bottomChatInput.value.trim() : '';
            activeInput = bottomChatInput;
        } else if (chatInput) {
            // 환영 상태면 상단 입력창 사용
            message = chatInput.value.trim();
            activeInput = chatInput;
        }

        if (!message) return;

        // 빈 상태 해제 및 환영 메시지 제거
        chatMessages.classList.remove('empty');
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) welcomeMessage.remove();

        // 사용자 메시지 출력
        const userMessage = createMessageElement('user', message);
        chatMessages.appendChild(userMessage);

        // 입력창 초기화
        if (activeInput) {
            activeInput.value = '';
            activeInput.style.height = 'auto';
        }

        // 스크롤 하단
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 사용자 메시지를 기반으로 텍스트 생성 요청
        generateResponse(message);
    }

    // ---------------------------
    // AI 응답 생성 요청
    // ---------------------------
    async function generateResponse(userMessage) {
        try {
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
                    stop: ["string"]
                })
            };
            if (USE_CREDENTIALS) fetchOpts.credentials = 'include';

            // /api/generate로 요청
            const endpoint = '/api/generate';
            const url = `${API_BASE}${endpoint}`;
            
            console.log(`Sending POST request to ${url} with prompt: "${userMessage}"`);
            const response = await fetch(url, fetchOpts);

            // 상태 체크
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const data = await response.json();
            
            // AI 응답을 타이핑 효과로 표시
            const aiResponseText = data.response || data.text || data.content || '응답을 생성했습니다.';
            displayTypingResponse(aiResponseText);
            
        } catch (error) {
            console.error('AI 응답 생성 실패:', error);
            displayTypingResponse('죄송합니다. 응답을 생성하는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    }

    // ---------------------------
    // 타이핑 효과로 응답 표시
    // ---------------------------
    function displayTypingResponse(text) {
        // 빈 메시지 요소 생성
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar assistant-avatar';
        avatarDiv.textContent = 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content typing'; // typing 클래스 추가
        contentDiv.textContent = ''; // 처음에는 빈 텍스트

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // 타이핑 효과 시작
        typeText(contentDiv, text, 0);
    }

    // ---------------------------
    // 텍스트 타이핑 효과
    // ---------------------------
    function typeText(element, text, index) {
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
            
            setTimeout(() => typeText(element, text, index + 1), delay);
        } else {
            // 타이핑 완료 후 커서 제거
            element.classList.remove('typing');
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
    // 이벤트 리스너 재연결
    // ---------------------------
    function reinitializeInputEvents() {
        const newChatInput = document.getElementById('chatInput');
        const newSendButton = document.getElementById('sendButton');

        if (newSendButton) {
            newSendButton.addEventListener('click', sendMessage);
        }

        if (newChatInput) {
            newChatInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            newChatInput.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }

        // 재바인딩
        chatInput = newChatInput;
        sendButton = newSendButton;
    }

    // ---------------------------
    // 이벤트 리스너 등록
    // ---------------------------
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (bottomSendButton) bottomSendButton.addEventListener('click', sendMessage);

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    if (bottomChatInput) {
        bottomChatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        bottomChatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);
}

// ===============================
// 초기화
// ===============================
document.addEventListener('DOMContentLoaded', function () {
    initSidebarToggle();
    initChatFeatures();
});
