// 에이전트 관리 페이지 JavaScript

class AgentManager {
    constructor() {
        this.agents = [];
        this.filteredAgents = [];
        this.selectedAgent = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAgents();
    }

    bindEvents() {
        // 뒤로 가기 버튼
        const backButton = document.getElementById('backToChat');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = '/';
            });
        }

        // 새 에이전트 생성 버튼
        const createButton = document.getElementById('createNewAgent');
        if (createButton) {
            createButton.addEventListener('click', () => {
                window.location.href = '/create-agent/';
            });
        }

        // 검색 기능
        const searchInput = document.getElementById('searchAgent');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterAgents();
            });
        }

        // 필터 기능
        const languageFilter = document.getElementById('languageFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (languageFilter) {
            languageFilter.addEventListener('change', () => {
                this.filterAgents();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterAgents();
            });
        }

        // 모달 닫기 이벤트
        this.bindModalEvents();
    }

    bindModalEvents() {
        // 상세보기 모달
        const detailModal = document.getElementById('agentDetailModal');
        const closeDetailModal = document.getElementById('closeDetailModal');
        
        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => {
                this.closeModal('agentDetailModal');
            });
        }

        // 삭제 확인 모달
        const deleteModal = document.getElementById('deleteConfirmModal');
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        const cancelDelete = document.getElementById('cancelDelete');
        const confirmDelete = document.getElementById('confirmDelete');
        
        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', () => {
                this.closeModal('deleteConfirmModal');
            });
        }
        
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => {
                this.closeModal('deleteConfirmModal');
            });
        }
        
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => {
                this.confirmDeleteAgent();
            });
        }

        // 모달 배경 클릭시 닫기
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    async loadAgents() {
        const loadingContainer = document.getElementById('loadingContainer');
        const agentsGrid = document.getElementById('agentsGrid');
        const emptyState = document.getElementById('emptyState');

        try {
            // 로딩 상태 표시
            if (loadingContainer) {
                loadingContainer.style.display = 'block';
            }
            if (emptyState) {
                emptyState.style.display = 'none';
            }

            // API에서 에이전트 목록 가져오기 (임시 데이터로 시작)
            await this.fetchAgentsFromAPI();
            
            this.filteredAgents = [...this.agents];
            this.renderAgents();

        } catch (error) {
            console.error('에이전트 로딩 실패:', error);
            this.showError('에이전트 목록을 불러올 수 없습니다.');
        } finally {
            if (loadingContainer) {
                loadingContainer.style.display = 'none';
            }
        }
    }

    async fetchAgentsFromAPI() {
        try {
            // 외부 API에서 에이전트 목록 가져오기
            const response = await fetch('/api/agents/');

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const agentsData = await response.json();
            
            // API 응답 데이터를 내부 형식으로 변환
            this.agents = agentsData.map((agent, index) => ({
                name: agent.name || '이름 없음',
                description: agent.description || '설명 없음',
                role_prompt: agent.role_prompt || ''
            }));

            console.log('에이전트 목록 로딩 성공:', this.agents);
            
        } catch (error) {
            console.error('API 요청 실패:', error);
            // 에러 발생 시 빈 배열로 설정
            this.agents = [];
            throw error;
        }
    }

    filterAgents() {
        const searchTerm = document.getElementById('searchAgent')?.value.toLowerCase() || '';
        const languageFilter = document.getElementById('languageFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        this.filteredAgents = this.agents.filter(agent => {
            const matchesSearch = agent.name.toLowerCase().includes(searchTerm) || 
                                agent.description.toLowerCase().includes(searchTerm);
            const matchesLanguage = !languageFilter || agent.language === languageFilter;
            const matchesStatus = !statusFilter || agent.status === statusFilter;

            return matchesSearch && matchesLanguage && matchesStatus;
        });

        this.renderAgents();
    }

    renderAgents() {
        const agentsGrid = document.getElementById('agentsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!agentsGrid) return;

        // 로딩 컨테이너 숨기기
        const loadingContainer = document.getElementById('loadingContainer');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }

        if (this.filteredAgents.length === 0) {
            agentsGrid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        const agentCards = this.filteredAgents.map(agent => this.createAgentCard(agent)).join('');
        agentsGrid.innerHTML = agentCards;

        // 이벤트 리스너 바인딩
        this.bindAgentCardEvents();
    }

    createAgentCard(agent) {
        return `
            <div class="agent-card" data-agent-name="${agent.name}">
                <div class="agent-header">
                    <h3 class="agent-name">${agent.name}</h3>
                    <span class="agent-status active">활성</span>
                </div>
                <p class="agent-description">${agent.description}</p>
                <div class="agent-meta">
                    <div class="agent-language">
                        <span class="language-badge">Python</span>
                    </div>
                </div>
                <div class="agent-actions">
                    <button class="action-btn view" data-action="view" data-agent-name="${agent.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        상세보기
                    </button>
                    <button class="action-btn edit" data-action="edit" data-agent-name="${agent.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        편집
                    </button>
                    <button class="action-btn delete" data-action="delete" data-agent-name="${agent.name}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        삭제
                    </button>
                </div>
            </div>
        `;
    }

    bindAgentCardEvents() {
        const actionButtons = document.querySelectorAll('.action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                const agentName = button.dataset.agentName;
                const agent = this.agents.find(a => a.name === agentName);
                
                if (!agent) return;
                
                switch (action) {
                    case 'view':
                        this.viewAgentDetails(agent);
                        break;
                    case 'edit':
                        this.editAgent(agent);
                        break;
                    case 'delete':
                        this.deleteAgent(agent);
                        break;
                }
            });
        });

        // 카드 클릭으로 상세보기
        const agentCards = document.querySelectorAll('.agent-card');
        agentCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.action-btn')) return;
                
                const agentName = card.dataset.agentName;
                const agent = this.agents.find(a => a.name === agentName);
                if (agent) {
                    this.viewAgentDetails(agent);
                }
            });
        });
    }

    viewAgentDetails(agent) {
        this.selectedAgent = agent;
        const modal = document.getElementById('agentDetailModal');
        const content = document.getElementById('agentDetailContent');
        
        if (!content) return;
        
        const languageNames = {
            'python': 'Python',
            'javascript': 'JavaScript',
            'java': 'Java',
            'cpp': 'C++',
            'csharp': 'C#',
            'go': 'Go',
            'rust': 'Rust'
        };

        content.innerHTML = `
            <div class="agent-detail">
                <div class="detail-header">
                    <h2>${agent.name}</h2>
                    <span class="agent-status active">활성</span>
                </div>
                
                <div class="detail-section">
                    <h4>설명</h4>
                    <p>${agent.description}</p>
                </div>
                
                <div class="detail-section">
                    <h4>역할 프롬프트</h4>
                    <p>${agent.role_prompt}</p>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="agentManager.editAgent(agentManager.selectedAgent)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        편집하기
                    </button>
                    <button class="btn btn-danger" onclick="agentManager.deleteAgent(agentManager.selectedAgent)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        삭제하기
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('agentDetailModal');
    }

    editAgent(agent) {
        // 에이전트 편집 페이지로 이동 (추후 구현)
        window.location.href = `/create-agent/?edit=${agent.id}`;
    }

    deleteAgent(agent) {
        this.selectedAgent = agent;
        this.showModal('deleteConfirmModal');
    }

    async confirmDeleteAgent() {
        if (!this.selectedAgent) return;
        
        try {
            // 로딩 표시
            const confirmButton = document.getElementById('confirmDelete');
            if (confirmButton) {
                confirmButton.disabled = true;
                confirmButton.textContent = '삭제 중...';
            }

            // API 호출로 에이전트 삭제
            const response = await fetch(`/api/agents/${encodeURIComponent(this.selectedAgent.name)}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                // 로컬 목록에서 제거
                this.agents = this.agents.filter(agent => agent.name !== this.selectedAgent.name);
                this.filterAgents(); // 필터링된 목록 업데이트
                
                this.closeModal('deleteConfirmModal');
                this.closeModal('agentDetailModal');
                
                this.showSuccess(`에이전트 "${this.selectedAgent.name}"이(가) 삭제되었습니다.`);
                this.selectedAgent = null;
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `삭제 실패: ${response.status}`);
            }
            
        } catch (error) {
            console.error('에이전트 삭제 실패:', error);
            this.showError(error.message || '에이전트 삭제에 실패했습니다.');
        } finally {
            // 버튼 상태 복원
            const confirmButton = document.getElementById('confirmDelete');
            if (confirmButton) {
                confirmButton.disabled = false;
                confirmButton.textContent = '삭제';
            }
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    getStatusText(status) {
        const statusTexts = {
            'active': '활성',
            'inactive': '비활성',
            'error': '오류'
        };
        return statusTexts[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        // 간단한 알림 표시
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

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
}

// 스타일 추가
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.detail-section {
    margin-bottom: 2rem;
}

.detail-section h4 {
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    padding-bottom: 0.5rem;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.detail-grid > div {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.75rem;
    border-radius: 8px;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
}

.metric-item {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 1rem;
    border-radius: 10px;
}

.metric-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.25rem;
}

.metric-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
}

.code-files-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.code-file-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    overflow: hidden;
}

.file-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.file-name {
    font-weight: 500;
    color: white;
}

.code-preview {
    margin: 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.85rem;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.9);
    overflow-x: auto;
}

.detail-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-header h2 {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}
`;
document.head.appendChild(style);

// 페이지 로드 시 AgentManager 초기화
let agentManager;

document.addEventListener('DOMContentLoaded', () => {
    agentManager = new AgentManager();
});
