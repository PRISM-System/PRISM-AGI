/**
 * AI 에이전트 플랫폼 - 에이전트 결과 표시
 * 개별 에이전트 결과를 실시간으로 표시하는 기능
 */

// 개별 에이전트 결과를 실시간으로 표시하는 함수
function displayAgentResult(execution) {
    const resultsDiv = document.getElementById('agent-results');
    if (!resultsDiv) return;
    
    // 에이전트 아이콘 매핑
    const getAgentIconClass = (agentType) => {
        switch (agentType) {
            case 'monitoring': return 'chart-line';
            case 'prediction': return 'brain';
            case 'control': return 'cogs';
            case 'orchestration': return 'network-wired';
            default: return 'robot';
        }
    };
    
    // 상세 데이터 표시 함수
    const formatDetailedData = (agentType, outputData) => {
        if (!outputData) return '<p class="text-muted">상세 데이터가 없습니다.</p>';
        
        // 외부 도구 사용 정보 표시
        const formatExternalToolsInfo = (data) => {
            if (data?.external_tools_used && data.external_tools_used.length > 0) {
                return `
                    <div class="mt-3 pt-3 border-top">
                        <h6 class="text-warning"><i class="fas fa-plug me-2"></i>연동 외부 도구</h6>
                        <div class="row">
                            ${data.external_tools_used.map(tool => `
                                <div class="col-md-6 mb-2">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-check-circle text-success me-2"></i>
                                        <span class="small">${tool}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ${data.data_sources_accessed ? `
                            <div class="mt-2">
                                <strong class="small">활용된 데이터 소스:</strong>
                                ${data.data_sources_accessed.map(source => `
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-database text-info me-2"></i>
                                        <span class="small">${source}</span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            return '';
        };
        
        switch (agentType) {
            case 'monitoring':
                return `
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-primary">감지된 이상</h6>
                            <div class="alert alert-${outputData.anomalies_count > 0 ? 'warning' : 'success'} p-2">
                                ${outputData.anomalies_count}건의 이상 감지
                            </div>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-info">센서 상태</h6>
                            <ul class="list-unstyled">
                                ${Object.entries(outputData.data || {}).map(([key, value]) => `
                                    <li><strong>${key}:</strong> ${value}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ${formatExternalToolsInfo(outputData)}
                `;
            case 'prediction':
                return `
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-success">예측 결과</h6>
                            <ul class="list-unstyled">
                                <li><strong>예측값:</strong> ${outputData.predicted_value || 'N/A'}</li>
                                <li><strong>신뢰도:</strong> ${outputData.confidence ? (outputData.confidence * 100).toFixed(1) + '%' : 'N/A'}</li>
                                <li><strong>예측 기간:</strong> ${outputData.prediction_horizon || 'N/A'}분</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-warning">상세 정보</h6>
                            <ul class="list-unstyled">
                                ${Object.entries(outputData.data || {}).map(([key, value]) => `
                                    <li><strong>${key}:</strong> ${value}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ${formatExternalToolsInfo(outputData)}
                `;
            case 'control':
                return `
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-warning">제어 결과</h6>
                            <ul class="list-unstyled">
                                <li><strong>실행된 명령:</strong> ${outputData.executed_commands || 0}개</li>
                                <li><strong>제어 상태:</strong> ${outputData.control_status || 'N/A'}</li>
                                <li><strong>안전성 확인:</strong> ${outputData.safety_checked ? '✓ 완료' : '✗ 미완료'}</li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-info">제어 상세</h6>
                            <ul class="list-unstyled">
                                ${Object.entries(outputData.data || {}).map(([key, value]) => `
                                    <li><strong>${key}:</strong> ${value}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                    ${formatExternalToolsInfo(outputData)}
                `;
            case 'orchestration':
                return `
                    <div class="row">
                        <div class="col-md-6">
                            <h6 class="text-danger">통합 관리</h6>
                            <ul class="list-unstyled">
                                ${Object.entries(outputData.data || {}).map(([key, value]) => `
                                    <li><strong>${key}:</strong> ${value}</li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6 class="text-success">성과 지표</h6>
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" style="width: ${outputData.data?.['최적화 수준'] || '0%'}"></div>
                            </div>
                            <small class="text-muted">전체 최적화 수준</small>
                        </div>
                    </div>
                    ${formatExternalToolsInfo(outputData)}
                `;
            default:
                return `<pre class="small">${JSON.stringify(outputData, null, 2)}</pre>`;
        }
    };
    
    // 실행 시간 계산
    const getExecutionTime = (execution) => {
        if (execution.started_at && execution.completed_at) {
            const start = new Date(execution.started_at);
            const end = new Date(execution.completed_at);
            const diffMs = end - start;
            const diffSec = Math.round(diffMs / 1000);
            return diffSec > 0 ? `${diffSec}초` : '< 1초';
        }
        return 'N/A';
    };
    
    const resultCard = document.createElement('div');
    resultCard.className = 'col-lg-6 mb-4';
    resultCard.innerHTML = `
        <div class="card h-100 shadow-sm agent-result-card" style="animation: slideInUp 0.5s ease;">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">
                    <i class="fas fa-${getAgentIconClass(execution.agent_type)} me-2"></i>
                    ${getAgentName(execution.agent_type)}
                    <span class="badge bg-success ms-auto">완료</span>
                </h5>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <h6 class="text-success">✓ 실행 완료</h6>
                    <p class="text-muted mb-2">${execution.output_data?.summary || '에이전트 작업이 성공적으로 완료되었습니다.'}</p>
                </div>
                
                ${formatDetailedData(execution.agent_type, execution.output_data)}
                
                <div class="mt-3 pt-3 border-top">
                    <div class="row text-center">
                        <div class="col-4">
                            <small class="text-muted">실행 시간</small><br>
                            <strong>${getExecutionTime(execution)}</strong>
                        </div>
                        <div class="col-4">
                            <small class="text-muted">상태</small><br>
                            <span class="badge bg-success">성공</span>
                        </div>
                        <div class="col-4">
                            <small class="text-muted">완료 시간</small><br>
                            <strong>${execution.completed_at ? new Date(execution.completed_at).toLocaleTimeString() : 'N/A'}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 애니메이션을 위한 CSS 추가 (한 번만)
    if (!document.getElementById('agent-animations-css')) {
        const style = document.createElement('style');
        style.id = 'agent-animations-css';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            .pulse {
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    resultsDiv.appendChild(resultCard);
    
    // 새로 추가된 카드로 스크롤
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 실행 결과 포맷팅 (구 버전 호환성을 위해 유지)
function formatExecutionResult(execution) {
    if (execution.status !== 'completed') {
        return `<p class="text-muted">실행 대기 중...</p>`;
    }
    
    const result = execution.output_data;
    let html = '';
    
    // 에이전트 유형별 결과 포맷팅
    switch (execution.agent_type) {
        case 'monitoring':
            html = `
                <div class="row">
                    <div class="col-sm-6">
                        <h6 class="text-primary">모니터링 지표</h6>
                        <ul class="list-unstyled">
                            <li><strong>감지된 이상:</strong> ${result.anomalies_count || 0}건</li>
                            <li><strong>위험 수준:</strong> <span class="badge bg-${getRiskColor(result.risk_level)}">${result.risk_level || '정상'}</span></li>
                            <li><strong>주요 센서:</strong> ${result.primary_sensors?.join(', ') || 'N/A'}</li>
                        </ul>
                    </div>
                    <div class="col-sm-6">
                        <h6 class="text-info">센서 데이터</h6>
                        <ul class="list-unstyled">
                            ${Object.entries(result.data || {}).map(([key, value]) => `
                                <li><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
        case 'prediction':
            html = `
                <div class="row">
                    <div class="col-sm-6">
                        <h6 class="text-success">예측 결과</h6>
                        <ul class="list-unstyled">
                            <li><strong>예측값:</strong> ${result.predicted_value || 'N/A'}</li>
                            <li><strong>신뢰도:</strong> ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}</li>
                            <li><strong>예측 기간:</strong> ${result.prediction_horizon || 'N/A'}분</li>
                        </ul>
                    </div>
                    <div class="col-sm-6">
                        <h6 class="text-warning">상세 정보</h6>
                        <ul class="list-unstyled">
                            ${Object.entries(result.data || {}).map(([key, value]) => `
                                <li><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
        case 'control':
            html = `
                <div class="row">
                    <div class="col-sm-6">
                        <h6 class="text-warning">제어 결과</h6>
                        <ul class="list-unstyled">
                            <li><strong>실행된 명령:</strong> ${result.executed_commands || 0}개</li>
                            <li><strong>제어 상태:</strong> ${result.control_status || 'N/A'}</li>
                            <li><strong>안전성 확인:</strong> ${result.safety_checked ? '✓ 완료' : '✗ 미완료'}</li>
                        </ul>
                    </div>
                    <div class="col-sm-6">
                        <h6 class="text-info">제어 상세</h6>
                        <ul class="list-unstyled">
                            ${Object.entries(result.data || {}).map(([key, value]) => `
                                <li><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
            break;
        case 'orchestration':
            html = `
                <div class="row">
                    <div class="col-sm-6">
                        <h6 class="text-danger">통합 관리</h6>
                        <ul class="list-unstyled">
                            ${Object.entries(result.data || {}).map(([key, value]) => `
                                <li><strong>${key}:</strong> ${value}</li>
                            `).join('')}
                        </ul>
                    </div>
                    <div class="col-sm-6">
                        <h6 class="text-success">성과 지표</h6>
                        <div class="progress mb-2">
                            <div class="progress-bar bg-success" style="width: ${result.data?.['최적화 결과'] || '0%'}"></div>
                        </div>
                        <small class="text-muted">전체 최적화 수준</small>
                    </div>
                </div>
            `;
            break;
        default:
            html = `<pre class="small">${JSON.stringify(result, null, 2)}</pre>`;
    }
    
    return html;
}

// 실행 결과 표시 (구 버전 호환성을 위해 유지)
function displayExecutionResults(workflow) {
    const resultsDiv = document.getElementById('execution-results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = `
        <h6><i class="fas fa-chart-bar me-2"></i>실행 결과</h6>
        <div class="row">
            ${workflow.executions.map(execution => `
                <div class="col-md-6 mb-3">
                    <div class="card agent-result-card">
                        <div class="card-header">
                            ${getAgentIcon(execution.agent_type)}
                            <strong class="ms-2">${execution.agent_name}</strong>
                            <span class="badge bg-success ms-auto">${execution.execution_time ? execution.execution_time.toFixed(1) + '초' : 'N/A'}</span>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info mb-3">
                                <i class="fas fa-info-circle me-2"></i>
                                ${execution.output_data?.summary || '실행 완료'}
                            </div>
                            ${formatExecutionResult(execution)}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="mt-4">
            <h6><i class="fas fa-lightbulb me-2"></i>종합 분석 및 권장사항</h6>
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i>
                ${generateSummaryRecommendations(workflow)}
            </div>
        </div>
    `;
}

// 전역 스코프에 함수들 할당
window.displayAgentResult = displayAgentResult;
window.formatExecutionResult = formatExecutionResult;
window.displayExecutionResults = displayExecutionResults;
