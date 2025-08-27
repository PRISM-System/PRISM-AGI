// 사용자 로그 페이지 JavaScript

// 전역 변수
let currentLogs = [];
let filteredLogs = [];
let currentPage = 1;
let logsPerPage = 50;
let sortField = 'timestamp';
let sortDirection = 'desc';

// DOM 요소
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
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const copyLogBtn = document.getElementById('copyLogBtn');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing user logs page');
    
    // DOM 요소 존재 확인
    console.log('Pagination elements check:', {
        prevPageBtn: !!prevPageBtn,
        nextPageBtn: !!nextPageBtn,
        pageNumbersEl: !!pageNumbersEl,
        prevPageBtnId: prevPageBtn ? prevPageBtn.id : 'not found',
        nextPageBtnId: nextPageBtn ? nextPageBtn.id : 'not found',
        pageNumbersElId: pageNumbersEl ? pageNumbersEl.id : 'not found'
    });
    
    initializeEventListeners();
    initializeDateFilters();
    loadLogs();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 검색 및 필터
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    logLevelFilter.addEventListener('change', handleFilter);
    logCategoryFilter.addEventListener('change', handleFilter);
    startDateInput.addEventListener('change', handleFilter);
    endDateInput.addEventListener('change', handleFilter);
    
    // 버튼 이벤트
    refreshBtn.addEventListener('click', loadLogs);
    exportBtn.addEventListener('click', exportLogs);
    backToChat.addEventListener('click', () => {
        window.location.href = '/';
    });
    
    // 페이지네이션
    prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
    nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));
    
    // 테이블 정렬
    document.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => handleSort(th.dataset.sort));
    });
    
    // 모달 이벤트
    closeModal.addEventListener('click', closeLogModal);
    closeModalBtn.addEventListener('click', closeLogModal);
    copyLogBtn.addEventListener('click', copyLogToClipboard);
    
    // 모달 외부 클릭 시 닫기
    logDetailModal.addEventListener('click', (e) => {
        if (e.target === logDetailModal) {
            closeLogModal();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && logDetailModal.style.display !== 'none') {
            closeLogModal();
        }
    });
}

// 날짜 필터 초기화
function initializeDateFilters() {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    endDateInput.value = today.toISOString().split('T')[0];
    startDateInput.value = weekAgo.toISOString().split('T')[0];
}

// 로그 데이터 로드
async function loadLogs() {
    try {
        showLoading(true);
        
        // API에서 실제 로그 데이터 가져오기
        const params = new URLSearchParams({
            user_id: 'user_1234',
            page: currentPage,
            per_page: logsPerPage
        });
        
        // 필터 적용
        const levelFilter = logLevelFilter.value;
        const categoryFilter = logCategoryFilter.value;
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        const search = searchInput.value.trim();
        
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
        updatePagination(data.pagination);
        
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
        renderPagination(); // 더미 데이터일 때는 기본 페이지네이션 사용
    }
}

// API에서 받은 통계 데이터 업데이트
function updateStatisticsFromAPI(stats) {
    totalLogsEl.textContent = stats.total || 0;
    warningLogsEl.textContent = stats.warning || 0;
    errorLogsEl.textContent = stats.error || 0;
    todayLogsEl.textContent = stats.today || 0;
}

// API에서 받은 페이지네이션 데이터 업데이트
function updatePagination(pagination) {
    if (!pagination) {
        renderPagination(); // 기본 페이지네이션 사용
        return;
    }
    
    const totalPages = pagination.total_pages || 1;
    currentPage = pagination.current_page || 1;
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    pageNumbersEl.innerHTML = '';
    
    // 페이지 번호 표시 로직
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else {
            startPage = Math.max(1, endPage - 4);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pageNumbersEl.appendChild(pageBtn);
    }
}

// 더미 로그 데이터 생성 (API 실패 시 사용)
function generateDummyLogs() {
    const logs = [];
    const actionTypes = [
        { type: 'agent_create', display: '에이전트 생성', messages: [
            'GPT-4 Assistant 에이전트를 생성했습니다.',
            'Data Analyst 에이전트를 생성했습니다.',
            'Code Helper 에이전트를 생성했습니다.'
        ]},
        { type: 'agent_delete', display: '에이전트 삭제', messages: [
            'Test Agent 에이전트를 삭제했습니다.',
            '임시 에이전트를 삭제했습니다.'
        ]},
        { type: 'tool_register', display: '도구 등록', messages: [
            'file_reader 도구를 등록했습니다.',
            'calculator 도구를 등록했습니다.',
            'web_scraper 도구를 등록했습니다.'
        ]},
        { type: 'tool_delete', display: '도구 삭제', messages: [
            'old_tool 도구를 삭제했습니다.',
            'test_tool 도구를 삭제했습니다.'
        ]},
        { type: 'chat_query', display: '자연어 질의', messages: [
            '"안녕하세요" 질의를 처리했습니다.',
            '"파이썬 코드를 작성해주세요" 질의를 처리했습니다.',
            '"데이터 분석을 도와주세요" 질의를 처리했습니다.',
            '"웹사이트를 만들어주세요" 질의를 처리했습니다.'
        ]},
        { type: 'session_create', display: '채팅 세션 생성', messages: [
            '새로운 채팅 세션을 시작했습니다.',
            '채팅 세션을 생성했습니다.'
        ]},
        { type: 'session_delete', display: '채팅 세션 삭제', messages: [
            '채팅 세션을 삭제했습니다.',
            '오래된 채팅 세션을 정리했습니다.'
        ]}
    ];
    
    const levels = ['INFO', 'WARNING', 'ERROR'];
    
    for (let i = 0; i < 150; i++) { // 50에서 150으로 증가
        const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const message = actionType.messages[Math.floor(Math.random() * actionType.messages.length)];
        
        logs.push({
            id: i + 1,
            user: 'user_1234',  // 사용자 정보 추가
            timestamp: timestamp.toISOString(),
            level: level,
            action_type: actionType.type,
            action_type_display: actionType.display,
            level_display: level === 'INFO' ? '정보' : level === 'WARNING' ? '경고' : '오류',
            message: message,
            details: {
                ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                session_id: 'sess_' + Math.random().toString(36).substr(2, 9),
                additional_data: {
                    request_id: 'req_' + Math.random().toString(36).substr(2, 9),
                    duration: Math.floor(Math.random() * 1000) + 'ms',
                    status: Math.random() > 0.8 ? 'failed' : 'success'
                }
            },
            ip_address: '192.168.1.' + Math.floor(Math.random() * 255),
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
    }
    
    // 시간순 정렬
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return logs;
}

// 로딩 상태 표시
function showLoading(show) {
    if (show) {
        loadingContainer.style.display = 'flex';
        emptyState.style.display = 'none';
        logsTableBody.innerHTML = '';
    } else {
        loadingContainer.style.display = 'none';
    }
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
    
    // 정렬 표시 업데이트
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    const activeTh = document.querySelector(`[data-sort="${field}"]`);
    if (activeTh) {
        activeTh.classList.add(sortDirection);
    }
    
    applyFilters();
}

// 필터 적용
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const levelValue = logLevelFilter.value;
    const categoryValue = logCategoryFilter.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    filteredLogs = currentLogs.filter(log => {
        const matchesSearch = !searchTerm || 
            log.message.toLowerCase().includes(searchTerm) ||
            (log.user || 'user_1234').toLowerCase().includes(searchTerm) ||
            (log.action_type_display || log.action_type).toLowerCase().includes(searchTerm);
        
        const matchesLevel = !levelValue || log.level === levelValue;
        const matchesCategory = !categoryValue || log.action_type === categoryValue;
        
        let matchesDate = true;
        if (startDate || endDate) {
            const logDate = new Date(log.timestamp).toISOString().split('T')[0];
            if (startDate && logDate < startDate) matchesDate = false;
            if (endDate && logDate > endDate) matchesDate = false;
        }
        
        return matchesSearch && matchesLevel && matchesCategory && matchesDate;
    });
    
    // 정렬 적용
    filteredLogs.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (sortField === 'timestamp') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    currentPage = 1;
    renderLogs();
    renderPagination();
}

// 로그 테이블 렌더링
function renderLogs() {
    logsTableBody.innerHTML = '';
    
    if (filteredLogs.length === 0) {
        emptyState.style.display = 'flex';
        logCountEl.textContent = '0개 항목';
        updatePagination(); // 페이지네이션 업데이트
        return;
    }
    
    emptyState.style.display = 'none';
    
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = Math.min(startIndex + logsPerPage, filteredLogs.length);
    const pageData = filteredLogs.slice(startIndex, endIndex);
    
    pageData.forEach(log => {
        const row = createLogRow(log);
        logsTableBody.appendChild(row);
    });
    
    logCountEl.textContent = `${filteredLogs.length}개 항목`;
    updatePagination(); // 페이지네이션 업데이트
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
    const now = new Date();
    const diff = now - date;
    
    // 오늘 날짜면 시간만 표시
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    }
    
    // 일주일 이내면 요일과 시간 표시
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return date.toLocaleDateString('ko-KR', { 
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // 그 외에는 전체 날짜 표시
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 통계 업데이트
function updateStatistics() {
    const today = new Date().toDateString();
    
    const totalCount = currentLogs.length;
    const warningCount = currentLogs.filter(log => log.level === 'WARNING').length;
    const errorCount = currentLogs.filter(log => log.level === 'ERROR').length;
    const todayCount = currentLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
    ).length;
    
    totalLogsEl.textContent = totalCount.toLocaleString();
    warningLogsEl.textContent = warningCount.toLocaleString();
    errorLogsEl.textContent = errorCount.toLocaleString();
    todayLogsEl.textContent = todayCount.toLocaleString();
}

// 페이지네이션 렌더링
function renderPagination() {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    pageNumbersEl.innerHTML = '';
    
    // 페이지 번호 표시 로직
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else {
            startPage = Math.max(1, endPage - 4);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pageNumbersEl.appendChild(pageBtn);
    }
}

// 페이지 변경
function changePage(page) {
    if (page < 1) return;
    
    currentPage = page;
    
    // API를 사용하는 경우 loadLogs 호출, 아니면 로컬 렌더링
    if (document.querySelector('.loading')) {
        // API 기반일 때는 새로운 데이터를 로드
        loadLogs();
    } else {
        // 로컬 데이터 기반일 때는 기존 로직 사용
        const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
        if (page > totalPages) return;
        
        renderLogs();
        renderPagination();
    }
}

// 로그 상세 모달 열기
function openLogModal(logId) {
    const log = currentLogs.find(l => l.id === logId);
    if (!log) return;
    
    // 모달 내용 채우기
    document.getElementById('modalTimestamp').textContent = 
        new Date(log.timestamp).toLocaleString('ko-KR');
    document.getElementById('modalLevel').textContent = log.level_display || log.level;
    document.getElementById('modalCategory').textContent = log.action_type_display || log.action_type;
    document.getElementById('modalUser').textContent = log.user || 'user_1234';
    document.getElementById('modalMessage').textContent = log.message;
    document.getElementById('modalDetails').textContent = 
        JSON.stringify(log.details, null, 2);
    
    // 현재 로그 정보 저장
    logDetailModal.currentLog = log;
    
    // 모달 표시
    logDetailModal.style.display = 'flex';
}

// 로그 상세 모달 닫기
function closeLogModal() {
    logDetailModal.style.display = 'none';
    logDetailModal.currentLog = null;
}

// 로그 클립보드 복사
function copyLogToClipboard() {
    const log = logDetailModal.currentLog;
    if (!log) return;
    
    const logText = `
시간: ${new Date(log.timestamp).toLocaleString('ko-KR')}
레벨: ${log.level}
카테고리: ${log.category}
사용자: ${log.user}
메시지: ${log.message}
상세 정보:
${JSON.stringify(log.details, null, 2)}
    `.trim();
    
    navigator.clipboard.writeText(logText).then(() => {
        alert('로그가 클립보드에 복사되었습니다.');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다.');
    });
}

// 로그 내보내기
function exportLogs() {
    const csvContent = generateCSV(filteredLogs);
    
    // UTF-8 BOM 추가하여 한글 깨짐 방지
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;
    
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `user_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// CSV 생성
function generateCSV(logs) {
    const headers = ['시간', '레벨', '카테고리', '사용자', '메시지', '상세정보'];
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
        const row = [
            `"${new Date(log.timestamp).toLocaleString('ko-KR')}"`,
            `"${log.level_display || log.level}"`,
            `"${log.action_type_display || log.action_type}"`,
            `"${log.user || 'user_1234'}"`,
            `"${log.message.replace(/"/g, '""')}"`,
            `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// 오류 표시
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        color: #ef4444;
        text-align: center;
    `;
    errorDiv.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="margin-bottom: 16px;">
            <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
        </svg>
        <p>${message}</p>
        <button onclick="loadLogs()" style="margin-top: 12px; padding: 8px 16px; background: #3b82f6; border: none; border-radius: 6px; color: white; cursor: pointer;">
            다시 시도
        </button>
    `;
    
    logsTableBody.innerHTML = '';
    logsTableBody.appendChild(errorDiv);
}

// 디바운스 함수
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 페이지네이션 함수들
function changePage(page) {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    
    if (page < 1 || page > totalPages) {
        return;
    }
    
    currentPage = page;
    renderLogs();
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    
    // 이전/다음 버튼 상태 업데이트
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // 페이지 번호 렌더링
    renderPageNumbers(totalPages);
}

function renderPageNumbers(totalPages) {
    console.log('renderPageNumbers called:', { totalPages, currentPage });
    
    pageNumbersEl.innerHTML = '';
    
    if (totalPages <= 1) {
        console.log('totalPages <= 1, returning early');
        return;
    }
    
    // 페이지 범위 계산
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    console.log('Page range:', { startPage, endPage });
    
    // 시작 페이지 조정
    if (endPage - startPage < 4 && totalPages > 5) {
        if (startPage === 1) {
            endPage = Math.min(5, totalPages);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - 4);
        }
    }
    
    // 첫 페이지
    if (startPage > 1) {
        addPageNumber(1);
        if (startPage > 2) {
            addPageEllipsis();
        }
    }
    
    // 중간 페이지들
    for (let i = startPage; i <= endPage; i++) {
        addPageNumber(i);
    }
    
    // 마지막 페이지
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            addPageEllipsis();
        }
        addPageNumber(totalPages);
    }
    
    console.log('Page numbers rendered. pageNumbersEl children:', pageNumbersEl.children.length);
}

function addPageNumber(pageNum) {
    console.log('Adding page number:', pageNum);
    const pageBtn = document.createElement('button');
    pageBtn.className = `page-number ${pageNum === currentPage ? 'active' : ''}`;
    pageBtn.textContent = pageNum;
    pageBtn.addEventListener('click', () => changePage(pageNum));
    pageNumbersEl.appendChild(pageBtn);
    console.log('Page button added to DOM');
}

function addPageEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.className = 'page-ellipsis';
    ellipsis.textContent = '...';
    pageNumbersEl.appendChild(ellipsis);
}

// 기본 페이지네이션 렌더링 (더미 데이터용)
function renderPagination() {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    
    console.log('renderPagination called:', {
        totalLogs: filteredLogs.length,
        logsPerPage: logsPerPage,
        totalPages: totalPages,
        currentPage: currentPage
    });
    
    // 이전/다음 버튼 상태 업데이트
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    
    // 페이지 번호 렌더링
    renderPageNumbers(totalPages);
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 전역 함수로 노출 (인라인 이벤트에서 사용)
window.openLogModal = openLogModal;
