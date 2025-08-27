// 사용자 로그 페이지 JavaScript (페이지네이션 포함 - 6개 항목/페이지)

// 전역 변수
let currentLogs = [];
let filteredLogs = [];
let currentPage = 1;
let logsPerPage = 8; // 한 페이지당 6개 항목
let sortField = 'timestamp';
let sortDirection = 'desc';

// Activity Logger 초기화
console.log('User logs page initialized with pagination (6 items per page)');

// DOM이 로드되면 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing user logs page');
    
    // DOM 요소 참조
    const logsTableBody = document.getElementById('logsTableBody');
    const loadingContainer = document.getElementById('loadingContainer');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchLogs');
    const logLevelFilter = document.getElementById('logLevelFilter');
    const logCategoryFilter = document.getElementById('logCategoryFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const refreshBtn = document.getElementById('refreshLogs');
    const exportBtn = document.getElementById('exportLogs');
    const backToChat = document.getElementById('backToChat');
    
    // 통계 요소
    const totalLogsEl = document.getElementById('totalLogs');
    const warningLogsEl = document.getElementById('warningLogs');
    const errorLogsEl = document.getElementById('errorLogs');
    const todayLogsEl = document.getElementById('todayLogs');
    const logCountEl = document.getElementById('logCount');
    
    // 페이지네이션 요소
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbersEl = document.getElementById('pageNumbers');
    
    // 모달 요소
    const logDetailModal = document.getElementById('logDetailModal');
    const closeModal = document.querySelector('.close-modal');
    
    // 로그 데이터 로드 함수 정의 (다른 함수들보다 먼저 정의)
    window.loadLogs = async function() {
        try {
            showLoading(true);
            
            const params = new URLSearchParams({
                user_id: 'user_1234'
            });
            
            // 필터 적용
            const levelFilter = logLevelFilter ? logLevelFilter.value : '';
            const categoryFilter = logCategoryFilter ? logCategoryFilter.value : '';
            const startDate = startDateInput ? startDateInput.value : '';
            const endDate = endDateInput ? endDateInput.value : '';
            const search = searchInput ? searchInput.value.trim() : '';
            
            if (levelFilter) params.append('level', levelFilter);
            if (categoryFilter) params.append('action_type', categoryFilter);
            if (startDate) params.append('start_date', startDate + 'T00:00:00');
            if (endDate) params.append('end_date', endDate + 'T23:59:59');
            if (search) params.append('search', search);
            
            const response = await fetch(`/django/api/user-logs/?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            currentLogs = data.logs;
            filteredLogs = [...data.logs];
            
            // 통계 업데이트
            if (data.statistics) {
                updateStatisticsFromAPI(data.statistics);
            }
            
            showLoading(false);
            renderLogs();
            
        } catch (error) {
            console.error('로그 로드 오류:', error);
            showLoading(false);
            
            // API 실패 시 더미 데이터로 폴백
            console.log('API 실패, 더미 데이터 사용');
            const logs = generateDummyLogs();
            currentLogs = logs;
            filteredLogs = [...logs];
            updateStatistics();
            renderLogs();
        }
    };
    
    // 이벤트 리스너 등록 (요소가 존재하는 경우에만)
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (logLevelFilter) logLevelFilter.addEventListener('change', handleFilter);
    if (logCategoryFilter) logCategoryFilter.addEventListener('change', handleFilter);
    if (startDateInput) startDateInput.addEventListener('change', handleFilter);
    if (endDateInput) endDateInput.addEventListener('change', handleFilter);
    
    // 버튼 이벤트
    if (refreshBtn) refreshBtn.addEventListener('click', loadLogs);
    if (exportBtn) exportBtn.addEventListener('click', exportLogs);
    if (backToChat) {
        backToChat.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
    
    // 페이지네이션 이벤트
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // 테이블 정렬
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
    
    // 모달 이벤트 (요소가 존재하는 경우에만)
    if (closeModal) {
        closeModal.addEventListener('click', closeLogModal);
    }
    if (logDetailModal) {
        logDetailModal.addEventListener('click', (e) => {
            if (e.target === logDetailModal) {
                closeLogModal();
            }
        });
    }
    
    // API에서 받은 통계 데이터 업데이트
    function updateStatisticsFromAPI(stats) {
        if (totalLogsEl) totalLogsEl.textContent = stats.total.toLocaleString();
        if (warningLogsEl) warningLogsEl.textContent = stats.warning.toLocaleString();
        if (errorLogsEl) errorLogsEl.textContent = stats.error.toLocaleString();
        if (todayLogsEl) todayLogsEl.textContent = stats.today.toLocaleString();
    }
    
    // 더미 데이터 생성 (API 실패 시 폴백용)
    function generateDummyLogs() {
        const actionTypes = [
            { type: 'chat_query', display: '자연어 질의' },
            { type: 'session_create', display: '채팅 세션 생성' },
            { type: 'session_delete', display: '채팅 세션 삭제' },
            { type: 'system_error', display: '시스템 오류' },
            { type: 'orchestrate_error', display: '오케스트레이션 오류' }
        ];
        
        const levels = ['INFO', 'WARNING', 'ERROR'];
        const logs = [];
        
        for (let i = 1; i <= 20; i++) {
            const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
            const level = levels[Math.floor(Math.random() * levels.length)];
            const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            
            logs.push({
                id: i,
                user_id: 'user_1234',
                action_type: actionType.type,
                action_type_display: actionType.display,
                level: level,
                level_display: level,
                message: `${actionType.display} 활동이 수행되었습니다.`,
                details: JSON.stringify({ test: true, id: i }),
                timestamp: timestamp.toISOString(),
                ip_address: '192.168.1.100',
                user_agent: 'Mozilla/5.0'
            });
        }
        
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    // 검색 처리
    function handleSearch() {
        currentPage = 1;
        applyFilters();
    }
    
    // 필터 처리
    function handleFilter() {
        currentPage = 1;
        applyFilters();
    }
    
    // 정렬 처리
    function handleSort(field) {
        if (sortField === field) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortField = field;
            sortDirection = 'desc';
        }
        
        // 정렬 아이콘 업데이트
        document.querySelectorAll('.sortable').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
            if (th.dataset.sort === field) {
                th.classList.add(`sort-${sortDirection}`);
            }
        });
        
        filteredLogs.sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            if (field === 'timestamp') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        currentPage = 1; // 정렬 시 첫 페이지로 이동
        renderLogs();
    }
    
    // 필터 적용
    function applyFilters() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const levelFilter = logLevelFilter ? logLevelFilter.value : '';
        const categoryFilter = logCategoryFilter ? logCategoryFilter.value : '';
        const startDate = startDateInput ? startDateInput.value : '';
        const endDate = endDateInput ? endDateInput.value : '';
        
        filteredLogs = currentLogs.filter(log => {
            // 검색어 필터
            if (searchTerm && !log.message.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            // 레벨 필터
            if (levelFilter && log.level !== levelFilter) {
                return false;
            }
            
            // 카테고리 필터
            if (categoryFilter && log.action_type !== categoryFilter) {
                return false;
            }
            
            // 날짜 필터
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            if (startDate && logDate < startDate) {
                return false;
            }
            if (endDate && logDate > endDate) {
                return false;
            }
            
            return true;
        });
        
        renderLogs();
    }
    
    // 로그 테이블 렌더링
    function renderLogs() {
        if (!logsTableBody) return;
        
        logsTableBody.innerHTML = '';
        
        if (filteredLogs.length === 0) {
            showEmptyState(true);
            if (logCountEl) logCountEl.textContent = '0개 항목';
            updatePagination();
            return;
        }
        
        showEmptyState(false);
        
        // 페이지네이션 적용
        const startIndex = (currentPage - 1) * logsPerPage;
        const endIndex = Math.min(startIndex + logsPerPage, filteredLogs.length);
        const pageData = filteredLogs.slice(startIndex, endIndex);
        
        console.log(`페이지 ${currentPage}: ${startIndex}-${endIndex-1} (총 ${filteredLogs.length}개 중 ${pageData.length}개 표시)`);
        
        pageData.forEach(log => {
            const row = createLogRow(log);
            logsTableBody.appendChild(row);
        });
        
        if (logCountEl) logCountEl.textContent = `${filteredLogs.length}개 항목`;
        updatePagination();
    }
    
    // 로그 행 생성
    function createLogRow(log) {
        const row = document.createElement('tr');
        
        const formattedTime = formatTimestamp(log.timestamp);
        
        row.innerHTML = `
            <td class="log-timestamp">${formattedTime}</td>
            <td><span class="log-level ${log.level}">${log.level_display || log.level}</span></td>
            <td><span class="log-category">${log.action_type_display || log.action_type}</span></td>
            <td class="log-message">${escapeHtml(log.message)}</td>
            <td class="log-actions">
                <button class="action-btn" onclick="openLogModal(${log.id})">상세</button>
            </td>
        `;
        
        return row;
    }
    
    // 시간 포맷팅
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 페이지 변경
    function changePage(page) {
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        console.log(`페이지 변경: ${currentPage} → ${page}`);
        currentPage = page;
        renderLogs();
    }
    
    // 페이지네이션 업데이트
    function updatePagination() {
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        
        console.log(`페이지네이션 업데이트: 총 ${totalPages}페이지, 현재 ${currentPage}페이지`);
        
        // 이전/다음 버튼 상태 업데이트
        if (prevPageBtn) prevPageBtn.disabled = currentPage <= 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages;
        
        // 페이지 번호 렌더링
        renderPageNumbers(totalPages);
    }
    
    // 페이지 번호 렌더링
    function renderPageNumbers(totalPages) {
        if (!pageNumbersEl) return;
        
        pageNumbersEl.innerHTML = '';
        
        if (totalPages <= 1) {
            console.log('페이지가 1개 이하이므로 페이지네이션을 숨깁니다');
            return;
        }
        
        // 페이지 범위 계산
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        // 시작 페이지 조정
        if (endPage - startPage < 4 && totalPages > 4) {
            if (startPage === 1) {
                endPage = Math.min(5, totalPages);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - 4);
            }
        }
        
        // 첫 페이지
        if (startPage > 1) {
            const firstBtn = createPageButton(1, false);
            pageNumbersEl.appendChild(firstBtn);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pageNumbersEl.appendChild(ellipsis);
            }
        }
        
        // 중간 페이지들
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPageButton(i, i === currentPage);
            pageNumbersEl.appendChild(pageBtn);
        }
        
        // 마지막 페이지
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pageNumbersEl.appendChild(ellipsis);
            }
            
            const lastBtn = createPageButton(totalPages, false);
            pageNumbersEl.appendChild(lastBtn);
        }
        
        console.log(`페이지 번호 렌더링 완료: ${startPage}-${endPage} (총 ${totalPages}페이지)`);
    }
    
    // 페이지 버튼 생성
    function createPageButton(pageNum, isActive) {
        const button = document.createElement('button');
        button.textContent = pageNum;
        button.className = `page-btn ${isActive ? 'active' : ''}`;
        button.addEventListener('click', () => changePage(pageNum));
        return button;
    }
    
    // 로딩 상태 표시/숨김
    function showLoading(show) {
        if (loadingContainer) {
            loadingContainer.style.display = show ? 'flex' : 'none';
        }
    }
    
    // 빈 상태 표시/숨김
    function showEmptyState(show) {
        if (emptyState) {
            emptyState.style.display = show ? 'flex' : 'none';
        }
    }
    
    // 통계 업데이트 (더미 데이터용)
    function updateStatistics() {
        const totalCount = currentLogs.length;
        const warningCount = currentLogs.filter(log => log.level === 'WARNING').length;
        const errorCount = currentLogs.filter(log => log.level === 'ERROR').length;
        
        const today = new Date().toISOString().split('T')[0];
        const todayCount = currentLogs.filter(
            log => new Date(log.timestamp).toISOString().split('T')[0] === today
        ).length;
        
        if (totalLogsEl) totalLogsEl.textContent = totalCount.toLocaleString();
        if (warningLogsEl) warningLogsEl.textContent = warningCount.toLocaleString();
        if (errorLogsEl) errorLogsEl.textContent = errorCount.toLocaleString();
        if (todayLogsEl) todayLogsEl.textContent = todayCount.toLocaleString();
    }
    
    // 로그 상세 모달 열기 (전역 함수로 정의)
    window.openLogModal = function(logId) {
        const log = currentLogs.find(l => l.id === logId);
        if (!log || !logDetailModal) return;
        
        const modalElements = {
            'modalLogId': log.id,
            'modalLogUser': log.user_id || 'N/A',
            'modalLogTimestamp': formatTimestamp(log.timestamp),
            'modalLogLevel': log.level_display || log.level,
            'modalLogCategory': log.action_type_display || log.action_type,
            'modalLogMessage': log.message,
            'modalLogDetails': log.details || 'N/A',
            'modalLogIp': log.ip_address || 'N/A',
            'modalLogUserAgent': log.user_agent || 'N/A'
        };
        
        // 모달 요소에 데이터 설정
        Object.entries(modalElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        logDetailModal.style.display = 'block';
    };
    
    // 로그 상세 모달 닫기
    function closeLogModal() {
        if (logDetailModal) {
            logDetailModal.style.display = 'none';
        }
    }
    
    // 로그 내보내기
    function exportLogs() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "시간,레벨,카테고리,메시지,IP주소\n"
            + filteredLogs.map(log => 
                `"${formatTimestamp(log.timestamp)}","${log.level}","${log.action_type_display || log.action_type}","${log.message}","${log.ip_address || 'N/A'}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `user_logs_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 초기 로그 로드
    loadLogs();
});
