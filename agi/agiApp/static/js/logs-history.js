/**
 * 로그 및 이력 관리 기능
 */

class LogsHistoryManager {
    constructor() {
        this.systemLogs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        this.activityHistory = JSON.parse(localStorage.getItem('activityHistory') || '[]');
        this.initializeMockData();
    }

    // Mock 데이터 초기화
    initializeMockData() {
        if (this.systemLogs.length === 0) {
            this.systemLogs = [
                {
                    id: 1,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    level: 'INFO',
                    component: 'MonitoringAgent',
                    message: '온도 센서 #1 정상 작동 중',
                    details: { sensorId: 1, temperature: 25.4, status: 'normal' }
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    level: 'WARNING',
                    component: 'PredictionAgent',
                    message: '센서 #3에서 이상 패턴 감지',
                    details: { sensorId: 3, pattern: 'anomaly_detected', confidence: 0.85 }
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 900000).toISOString(),
                    level: 'ERROR',
                    component: 'ControlAgent',
                    message: '자동 제어 실패 - 수동 개입 필요',
                    details: { controllerId: 2, errorCode: 'CTRL_FAIL_001', action: 'manual_intervention_required' }
                },
                {
                    id: 4,
                    timestamp: new Date(Date.now() - 300000).toISOString(),
                    level: 'INFO',
                    component: 'OrchestrationAgent',
                    message: '워크플로우 WF_001 완료',
                    details: { workflowId: 'WF_001', duration: 120, status: 'completed' }
                }
            ];
            this.saveSystemLogs();
        }

        if (this.activityHistory.length === 0) {
            this.activityHistory = [
                {
                    id: 1,
                    timestamp: new Date(Date.now() - 7200000).toISOString(),
                    user: 'admin',
                    action: 'TEMPLATE_CREATED',
                    target: '온도센서_모니터링',
                    details: { templateType: 'monitoring', agentCount: 3 }
                },
                {
                    id: 2,
                    timestamp: new Date(Date.now() - 5400000).toISOString(),
                    user: 'operator1',
                    action: 'WORKFLOW_EXECUTED',
                    target: '이상탐지_워크플로우',
                    details: { workflowId: 'WF_002', executionTime: 45, result: 'success' }
                },
                {
                    id: 3,
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    user: 'admin',
                    action: 'SYSTEM_CONFIG_CHANGED',
                    target: '모니터링 설정',
                    details: { configType: 'monitoring_interval', oldValue: 30, newValue: 15 }
                },
                {
                    id: 4,
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    user: 'operator2',
                    action: 'ALERT_ACKNOWLEDGED',
                    target: '온도 이상 알림',
                    details: { alertId: 'ALT_001', severity: 'medium', responseTime: 120 }
                }
            ];
            this.saveActivityHistory();
        }
    }

    // 시스템 로그 저장
    saveSystemLogs() {
        localStorage.setItem('systemLogs', JSON.stringify(this.systemLogs));
    }

    // 활동 이력 저장
    saveActivityHistory() {
        localStorage.setItem('activityHistory', JSON.stringify(this.activityHistory));
    }

    // 시스템 로그 추가
    addSystemLog(level, component, message, details = {}) {
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            level,
            component,
            message,
            details
        };
        
        this.systemLogs.unshift(log);
        
        // 최대 1000개 로그만 유지
        if (this.systemLogs.length > 1000) {
            this.systemLogs = this.systemLogs.slice(0, 1000);
        }
        
        this.saveSystemLogs();
        this.refreshSystemLogsDisplay();
    }

    // 활동 이력 추가
    addActivityHistory(user, action, target, details = {}) {
        const activity = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            user,
            action,
            target,
            details
        };
        
        this.activityHistory.unshift(activity);
        
        // 최대 500개 이력만 유지
        if (this.activityHistory.length > 500) {
            this.activityHistory = this.activityHistory.slice(0, 500);
        }
        
        this.saveActivityHistory();
        this.refreshActivityHistoryDisplay();
    }

    // 시스템 로그 표시 새로고침
    refreshSystemLogsDisplay() {
        const container = document.getElementById('system-logs-list');
        if (!container) return;

        const filteredLogs = this.filterLogs();
        container.innerHTML = '';

        if (filteredLogs.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-file-alt fa-2x mb-2"></i>
                    <p>조건에 맞는 로그가 없습니다.</p>
                </div>
            `;
            return;
        }

        filteredLogs.forEach(log => {
            const logElement = this.createLogElement(log);
            container.appendChild(logElement);
        });
    }

    // 활동 이력 표시 새로고침
    refreshActivityHistoryDisplay() {
        const container = document.getElementById('activity-history-list');
        if (!container) return;

        const filteredHistory = this.filterHistory();
        container.innerHTML = '';

        if (filteredHistory.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-history fa-2x mb-2"></i>
                    <p>조건에 맞는 이력이 없습니다.</p>
                </div>
            `;
            return;
        }

        filteredHistory.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            container.appendChild(activityElement);
        });
    }

    // 로그 요소 생성
    createLogElement(log) {
        const div = document.createElement('div');
        div.className = `alert alert-${this.getLogAlertClass(log.level)} mb-2`;
        
        const levelIcon = this.getLogLevelIcon(log.level);
        const timeAgo = window.getTimeAgo(log.timestamp);
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <i class="${levelIcon} me-2"></i>
                        <strong>[${log.level}] ${log.component}</strong>
                        <small class="text-muted ms-2">${timeAgo}</small>
                    </div>
                    <p class="mb-1">${log.message}</p>
                    ${Object.keys(log.details).length > 0 ? `
                        <button class="btn btn-sm btn-link p-0" onclick="toggleLogDetails(${log.id})">
                            <small><i class="fas fa-info-circle me-1"></i>세부정보</small>
                        </button>
                        <div id="log-details-${log.id}" class="mt-2" style="display: none;">
                            <pre class="bg-light p-2 rounded"><code>${JSON.stringify(log.details, null, 2)}</code></pre>
                        </div>
                    ` : ''}
                </div>
                <button class="btn btn-sm btn-outline-secondary" onclick="exportLog(${log.id})">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    // 활동 이력 요소 생성
    createActivityElement(activity) {
        const div = document.createElement('div');
        div.className = 'list-group-item';
        
        const timeAgo = window.getTimeAgo(activity.timestamp);
        const actionIcon = this.getActionIcon(activity.action);
        
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <i class="${actionIcon} me-2"></i>
                        <strong>${activity.user}</strong>
                        <span class="ms-2">${this.getActionDescription(activity.action)}</span>
                        <small class="text-muted ms-2">${timeAgo}</small>
                    </div>
                    <p class="mb-1 text-muted">대상: ${activity.target}</p>
                    ${Object.keys(activity.details).length > 0 ? `
                        <button class="btn btn-sm btn-link p-0" onclick="toggleActivityDetails(${activity.id})">
                            <small><i class="fas fa-info-circle me-1"></i>세부정보</small>
                        </button>
                        <div id="activity-details-${activity.id}" class="mt-2" style="display: none;">
                            <pre class="bg-light p-2 rounded"><code>${JSON.stringify(activity.details, null, 2)}</code></pre>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        return div;
    }

    // 로그 레벨별 알림 클래스
    getLogAlertClass(level) {
        switch(level) {
            case 'ERROR': return 'danger';
            case 'WARNING': return 'warning';
            case 'INFO': return 'info';
            case 'DEBUG': return 'secondary';
            default: return 'light';
        }
    }

    // 로그 레벨별 아이콘
    getLogLevelIcon(level) {
        switch(level) {
            case 'ERROR': return 'fas fa-exclamation-triangle text-danger';
            case 'WARNING': return 'fas fa-exclamation-circle text-warning';
            case 'INFO': return 'fas fa-info-circle text-info';
            case 'DEBUG': return 'fas fa-bug text-secondary';
            default: return 'fas fa-circle text-muted';
        }
    }

    // 액션별 아이콘
    getActionIcon(action) {
        switch(action) {
            case 'TEMPLATE_CREATED': return 'fas fa-plus text-success';
            case 'WORKFLOW_EXECUTED': return 'fas fa-play text-primary';
            case 'SYSTEM_CONFIG_CHANGED': return 'fas fa-cog text-warning';
            case 'ALERT_ACKNOWLEDGED': return 'fas fa-check text-info';
            case 'USER_LOGIN': return 'fas fa-sign-in-alt text-success';
            case 'USER_LOGOUT': return 'fas fa-sign-out-alt text-muted';
            default: return 'fas fa-circle text-muted';
        }
    }

    // 액션 설명
    getActionDescription(action) {
        switch(action) {
            case 'TEMPLATE_CREATED': return '템플릿을 생성했습니다';
            case 'WORKFLOW_EXECUTED': return '워크플로우를 실행했습니다';
            case 'SYSTEM_CONFIG_CHANGED': return '시스템 설정을 변경했습니다';
            case 'ALERT_ACKNOWLEDGED': return '알림을 확인했습니다';
            case 'USER_LOGIN': return '로그인했습니다';
            case 'USER_LOGOUT': return '로그아웃했습니다';
            default: return '작업을 수행했습니다';
        }
    }

    // 로그 필터링
    filterLogs() {
        let filtered = [...this.systemLogs];
        
        // 로그 레벨 필터
        const levelFilter = document.getElementById('log-level-filter');
        if (levelFilter && levelFilter.value !== 'all') {
            filtered = filtered.filter(log => log.level === levelFilter.value);
        }
        
        // 컴포넌트 필터
        const componentFilter = document.getElementById('log-component-filter');
        if (componentFilter && componentFilter.value !== 'all') {
            filtered = filtered.filter(log => log.component === componentFilter.value);
        }
        
        // 검색어 필터
        const searchInput = document.getElementById('log-search-input');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(log => 
                log.message.toLowerCase().includes(searchTerm) ||
                log.component.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    }

    // 이력 필터링
    filterHistory() {
        let filtered = [...this.activityHistory];
        
        // 사용자 필터
        const userFilter = document.getElementById('history-user-filter');
        if (userFilter && userFilter.value !== 'all') {
            filtered = filtered.filter(activity => activity.user === userFilter.value);
        }
        
        // 액션 필터
        const actionFilter = document.getElementById('history-action-filter');
        if (actionFilter && actionFilter.value !== 'all') {
            filtered = filtered.filter(activity => activity.action === actionFilter.value);
        }
        
        // 검색어 필터
        const searchInput = document.getElementById('history-search-input');
        if (searchInput && searchInput.value.trim()) {
            const searchTerm = searchInput.value.trim().toLowerCase();
            filtered = filtered.filter(activity => 
                activity.target.toLowerCase().includes(searchTerm) ||
                activity.user.toLowerCase().includes(searchTerm)
            );
        }
        
        return filtered;
    }

    // 로그 내보내기
    exportLogs(format = 'json') {
        const logs = this.filterLogs();
        let content, filename, mimeType;
        
        if (format === 'csv') {
            content = this.convertLogsToCSV(logs);
            filename = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(logs, null, 2);
            filename = `system_logs_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        }
        
        this.downloadFile(content, filename, mimeType);
    }

    // 이력 내보내기
    exportHistory(format = 'json') {
        const history = this.filterHistory();
        let content, filename, mimeType;
        
        if (format === 'csv') {
            content = this.convertHistoryToCSV(history);
            filename = `activity_history_${new Date().toISOString().split('T')[0]}.csv`;
            mimeType = 'text/csv';
        } else {
            content = JSON.stringify(history, null, 2);
            filename = `activity_history_${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        }
        
        this.downloadFile(content, filename, mimeType);
    }

    // CSV 변환 (로그)
    convertLogsToCSV(logs) {
        const headers = ['Timestamp', 'Level', 'Component', 'Message', 'Details'];
        const rows = logs.map(log => [
            log.timestamp,
            log.level,
            log.component,
            log.message,
            JSON.stringify(log.details)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    // CSV 변환 (이력)
    convertHistoryToCSV(history) {
        const headers = ['Timestamp', 'User', 'Action', 'Target', 'Details'];
        const rows = history.map(activity => [
            activity.timestamp,
            activity.user,
            activity.action,
            activity.target,
            JSON.stringify(activity.details)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    // 파일 다운로드
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 전역 함수들
function loadSystemLogs() {
    if (typeof window.logsManager === 'undefined') {
        window.logsManager = new LogsHistoryManager();
    }
    window.logsManager.refreshSystemLogsDisplay();
}

function loadActivityHistory() {
    if (typeof window.logsManager === 'undefined') {
        window.logsManager = new LogsHistoryManager();
    }
    window.logsManager.refreshActivityHistoryDisplay();
}

function applyLogFilters() {
    if (window.logsManager) {
        window.logsManager.refreshSystemLogsDisplay();
    }
}

function applyHistoryFilters() {
    if (window.logsManager) {
        window.logsManager.refreshActivityHistoryDisplay();
    }
}

function clearLogFilters() {
    const filters = ['log-level-filter', 'log-component-filter', 'log-search-input'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = element.tagName === 'SELECT' ? 'all' : '';
    });
    applyLogFilters();
}

function clearHistoryFilters() {
    const filters = ['history-user-filter', 'history-action-filter', 'history-search-input'];
    filters.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = element.tagName === 'SELECT' ? 'all' : '';
    });
    applyHistoryFilters();
}

function exportSystemLogs(format) {
    if (window.logsManager) {
        window.logsManager.exportLogs(format);
    }
}

function exportActivityHistory(format) {
    if (window.logsManager) {
        window.logsManager.exportHistory(format);
    }
}

function toggleLogDetails(logId) {
    const details = document.getElementById(`log-details-${logId}`);
    if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleActivityDetails(activityId) {
    const details = document.getElementById(`activity-details-${activityId}`);
    if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
}

function exportLog(logId) {
    if (window.logsManager) {
        const log = window.logsManager.systemLogs.find(l => l.id === logId);
        if (log) {
            const content = JSON.stringify(log, null, 2);
            const filename = `log_${logId}_${new Date().toISOString().split('T')[0]}.json`;
            window.logsManager.downloadFile(content, filename, 'application/json');
        }
    }
}

// 전역 스코프에 함수들 할당
window.loadSystemLogs = loadSystemLogs;
window.loadActivityHistory = loadActivityHistory;
window.applyLogFilters = applyLogFilters;
window.applyHistoryFilters = applyHistoryFilters;
window.clearLogFilters = clearLogFilters;
window.clearHistoryFilters = clearHistoryFilters;
window.exportSystemLogs = exportSystemLogs;
window.exportActivityHistory = exportActivityHistory;
window.toggleLogDetails = toggleLogDetails;
window.toggleActivityDetails = toggleActivityDetails;
window.exportLog = exportLog;
