/**
 * AI 에이전트 플랫폼 - NLP 및 워크플로우 관리
 * 자연어 질문 처리 및 AI 에이전트 워크플로우 실행
 */

// 히어로 섹션의 자연어 질문 처리
window.handleNlpQuery = async function(e) {
    console.log('handleNlpQuery called', e);
    if (e) {
        e.preventDefault();
    }
    
    const query = document.getElementById('nlp-query').value.trim();
    console.log('Query:', query);
    
    if (!query) {
        showQueryStatus('질문을 입력해주세요.', 'warning');
        return;
    }

    // 이전 결과 초기화
    clearPreviousResults();

    // 버튼 상태 변경
    const submitBtn = document.getElementById('submit-btn');
    const originalHtml = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div> 분석 중...';
    submitBtn.disabled = true;

    // 대시보드 표시
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
    dashboard.scrollIntoView({ behavior: 'smooth' });

    // 상태 표시
    showQueryStatus('질문을 분석하고 적절한 AI 에이전트를 선택하고 있습니다...', 'info');
    
    try {
        // Mock 분석 결과 생성
        const analysisResult = generateMockAnalysisResult(query);
        
        if (analysisResult.success) {
            // entities가 존재하는지 확인
            if (!analysisResult.entities) {
                console.warn('entities is missing from response, creating default');
                analysisResult.entities = {
                    sensors: [],
                    risk_level: 'low',
                    complexity: 'medium'
                };
            }
            
            // 분석 결과 표시
            displayQueryAnalysis(analysisResult);
            
            // Mock 워크플로우 실행
            await executeMockAgentWorkflow(analysisResult.workflow_id);
        } else {
            console.error('Analysis failed:', analysisResult);
            showQueryStatus('질문 분석에 실패했습니다: ' + (analysisResult.error || '알 수 없는 오류'), 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showQueryStatus('오류가 발생했습니다: ' + error.message, 'danger');
    } finally {
        // 버튼 상태 복원
        submitBtn.innerHTML = originalHtml;
        submitBtn.disabled = false;
    }
};

// 질문 분석 결과 표시
function displayQueryAnalysis(result) {
    console.log('Displaying analysis result:', result);
    
    // 안전한 데이터 접근
    const entities = result.entities || {};
    const sensors = entities.sensors || [];
    const riskLevel = entities.risk_level || 'low';
    const complexity = entities.complexity || '중간';
    const recommendedAgents = result.recommended_agents || [];
    const externalTools = result.external_tools || [];
    const dataSourcesUsed = result.data_sources_used || [];
    
    const analysisDiv = document.getElementById('query-analysis');
    analysisDiv.innerHTML = `
        <div class="row">
            <div class="col-lg-4">
                <div class="card border-primary mb-3">
                    <div class="card-header bg-primary text-white">
                        <h6 class="mb-0"><i class="fas fa-brain me-2"></i>오케스트레이션 AI 분석</h6>
                    </div>
                    <div class="card-body">
                        <p><strong>사용자 질문:</strong><br><em>"${result.original_question}"</em></p>
                        <p><strong>감지된 상황:</strong> 
                            <span class="badge bg-primary fs-6">${getIntentLabel(result.intent)}</span>
                        </p>
                        <p><strong>관련 정보:</strong></p>
                        <div class="row">
                            <div class="col-sm-6 mb-2">
                                <span class="badge bg-secondary">대상 센서</span>
                                <div class="small">${sensors.length > 0 ? sensors.join(', ') : '전체'}</div>
                            </div>
                            <div class="col-sm-6 mb-2">
                                <span class="badge bg-${getRiskColor(riskLevel)}">위험도</span>
                                <div class="small">${riskLevel.toUpperCase()}</div>
                            </div>
                            <div class="col-sm-6 mb-2">
                                <span class="badge bg-info">분석 복잡도</span>
                                <div class="small">${complexity}</div>
                            </div>
                            <div class="col-sm-6 mb-2">
                                <span class="badge bg-warning">협력 에이전트</span>
                                <div class="small">${recommendedAgents.length}개</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">
                        <h6 class="mb-0"><i class="fas fa-network-wired me-2"></i>협력 AI 에이전트 배치</h6>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-info mb-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>오케스트레이션 AI</strong>가 상황을 분석하여 다음 전문 에이전트들을 협력 배치합니다.
                        </div>
                        <div id="recommended-agents">
                            ${recommendedAgents.map((agent, index) => `
                                <div class="workflow-step" id="agent-step-${index}">
                                    <div class="d-flex align-items-center mb-2">
                                        <span class="badge bg-secondary me-2">${index + 1}</span>
                                        <div class="flex-grow-1">
                                            <div class="d-flex align-items-center">
                                                ${getAgentIcon(getAgentType(agent))}
                                                <strong class="ms-2">${agent}</strong>
                                                <span class="badge bg-info ms-auto">배치 대기</span>
                                            </div>
                                            <small class="text-muted">${getAgentDescription(getAgentType(agent))}</small>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card border-warning mb-3">
                    <div class="card-header bg-warning text-dark">
                        <h6 class="mb-0"><i class="fas fa-plug me-2"></i>연동된 외부 도구</h6>
                    </div>
                    <div class="card-body">
                        ${externalTools.length > 0 ? `
                            <div class="alert alert-success small mb-3">
                                <i class="fas fa-check-circle me-2"></i>
                                <strong>${externalTools.length}개의 외부 도구</strong>가 이 질문 처리에 활용됩니다.
                            </div>
                            <div class="mb-3">
                                <strong>활용 도구:</strong>
                                ${externalTools.map(tool => `
                                    <div class="d-flex align-items-center mb-1">
                                        <i class="fas fa-link text-success me-2"></i>
                                        <span class="small">${tool}</span>
                                    </div>
                                `).join('')}
                            </div>
                            ${dataSourcesUsed.length > 0 ? `
                                <div>
                                    <strong>데이터 소스:</strong>
                                    ${dataSourcesUsed.map(source => `
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="fas fa-database text-info me-2"></i>
                                            <span class="small">${source}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        ` : `
                            <div class="alert alert-secondary small">
                                <i class="fas fa-info-circle me-2"></i>
                                현재 연동된 외부 도구가 없습니다.<br>
                                <a href="#" onclick="showSection('external-tools'); return false;" class="text-decoration-none">
                                    외부 도구 연동하기 →
                                </a>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // 대시보드 표시 (부드러운 애니메이션)
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
    dashboard.style.opacity = '0';
    dashboard.scrollIntoView({ behavior: 'smooth' });
    
    setTimeout(() => {
        dashboard.style.transition = 'opacity 0.5s ease';
        dashboard.style.opacity = '1';
    }, 300);
}

// Mock 워크플로우 실행
async function executeMockAgentWorkflow(workflowId) {
    currentWorkflowId = workflowId;
    
    // 대시보드 표시
    const dashboard = document.getElementById('dashboard');
    dashboard.style.display = 'block';
    
    // 워크플로우 상태 카드 표시
    const statusCard = document.getElementById('workflow-status-card');
    if (statusCard) {
        statusCard.style.display = 'block';
    }
    
    // Mock 상태 폴링 시작
    startMockStatusPolling();
    
    // 상태 메시지 업데이트
    showQueryStatus('AI 에이전트들이 협력하여 작업을 수행하고 있습니다...', 'info');
}

// 워크플로우 상태 업데이트
function updateWorkflowStatus(workflow) {
    const progressDiv = document.getElementById('workflow-progress');
    
    // 워크플로우 상태 카드 표시
    const statusCard = document.getElementById('workflow-status-card');
    if (statusCard) {
        statusCard.style.display = 'block';
    }
    
    let statusHtml = `
        <div class="mb-3">
            <h6>워크플로우 상태: <span class="badge bg-${getStatusColor(workflow.status)}">${getStatusDisplayName(workflow.status)}</span></h6>
            <div class="progress mb-2">
                <div class="progress-bar" role="progressbar" 
                     style="width: ${workflow.progress || 0}%" 
                     aria-valuenow="${workflow.progress || 0}" 
                     aria-valuemin="0" 
                     aria-valuemax="100">
                    ${workflow.progress || 0}%
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <h6>에이전트 실행 상태:</h6>
            <div class="row">
    `;
    
    // 에이전트 상태 정보
    const agents = workflow.executions || workflow.agents || [];
    
    agents.forEach((agent, index) => {
        const agentName = agent.agent_type ? 
            (agent.agent_type === 'monitoring' ? '모니터링 AI' :
             agent.agent_type === 'prediction' ? '예측 AI' :
             agent.agent_type === 'control' ? '제어 AI' :
             agent.agent_type === 'orchestration' ? '오케스트레이션 AI' : 'AI 에이전트') :
            (agent.name || `에이전트 ${index + 1}`);
        
        const agentStatus = agent.status || 'pending';
        const isRunning = agentStatus === 'running';
        const isCompleted = agentStatus === 'completed';
        
        statusHtml += `
            <div class="col-md-3 mb-2">
                <div class="card border-${getStatusColor(agentStatus)} ${isRunning ? 'pulse' : ''}">
                    <div class="card-body p-2 text-center">
                        <h6 class="card-title mb-1 small">${agentName}</h6>
                        <span class="badge bg-${getStatusColor(agentStatus)}">${agentStatus}</span>
                        ${isRunning ? '<div class="mt-1"><div class="typing-indicator"><span></span><span></span><span></span></div></div>' : ''}
                        ${isCompleted ? '<div class="mt-1"><i class="fas fa-check-circle text-success"></i></div>' : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    statusHtml += '</div></div>';
    
    // 워크플로우 시작 시간과 완료 시간 표시
    if (workflow.started_at) {
        const startTime = new Date(workflow.started_at).toLocaleTimeString();
        statusHtml += `
            <div class="row">
                <div class="col-md-6">
                    <small class="text-muted">시작 시간: ${startTime}</small>
                </div>
                <div class="col-md-6">
                    <small class="text-muted">
                        ${workflow.status === 'completed' ? 
                            `완료 시간: ${workflow.completed_at ? new Date(workflow.completed_at).toLocaleTimeString() : 'N/A'}` :
                            '실행 중...'
                        }
                    </small>
                </div>
            </div>
        `;
    }
    
    if (progressDiv) {
        progressDiv.innerHTML = statusHtml;
    }
}

// 에이전트 배치 상태 업데이트
function updateAgentDeploymentStatus(agentIndex, status, agentName = '') {
    const agentStep = document.getElementById(`agent-step-${agentIndex}`);
    if (!agentStep) return;
    
    const statusBadge = agentStep.querySelector('.badge');
    if (!statusBadge) return;
    
    let statusText, statusClass, icon = '';
    
    switch (status) {
        case 'pending':
            statusText = '배치 대기';
            statusClass = 'bg-info';
            icon = '<i class="fas fa-clock me-1"></i>';
            break;
        case 'running':
            statusText = '실행 중';
            statusClass = 'bg-warning';
            icon = '<i class="fas fa-spinner fa-spin me-1"></i>';
            break;
        case 'completed':
            statusText = '완료';
            statusClass = 'bg-success';
            icon = '<i class="fas fa-check me-1"></i>';
            break;
        default:
            statusText = '배치 대기';
            statusClass = 'bg-info';
            icon = '<i class="fas fa-clock me-1"></i>';
    }
    
    statusBadge.className = `badge ${statusClass} ms-auto`;
    statusBadge.innerHTML = `${icon}${statusText}`;
    
    console.log(`Agent ${agentIndex} (${agentName}) status updated to: ${status}`);
}

// 전역 스코프에 함수들 할당
window.handleNlpQuery = handleNlpQuery;
window.displayQueryAnalysis = displayQueryAnalysis;
window.executeMockAgentWorkflow = executeMockAgentWorkflow;
window.updateWorkflowStatus = updateWorkflowStatus;
window.updateAgentDeploymentStatus = updateAgentDeploymentStatus;
