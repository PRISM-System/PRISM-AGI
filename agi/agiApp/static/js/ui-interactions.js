/**
 * AI 에이전트 플랫폼 - UI 인터랙션 및 예시 질문
 * 예시 질문 토글, 추가 및 기타 UI 인터랙션
 */

// 예시 질문 토글
window.toggleExamples = function() {
    console.log('Toggle examples called');
    const examplesDiv = document.getElementById('query-examples');
    if (examplesDiv) {
        examplesDiv.classList.toggle('show');
        console.log('Examples toggled, current classes:', examplesDiv.className);
    } else {
        console.error('query-examples element not found');
    }
};

// 예시 질문 버튼들 추가
function addExampleQueries() {
    const examples = [
        "온도 센서에서 감지된 이상이 장비 고장으로 이어질 가능성은?",
        "압력 급상승 알림이 왔는데, 원인 분석하고 자동 조치 방법은?", 
        "진동 센서 이상 신호에 대한 예측 분석과 예방 조치가 필요해",
        "습도 센서 급락 알림 - 생산라인 영향도와 대응 방안은?",
        "온도와 압력 동시 이상 - 통합 분석과 긴급 대응 필요",
        "센서 다운 알림이 왔는데 대체 모니터링 방법은?"
    ];
    
    const examplesContainer = document.getElementById('example-questions');
    if (examplesContainer) {
        const examplesHtml = examples.map(example => 
            `<div class="col-md-6 col-lg-4 mb-2">
                <button class="btn btn-outline-primary btn-sm w-100 text-start" 
                        onclick="document.getElementById('nlp-query').value='${example}'; document.getElementById('nlp-query').focus();"
                        title="${example}">
                    ${example.length > 50 ? example.substring(0, 50) + '...' : example}
                </button>
            </div>`
        ).join('');
        examplesContainer.innerHTML = examplesHtml;
    }
    
    // 히어로 섹션의 예시 질문도 업데이트
    const heroExamples = examples.slice(0, 4);
    const heroExamplesHtml = heroExamples.map(example => 
        `<button class="btn btn-outline-light btn-sm me-2 mb-2" 
                 onclick="document.getElementById('nlp-query').value='${example}'; toggleExamples(); document.getElementById('nlp-query').focus();"
                 style="text-align: left; white-space: normal;">
            ${example.length > 45 ? example.substring(0, 45) + '...' : example}
         </button>`
    ).join('');
    
    const heroExamplesContainer = document.getElementById('query-examples');
    if (heroExamplesContainer) {
        heroExamplesContainer.innerHTML = heroExamplesHtml;
        console.log('Hero examples added:', heroExamplesHtml);
    }
}

// 모니터링 상세 정보 표시
function showMonitoringDetails() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'monitoringDetailsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-radar me-2"></i>실시간 모니터링 상세 정보
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>모니터링 상태</h6>
                            <ul class="list-unstyled">
                                <li><strong>활성 센서:</strong> ${monitoredSensorCount}개</li>
                                <li><strong>감지된 이상:</strong> ${currentAnomalyCount}건</li>
                                <li><strong>시스템 상태:</strong> ${isAutoMonitoringActive ? '정상 운영' : '일시 정지'}</li>
                                <li><strong>마지막 업데이트:</strong> ${new Date().toLocaleTimeString()}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6>센서 유형별 분포</h6>
                            <ul class="list-unstyled">
                                <li><strong>온도센서:</strong> 6개</li>
                                <li><strong>압력센서:</strong> 8개</li>
                                <li><strong>습도센서:</strong> 5개</li>
                                <li><strong>진동센서:</strong> 5개</li>
                            </ul>
                        </div>
                    </div>
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>최근 이상 감지 로그</h6>
                            <div id="recent-anomalies" style="max-height: 200px; overflow-y: auto;">
                                ${alertHistory.slice(0, 5).map(alert => `
                                    <div class="alert alert-${getAlertColor(alert.priority)} p-2 mb-1">
                                        <small><strong>${alert.title}</strong> - ${getTimeAgo(alert.created_at)}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    <button type="button" class="btn btn-primary" onclick="toggleAutoMonitoring()">
                        ${isAutoMonitoringActive ? '모니터링 일시정지' : '모니터링 재시작'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// 자동 모니터링 토글
function toggleAutoMonitoring() {
    if (isAutoMonitoringActive) {
        isAutoMonitoringActive = false;
        if (monitoringInterval) {
            clearInterval(monitoringInterval);
            monitoringInterval = null;
        }
        // UI 업데이트
        const indicator = document.getElementById('monitoring-indicator');
        const toggleIcon = document.getElementById('monitoring-toggle-icon');
        const toggleText = document.getElementById('monitoring-toggle-text');
        
        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-circle"></i> 일시정지';
            indicator.className = 'badge bg-warning ms-2';
        }
        if (toggleIcon) toggleIcon.className = 'fas fa-play';
        if (toggleText) toggleText.textContent = '재시작';
        
        console.log('Auto monitoring stopped');
    } else {
        startAutoMonitoring();
        // UI 업데이트
        const indicator = document.getElementById('monitoring-indicator');
        const toggleIcon = document.getElementById('monitoring-toggle-icon');
        const toggleText = document.getElementById('monitoring-toggle-text');
        
        if (indicator) {
            indicator.innerHTML = '<i class="fas fa-circle pulse"></i> 활성';
            indicator.className = 'badge bg-success ms-2';
        }
        if (toggleIcon) toggleIcon.className = 'fas fa-pause';
        if (toggleText) toggleText.textContent = '일시정지';
    }
}

// 전역 스코프에 함수들 할당
window.addExampleQueries = addExampleQueries;
window.showMonitoringDetails = showMonitoringDetails;
window.toggleAutoMonitoring = toggleAutoMonitoring;
