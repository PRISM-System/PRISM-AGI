// 규정 관리 JavaScript
class RegulationsManager {
    constructor() {
        this.regulations = [];
        this.filteredRegulations = [];
        this.selectedRegulation = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadRegulations();
    }

    bindEvents() {
        // 뒤로가기 버튼
        const backButton = document.getElementById('backToChat');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = '/';
            });
        }

        // 검색 기능
        const searchInput = document.getElementById('searchRegulation');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterRegulations();
            });
        }

        // 필터 기능
        const categoryFilter = document.getElementById('categoryFilter');
        const statusFilter = document.getElementById('statusFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterRegulations();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterRegulations();
            });
        }

        // 새 규정 추가 버튼
        const addButton = document.getElementById('addRegulationBtn');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.showAddRegulationModal();
            });
        }

        // 새로고침 버튼
        const refreshButton = document.getElementById('refreshRegulationsBtn');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadRegulations();
            });
        }

        // 모달 관련 이벤트
        this.bindModalEvents();
    }

    bindModalEvents() {
        const modal = document.getElementById('regulationModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeModal = document.getElementById('closeModal');
        const editBtn = document.getElementById('editRegulationBtn');
        const deleteBtn = document.getElementById('deleteRegulationBtn');
        const downloadBtn = document.getElementById('downloadRegulationBtn');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editRegulation(this.selectedRegulation);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteRegulation(this.selectedRegulation);
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadRegulation(this.selectedRegulation);
            });
        }
    }

    async loadRegulations() {
        this.showLoading(true);
        
        try {
            // 실제 API 호출 대신 더미 데이터 사용
            await this.delay(1000); // 로딩 시뮬레이션
            
            this.regulations = this.getDummyRegulations();
            this.filteredRegulations = [...this.regulations];
            
            this.updateStats();
            this.renderRegulations();
            this.showLoading(false);
            
            // 활동 로그
            if (window.ActivityLogger) {
                window.ActivityLogger.logActivity('regulation_list_loaded', {
                    count: this.regulations.length
                });
            }
        } catch (error) {
            console.error('규정 목록 로드 실패:', error);
            this.showError('규정 목록을 불러오는 중 오류가 발생했습니다.');
            this.showLoading(false);
        }
    }

    getDummyRegulations() {
        return [
            {
                id: 1,
                title: '직원 행동 강령',
                description: '회사 내 모든 직원이 준수해야 할 윤리적 행동 기준과 규범을 정의합니다.',
                category: 'HR',
                status: 'ACTIVE',
                version: '2.1',
                content: '1. 정직성과 신뢰성을 바탕으로 업무를 수행한다.\n2. 회사의 기밀 정보를 보호한다.\n3. 동료와 고객을 존중한다.\n4. 법적, 윤리적 기준을 준수한다.',
                updatedAt: '2024-12-15',
                createdBy: '인사팀'
            },
            {
                id: 2,
                title: '재무 승인 절차',
                description: '회사 지출 및 예산 승인에 대한 절차와 권한을 명시합니다.',
                category: 'FINANCE',
                status: 'ACTIVE',
                version: '1.5',
                content: '1. 50만원 이상 지출 시 팀장 승인 필요\n2. 500만원 이상 지출 시 부서장 승인 필요\n3. 5000만원 이상 지출 시 대표이사 승인 필요',
                updatedAt: '2024-12-10',
                createdBy: '재무팀'
            },
            {
                id: 3,
                title: '안전 관리 지침',
                description: '사업장 내 안전사고 예방 및 대응 절차에 대한 지침입니다.',
                category: 'SAFETY',
                status: 'REVIEW',
                version: '3.0',
                content: '1. 안전장비 착용 의무\n2. 정기 안전교육 참석\n3. 사고 발생 시 즉시 보고\n4. 안전점검 절차 준수',
                updatedAt: '2024-12-08',
                createdBy: '안전관리팀'
            },
            {
                id: 4,
                title: '품질 관리 표준',
                description: '제품 및 서비스 품질 보증을 위한 표준 절차와 기준입니다.',
                category: 'QUALITY',
                status: 'DRAFT',
                version: '1.0',
                content: '1. 품질 목표 설정\n2. 품질 검사 프로세스\n3. 불량품 처리 절차\n4. 지속적 개선 활동',
                updatedAt: '2024-12-05',
                createdBy: '품질관리팀'
            },
            {
                id: 5,
                title: '정보보안 정책',
                description: '회사의 정보 자산 보호를 위한 보안 정책과 절차입니다.',
                category: 'SECURITY',
                status: 'ACTIVE',
                version: '2.3',
                content: '1. 강력한 비밀번호 사용\n2. 정기적 비밀번호 변경\n3. USB 사용 제한\n4. 외부 이메일 첨부파일 주의',
                updatedAt: '2024-12-12',
                createdBy: '정보보안팀'
            }
        ];
    }

    filterRegulations() {
        const searchTerm = document.getElementById('searchRegulation')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        this.filteredRegulations = this.regulations.filter(regulation => {
            const matchesSearch = regulation.title.toLowerCase().includes(searchTerm) ||
                                regulation.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || regulation.category === categoryFilter;
            const matchesStatus = !statusFilter || regulation.status === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.renderRegulations();
    }

    renderRegulations() {
        const grid = document.getElementById('regulationsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) return;

        // 로딩 상태 숨기기
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        if (this.filteredRegulations.length === 0) {
            grid.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'flex';
            }
            return;
        }

        if (emptyState) {
            emptyState.style.display = 'none';
        }

        grid.innerHTML = this.filteredRegulations.map(regulation => 
            this.createRegulationCard(regulation)
        ).join('');

        // 카드 클릭 이벤트 바인딩
        this.bindCardEvents();
    }

    createRegulationCard(regulation) {
        const categoryNames = {
            'HR': '인사 규정',
            'FINANCE': '재무 규정',
            'SAFETY': '안전 규정',
            'QUALITY': '품질 규정',
            'SECURITY': '보안 규정',
            'COMPLIANCE': '컴플라이언스',
            'OPERATIONAL': '운영 규정'
        };

        const statusNames = {
            'ACTIVE': '활성',
            'DRAFT': '초안',
            'REVIEW': '검토중',
            'ARCHIVED': '보관'
        };

        return `
            <div class="regulation-card" data-regulation-id="${regulation.id}">
                <div class="regulation-header">
                    <h3 class="regulation-title">${regulation.title}</h3>
                    <div class="regulation-badges">
                        <span class="category-badge ${regulation.category}">${categoryNames[regulation.category]}</span>
                        <span class="status-badge ${regulation.status}">${statusNames[regulation.status]}</span>
                    </div>
                </div>
                <div class="regulation-description">
                    ${regulation.description}
                </div>
                <div class="regulation-meta">
                    <span class="regulation-version">v${regulation.version}</span>
                    <span class="regulation-date">${regulation.updatedAt}</span>
                </div>
            </div>
        `;
    }

    bindCardEvents() {
        const cards = document.querySelectorAll('.regulation-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const regulationId = parseInt(card.dataset.regulationId);
                const regulation = this.regulations.find(r => r.id === regulationId);
                if (regulation) {
                    this.showRegulationDetails(regulation);
                }
            });
        });
    }

    showRegulationDetails(regulation) {
        this.selectedRegulation = regulation;
        
        const categoryNames = {
            'HR': '인사 규정',
            'FINANCE': '재무 규정',
            'SAFETY': '안전 규정',
            'QUALITY': '품질 규정',
            'SECURITY': '보안 규정',
            'COMPLIANCE': '컴플라이언스',
            'OPERATIONAL': '운영 규정'
        };

        const statusNames = {
            'ACTIVE': '활성',
            'DRAFT': '초안',
            'REVIEW': '검토중',
            'ARCHIVED': '보관'
        };

        // 모달 내용 업데이트
        document.getElementById('modalRegulationTitle').textContent = regulation.title;
        document.getElementById('modalRegulationCategory').textContent = categoryNames[regulation.category];
        document.getElementById('modalRegulationCategory').className = `info-value category-badge ${regulation.category}`;
        document.getElementById('modalRegulationStatus').textContent = statusNames[regulation.status];
        document.getElementById('modalRegulationStatus').className = `info-value status-badge ${regulation.status}`;
        document.getElementById('modalRegulationVersion').textContent = regulation.version;
        document.getElementById('modalRegulationUpdated').textContent = regulation.updatedAt;
        document.getElementById('modalRegulationDescription').textContent = regulation.description;
        document.getElementById('modalRegulationContent').textContent = regulation.content;

        this.showModal();

        // 활동 로그
        if (window.ActivityLogger) {
            window.ActivityLogger.logActivity('regulation_viewed', {
                regulation_id: regulation.id,
                regulation_title: regulation.title
            });
        }
    }

    showModal() {
        const modal = document.getElementById('regulationModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideModal() {
        const modal = document.getElementById('regulationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        this.selectedRegulation = null;
    }

    updateStats() {
        const totalElement = document.getElementById('totalRegulations');
        const activeElement = document.getElementById('activeRegulations');
        const draftElement = document.getElementById('draftRegulations');

        if (totalElement) {
            totalElement.textContent = this.regulations.length;
        }

        if (activeElement) {
            const activeCount = this.regulations.filter(r => r.status === 'ACTIVE').length;
            activeElement.textContent = activeCount;
        }

        if (draftElement) {
            const draftCount = this.regulations.filter(r => r.status === 'DRAFT').length;
            draftElement.textContent = draftCount;
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        // 간단한 에러 표시 (실제로는 더 정교한 알림 시스템 사용)
        alert(message);
    }

    showAddRegulationModal() {
        // 새 규정 추가 모달 표시 (구현 예정)
        alert('새 규정 추가 기능은 곧 구현될 예정입니다.');
        
        if (window.ActivityLogger) {
            window.ActivityLogger.logActivity('add_regulation_clicked');
        }
    }

    editRegulation(regulation) {
        if (!regulation) return;
        
        // 규정 편집 기능 (구현 예정)
        alert(`"${regulation.title}" 편집 기능은 곧 구현될 예정입니다.`);
        
        if (window.ActivityLogger) {
            window.ActivityLogger.logActivity('edit_regulation_clicked', {
                regulation_id: regulation.id,
                regulation_title: regulation.title
            });
        }
    }

    deleteRegulation(regulation) {
        if (!regulation) return;
        
        if (confirm(`"${regulation.title}" 규정을 정말 삭제하시겠습니까?`)) {
            // 실제 삭제 로직 구현 예정
            alert('규정 삭제 기능은 곧 구현될 예정입니다.');
            
            if (window.ActivityLogger) {
                window.ActivityLogger.logActivity('delete_regulation_clicked', {
                    regulation_id: regulation.id,
                    regulation_title: regulation.title
                });
            }
        }
    }

    downloadRegulation(regulation) {
        if (!regulation) return;
        
        // 규정 다운로드 기능 (구현 예정)
        alert(`"${regulation.title}" 다운로드 기능은 곧 구현될 예정입니다.`);
        
        if (window.ActivityLogger) {
            window.ActivityLogger.logActivity('download_regulation_clicked', {
                regulation_id: regulation.id,
                regulation_title: regulation.title
            });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 규정 관리 페이지에서만 초기화
    if (document.body.classList.contains('manage-regulations-page')) {
        window.regulationsManager = new RegulationsManager();
        
        // 활동 로그
        if (window.ActivityLogger) {
            window.ActivityLogger.logActivity('regulations_page_loaded');
        }
    }
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    if (!document.body.classList.contains('manage-regulations-page')) return;
    
    // ESC 키로 모달 닫기
    if (e.key === 'Escape') {
        const modal = document.getElementById('regulationModal');
        if (modal && modal.style.display === 'flex') {
            window.regulationsManager?.hideModal();
        }
    }
    
    // Ctrl+F로 검색 포커스
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('searchRegulation');
        if (searchInput) {
            searchInput.focus();
        }
    }
});
