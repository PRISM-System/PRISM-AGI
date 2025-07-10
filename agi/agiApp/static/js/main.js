/**
 * AI 에이전트 플랫폼 - 메인 JavaScript 파일
 * 핵심 기능 및 유틸리티 함수들
 */

// 전역 변수들
let currentWorkflowId = null;
let displayedAgentResults = new Set();
let isAutoMonitoringActive = true;
let monitoredSensorCount = 24;
let currentAnomalyCount = 0;
let alertHistory = [];
let unreadAlertCount = 0;
let monitoringInterval = null;

// 윈도우 전역 변수 설정
window.currentPollingInterval = null;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI 에이전트 플랫폼 초기화 시작');
    
    // 예시 질문 추가
    addExampleQueries();
    
    // 알림 히스토리 로드
    loadAlertHistory();
    
    // 실시간 알림 모니터링 시작
    startAlertMonitoring();
    
    // 초기 테스트 이상 생성 (데모용)
    setTimeout(() => {
        currentAnomalyCount = 1; // 테스트용 이상 1건 설정
        
        // 이상 수 UI 업데이트
        const anomalyCountElement = document.getElementById('anomaly-count');
        if (anomalyCountElement) {
            anomalyCountElement.textContent = currentAnomalyCount;
        }
        
        // 모니터링 상태 업데이트
        if (typeof updateMonitoringIndicator === 'function') {
            updateMonitoringIndicator();
        }
        
        console.log('초기 테스트 이상 생성:', currentAnomalyCount, '건');
    }, 2000);
    
    // 자동 모니터링 시작
    startAutoMonitoring();
    
    console.log('AI 에이전트 플랫폼 초기화 완료');
});

// 이전 결과 초기화
function clearPreviousResults() {
    // 기존 워크플로우 폴링 중지
    if (window.currentPollingInterval) {
        clearInterval(window.currentPollingInterval);
        window.currentPollingInterval = null;
    }
    
    // 대시보드 숨기기
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
        dashboard.style.display = 'none';
    }
    
    // 분석 결과 초기화
    const queryAnalysis = document.getElementById('query-analysis');
    if (queryAnalysis) {
        queryAnalysis.innerHTML = '';
    }
    
    // 워크플로우 상태 카드 숨기기
    const workflowStatusCard = document.getElementById('workflow-status-card');
    if (workflowStatusCard) {
        workflowStatusCard.style.display = 'none';
    }
    
    // 에이전트 결과 초기화
    const agentResults = document.getElementById('agent-results');
    if (agentResults) {
        agentResults.innerHTML = '';
    }
    
    // 워크플로우 진행상황 초기화
    const workflowProgress = document.getElementById('workflow-progress');
    if (workflowProgress) {
        workflowProgress.innerHTML = '';
    }
    
    // 상태 변수 초기화
    currentWorkflowId = null;
    displayedAgentResults.clear();
    
    // 상태 메시지 초기화
    const queryStatus = document.getElementById('query-status');
    if (queryStatus) {
        queryStatus.innerHTML = '';
    }
}

// 상태 메시지 표시
function showQueryStatus(message, type) {
    const statusDiv = document.getElementById('query-status');
    if (statusDiv) {
        statusDiv.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    }
}

// 쿠키 가져오기 (CSRF 토큰용)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// 시간 경과 표시
function getTimeAgo(timestamp) {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
}

// 섹션 전환 함수
function showSection(sectionId) {
    // 모든 섹션 숨기기
    const sections = ['dashboard', 'agent-settings', 'logs-history', 'external-tools', 'advanced-analytics'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // 히어로 섹션과 일반 섹션들 숨기기
    const heroSection = document.querySelector('.hero-section');
    const featuresSection = document.getElementById('features');
    const aboutSection = document.getElementById('about');
    const agentsSection = document.getElementById('agents');
    
    if (heroSection) heroSection.style.display = 'none';
    if (featuresSection) featuresSection.style.display = 'none';
    if (aboutSection) aboutSection.style.display = 'none';
    if (agentsSection) agentsSection.style.display = 'none';
    
    // 선택된 섹션 표시
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // 특정 섹션에 대한 초기화 작업
        switch(sectionId) {
            case 'agent-settings':
                initializeAgentSettings();
                break;
            case 'logs-history':
                initializeLogsHistory();
                break;
            case 'external-tools':
                initializeExternalTools();
                break;
            case 'advanced-analytics':
                initializeAdvancedAnalytics();
                break;
        }
    }
    
    // 스크롤을 맨 위로
    window.scrollTo(0, 0);
}

// 메인 페이지로 돌아가기
function showMainPage() {
    // 모든 관리 섹션 숨기기
    const sections = ['agent-settings', 'logs-history', 'external-tools', 'advanced-analytics'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
    
    // 메인 섹션들 표시
    const heroSection = document.querySelector('.hero-section');
    const featuresSection = document.getElementById('features');
    const aboutSection = document.getElementById('about');
    const agentsSection = document.getElementById('agents');
    
    if (heroSection) heroSection.style.display = 'block';
    if (featuresSection) featuresSection.style.display = 'block';
    if (aboutSection) aboutSection.style.display = 'block';
    if (agentsSection) agentsSection.style.display = 'block';
    
    window.scrollTo(0, 0);
}

// 에이전트 설정 초기화
function initializeAgentSettings() {
    if (typeof AgentTemplateManager !== 'undefined') {
        window.templateManager = new AgentTemplateManager();
    }
}

// 로그 및 이력 관리 초기화
function initializeLogsHistory() {
    loadSystemLogs();
    loadActivityHistory();
}

// 외부 도구 초기화
function initializeExternalTools() {
    loadAvailableTools();
}

// 고급 분석 기능 초기화
function initializeAdvancedAnalytics() {
    loadAnalyticsModules();
}

// 전역 스코프에 함수들 할당
window.clearPreviousResults = clearPreviousResults;
window.showQueryStatus = showQueryStatus;
window.getCookie = getCookie;
window.getTimeAgo = getTimeAgo;
window.showSection = showSection;
window.showMainPage = showMainPage;
