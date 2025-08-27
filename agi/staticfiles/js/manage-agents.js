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
                window.location.href = '/django/create-agent/';
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
            const response = await fetch('https://grnd.bimatrix.co.kr/api/agents/');

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const agentsData = await response.json();
            console.log('Raw API response:', agentsData);
            
            // API 응답 데이터를 내부 형식으로 변환
            this.agents = agentsData.map((agent, index) => {
                console.log(`Processing agent ${index}:`, agent);
                return {
                    name: agent.name || '이름 없음',
                    description: agent.description || '설명 없음',
                    role_prompt: agent.role_prompt || '',
                    tools: agent.tools || [],
                    status: 'active', // 기본값으로 active 설정
                    language: 'python' // 기본값으로 python 설정
                };
            });

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
        const toolsHtml = agent.tools && agent.tools.length > 0 
            ? agent.tools.map(tool => `<span class="tool-tag">${this.escapeHtml(tool)}</span>`).join('')
            : '<span class="tool-tag">도구 없음</span>';

        return `
            <div class="agent-card" data-agent-name="${this.escapeHtml(agent.name)}">
                <div class="agent-card-header">
                    <div class="agent-info">
                        <h3 class="agent-name">${this.escapeHtml(agent.name)}</h3>
                    </div>
                </div>
                
                <p class="agent-description">${this.escapeHtml(agent.description)}</p>
                
                <div class="agent-role">
                    ${this.escapeHtml(agent.role_prompt)}
                </div>
                
                <div class="agent-tools">
                    <div class="agent-tools-label">사용 도구 (${agent.tools ? agent.tools.length : 0}개)</div>
                    <div class="tools-list">
                        ${toolsHtml}
                    </div>
                </div>
                
                <div class="agent-card-footer">
                    <div class="agent-actions">
                        <button class="action-btn action-btn-view" data-action="view" data-agent-name="${this.escapeHtml(agent.name)}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                            상세보기
                        </button>
                        <button class="action-btn action-btn-delete" data-action="delete" data-agent-name="${this.escapeHtml(agent.name)}">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        console.log('viewAgentDetails called with:', agent);
        this.selectedAgent = agent;
        console.log('selectedAgent set to:', this.selectedAgent);
        
        const modal = document.getElementById('agentDetailModal');
        const content = document.getElementById('agentDetailContent');
        
        if (!content) return;
        
        const toolsHtml = agent.tools && agent.tools.length > 0 
            ? agent.tools.map(tool => `<span class="detail-tool-tag">${this.escapeHtml(tool)}</span>`).join('')
            : '<span class="no-tools">사용하는 도구가 없습니다.</span>';

        content.innerHTML = `
            <div class="agent-detail">
                <div class="detail-header">
                    <div class="detail-title-section">
                        <h2 class="detail-title">${this.escapeHtml(agent.name)}</h2>
                        <span class="detail-status-badge">활성</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="detail-section-title">에이전트 설명</h4>
                    <div class="detail-content">
                        <p>${this.escapeHtml(agent.description)}</p>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="detail-section-title">역할 프롬프트</h4>
                    <div class="detail-content">
                        <div class="role-prompt-content">${this.escapeHtml(agent.role_prompt)}</div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4 class="detail-section-title">사용 도구 (${agent.tools ? agent.tools.length : 0}개)</h4>
                    <div class="detail-content">
                        <div class="detail-tools-list">
                            ${toolsHtml}
                        </div>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-secondary" onclick="agentManager.closeModal('agentDetailModal')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        닫기
                    </button>
                    <button class="btn btn-danger" onclick="agentManager.deleteAgent(agentManager.selectedAgent)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        에이전트 삭제
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('agentDetailModal');
    }

    // editAgent 함수는 현재 사용하지 않음 (PUT API 지원 전까지 비활성화)
    // editAgent(agent) {
    //     // 디버깅 로그 추가
    //     console.log('editAgent called with:', agent);
    //     console.log('agent.name:', agent?.name);
    //     
    //     if (!agent || !agent.name) {
    //         console.error('Agent or agent.name is undefined:', agent);
    //         alert('에이전트 정보를 찾을 수 없습니다.');
    //         return;
    //     }
    //     
    //     // 에이전트 편집 페이지로 이동 - agent.name을 사용
    //     window.location.href = `/django/create-agent/?edit=${encodeURIComponent(agent.name)}`;
    // }

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
                // 사용자 활동 로그 기록
                if (window.logAgentDelete) {
                    window.logAgentDelete(this.selectedAgent.name, {
                        description: this.selectedAgent.description,
                        tools_count: this.selectedAgent.tools ? this.selectedAgent.tools.length : 0
                    });
                }

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
`;
document.head.appendChild(style);

// 페이지 로드 시 AgentManager 초기화
let agentManager;

document.addEventListener('DOMContentLoaded', () => {
    // 에이전트 관리 페이지인지 확인
    if (document.body.classList.contains('manage-agents-page')) {
        agentManager = new AgentManager();
    }
});
