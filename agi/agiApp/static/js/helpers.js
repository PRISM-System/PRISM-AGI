/**
 * AI 에이전트 플랫폼 - 헬퍼 함수들
 * 각종 유틸리티 및 헬퍼 함수들
 */

// 의도 레이블 변환
function getIntentLabel(intent) {
    const labels = {
        'anomaly_investigation': '이상 상황 조사',
        'predictive_analysis': '예측 분석 요청', 
        'emergency_response': '긴급 대응 요청',
        'system_diagnosis': '시스템 진단',
        'preventive_action': '예방 조치',
        'monitoring': '모니터링 요청',
        'prediction': '예측 분석',
        'control': '제어 요청',
        'orchestration': '통합 관리',
        'general': '일반 문의'
    };
    return labels[intent] || '기타 요청';
}

// 에이전트 타입 확인
function getAgentType(agentName) {
    if (agentName.includes('Monitoring') || agentName.includes('모니터링')) return 'monitoring';
    if (agentName.includes('Prediction') || agentName.includes('예측')) return 'prediction';
    if (agentName.includes('Control') || agentName.includes('제어')) return 'control';
    if (agentName.includes('Orchestration') || agentName.includes('오케스트레이션')) return 'orchestration';
    return 'general';
}

// 에이전트 설명
function getAgentDescription(agentType) {
    const descriptions = {
        'monitoring': '실시간 시스템 모니터링 및 이상 탐지',
        'prediction': '데이터 기반 예측 분석 및 위험 평가',
        'control': '자동 제어 시스템 및 조치 실행',
        'orchestration': '에이전트 협력 및 통합 관리'
    };
    return descriptions[agentType] || '일반 에이전트';
}

// 에이전트 아이콘
function getAgentIcon(agentType) {
    const icons = {
        'monitoring': '<i class="fas fa-eye text-primary"></i>',
        'prediction': '<i class="fas fa-chart-line text-success"></i>',
        'control': '<i class="fas fa-cog text-warning"></i>',
        'orchestration': '<i class="fas fa-network-wired text-danger"></i>'
    };
    return icons[agentType] || '<i class="fas fa-robot"></i>';
}

// 상태 배지
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-secondary">대기중</span>',
        'running': '<span class="badge bg-primary">실행중</span>',
        'completed': '<span class="badge bg-success">완료</span>',
        'failed': '<span class="badge bg-danger">실패</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">알 수 없음</span>';
}

// 위험도 색상
function getRiskColor(riskLevel) {
    const colors = {
        'low': 'success',
        'medium': 'warning',
        'high': 'danger',
        'critical': 'danger'
    };
    return colors[riskLevel] || 'secondary';
}

// 상태 색상
function getStatusColor(status) {
    switch (status) {
        case 'completed': return 'success';
        case 'running': return 'warning';
        case 'resolving_anomalies': return 'info';
        case 'failed': return 'danger';
        case 'pending': return 'secondary';
        default: return 'secondary';
    }
}

// 워크플로우 상태 표시명
function getStatusDisplayName(status) {
    switch (status) {
        case 'completed': return '완료';
        case 'running': return '실행 중';
        case 'resolving_anomalies': return '이상 상태 해결 중';
        case 'failed': return '실패';
        case 'pending': return '대기 중';
        default: return status;
    }
}

// 알림 색상
function getAlertColor(priority) {
    switch (priority) {
        case 'critical': return 'danger';
        case 'high': return 'warning';
        case 'medium': return 'info';
        case 'low': return 'success';
        default: return 'secondary';
    }
}

// 알림 아이콘
function getAlertIcon(priority) {
    switch (priority) {
        case 'critical': return 'exclamation-triangle';
        case 'high': return 'exclamation-circle';
        case 'medium': return 'info-circle';
        case 'low': return 'bell';
        default: return 'info-circle';
    }
}

// 에이전트 이름 매핑
function getAgentName(agentType) {
    switch (agentType) {
        case 'monitoring': return '모니터링 AI';
        case 'prediction': return '예측 AI';
        case 'control': return '제어 AI';
        case 'orchestration': return '오케스트레이션 AI';
        default: return 'AI 에이전트';
    }
}

// 종합 분석 및 권장사항 생성
function generateSummaryRecommendations(workflow) {
    let recommendations = [];
    
    if (workflow.executions) {
        workflow.executions.forEach(execution => {
            const result = execution.output_data;
            if (execution.agent_type === 'monitoring' && result.risk_level === 'high') {
                recommendations.push('즉시 해당 센서 지역의 안전점검이 필요합니다.');
            }
            if (execution.agent_type === 'prediction' && result.confidence < 0.7) {
                recommendations.push('예측 신뢰도가 낮습니다. 추가 데이터 수집을 권장합니다.');
            }
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push('현재 시스템이 정상적으로 운영되고 있습니다.');
    }
    
    return recommendations.join('<br>');
}

// Toast 메시지 표시 기능
function showToast(message, type = 'info') {
    // 기존 토스트가 있으면 제거
    const existingToast = document.querySelector('.toast-container .toast');
    if (existingToast) {
        existingToast.remove();
    }

    // 토스트 컨테이너가 없으면 생성
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // 토스트 타입별 클래스 및 아이콘
    const typeConfig = {
        'success': { class: 'text-bg-success', icon: 'fas fa-check-circle' },
        'error': { class: 'text-bg-danger', icon: 'fas fa-exclamation-triangle' },
        'warning': { class: 'text-bg-warning', icon: 'fas fa-exclamation-circle' },
        'info': { class: 'text-bg-info', icon: 'fas fa-info-circle' }
    };

    const config = typeConfig[type] || typeConfig['info'];

    // 토스트 엘리먼트 생성
    const toastElement = document.createElement('div');
    toastElement.className = `toast ${config.class}`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="${config.icon} me-2"></i>${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toastElement);

    // Bootstrap Toast 초기화 및 표시
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: type === 'error' ? 5000 : 3000
    });
    
    toast.show();

    // 토스트가 숨겨진 후 DOM에서 제거
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// 전역 스코프에 함수들 할당
window.getIntentLabel = getIntentLabel;
window.getAgentType = getAgentType;
window.getAgentDescription = getAgentDescription;
window.getAgentIcon = getAgentIcon;
window.getStatusBadge = getStatusBadge;
window.getRiskColor = getRiskColor;
window.getStatusColor = getStatusColor;
window.getStatusDisplayName = getStatusDisplayName;
window.getAlertColor = getAlertColor;
window.getAlertIcon = getAlertIcon;
window.getAgentName = getAgentName;
window.generateSummaryRecommendations = generateSummaryRecommendations;
window.showToast = showToast;
