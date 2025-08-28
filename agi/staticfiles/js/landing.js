/**
 * Landing Page JavaScript
 * PRISM-AGI 랜딩 페이지 기능
 */

// 시스템 접속 버튼 클릭 시 기관 선택 모달 표시
function enterSystem() {
    console.log('enterSystem() called'); // 디버깅용
    const modal = document.getElementById('institutionModal');
    if (modal) {
        modal.classList.add('show');
        console.log('Modal opened'); // 디버깅용
    } else {
        console.error('Modal element not found');
    }
}

// 모달 닫기
function closeModal() {
    const modal = document.getElementById('institutionModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 기관 선택 처리
function selectInstitution(userId, institutionName) {
    // 선택된 기관 정보를 로컬 스토리지에 저장
    localStorage.setItem('selectedUserId', userId);
    localStorage.setItem('selectedInstitution', institutionName);
    
    // 부드러운 전환 효과
    document.body.classList.add('transitioning');
    
    // 선택 확인 메시지 (선택사항)
    // console.log(`Selected: ${institutionName} (${userId})`);
    
    // 딜레이 후 페이지 이동
    setTimeout(() => {
        // /django/ 페이지로 이동하면서 user_id 전달
        // 기관 선택 완료 후 채팅 페이지로 이동
        window.location.href = `/django/index/?user_id=${userId}`;
    }, 300);
}

// 전역 함수로 export (HTML onclick에서 사용하기 위해)
window.enterSystem = enterSystem;
window.closeModal = closeModal;
window.selectInstitution = selectInstitution;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing page JavaScript loaded'); // 디버깅용
    
    // 페이지 로드 애니메이션
    document.body.classList.add('loaded');
    
    // 이벤트 리스너 등록
    setupEventListeners();
    
    // 버튼 존재 확인
    const demoButton = document.querySelector('.landing-btn.primary');
    const modal = document.getElementById('institutionModal');
    console.log('Demo button found:', !!demoButton);
    console.log('Modal found:', !!modal);
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // 모달 오버레이 클릭 시 닫기 (이미 HTML에서 onclick으로 처리됨)
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    // 필요시 정리 작업 수행
});
