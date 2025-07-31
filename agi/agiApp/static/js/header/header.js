// Header JavaScript Functions
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    toggleFamilySite();
});

function initializeHeader() {
    // 스크롤 이벤트 리스너
    window.addEventListener('scroll', handleScroll);
    
    // 알림 시스템 초기화
    initializeAlertSystem();
    
    // 네비게이션 기능 초기화
    initializeNavigation();
    
    // 모바일 메뉴 초기화
    initializeMobileMenu();
    
    // 드롭다운 메뉴 초기화
    initializeDropdownMenus();
    
    // 검색 기능 초기화
    initializeSearch();
    
    // 패밀리 사이트 슬라이더 초기화
    initializeFamilySiteSlider();
}

// 스크롤 처리
function handleScroll() {
    const gnbBar = document.querySelector('.gnb__bar');
    
    if (window.scrollY > 50) {
        if (gnbBar) gnbBar.classList.add('scrolled');
    } else {
        if (gnbBar) gnbBar.classList.remove('scrolled');
    }
}

// 모바일 메뉴 초기화
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile_menu');
    const mobileMenuCloseBtn = document.querySelector('.mobile_menu_close');
    const gnbSubBar = document.querySelector('.gnb__sub_bar');
    const body = document.body;
    
    if (mobileMenuBtn && gnbSubBar) {
        mobileMenuBtn.addEventListener('click', function() {
            gnbSubBar.style.right = '0';
            gnbSubBar.style.display = 'block';
            body.classList.add('no_scroll');
        });
    }
    
    if (mobileMenuCloseBtn && gnbSubBar) {
        mobileMenuCloseBtn.addEventListener('click', function() {
            gnbSubBar.style.right = '-280px';
            setTimeout(() => {
                gnbSubBar.style.display = 'none';
            }, 300);
            body.classList.remove('no_scroll');
        });
    }
    
    // 모바일 서브메뉴 토글
    const mobileMenuItems = document.querySelectorAll('.gnb__submenus__1dp');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const subMenu = this.nextElementSibling;
            const isActive = this.classList.contains('_on');
            
            // 모든 메뉴 닫기
            mobileMenuItems.forEach(otherItem => {
                otherItem.classList.remove('_on');
                const otherSubMenu = otherItem.nextElementSibling;
                if (otherSubMenu) {
                    otherSubMenu.style.display = 'none';
                }
            });
            
            // 클릭한 메뉴 토글
            if (!isActive && subMenu) {
                this.classList.add('_on');
                subMenu.style.display = 'block';
            }
        });
    });
}

// 드롭다운 메뉴 초기화
function initializeDropdownMenus() {
    const gnbMenus = document.querySelectorAll('.gnb__menu');
    const gnbSubBar = document.querySelector('.gnb__sub_bar');
    let hideTimeout;
    
    // 데스크톱에서만 동작하도록 체크
    if (window.innerWidth <= 768) return;
    
    gnbMenus.forEach((menu, index) => {
        menu.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
            
            // 모든 메뉴에서 active 제거
            gnbMenus.forEach(m => m.classList.remove('active'));
            
            // 현재 메뉴에 active 추가
            this.classList.add('active');
            
            // 서브메뉴 표시
            if (gnbSubBar && window.innerWidth > 768) {
                gnbSubBar.style.display = 'block';
                gnbSubBar.removeAttribute('hidden');
            }
        });
        
        menu.addEventListener('mouseleave', function() {
            hideTimeout = setTimeout(() => {
                this.classList.remove('active');
                if (gnbSubBar) {
                    gnbSubBar.style.display = 'none';
                    gnbSubBar.setAttribute('hidden', '');
                }
            }, 300);
        });
    });
    
    // 서브메뉴 영역에서 마우스 이벤트 처리
    if (gnbSubBar) {
        gnbSubBar.addEventListener('mouseenter', function() {
            clearTimeout(hideTimeout);
        });
        
        gnbSubBar.addEventListener('mouseleave', function() {
            gnbMenus.forEach(m => m.classList.remove('active'));
            this.style.display = 'none';
            this.setAttribute('hidden', '');
        });
    }
}

// 검색 기능 초기화
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.top__input, .board_list__input');
    const searchButtons = document.querySelectorAll('.top__search, .board_list__search_icon');
    
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    });
    
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.top__input_wrap, .board_list__search')?.querySelector('input');
            if (input) {
                performSearch(input.value);
            }
        });
    });
}

// 검색 실행
function performSearch(query) {
    if (!query.trim()) {
        showToast('검색어를 입력해주세요.', 'warning');
        return;
    }
    
    console.log('검색 실행:', query);
    showToast(`"${query}" 검색 중...`, 'info');
    
    // 실제 검색 로직은 서버 사이드에서 처리
    // 여기서는 페이지 이동 또는 AJAX 요청을 처리
}

// 패밀리 사이트 슬라이더 초기화
function initializeFamilySiteSlider() {
    const familySiteButtons = document.querySelectorAll('.family_site__button');
    const familySiteList = document.querySelector('.family_site__list');
    let currentPosition = 0;
    
    if (!familySiteList || familySiteButtons.length === 0) return;
    
    const slideWidth = 160; // 각 아이템의 너비
    const visibleItems = Math.floor(familySiteList.parentElement.offsetWidth / slideWidth);
    const totalItems = familySiteList.children.length;
    const maxPosition = Math.max(0, (totalItems - visibleItems) * slideWidth);
    
    familySiteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isNext = this.querySelector('.family_site__button_icon--reverse') === null;
            
            if (isNext && currentPosition < maxPosition) {
                currentPosition += slideWidth;
            } else if (!isNext && currentPosition > 0) {
                currentPosition -= slideWidth;
            }
            
            familySiteList.style.transform = `translateX(-${currentPosition}px)`;
            
            // 버튼 상태 업데이트
            updateFamilySiteButtonStates();
        });
    });
    
    function updateFamilySiteButtonStates() {
        const prevButton = document.querySelector('.family_site__button:first-child');
        const nextButton = document.querySelector('.family_site__button:last-child');
        
        if (prevButton) {
            prevButton.style.opacity = currentPosition === 0 ? '0.5' : '1';
            prevButton.style.pointerEvents = currentPosition === 0 ? 'none' : 'auto';
        }
        
        if (nextButton) {
            nextButton.style.opacity = currentPosition >= maxPosition ? '0.5' : '1';
            nextButton.style.pointerEvents = currentPosition >= maxPosition ? 'none' : 'auto';
        }
    }
    
    // 초기 버튼 상태 설정
    updateFamilySiteButtonStates();
    
    // 자동 슬라이드 (선택사항)
    setInterval(() => {
        if (currentPosition >= maxPosition) {
            currentPosition = 0;
        } else {
            currentPosition += slideWidth;
        }
        familySiteList.style.transform = `translateX(-${currentPosition}px)`;
        updateFamilySiteButtonStates();
    }, 5000);
}

// 네비게이션 기능
function initializeNavigation() {
    // 네비게이션 링크 클릭 시 부드러운 스크롤
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 메인 페이지로 이동
function showMainPage() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 섹션 표시
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 알림 시스템 초기화
function initializeAlertSystem() {
    updateAlertBadge();
    loadAlertHistory();
}

// 알림 히스토리 로드
function loadAlertHistory() {
    // 이미 HTML에 알림이 포함되어 있으므로 
    // 필요한 경우 동적으로 로드하는 로직을 여기에 추가
    console.log('Alert history loaded');
}

// 알림 배지 업데이트
function updateAlertBadge() {
    const alertBadge = document.getElementById('alert-badge');
    const unreadAlerts = document.querySelectorAll('.alert-item.bg-light').length;
    
    if (alertBadge) {
        if (unreadAlerts > 0) {
            alertBadge.textContent = unreadAlerts;
            alertBadge.style.display = 'block';
        } else {
            alertBadge.style.display = 'none';
        }
    }
}

// 모든 알림 확인
function clearAllAlerts() {
    const alertItems = document.querySelectorAll('.alert-item.bg-light');
    alertItems.forEach(item => {
        item.classList.remove('bg-light');
        item.classList.remove('fw-bold');
        
        // 확인 버튼 제거
        const ackButton = item.querySelector('.btn-outline-primary');
        if (ackButton) {
            ackButton.remove();
        }
    });
    
    updateAlertBadge();
    showToast('모든 알림이 확인되었습니다.', 'success');
}

// 개별 알림 확인
function acknowledgeAlert(alertId) {
    const alertItem = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertItem) {
        // 스타일 변경
        alertItem.classList.remove('bg-light');
        alertItem.classList.remove('fw-bold');
        
        // 확인 버튼 제거
        const ackButton = alertItem.querySelector('.btn-outline-primary');
        if (ackButton) {
            ackButton.style.opacity = '0';
            setTimeout(() => {
                ackButton.remove();
            }, 300);
        }
        
        // 아이콘 변경
        const icon = alertItem.querySelector('.flex-shrink-0 i');
        if (icon) {
            icon.className = 'fas fa-check-circle text-success';
        }
        
        updateAlertBadge();
        showToast('알림이 확인되었습니다.', 'info');
    }
}

// 알림 상세 보기
function showAlertDetails(alertId) {
    const alertItem = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertItem) {
        const title = alertItem.querySelector('h6').textContent;
        const message = alertItem.querySelector('p').textContent.slice(0, 100) + '...';
        const time = alertItem.querySelector('small').textContent;
        
        // 모달 또는 상세 페이지 표시
        showAlertModal(alertId, title, message, time);
    }
}

// 알림 모달 표시
function showAlertModal(alertId, title, message, time) {
    // Bootstrap 모달 생성
    const modalHtml = `
        <div class="modal fade" id="alertModal-${alertId}" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-info-circle me-2"></i>${title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>시간:</strong> ${time}</p>
                        <p><strong>내용:</strong></p>
                        <p>${message}</p>
                        <div class="alert alert-info">
                            <i class="fas fa-lightbulb me-2"></i>
                            이 알림은 시스템에서 자동으로 생성되었습니다.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                        <button type="button" class="btn btn-primary" onclick="acknowledgeAlert(${alertId}); bootstrap.Modal.getInstance(document.getElementById('alertModal-${alertId}')).hide();">
                            확인 처리
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 기존 모달 제거
    const existingModal = document.getElementById(`alertModal-${alertId}`);
    if (existingModal) {
        existingModal.remove();
    }
    
    // 새 모달 추가
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 모달 표시
    const modal = new bootstrap.Modal(document.getElementById(`alertModal-${alertId}`));
    modal.show();
}

// 모든 알림 페이지로 이동
function showAllAlerts() {
    // 알림 페이지로 리다이렉트하거나 모든 알림을 표시하는 모달 생성
    showToast('모든 알림 페이지로 이동합니다.', 'info');
    // window.location.href = '/alerts/';
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    const bgClass = {
        'success': 'bg-success',
        'error': 'bg-danger', 
        'warning': 'bg-warning',
        'info': 'bg-info'
    }[type] || 'bg-info';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-info-circle me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // 토스트 컨테이너 생성 (없는 경우)
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    
    // 토스트 추가
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    // 토스트 표시
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // 토스트 제거
    toastElement.addEventListener('hidden.bs.toast', function() {
        this.remove();
    });
}

// 새 알림 추가 (시뮬레이션)
function addNewAlert(title, message, type = 'info') {
    const alertId = Date.now();
    const now = new Date();
    const timeString = '방금 전';
    
    const iconClass = {
        'info': 'fas fa-info-circle text-info',
        'warning': 'fas fa-exclamation-triangle text-warning',
        'error': 'fas fa-times-circle text-danger',
        'success': 'fas fa-check-circle text-success'
    }[type] || 'fas fa-info-circle text-info';
    
    const newAlertHtml = `
        <div class="alert-item p-2 mb-2 border-bottom bg-light" data-alert-id="${alertId}">
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0">
                    <i class="${iconClass}"></i>
                </div>
                <div class="flex-grow-1 ms-2">
                    <h6 class="mb-1 small fw-bold">${title}</h6>
                    <p class="mb-1 small text-muted">${message}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${timeString}</small>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="acknowledgeAlert(${alertId})">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-info" onclick="showAlertDetails(${alertId})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    const alertHistory = document.getElementById('alert-history');
    if (alertHistory) {
        alertHistory.insertAdjacentHTML('afterbegin', newAlertHtml);
        updateAlertBadge();
        
        // 새 알림 애니메이션
        const newAlert = alertHistory.firstElementChild;
        newAlert.style.opacity = '0';
        newAlert.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            newAlert.style.transition = 'all 0.3s ease';
            newAlert.style.opacity = '1';
            newAlert.style.transform = 'translateX(0)';
        }, 100);
    }
}

// 검색 기능 (향후 확장용)
function searchAlerts(query) {
    const alertItems = document.querySelectorAll('.alert-item');
    alertItems.forEach(item => {
        const title = item.querySelector('h6').textContent.toLowerCase();
        const message = item.querySelector('p').textContent.toLowerCase();
        
        if (title.includes(query.toLowerCase()) || message.includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// 반응형 처리
function handleResize() {
    const isMobile = window.innerWidth <= 768;
    const gnbMenus = document.querySelector('.gnb__menus');
    const gnbSubBar = document.querySelector('.gnb__sub_bar');
    
    if (isMobile) {
        // 모바일에서는 데스크톱 메뉴 숨김
        if (gnbMenus) gnbMenus.style.display = 'none';
        // 서브메뉴바 초기화
        if (gnbSubBar) {
            gnbSubBar.style.right = '-280px';
            gnbSubBar.style.display = 'none';
            gnbSubBar.setAttribute('hidden', '');
        }
    } else {
        // 데스크톱에서는 메뉴 표시
        if (gnbMenus) gnbMenus.style.display = 'flex';
        // 모바일 메뉴 닫기
        if (gnbSubBar) {
            gnbSubBar.style.right = '';
            gnbSubBar.style.display = 'none';
            gnbSubBar.setAttribute('hidden', '');
        }
        document.body.classList.remove('no_scroll');
        
        // 드롭다운 메뉴 재초기화
        initializeDropdownMenus();
    }
}

// 윈도우 리사이즈 이벤트
window.addEventListener('resize', handleResize);

// 페이지 로드시 초기 반응형 설정
window.addEventListener('load', handleResize);

// 패밀리 사이트 토글
function toggleFamilySite() {
    const familyButton = document.querySelector('.footer__family__btn');
    const familyList = document.querySelector('.footer__family__list');
    
    if (familyButton && familyList) {
        familyButton.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            
            if (isActive) {
                this.classList.remove('active');
                familyList.classList.remove('show');
            } else {
                this.classList.add('active');
                familyList.classList.add('show');
            }
        });
        
        // 외부 클릭시 닫기
        document.addEventListener('click', function(e) {
            if (!familyButton.contains(e.target) && !familyList.contains(e.target)) {
                familyButton.classList.remove('active');
                familyList.classList.remove('show');
            }
        });
    }
}

// 초기화시 패밀리 사이트 토글도 추가
document.addEventListener('DOMContentLoaded', function() {
    initializeHeader();
    toggleFamilySite();
});

// 전역 함수로 내보내기 (필요시)
window.headerFunctions = {
    showMainPage,
    showSection,
    clearAllAlerts,
    acknowledgeAlert,
    showAlertDetails,
    showAllAlerts,
    addNewAlert,
    searchAlerts,
    performSearch,
    toggleFamilySite,
    handleResize
};