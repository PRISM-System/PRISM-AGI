/**
 * 로그아웃 및 사용자 인증 관리 유틸리티
 * 모든 페이지에서 공통으로 사용되는 로그아웃 기능과 user_id 체크 기능
 */

// 현재 user_id를 가져오는 함수
function getCurrentUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    
    // URL 파라미터에 user_id가 없으면 null 반환
    if (!userId) {
        console.warn('URL에서 user_id를 찾을 수 없습니다.');
        return null;
    }
    
    return userId;
}

// 로그아웃 함수 (기관 선택 페이지로 이동)
function handleLogout() {
    if (confirm('로그아웃하시겠습니까? 기관 선택 페이지로 이동합니다.')) {
        window.location.href = '/django/';
    }
}

// user_id 체크 및 자동 리다이렉트 함수
function checkUserIdAndRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    
    // user_id가 없으면 landing 페이지로 리다이렉트
    if (!userId) {
        console.log('user_id가 없어 기관 선택 페이지로 이동합니다.');
        window.location.href = '/django/';
        return false;
    }
    
    return true;
}

// 메인 헤더의 로그아웃 버튼 초기화
function initMainLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
}

// 사이드바의 로그아웃 버튼 초기화 (전역 함수로 정의)
window.handleSidebarLogout = function() {
    handleLogout();
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // user_id 체크
    if (!checkUserIdAndRedirect()) {
        return; // 리다이렉트되면 더 이상 진행하지 않음
    }
    
    // 로그아웃 버튼 초기화
    initMainLogoutButton();
});

// 네비게이션 헬퍼 함수들
function goToChat() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/index/?user_id=${userId}` : '/django/index/';
    window.location.href = url;
}

function goToUserLogs() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/user-logs/?user_id=${userId}` : '/django/user-logs/';
    window.location.href = url;
}

function goToServerLogs() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/server-logs/?user_id=${userId}` : '/django/server-logs/';
    window.location.href = url;
}

function goToManageTools() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/manage-tools/?user_id=${userId}` : '/django/manage-tools/';
    window.location.href = url;
}

function goToManageAgents() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/manage-agents/?user_id=${userId}` : '/django/manage-agents/';
    window.location.href = url;
}

function goToManageRegulations() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/manage-regulations/?user_id=${userId}` : '/django/manage-regulations/';
    window.location.href = url;
}

function goToDashboard() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/dashboard/?user_id=${userId}` : '/django/dashboard/';
    window.location.href = url;
}

function navigateToIndex() {
    const userId = getCurrentUserId();
    const url = userId ? `/django/index/?user_id=${userId}` : '/django/';
    window.location.href = url;
}

// 전역 함수로 노출
window.getCurrentUserId = getCurrentUserId;
window.handleLogout = handleLogout;
window.goToChat = goToChat;
window.goToUserLogs = goToUserLogs;
window.goToServerLogs = goToServerLogs;
window.goToManageTools = goToManageTools;
window.goToManageAgents = goToManageAgents;
window.goToManageRegulations = goToManageRegulations;
window.goToDashboard = goToDashboard;
window.navigateToIndex = navigateToIndex;

console.log('Logout Handler initialized');
