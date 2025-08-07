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
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChatBtn');
    
    // 메시지 전송 기능
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // 빈 상태 클래스 제거
        chatMessages.classList.remove('empty');
        
        // 환영 메시지 제거
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }
        
        // 사용자 메시지 추가
        const userMessage = createMessageElement('user', message);
        chatMessages.appendChild(userMessage);
        
        // 입력창 초기화
        chatInput.value = '';
        
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
            </div>
        `;
        chatMessages.classList.add('empty');
    }
    
    // 이벤트 리스너
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
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
    
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initSidebarToggle();
    initChatFeatures();
});
