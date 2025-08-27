// 도구 관리 페이지 JavaScript

// 전역 변수
let currentTools = [];
let filteredTools = [];

// DOM 요소
const toolsGrid = document.getElementById('toolsGrid');
const loadingContainer = document.getElementById('loadingContainer');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchTool');
const methodFilter = document.getElementById('methodFilter');
const statusFilter = document.getElementById('statusFilter');
const addToolBtn = document.getElementById('addToolBtn');
const backToChat = document.getElementById('backToChat');

// 모달 요소
const toolDetailModal = document.getElementById('toolDetailModal');
const closeModal = document.getElementById('closeModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const deleteToolBtn = document.getElementById('deleteToolBtn');
const testToolBtn = document.getElementById('testToolBtn');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTools();
});

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 검색 및 필터
    searchInput.addEventListener('input', handleSearch);
    methodFilter.addEventListener('change', handleFilter);
    statusFilter.addEventListener('change', handleFilter);
    
    // 버튼 이벤트
    addToolBtn.addEventListener('click', () => {
        window.location.href = '/django/register-tool/';
    });
    
    backToChat.addEventListener('click', () => {
        window.location.href = '/';
    });
    
    // 모달 이벤트
    closeModal.addEventListener('click', closeToolModal);
    closeModalBtn.addEventListener('click', closeToolModal);
    deleteToolBtn.addEventListener('click', handleDeleteTool);
    testToolBtn.addEventListener('click', handleTestTool);
    
    // 모달 외부 클릭 시 닫기
    toolDetailModal.addEventListener('click', (e) => {
        if (e.target === toolDetailModal) {
            closeToolModal();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toolDetailModal.style.display !== 'none') {
            closeToolModal();
        }
    });
}

// 도구 목록 로드
async function loadTools() {
    try {
        showLoading(true);
        
        // 로컬 프록시를 통해 외부 API 호출
        const response = await fetch('/django/api/tools/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const tools = await response.json();
        
        // API 응답을 그대로 사용 (새로운 데이터 구조)
        const formattedTools = tools.map((tool, index) => ({
            ...tool, // 원본 데이터 그대로 사용
            id: index + 1 // ID만 추가
        }));
        
        currentTools = formattedTools;
        filteredTools = [...currentTools];
        
        showLoading(false);
        renderTools();
        
    } catch (error) {
        console.error('도구 목록 로드 실패:', error);
        showLoading(false);
        showError('도구 목록을 불러오는데 실패했습니다: ' + error.message);
    }
}

// 로딩 상태 표시
function showLoading(show) {
    if (show) {
        loadingContainer.style.display = 'flex';
        emptyState.style.display = 'none';
        toolsGrid.innerHTML = '';
        toolsGrid.appendChild(loadingContainer);
    } else {
        loadingContainer.style.display = 'none';
    }
}

// 도구 카드 렌더링
function renderTools() {
    toolsGrid.innerHTML = '';
    
    if (filteredTools.length === 0) {
        emptyState.style.display = 'flex';
        toolsGrid.appendChild(emptyState);
        return;
    }
    
    emptyState.style.display = 'none';
    
    filteredTools.forEach(tool => {
        const toolCard = createToolCard(tool);
        toolsGrid.appendChild(toolCard);
    });
}

// 도구 카드 생성
function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.onclick = () => openToolModal(tool);
    
    // additionalProp1에서 정보 추출
    const additionalProp1 = tool.parameters_schema?.properties?.additionalProp1 || {};
    const method = additionalProp1.method || 'GET';
    const url = additionalProp1.url || '';
    const toolType = tool.tool_type || 'api'; // 기본값을 api로 설정
    
    card.innerHTML = `
        <div class="tool-card-header">
            <h3 class="tool-name">${escapeHtml(tool.name)}</h3>
            <span class="tool-type ${toolType}">${toolType}</span>
        </div>
        
        <p class="tool-description">${escapeHtml(tool.description || '설명이 없습니다.')}</p>
        
        <div class="tool-meta">
            <div class="tool-meta-row">
                <span class="meta-label">메서드:</span>
                <span class="meta-value">
                    <span class="method-badge ${method}">${method}</span>
                </span>
            </div>
            <div class="tool-meta-row">
                <span class="meta-label">타입:</span>
                <span class="meta-value">${toolType}</span>
            </div>
            <div class="tool-meta-row">
                <span class="meta-label">URL:</span>
                <span class="meta-value tool-url">${escapeHtml(url || '설정되지 않음')}</span>
            </div>
        </div>
    `;
    
    return card;
}

// 상태 텍스트 반환
function getStatusText(status) {
    switch (status) {
        case 'active': return '활성';
        case 'inactive': return '비활성';
        case 'error': return '오류';
        default: return '알 수 없음';
    }
}

// 검색 처리
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    applyFilters(searchTerm);
}

// 필터 처리
function handleFilter() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    applyFilters(searchTerm);
}

// 필터 적용
function applyFilters(searchTerm = '') {
    const methodValue = methodFilter.value;
    const statusValue = statusFilter.value;
    
    filteredTools = currentTools.filter(tool => {
        const matchesSearch = !searchTerm || 
            tool.name.toLowerCase().includes(searchTerm) ||
            (tool.description && tool.description.toLowerCase().includes(searchTerm));
        
        const matchesMethod = !methodValue || tool.endpoint_method === methodValue;
        const matchesStatus = !statusValue || tool.status === statusValue;
        
        return matchesSearch && matchesMethod && matchesStatus;
    });
    
    renderTools();
}

// 도구 상세 모달 열기
function openToolModal(tool) {
    // 기본 정보 채우기
    document.getElementById('modalToolName').textContent = tool.name;
    document.getElementById('modalToolNameValue').textContent = tool.name;
    document.getElementById('modalToolDescription').textContent = tool.description || '설명이 없습니다.';
    
    // 도구 타입 표시
    const toolTypeBadge = document.getElementById('modalToolType');
    const toolType = tool.tool_type || 'api'; // 기본값을 api로 설정
    toolTypeBadge.textContent = toolType;
    toolTypeBadge.className = `info-value tool-type-badge ${toolType}`;
    
    // additionalProp1 속성들 표시
    const additionalProp1 = tool.parameters_schema?.properties?.additionalProp1 || {};
    
    document.getElementById('modalAdditionalPropUrl').textContent = additionalProp1.url || '-';
    
    const methodBadge = document.getElementById('modalAdditionalPropMethod');
    methodBadge.textContent = additionalProp1.method || 'GET';
    methodBadge.className = `info-value method-badge ${additionalProp1.method || 'GET'}`;
    
    document.getElementById('modalAdditionalPropHeader').textContent = 
        additionalProp1.header ? JSON.stringify(additionalProp1.header, null, 2) : '헤더가 없습니다.';
    
    // 추가 속성들 표시 (url, method, header 제외)
    const additionalPropsContainer = document.getElementById('modalAdditionalProps');
    additionalPropsContainer.innerHTML = '';
    
    Object.entries(additionalProp1).forEach(([key, value]) => {
        if (!['url', 'method', 'header'].includes(key)) {
            const propRow = document.createElement('div');
            propRow.className = 'info-row';
            propRow.innerHTML = `
                <span class="info-label">${key}:</span>
                <span class="info-value">${value}</span>
            `;
            additionalPropsContainer.appendChild(propRow);
        }
    });
    
    // 전체 매개변수 스키마 표시
    document.getElementById('modalParametersSchema').textContent = 
        tool.parameters_schema ? JSON.stringify(tool.parameters_schema, null, 2) : '스키마가 없습니다.';
    
    // 현재 도구 정보 저장
    toolDetailModal.currentTool = tool;
    
    // 모달 표시
    toolDetailModal.style.display = 'flex';
}

// 도구 상세 모달 닫기
function closeToolModal() {
    toolDetailModal.style.display = 'none';
    toolDetailModal.currentTool = null;
}

// 도구 삭제 처리
async function handleDeleteTool() {
    const tool = toolDetailModal.currentTool;
    if (!tool) return;
    
    if (!confirm(`'${tool.name}' 도구를 삭제하시겠습니까?`)) {
        return;
    }
    
    try {
        // 삭제 API 호출 (URL 끝에 슬래시 추가)
        const response = await fetch(`/django/api/tools/${encodeURIComponent(tool.name)}/`, { 
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `삭제 실패: ${response.status}`);
        }
        
        // 로컬 목록에서 제거
        currentTools = currentTools.filter(t => t.name !== tool.name);
        applyFilters(searchInput.value.toLowerCase().trim());
        
        // 사용자 활동 로그 기록
        if (window.logToolDelete) {
            window.logToolDelete(tool.name, {
                description: tool.description,
                endpoint: tool.endpoint
            });
        }
        
        closeToolModal();
        showSuccess('도구가 성공적으로 삭제되었습니다.');
        
    } catch (error) {
        console.error('도구 삭제 오류:', error);
        showError('도구 삭제 중 오류가 발생했습니다: ' + error.message);
    }
}

// 도구 테스트 처리
function handleTestTool() {
    const tool = toolDetailModal.currentTool;
    if (!tool) return;
    
    // TODO: 도구 테스트 기능 구현
    alert(`'${tool.name}' 도구 테스트 기능은 구현 예정입니다.`);
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
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <p>${message}</p>
        <button onclick="loadTools()" style="margin-top: 12px; padding: 8px 16px; background: #3b82f6; border: none; border-radius: 6px; color: white; cursor: pointer;">
            다시 시도
        </button>
    `;
    
    toolsGrid.innerHTML = '';
    toolsGrid.appendChild(errorDiv);
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// CSRF 토큰 가져오기
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

// 성공 메시지 표시
function showSuccess(message) {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-message alert-success';
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// 오류 메시지 표시
function showError(message) {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert-message');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-message alert-error';
    alertDiv.textContent = message;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}
