// 서버 로그 페이지 JavaScript

// 전역 변수
let allLogs = [];

// DOM 요소
const logsList = document.getElementById('logsList');
const refreshBtn = document.getElementById('refreshLogs');
const exportBtn = document.getElementById('exportLogs');
const backToChat = document.getElementById('backToChat');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadLogsFromDOM();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 버튼 이벤트
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshLogs);
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportLogs);
    }
    
    if (backToChat) {
        backToChat.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
}


// DOM에서 로그 데이터 로드
function loadLogsFromDOM() {
    const logEntries = document.querySelectorAll('.log-entry');
    allLogs = [];
    
    logEntries.forEach(entry => {
        const logData = entry.dataset.log;
        if (logData) {
            allLogs.push(parseLogEntry(logData));
        }
    });
    
    console.log(`로드된 로그 수: ${allLogs.length}`);
}

// 로그 엔트리 파싱
function parseLogEntry(logString) {
    // 빈 문자열이나 null 체크
    if (!logString || !logString.trim()) {
        return {
            raw: logString || '',
            timestamp: '',
            level: 'LOG',
            type: 'unknown',
            pid: '',
            tid: '',
            message: ''
        };
    }

    // 타임스탬프 패턴 매칭 (다양한 형식 지원)
    const timestampPatterns = [
        /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}/,  // 2024-08-25 15:30:45,123
        /\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,        // 2024-08-25 15:30:45
        /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/       // 25/08/2024 15:30:45
    ];
    
    let timestamp = '';
    let timestampEnd = 0;
    
    for (const pattern of timestampPatterns) {
        const match = logString.match(pattern);
        if (match) {
            timestamp = match[0];
            timestampEnd = logString.indexOf(timestamp) + timestamp.length;
            break;
        }
    }

    // 로그 레벨 추출 (더 포괄적)
    const levelPatterns = ['CRITICAL', 'ERROR', 'WARNING', 'WARN', 'INFO', 'DEBUG', 'TRACE'];
    let level = 'LOG';
    let levelPosition = -1;
    
    for (const lvl of levelPatterns) {
        const index = logString.indexOf(lvl);
        if (index !== -1) {
            level = lvl;
            levelPosition = index;
            break;
        }
    }

    // 타입 추출 (더 다양한 모듈 지원)
    let type = 'unknown';
    const typeMapping = {
        'basehttp': 'basehttp',
        'autoreload': 'autoreload',
        'django': 'django',
        'runserver': 'runserver',
        'External API': 'external_api',
        'HTTPConnectionPool': 'http_pool',
        'GET': 'http_request',
        'POST': 'http_request',
        'PUT': 'http_request',
        'DELETE': 'http_request',
        'api/agents': 'agents_api',
        'Connection': 'connection',
        'timeout': 'timeout'
    };

    for (const [key, value] of Object.entries(typeMapping)) {
        if (logString.toLowerCase().includes(key.toLowerCase())) {
            type = value;
            break;
        }
    }

    // PID 추출 (프로세스 ID)
    const pidMatch = logString.match(/\[(\d+)\]/) || logString.match(/pid:?\s*(\d+)/i);
    const pid = pidMatch ? pidMatch[1] : '';

    // 메시지 추출 (개선된 로직)
    let message = logString;
    
    // 타임스탬프 이후부터 시작
    if (timestampEnd > 0) {
        message = logString.substring(timestampEnd).trim();
    }
    
    // 레벨 제거 (레벨이 있는 경우)
    if (levelPosition !== -1 && message.includes(level)) {
        const levelIndex = message.indexOf(level);
        if (levelIndex !== -1) {
            message = message.substring(levelIndex + level.length).trim();
        }
    }

    // 불필요한 접두사 제거
    message = message.replace(/^[\s\-\[\]]*/, '').trim();

    return {
        raw: logString,
        timestamp: timestamp,
        level: level,
        type: type,
        pid: pid,
        tid: '', // TID는 복잡하므로 일단 빈 값
        message: message || logString.trim() // 메시지 추출 실패 시 원본 사용
    };
}

// 로그 새로고침 (현재 페이지 새로고침)
async function refreshLogs() {
    // 새로고침 버튼 비활성화 및 로딩 표시
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="spinning">
            <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
        </svg>
        새로고침 중...
    `;

    // 0.5초 후 페이지 새로고침
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

// 로그 내보내기 (현재 화면의 logs-list 컨텐츠를 TXT로)
async function exportLogs() {
    // 내보내기 버튼 비활성화
    exportBtn.disabled = true;
    exportBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A2,2 0 0,1 14,4V16L18,12H16V10A2,2 0 0,1 18,8H20V16L16,20H8L4,16V8H6A2,2 0 0,1 8,10V12H6L10,16V4A2,2 0 0,1 12,2Z"/>
        </svg>
        내보내는 중...
    `;

    try {
        // logs-list의 모든 로그 엔트리 가져오기
        const logEntries = document.querySelectorAll('.logs-list .log-entry');
        const logs = [];
        
        logEntries.forEach(entry => {
            const logData = entry.dataset.log;
            if (logData && logData.trim()) {
                logs.push(logData.trim());
            }
        });
        
        // TXT 파일 내용 생성
        const header = `PRISM-AGI 서버 로그 파일
생성 시간: ${new Date().toLocaleString('ko-KR')}
총 로그 수: ${logs.length}개

${'='.repeat(80)}

`;
        
        const logContent = logs.join('\n');
        
        const footer = `

${'='.repeat(80)}
로그 파일 끝 - 총 ${logs.length}개 항목
`;
        
        const txtContent = header + logContent + footer;
        
        // 파일 다운로드
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `server_logs_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast('로그 파일이 성공적으로 다운로드되었습니다.', 'success');
        
    } catch (error) {
        console.error('내보내기 오류:', error);
        showToast('내보내기 중 오류가 발생했습니다.', 'error');
    } finally {
        // 버튼 복원
        setTimeout(() => {
            exportBtn.disabled = false;
            exportBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                내보내기
            `;
        }, 1000);
    }
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                ${type === 'success' ? 
                    '<path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>' :
                    '<path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>'
                }
            </svg>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // 애니메이션과 자동 제거
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
