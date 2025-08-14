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
        // 임시 데모 데이터 (실제로는 API 호출)
        await new Promise(resolve => setTimeout(resolve, 1000)); // 로딩 시뮬레이션
        
        this.agents = [
            {
                id: 1,
                name: 'Data Analyzer Pro',
                description: '고급 데이터 분석 및 시각화를 수행하는 Python 기반 에이전트입니다. 대용량 데이터 처리와 머신러닝 모델 훈련이 가능합니다.',
                language: 'python',
                status: 'active',
                created: '2024-12-19',
                lastModified: '2024-12-19',
                codeFiles: [
                    { name: 'main.py', language: 'python', code: 'import pandas as pd\nimport numpy as np\n\nclass DataAnalyzer:\n    def __init__(self):\n        self.data = None\n    \n    def load_data(self, file_path):\n        self.data = pd.read_csv(file_path)\n        return self.data' },
                    { name: 'visualizer.py', language: 'python', code: 'import matplotlib.pyplot as plt\nimport seaborn as sns\n\nclass Visualizer:\n    def create_plot(self, data):\n        plt.figure(figsize=(10, 6))\n        sns.heatmap(data.corr(), annot=True)\n        plt.show()' }
                ],
                metrics: {
                    executions: 145,
                    successRate: 98.5,
                    avgRuntime: '2.3초'
                }
            },
            {
                id: 2,
                name: 'Web Scraper Bot',
                description: '웹사이트에서 데이터를 수집하고 정제하는 JavaScript 기반 에이전트입니다.',
                language: 'javascript',
                status: 'active',
                created: '2024-12-18',
                lastModified: '2024-12-19',
                codeFiles: [
                    { name: 'scraper.js', language: 'javascript', code: 'const puppeteer = require("puppeteer");\n\nclass WebScraper {\n    async scrapeData(url) {\n        const browser = await puppeteer.launch();\n        const page = await browser.newPage();\n        await page.goto(url);\n        // 스크래핑 로직\n        await browser.close();\n    }\n}' }
                ],
                metrics: {
                    executions: 67,
                    successRate: 94.2,
                    avgRuntime: '5.1초'
                }
            },
            {
                id: 3,
                name: 'File Processor',
                description: '다양한 파일 형식을 처리하고 변환하는 범용 파일 처리 에이전트입니다.',
                language: 'java',
                status: 'inactive',
                created: '2024-12-17',
                lastModified: '2024-12-17',
                codeFiles: [
                    { name: 'FileProcessor.java', language: 'java', code: 'public class FileProcessor {\n    public void processFile(String filePath) {\n        // 파일 처리 로직\n    }\n}' }
                ],
                metrics: {
                    executions: 23,
                    successRate: 87.0,
                    avgRuntime: '1.8초'
                }
            },
            {
                id: 4,
                name: 'API Monitor',
                description: 'REST API 상태를 모니터링하고 알림을 보내는 Go 기반 에이전트입니다.',
                language: 'go',
                status: 'error',
                created: '2024-12-16',
                lastModified: '2024-12-18',
                codeFiles: [
                    { name: 'monitor.go', language: 'go', code: 'package main\n\nimport (\n    "fmt"\n    "net/http"\n    "time"\n)\n\nfunc checkAPI(url string) {\n    resp, err := http.Get(url)\n    if err != nil {\n        fmt.Printf("Error: %v\\n", err)\n        return\n    }\n    defer resp.Body.Close()\n}' }
                ],
                metrics: {
                    executions: 12,
                    successRate: 75.0,
                    avgRuntime: '0.5초'
                }
            }
        ];
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
        const statusClass = agent.status;
        const languageNames = {
            'python': 'Python',
            'javascript': 'JavaScript',
            'java': 'Java',
            'cpp': 'C++',
            'csharp': 'C#',
            'go': 'Go',
            'rust': 'Rust'
        };

        return `
            <div class="agent-card" data-agent-id="${agent.id}">
                <div class="agent-header">
                    <h3 class="agent-name">${agent.name}</h3>
                    <span class="agent-status ${statusClass}">${this.getStatusText(agent.status)}</span>
                </div>
                <p class="agent-description">${agent.description}</p>
                <div class="agent-meta">
                    <div class="agent-language">
                        <span class="language-badge">${languageNames[agent.language] || agent.language}</span>
                        <span>${agent.codeFiles.length}개 파일</span>
                    </div>
                    <span class="agent-date">${this.formatDate(agent.created)}</span>
                </div>
                <div class="agent-actions">
                    <button class="action-btn view" data-action="view" data-agent-id="${agent.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                        </svg>
                        상세보기
                    </button>
                    <button class="action-btn edit" data-action="edit" data-agent-id="${agent.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        편집
                    </button>
                    <button class="action-btn delete" data-action="delete" data-agent-id="${agent.id}">
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
                const agentId = parseInt(button.dataset.agentId);
                const agent = this.agents.find(a => a.id === agentId);
                
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
                
                const agentId = parseInt(card.dataset.agentId);
                const agent = this.agents.find(a => a.id === agentId);
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
                    <span class="agent-status ${agent.status}">${this.getStatusText(agent.status)}</span>
                </div>
                
                <div class="detail-section">
                    <h4>설명</h4>
                    <p>${agent.description}</p>
                </div>
                
                <div class="detail-section">
                    <h4>기본 정보</h4>
                    <div class="detail-grid">
                        <div>
                            <strong>언어:</strong> ${languageNames[agent.language] || agent.language}
                        </div>
                        <div>
                            <strong>생성일:</strong> ${this.formatDate(agent.created)}
                        </div>
                        <div>
                            <strong>수정일:</strong> ${this.formatDate(agent.lastModified)}
                        </div>
                        <div>
                            <strong>파일 수:</strong> ${agent.codeFiles.length}개
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>성능 지표</h4>
                    <div class="metrics-grid">
                        <div class="metric-item">
                            <span class="metric-value">${agent.metrics.executions}</span>
                            <span class="metric-label">실행 횟수</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${agent.metrics.successRate}%</span>
                            <span class="metric-label">성공률</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-value">${agent.metrics.avgRuntime}</span>
                            <span class="metric-label">평균 실행시간</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>코드 파일</h4>
                    <div class="code-files-list">
                        ${agent.codeFiles.map(file => `
                            <div class="code-file-item">
                                <div class="file-header">
                                    <span class="file-name">${file.name}</span>
                                    <span class="language-badge">${languageNames[file.language] || file.language}</span>
                                </div>
                                <pre class="code-preview"><code>${this.escapeHtml(file.code.substring(0, 200))}${file.code.length > 200 ? '...' : ''}</code></pre>
                            </div>
                        `).join('')}
                    </div>
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
            // API 호출로 에이전트 삭제 (임시로 로컬에서 제거)
            this.agents = this.agents.filter(agent => agent.id !== this.selectedAgent.id);
            this.filterAgents(); // 필터링된 목록 업데이트
            
            this.closeModal('deleteConfirmModal');
            this.closeModal('agentDetailModal');
            
            this.showSuccess(`에이전트 "${this.selectedAgent.name}"이(가) 삭제되었습니다.`);
            this.selectedAgent = null;
            
        } catch (error) {
            console.error('에이전트 삭제 실패:', error);
            this.showError('에이전트 삭제에 실패했습니다.');
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
