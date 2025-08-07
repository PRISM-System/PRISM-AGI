// 사이드바 토글 기능
function initSidebarToggle() {
    const sidebar = document.getElementById('chatSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    let isCollapsed = false;
    
    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        } else {
            sidebar.classList.remove('collapsed');
        }
    }
    
    // 사이드바 내부 토글 버튼
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

// 채팅 기능
function initChatFeatures() {
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const bottomChatInput = document.getElementById('bottomChatInput');
    const bottomSendButton = document.getElementById('bottomSendButton');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChatBtn');
    
    // 메시지 전송 기능
    function sendMessage() {
        // 현재 활성화된 입력창에서 메시지 가져오기
        let message = '';
        let activeInput = null;
        
        if (chatInput && !chatMessages.classList.contains('empty')) {
            // 환영 상태가 아닐 때는 하단 입력창 사용
            message = bottomChatInput ? bottomChatInput.value.trim() : '';
            activeInput = bottomChatInput;
        } else if (chatInput) {
            // 환영 상태일 때는 환영 입력창 사용
            message = chatInput.value.trim();
            activeInput = chatInput;
        }
        
        if (!message) return;
        
        // 빈 상태 클래스 제거
        chatMessages.classList.remove('empty');
        
        // 환영 메시지 제거
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // 하단 입력창 표시 (CSS에서 자동으로 처리됨)
        
        // 사용자 메시지 추가
        const userMessage = createMessageElement('user', message);
        chatMessages.appendChild(userMessage);
        
        // 입력창 초기화
        if (activeInput) {
            activeInput.value = '';
            activeInput.style.height = 'auto'; // 높이도 초기화
        }
        
        // 스크롤을 최하단으로
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // TODO: 여기에 AI 응답 로직 추가
        // 예시 응답
        setTimeout(() => {
            const aiResponse = createMessageElement('assistant', '안녕하세요! 메시지를 받았습니다.');
            chatMessages.appendChild(aiResponse);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
    
    // 메시지 요소 생성
    function createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${type}-avatar`;
        avatarDiv.textContent = type === 'user' ? 'U' : 'AI';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        return messageDiv;
    }
    
    // 새 채팅 기능
    function startNewChat() {
        // 메시지 초기화
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
        
        // 이벤트 리스너 다시 연결
        reinitializeInputEvents();
    }
    
    // 이벤트 리스너 재연결 함수
    function reinitializeInputEvents() {
        const newChatInput = document.getElementById('chatInput');
        const newSendButton = document.getElementById('sendButton');
        
        if (newSendButton) {
            newSendButton.addEventListener('click', sendMessage);
        }
        
        if (newChatInput) {
            newChatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // 자동 높이 조절
            newChatInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }
        
        // 전역 변수 업데이트
        chatInput = newChatInput;
        sendButton = newSendButton;
    }
    
    // 이벤트 리스너
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    if (bottomSendButton) {
        bottomSendButton.addEventListener('click', sendMessage);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 자동 높이 조절
        chatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    if (bottomChatInput) {
        bottomChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 자동 높이 조절
        bottomChatInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    initChatFeatures();
});
