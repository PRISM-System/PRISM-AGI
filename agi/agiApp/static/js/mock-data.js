/**
 * AI 에이전트 플랫폼 - Mock 데이터 및 시뮬레이션
 * Mock 분석 결과, 워크플로우 폴링, 에이전트 출력 데이터 생성
 */

// Mock 분석 결과 생성 (외부 도구 연동 포함)
function generateMockAnalysisResult(query) {
    const workflowId = 'mock_' + Date.now();
    
    // 질문 키워드 분석
    const keywords = query.toLowerCase();
    let intent = 'general';
    let riskLevel = 'low';
    let complexity = '중간';
    let sensors = [];
    let recommendedAgents = [];
    let externalTools = [];
    let dataSourcesUsed = [];
    
    // 연결된 외부 도구 확인
    const connectedTools = getConnectedExternalTools();
    
    // 키워드 기반 분석
    if (keywords.includes('온도')) {
        sensors.push('온도센서');
        intent = 'monitoring';
        recommendedAgents.push('모니터링 AI', '예측 AI');
        
        // SCADA나 센서 게이트웨이가 연결되어 있으면 활용
        if (connectedTools.some(tool => tool.id === 'scada-system')) {
            externalTools.push('SCADA 시스템');
            dataSourcesUsed.push('SCADA 실시간 온도 데이터');
        }
        if (connectedTools.some(tool => tool.id === 'sensor-gateway')) {
            externalTools.push('센서 게이트웨이');
            dataSourcesUsed.push('IoT 온도 센서 데이터');
        }
    }
    
    if (keywords.includes('압력')) {
        sensors.push('압력센서');
        intent = 'monitoring';
        recommendedAgents.push('모니터링 AI', '제어 AI');
        
        if (connectedTools.some(tool => tool.id === 'plc-connector')) {
            externalTools.push('PLC 커넥터');
            dataSourcesUsed.push('PLC 압력 제어 데이터');
        }
        if (connectedTools.some(tool => tool.id === 'scada-system')) {
            externalTools.push('SCADA 시스템');
            dataSourcesUsed.push('SCADA 압력 모니터링 데이터');
        }
    }
    
    if (keywords.includes('습도')) {
        sensors.push('습도센서');
        intent = 'monitoring';
        recommendedAgents.push('모니터링 AI');
        
        if (connectedTools.some(tool => tool.id === 'sensor-gateway')) {
            externalTools.push('센서 게이트웨이');
            dataSourcesUsed.push('환경 습도 센서 데이터');
        }
    }
    
    if (keywords.includes('진동')) {
        sensors.push('진동센서');
        intent = 'monitoring';
        recommendedAgents.push('모니터링 AI', '예측 AI');
        
        if (connectedTools.some(tool => tool.id === 'sensor-gateway')) {
            externalTools.push('센서 게이트웨이');
            dataSourcesUsed.push('진동 분석 센서 데이터');
        }
    }
    
    if (keywords.includes('예측') || keywords.includes('향후') || keywords.includes('미래')) {
        intent = 'prediction';
        if (!recommendedAgents.includes('예측 AI')) {
            recommendedAgents.push('예측 AI');
        }
        complexity = '높음';
        
        // 예측을 위한 외부 데이터 소스
        if (connectedTools.some(tool => tool.id === 'elastic-search')) {
            externalTools.push('Elasticsearch');
            dataSourcesUsed.push('과거 로그 데이터 분석');
        }
        if (connectedTools.some(tool => tool.id === 'message-queue')) {
            externalTools.push('메시지 큐');
            dataSourcesUsed.push('실시간 이벤트 스트림');
        }
    }
    
    if (keywords.includes('제어') || keywords.includes('조치') || keywords.includes('대응')) {
        intent = 'control';
        if (!recommendedAgents.includes('제어 AI')) {
            recommendedAgents.push('제어 AI');
        }
        riskLevel = 'medium';
        
        // 제어를 위한 외부 시스템
        if (connectedTools.some(tool => tool.id === 'plc-connector')) {
            externalTools.push('PLC 커넥터');
            dataSourcesUsed.push('직접 장비 제어');
        }
        if (connectedTools.some(tool => tool.id === 'rest-api')) {
            externalTools.push('REST API 클라이언트');
            dataSourcesUsed.push('제어 시스템 API 호출');
        }
    }
    
    if (keywords.includes('긴급') || keywords.includes('위험') || keywords.includes('급상승') || keywords.includes('급락')) {
        riskLevel = 'high';
        complexity = '높음';
        if (!recommendedAgents.includes('오케스트레이션 AI')) {
            recommendedAgents.push('오케스트레이션 AI');
        }
        
        // 긴급 상황 대응을 위한 알림 시스템
        if (connectedTools.some(tool => tool.id === 'webhook-manager')) {
            externalTools.push('웹훅 매니저');
            dataSourcesUsed.push('긴급 알림 발송');
        }
        if (connectedTools.some(tool => tool.id === 'message-queue')) {
            externalTools.push('메시지 큐');
            dataSourcesUsed.push('우선순위 이벤트 처리');
        }
    }
    
    if (keywords.includes('통합') || keywords.includes('전체') || keywords.includes('협력')) {
        intent = 'orchestration';
        if (!recommendedAgents.includes('오케스트레이션 AI')) {
            recommendedAgents.push('오케스트레이션 AI');
        }
        complexity = '높음';
    }
    
    // 분석 및 시각화 요청
    if (keywords.includes('분석') || keywords.includes('차트') || keywords.includes('그래프') || keywords.includes('보고서')) {
        if (connectedTools.some(tool => tool.id === 'power-bi')) {
            externalTools.push('Power BI 커넥터');
            dataSourcesUsed.push('대시보드 시각화');
        }
        if (connectedTools.some(tool => tool.id === 'tableau-connector')) {
            externalTools.push('Tableau 커넥터');
            dataSourcesUsed.push('고급 차트 생성');
        }
    }
    
    // 기본 에이전트 추가
    if (recommendedAgents.length === 0) {
        recommendedAgents.push('모니터링 AI');
    }
    
    // 분석 텍스트 생성 (외부 도구 포함)
    let analysisText = `질문을 분석한 결과, ${getIntentLabel(intent)} 상황으로 판단됩니다. ${recommendedAgents.length}개의 AI 에이전트가 협력하여 문제를 해결하겠습니다.`;
    
    if (externalTools.length > 0) {
        analysisText += `\n\n연결된 외부 도구 활용: ${externalTools.join(', ')}`;
        analysisText += `\n활용할 데이터 소스: ${dataSourcesUsed.join(', ')}`;
    } else {
        analysisText += '\n\n현재 연결된 외부 도구가 없어 내부 Mock 데이터를 사용합니다. 관리도구 > 외부 도구에서 시스템을 연결하면 더 정확한 분석이 가능합니다.';
    }
    
    return {
        success: true,
        workflow_id: workflowId,
        original_question: query,
        intent: intent,
        entities: {
            sensors: sensors,
            risk_level: riskLevel,
            complexity: complexity
        },
        recommended_agents: recommendedAgents,
        external_tools: externalTools,
        data_sources: dataSourcesUsed,
        connected_tools_count: connectedTools.length,
        analysis: analysisText
    };
}

// Mock 상태 폴링
function startMockStatusPolling() {
    const agents = ['monitoring', 'prediction', 'control', 'orchestration'];
    let currentStep = 0;
    const totalSteps = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1)); // 1-3개 에이전트
    
    // Mock 워크플로우 데이터 생성
    const mockWorkflow = {
        id: currentWorkflowId,
        status: 'running',
        progress: 0,
        started_at: new Date().toISOString(),
        executions: []
    };
    
    // 실행할 에이전트들 선택
    for (let i = 0; i < totalSteps; i++) {
        const agentType = agents[i % agents.length];
        mockWorkflow.executions.push({
            id: `exec_${i}`,
            agent_type: agentType,
            agent_name: getAgentName(agentType),
            status: i === 0 ? 'running' : 'pending',
            started_at: i === 0 ? new Date().toISOString() : null,
            completed_at: null,
            output_data: null
        });
    }
    
    // 진행 상황 업데이트
    updateWorkflowStatus(mockWorkflow);
    
    // 첫 번째 에이전트 실행 중 상태로 시작
    if (typeof updateAgentDeploymentStatus === 'function' && mockWorkflow.executions.length > 0) {
        updateAgentDeploymentStatus(0, 'running', mockWorkflow.executions[0].agent_name);
    }
    
    window.currentPollingInterval = setInterval(() => {
        try {
            if (currentStep < totalSteps) {
                // 현재 에이전트 완료 처리
                if (mockWorkflow.executions[currentStep].status === 'running') {
                    mockWorkflow.executions[currentStep].status = 'completed';
                    mockWorkflow.executions[currentStep].completed_at = new Date().toISOString();
                    mockWorkflow.executions[currentStep].output_data = generateMockAgentOutput(mockWorkflow.executions[currentStep].agent_type);
                    
                    // 에이전트 배치 상태 업데이트 (완료)
                    if (typeof updateAgentDeploymentStatus === 'function') {
                        updateAgentDeploymentStatus(currentStep, 'completed', mockWorkflow.executions[currentStep].agent_name);
                    }
                    
                    // 에이전트 결과 표시
                    displayAgentResult(mockWorkflow.executions[currentStep]);
                    displayedAgentResults.add(mockWorkflow.executions[currentStep].id);
                    
                    currentStep++;
                }
                
                // 다음 에이전트 시작
                if (currentStep < totalSteps) {
                    mockWorkflow.executions[currentStep].status = 'running';
                    mockWorkflow.executions[currentStep].started_at = new Date().toISOString();
                    
                    // 에이전트 배치 상태 업데이트 (실행 중)
                    if (typeof updateAgentDeploymentStatus === 'function') {
                        updateAgentDeploymentStatus(currentStep, 'running', mockWorkflow.executions[currentStep].agent_name);
                    }
                }
                
                // 진행률 업데이트
                mockWorkflow.progress = Math.round((currentStep / totalSteps) * 80); // 80%까지만
                updateWorkflowStatus(mockWorkflow);
                
            } else {
                // AI 에이전트 작업 완료 - 이제 시스템 이상 해결 단계로 진입
                mockWorkflow.status = 'resolving_anomalies';
                mockWorkflow.progress = 80; // 80% 완료 상태로 설정
                
                updateWorkflowStatus(mockWorkflow);
                
                clearInterval(window.currentPollingInterval);
                window.currentPollingInterval = null;
                
                // 시스템 이상 해결 단계 시작
                showQueryStatus('🔧 AI 에이전트 작업 완료. 시스템 이상 상태를 해결하고 있습니다...', 'info');
                resolveSystemAnomalies(mockWorkflow);
            }
        } catch (error) {
            console.error('Mock status polling error:', error);
            clearInterval(window.currentPollingInterval);
            window.currentPollingInterval = null;
            showQueryStatus('워크플로우 실행 중 오류가 발생했습니다.', 'danger');
        }
    }, 3000); // 3초마다 상태 업데이트
}

// Mock 에이전트 출력 데이터 생성
function generateMockAgentOutput(agentType) {
    const connectedTools = getConnectedExternalTools();
    
    const baseData = {
        summary: '',
        data: {},
        execution_time: Math.random() * 3 + 1, // 1-4초
        timestamp: new Date().toISOString(),
        external_tools_used: [],
        data_sources_accessed: []
    };
    
    // 에이전트 타입별로 활용 가능한 외부 도구 결정
    const getRelevantTools = (type) => {
        const tools = [];
        const sources = [];
        
        switch (type) {
            case 'monitoring':
                if (connectedTools.some(tool => tool.id === 'scada-system')) {
                    tools.push('SCADA 시스템');
                    sources.push('SCADA 실시간 모니터링 데이터');
                }
                if (connectedTools.some(tool => tool.id === 'sensor-gateway')) {
                    tools.push('센서 게이트웨이');
                    sources.push('IoT 센서 네트워크 데이터');
                }
                break;
                
            case 'prediction':
                if (connectedTools.some(tool => tool.id === 'elastic-search')) {
                    tools.push('Elasticsearch');
                    sources.push('과거 운영 데이터 분석');
                }
                if (connectedTools.some(tool => tool.id === 'message-queue')) {
                    tools.push('메시지 큐');
                    sources.push('실시간 이벤트 스트림 분석');
                }
                if (connectedTools.some(tool => tool.id === 'power-bi')) {
                    tools.push('Power BI 커넥터');
                    sources.push('예측 모델 시각화');
                }
                break;
                
            case 'control':
                if (connectedTools.some(tool => tool.id === 'plc-connector')) {
                    tools.push('PLC 커넥터');
                    sources.push('직접 장비 제어 시스템');
                }
                if (connectedTools.some(tool => tool.id === 'rest-api')) {
                    tools.push('REST API 클라이언트');
                    sources.push('제어 시스템 API');
                }
                if (connectedTools.some(tool => tool.id === 'webhook-manager')) {
                    tools.push('웹훅 매니저');
                    sources.push('제어 결과 알림');
                }
                break;
                
            case 'orchestration':
                // 오케스트레이션은 모든 연결된 도구를 종합적으로 활용
                connectedTools.forEach(tool => {
                    if (!tools.includes(tool.name)) {
                        tools.push(tool.name);
                        sources.push(`${tool.name} 통합 데이터`);
                    }
                });
                break;
        }
        
        return { tools, sources };
    };
    
    const relevantTools = getRelevantTools(agentType);
    baseData.external_tools_used = relevantTools.tools;
    baseData.data_sources_accessed = relevantTools.sources;
    
    switch (agentType) {
        case 'monitoring':
            return {
                ...baseData,
                summary: '시스템 모니터링 완료 - 이상 상황 식별 및 분석',
                anomalies_count: currentAnomalyCount,
                risk_level: currentAnomalyCount > 2 ? 'high' : currentAnomalyCount > 0 ? 'medium' : 'low',
                primary_sensors: ['온도센서-3', '압력센서-1'],
                data: {
                    '감지된 이상': `${currentAnomalyCount}건`,
                    '모니터링 센서': '24개',
                    '정상 센서': `${24 - currentAnomalyCount}개`,
                    '마지막 체크': new Date().toLocaleTimeString(),
                    '연동 도구 활용': relevantTools.tools.length > 0 ? `${relevantTools.tools.length}개 도구 활용` : '내장 센서만 사용'
                }
            };
        case 'prediction':
            return {
                ...baseData,
                summary: '예측 분석 완료 - 향후 2시간 동안 시스템 안정성 확보 예상',
                predicted_value: '정상 범위 유지',
                confidence: 0.87,
                prediction_horizon: 120,
                data: {
                    '예측 결과': '안정적',
                    '신뢰도': '87%',
                    '예측 기간': '2시간',
                    '권장 조치': '예방적 점검',
                    '데이터 품질': relevantTools.sources.length > 0 ? '외부 데이터 연동으로 향상됨' : '기본 데이터 활용'
                }
            };
        case 'control':
            return {
                ...baseData,
                summary: '제어 시스템 조정 완료 - 최적 운영 조건으로 설정',
                executed_commands: 3,
                control_status: '최적화 완료',
                safety_checked: true,
                data: {
                    '실행된 명령': '3개',
                    '제어 상태': '최적화 완료',
                    '안전성 검증': '완료',
                    '조정 항목': '온도, 압력, 유량',
                    '제어 방식': relevantTools.tools.length > 0 ? '외부 시스템 연동 제어' : '내장 제어 로직'
                }
            };
        case 'orchestration':
            return {
                ...baseData,
                summary: '통합 관리 완료 - 모든 시스템 구성요소 최적화',
                data: {
                    '협력 에이전트': '3개',
                    '최적화 수준': '95%',
                    '시스템 효율': '개선됨',
                    '통합 상태': '완료',
                    '통합 도구': relevantTools.tools.length > 0 ? `${relevantTools.tools.length}개 외부 도구 통합` : '기본 시스템만 사용'
                }
            };
        default:
            return {
                ...baseData,
                summary: 'AI 에이전트 작업 완료',
                data: {
                    '작업 상태': '완료',
                    '처리 시간': `${baseData.execution_time.toFixed(1)}초`
                }
            };
    }
}

// AI 에이전트 작업 완료 후 시스템 이상 상태 해결
function resolveSystemAnomalies(workflow) {
    console.log('AI 에이전트 작업 완료 - 시스템 이상 상태 해결 시작');
    
    // 현재 이상 감지 건수를 점진적으로 감소
    const originalAnomalyCount = currentAnomalyCount;
    let resolvedCount = 0;
    
    // 해결할 이상이 없으면 즉시 완료 처리
    if (originalAnomalyCount === 0) {
        // 워크플로우 완료 상태로 업데이트
        workflow.status = 'completed';
        workflow.progress = 100;
        workflow.completed_at = new Date().toISOString();
        updateWorkflowStatus(workflow);
        
        showQueryStatus('✅ 시스템이 정상 상태입니다. 모든 작업이 완료되었습니다.', 'success');
        showSystemRecoveryAlert(0);
        return;
    }
    
    const resolutionInterval = setInterval(() => {
        if (currentAnomalyCount > 0) {
            currentAnomalyCount = Math.max(0, currentAnomalyCount - 1);
            resolvedCount++;
            
            // 모니터링 상태 업데이트
            if (typeof updateMonitoringIndicator === 'function') {
                updateMonitoringIndicator();
            }
            
            // 이상 수 UI 업데이트
            const anomalyCountElement = document.getElementById('anomaly-count');
            if (anomalyCountElement) {
                anomalyCountElement.textContent = currentAnomalyCount;
            }
            
            // 워크플로우 진행률 업데이트 (80% + 해결 진행률)
            const resolutionProgress = (resolvedCount / originalAnomalyCount) * 20; // 나머지 20%
            workflow.progress = 80 + resolutionProgress;
            updateWorkflowStatus(workflow);
            
            // 진행 상황 표시
            if (currentAnomalyCount === 0) {
                // 모든 이상 해결 완료
                workflow.status = 'completed';
                workflow.progress = 100;
                workflow.completed_at = new Date().toISOString();
                updateWorkflowStatus(workflow);
                
                showQueryStatus(`✅ ${resolvedCount}건의 이상 상황이 모두 해결되었습니다. 워크플로우가 완료되었습니다.`, 'success');
                clearInterval(resolutionInterval);
                
                // 해결 완료 토스트 알림
                showSystemRecoveryAlert(resolvedCount);
            } else {
                showQueryStatus(`🔧 이상 상황 해결 중... (${resolvedCount}/${originalAnomalyCount}건 완료)`, 'info');
            }
        } else {
            clearInterval(resolutionInterval);
        }
    }, 1500); // 1.5초마다 하나씩 해결
}

// 전역 스코프에 함수들 할당
window.generateMockAnalysisResult = generateMockAnalysisResult;
window.startMockStatusPolling = startMockStatusPolling;
window.generateMockAgentOutput = generateMockAgentOutput;
window.resolveSystemAnomalies = resolveSystemAnomalies;
