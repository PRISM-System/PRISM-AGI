/**
 * AI 에이전트 플랫폼 - 알림 및 모니터링 시스템
 * 실시간 알림, 모니터링, 에이전트 결과 표시
 */

// 알림 배지 업데이트
function updateAlertBadge() {
    const badge = document.getElementById('alert-badge');
    if (badge) {
        if (unreadAlertCount > 0) {
            badge.textContent = unreadAlertCount > 99 ? '99+' : unreadAlertCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// 알림 히스토리 표시 업데이트
function updateAlertHistoryDisplay() {
    const historyDiv = document.getElementById('alert-history');
    if (!historyDiv) return;
    
    if (alertHistory.length === 0) {
        historyDiv.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-inbox fa-2x mb-2"></i>
                <p class="mb-0">알림이 없습니다</p>
            </div>
        `;
        return;
    }
    
    const alertsHtml = alertHistory.slice(0, 10).map(alert => {
        const timeAgo = getTimeAgo(alert.created_at);
        const isUnread = !alert.acknowledged;
        
        return `
            <div class="alert-item p-2 mb-2 border-bottom ${isUnread ? 'bg-light' : ''}" 
                 data-alert-id="${alert.id}">
                <div class="d-flex align-items-start">
                    <div class="flex-shrink-0">
                        <i class="fas fa-${getAlertIcon(alert.priority)} text-${getAlertColor(alert.priority)}"></i>
                    </div>
                    <div class="flex-grow-1 ms-2">
                        <h6 class="mb-1 small ${isUnread ? 'fw-bold' : ''}">${alert.title}</h6>
                        <p class="mb-1 small text-muted">${alert.description.split('\\n\\n')[0].substring(0, 80)}...</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">${timeAgo}</small>
                            <div>
                                ${!isUnread ? '' : `
                                    <button class="btn btn-sm btn-outline-primary me-1" onclick="acknowledgeAlert(${alert.id})">
                                        <i class="fas fa-check"></i>
                                    </button>
                                `}
                                <button class="btn btn-sm btn-outline-info" onclick="showAlertDetails(${alert.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    historyDiv.innerHTML = alertsHtml;
}

// 알림 히스토리 로드
function loadAlertHistory() {
    try {
        // 실제 API 대신 기존 alertHistory가 비어있으면 초기 모의 데이터 생성
        if (alertHistory.length === 0) {
            alertHistory = generateInitialMockAlerts();
            
            // 미확인 알림 수 계산
            unreadAlertCount = alertHistory.filter(alert => !alert.acknowledged).length;
            updateAlertBadge();
        }
        updateAlertHistoryDisplay();
        console.log('Alert history loaded (mock data):', alertHistory.length, 'alerts, unread:', unreadAlertCount);
    } catch (error) {
        console.error('Error loading alert history:', error);
    }
}

// 초기 모의 알림 데이터 생성
function generateInitialMockAlerts() {
    const mockAlerts = [];
    const now = new Date();
    
    // 과거 몇 개의 알림 생성
    for (let i = 0; i < 5; i++) {
        const alertTime = new Date(now.getTime() - (i * 3600000)); // i시간 전
        const sensorTypes = ['온도', '압력', '습도', '진동'];
        const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
        
        mockAlerts.push({
            id: Date.now() + i,
            title: `${sensorType}센서 이상 감지`,
            description: `${sensorType} 센서에서 비정상적인 값이 감지되었습니다.\\n\\n즉시 점검이 필요합니다.`,
            priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            sensor_name: `${sensorType}센서-${Math.floor(Math.random() * 10) + 1}`,
            sensor_id: `SENSOR_${i + 1}`,
            value: Math.random() * 100,
            unit: sensorType === '온도' ? '°C' : sensorType === '압력' ? 'bar' : '%',
            location: ['생산라인A', '생산라인B', '보일러실'][Math.floor(Math.random() * 3)],
            created_at: alertTime.toISOString(),
            acknowledged: i > 2, // 최근 3개는 미확인으로
            recommendations: `1. ${sensorType} 센서 점검\\n2. 관련 장비 상태 확인\\n3. 필요시 전문가 문의`
        });
    }
    
    return mockAlerts;
}

// 자동 모니터링 시작
function startAutoMonitoring() {
    isAutoMonitoringActive = true;
    console.log('Auto monitoring started');
    
    if (monitoringInterval) {
        clearInterval(monitoringInterval);
    }
    
    monitoringInterval = setInterval(() => {
        if (isAutoMonitoringActive) {
            checkSystemStatus();
        }
    }, 10000); // 10초마다 체크
    
    // 즉시 첫 체크 실행
    checkSystemStatus();
}

// 시스템 상태 체크
function checkSystemStatus() {
    if (!isAutoMonitoringActive) return;
    
    try {
        // 마지막 체크 시간 업데이트
        const lastCheckElement = document.getElementById('last-check-time');
        if (lastCheckElement) {
            lastCheckElement.textContent = new Date().toLocaleTimeString();
        }
        
        // 이상 수 업데이트
        const anomalyCountElement = document.getElementById('anomaly-count');
        if (anomalyCountElement) {
            anomalyCountElement.textContent = currentAnomalyCount;
        }
        
        // 모니터링 상태 표시기 업데이트
        updateMonitoringIndicator();
        
        // 15% 확률로 새로운 이상 발생
        if (Math.random() < 0.15) {
            const sensorTypes = ['온도', '압력', '습도', '진동'];
            const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
            
            const anomaly = {
                id: Date.now() + Math.random(),
                sensor_name: `${sensorType}센서-${Math.floor(Math.random() * 10) + 1}`,
                anomaly_type: '임계치 초과',
                current_value: (Math.random() * 100).toFixed(1),
                unit: sensorType === '온도' ? '°C' : sensorType === '압력' ? 'bar' : '%',
                location: ['생산라인A', '생산라인B', '보일러실'][Math.floor(Math.random() * 3)],
                severity: ['medium', 'high'][Math.floor(Math.random() * 2)]
            };
            
            sendAnomalyAlert(anomaly);
            currentAnomalyCount++;
        }
        
        updateMonitoringIndicator(); // 모니터링 상태 표시기 업데이트
        console.log('System status checked - anomalies:', currentAnomalyCount);
    } catch (error) {
        console.error('System status check error:', error);
    }
}

// 모니터링 상태 표시기 업데이트
function updateMonitoringIndicator() {
    const indicator = document.getElementById('monitoring-indicator');
    if (!indicator) return;
    
    if (currentAnomalyCount === 0) {
        indicator.innerHTML = '<i class="fas fa-circle pulse"></i> 정상';
        indicator.className = 'badge bg-success ms-2';
    } else if (currentAnomalyCount <= 2) {
        indicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 주의';
        indicator.className = 'badge bg-warning ms-2';
    } else {
        indicator.innerHTML = '<i class="fas fa-exclamation-circle"></i> 위험';
        indicator.className = 'badge bg-danger ms-2';
    }
}

// 이상 감지 알림 발송
function sendAnomalyAlert(anomaly) {
    const alertData = {
        id: anomaly.id || Date.now(),
        title: `${anomaly.sensor_name} ${anomaly.anomaly_type} 감지`,
        description: `센서: ${anomaly.sensor_name}\\n\\n이상 유형: ${anomaly.anomaly_type}\\n값: ${anomaly.current_value}${anomaly.unit}\\n\\n즉시 확인이 필요합니다.`,
        priority: anomaly.severity || 'medium',
        sensor_name: anomaly.sensor_name,
        value: anomaly.current_value,
        unit: anomaly.unit,
        location: anomaly.location,
        created_at: new Date().toISOString(),
        acknowledged: false,
        recommendations: `1. 해당 센서 주변 점검\\n2. 관련 장비 상태 확인\\n3. 필요시 전문가에게 문의`
    };
    
    // 알림 히스토리에 추가
    if (!alertHistory.find(a => a.id === alertData.id)) {
        alertHistory.unshift(alertData);
        unreadAlertCount++;
        updateAlertBadge();
        updateMonitoringIndicator(); // 모니터링 상태 표시기 업데이트
        showRealtimeAlert(alertData);
    }
}

// 실시간 알림 모니터링 시작
function startAlertMonitoring() {
    console.log('Alert monitoring started');
}

// 실시간 알림 표시
function showRealtimeAlert(alert) {
    // 토스트 컨테이너 확인/생성
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    const toastDiv = document.createElement('div');
    toastDiv.className = `toast align-items-center text-white bg-${getAlertColor(alert.priority)} border-0`;
    toastDiv.setAttribute('data-alert-id', alert.id);
    toastDiv.setAttribute('role', 'alert');
    toastDiv.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <div class="d-flex align-items-start">
                    <div class="flex-shrink-0 me-2">
                        <i class="fas fa-${getAlertIcon(alert.priority)}"></i>
                    </div>
                    <div class="flex-grow-1">
                        <strong>${alert.title}</strong><br>
                        <small>${alert.description.split('\\n\\n')[0]}</small>
                    </div>
                </div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    onclick="closeToastAlert(${alert.id})" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastDiv);
    
    // Bootstrap Toast 초기화 및 표시
    const toast = new bootstrap.Toast(toastDiv, {
        autohide: true,
        delay: 8000
    });
    toast.show();
}

// 토스트 알림 닫기
function closeToastAlert(alertId) {
    const toastElement = document.querySelector(`[data-alert-id="${alertId}"].toast`);
    if (toastElement) {
        const toast = bootstrap.Toast.getInstance(toastElement);
        if (toast) {
            toast.hide();
        }
        setTimeout(() => {
            if (toastElement.parentNode) {
                toastElement.parentNode.removeChild(toastElement);
            }
        }, 300);
    }
}

// 알림 확인 처리
function acknowledgeAlert(alertId) {
    try {
        const alert = alertHistory.find(a => a.id === alertId);
        if (alert && !alert.acknowledged) {
            alert.acknowledged = true;
            unreadAlertCount = Math.max(0, unreadAlertCount - 1);
            updateAlertBadge();
            updateAlertHistoryDisplay();
            console.log('Alert acknowledged (mock data):', alertId);
        }
    } catch (error) {
        console.error('Error acknowledging alert:', error);
    }
}

// 알림 상세보기
function showAlertDetails(alertId) {
    const alert = alertHistory.find(a => a.id === alertId);
    if (!alert) {
        console.error('Alert not found:', alertId);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-${getAlertColor(alert.priority)} text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-${getAlertIcon(alert.priority)} me-2"></i>
                        ${alert.title}
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-3">
                        <div class="col-sm-6">
                            <strong>센서:</strong> ${alert.sensor_name || 'N/A'}
                        </div>
                        <div class="col-sm-6">
                            <strong>위치:</strong> ${alert.location || 'N/A'}
                        </div>
                        <div class="col-sm-6">
                            <strong>우선순위:</strong> 
                            <span class="badge bg-${getAlertColor(alert.priority)}">${alert.priority}</span>
                        </div>
                        <div class="col-sm-6">
                            <strong>발생시간:</strong> ${new Date(alert.created_at).toLocaleString()}
                        </div>
                    </div>
                    <div class="mb-3">
                        <strong>상세 설명:</strong>
                        <div class="mt-2 p-3 bg-light rounded">
                            ${alert.description.replace(/\\n/g, '<br>')}
                        </div>
                    </div>
                    <div class="mb-3">
                        <strong>권장 조치:</strong>
                        <div class="mt-2 p-3 bg-light rounded">
                            ${alert.recommendations.replace(/\\n/g, '<br>')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">닫기</button>
                    ${!alert.acknowledged ? `
                        <button type="button" class="btn btn-primary" onclick="acknowledgeAlert(${alert.id}); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">
                            <i class="fas fa-check me-2"></i>확인 처리
                        </button>
                    ` : ''}
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

// 모든 알림 확인
function clearAllAlerts() {
    alertHistory.forEach(alert => {
        if (!alert.acknowledged) {
            alert.acknowledged = true;
        }
    });
    unreadAlertCount = 0;
    updateAlertBadge();
    updateAlertHistoryDisplay();
    console.log('All alerts cleared');
}

// 모든 알림 보기
function showAllAlerts() {
    console.log('Show all alerts modal - 구현 예정');
    // 향후 전체 알림 목록 모달 구현
}

// 시스템 복구 완료 알림 표시
function showSystemRecoveryAlert(resolvedCount) {
    const recoveryAlert = {
        id: Date.now(),
        title: '🎉 시스템 복구 완료',
        description: `AI 에이전트들의 협력으로 ${resolvedCount}건의 이상 상황이 모두 해결되었습니다.\\n\\n시스템이 정상 상태로 복구되었습니다.`,
        priority: 'low',
        sensor_name: '시스템 전체',
        sensor_id: 'SYSTEM_RECOVERY',
        value: '정상',
        unit: '',
        location: '전체 시설',
        created_at: new Date().toISOString(),
        acknowledged: false,
        recommendations: '1. 정기적인 예방 점검 실시\\n2. AI 모니터링 시스템 지속 운영\\n3. 시스템 로그 검토'
    };
    
    // 복구 알림을 히스토리에 추가
    alertHistory.unshift(recoveryAlert);
    unreadAlertCount++;
    updateAlertBadge();
    
    // 토스트 알림 표시
    showRealtimeAlert(recoveryAlert);
    
    console.log('System recovery alert sent:', resolvedCount, 'anomalies resolved');
}

// 전역 스코프에 함수들 할당
window.updateAlertBadge = updateAlertBadge;
window.updateAlertHistoryDisplay = updateAlertHistoryDisplay;
window.loadAlertHistory = loadAlertHistory;
window.generateInitialMockAlerts = generateInitialMockAlerts;
window.startAutoMonitoring = startAutoMonitoring;
window.checkSystemStatus = checkSystemStatus;
window.sendAnomalyAlert = sendAnomalyAlert;
window.startAlertMonitoring = startAlertMonitoring;
window.showRealtimeAlert = showRealtimeAlert;
window.closeToastAlert = closeToastAlert;
window.acknowledgeAlert = acknowledgeAlert;
window.updateMonitoringIndicator = updateMonitoringIndicator; // 추가
window.showAlertDetails = showAlertDetails;
window.clearAllAlerts = clearAllAlerts;
window.showAllAlerts = showAllAlerts;
window.showSystemRecoveryAlert = showSystemRecoveryAlert;
