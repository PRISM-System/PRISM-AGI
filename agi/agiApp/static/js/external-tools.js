/**
 * 외부 도구 연동 기능
 */

class ExternalToolsManager {
    constructor() {
        this.availableTools = this.initializeMockTools();
        this.connectedTools = JSON.parse(localStorage.getItem('connectedTools') || '[]');
        this.toolConfigurations = JSON.parse(localStorage.getItem('toolConfigurations') || '{}');
        
        // 최초 실행 시 기본 도구들을 연결된 상태로 초기화
        this.initializeDefaultConnectedTools();
        
        // 연결된 도구들의 상태를 'connected'로 설정
        this.connectedTools.forEach(connectedTool => {
            const tool = this.findToolById(connectedTool.id);
            if (tool) {
                tool.status = 'connected';
            }
        });
    }

    // 기본 연결 도구 초기화 (최초 실행 시만)
    initializeDefaultConnectedTools() {
        if (this.connectedTools.length === 0) {
            // 기본으로 센서 게이트웨이를 연결된 상태로 설정
            const sensorGateway = this.findToolById('sensor-gateway');
            if (sensorGateway) {
                this.connectedTools.push({
                    ...sensorGateway,
                    connectedAt: new Date().toISOString(),
                    lastActivity: new Date().toISOString()
                });
                sensorGateway.status = 'connected';
            }
            
            // LocalStorage에 저장
            localStorage.setItem('connectedTools', JSON.stringify(this.connectedTools));
        }
    }

    // Mock 도구 데이터 초기화
    initializeMockTools() {
        return {
            monitoring: [
                {
                    id: 'scada-system',
                    name: 'SCADA 시스템',
                    description: 'Supervisory Control and Data Acquisition 시스템 연동',
                    icon: 'fas fa-monitor-heart-rate',
                    category: 'monitoring',
                    status: 'available',
                    features: ['실시간 데이터 수집', '알람 관리', '트렌드 분석'],
                    connectionType: 'OPC-UA'
                },
                {
                    id: 'plc-connector',
                    name: 'PLC 커넥터',
                    description: 'Programmable Logic Controller 직접 연동',
                    icon: 'fas fa-microchip',
                    category: 'monitoring',
                    status: 'available',
                    features: ['실시간 I/O 제어', '프로그램 업로드/다운로드', '진단 기능'],
                    connectionType: 'Ethernet/IP'
                },
                {
                    id: 'sensor-gateway',
                    name: '센서 게이트웨이',
                    description: 'IoT 센서 데이터 통합 수집',
                    icon: 'fas fa-broadcast-tower',
                    category: 'monitoring',
                    status: 'connected',
                    features: ['다중 프로토콜 지원', '데이터 변환', '엣지 컴퓨팅'],
                    connectionType: 'MQTT'
                }
            ],
            integration: [
                {
                    id: 'rest-api',
                    name: 'REST API 클라이언트',
                    description: 'RESTful 웹 서비스 API 호출 및 테스트',
                    icon: 'fas fa-code',
                    category: 'integration',
                    status: 'available',
                    features: ['HTTP 메소드 지원', '인증 관리', 'JSON/XML 처리'],
                    connectionType: 'HTTP/HTTPS'
                },
                {
                    id: 'webhook-manager',
                    name: '웹훅 매니저',
                    description: '웹훅 이벤트 수신 및 처리',
                    icon: 'fas fa-webhook',
                    category: 'integration',
                    status: 'available',
                    features: ['이벤트 라우팅', '페이로드 변환', '재시도 로직'],
                    connectionType: 'HTTP POST'
                },
                {
                    id: 'message-queue',
                    name: '메시지 큐',
                    description: '비동기 메시지 처리 시스템',
                    icon: 'fas fa-stream',
                    category: 'integration',
                    status: 'connected',
                    features: ['큐 관리', '메시지 라우팅', '지연 처리'],
                    connectionType: 'AMQP'
                }
            ],
            analytics: [
                {
                    id: 'power-bi',
                    name: 'Power BI 커넥터',
                    description: 'Microsoft Power BI 대시보드 연동',
                    icon: 'fas fa-chart-bar',
                    category: 'analytics',
                    status: 'available',
                    features: ['데이터 시각화', '대시보드 임베딩', '실시간 업데이트'],
                    connectionType: 'Power BI API'
                },
                {
                    id: 'tableau-connector',
                    name: 'Tableau 커넥터',
                    description: 'Tableau 워크북 및 대시보드 연동',
                    icon: 'fas fa-chart-line',
                    category: 'analytics',
                    status: 'available',
                    features: ['워크북 퍼블리싱', '데이터 추출', '사용자 관리'],
                    connectionType: 'Tableau REST API'
                },
                {
                    id: 'elastic-search',
                    name: 'Elasticsearch',
                    description: '로그 검색 및 분석 엔진',
                    icon: 'fas fa-search',
                    category: 'analytics',
                    status: 'available',
                    features: ['전문 검색', '로그 집계', '실시간 분석'],
                    connectionType: 'Elasticsearch API'
                }
            ]
        };
    }

    // 도구 목록 로드
    loadAvailableTools() {
        this.renderToolCategories();
        this.updateConnectedToolsList(); // 연결된 도구 목록 초기 업데이트
    }

    // 도구 카테고리 렌더링
    renderToolCategories() {
        const categories = [
            { key: 'monitoring', name: '모니터링 도구', color: 'primary' },
            { key: 'integration', name: '통합 도구', color: 'success' },
            { key: 'analytics', name: '분석 도구', color: 'info' }
        ];

        categories.forEach(category => {
            this.renderToolCategory(category);
        });
    }

    // 개별 카테고리 렌더링
    renderToolCategory(category) {
        const tools = this.availableTools[category.key];
        const container = document.querySelector(`[data-category="${category.key}"] .list-group`);
        
        if (!container || !tools) return;

        container.innerHTML = '';
        tools.forEach(tool => {
            const toolElement = this.createToolElement(tool, category.color);
            container.appendChild(toolElement);
        });
    }

    // 도구 요소 생성
    createToolElement(tool, categoryColor) {
        const button = document.createElement('button');
        button.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-start';
        
        const statusBadge = tool.status === 'connected' ? 
            '<span class="badge bg-success">연결됨</span>' : 
            '<span class="badge bg-secondary">사용가능</span>';
            
        button.innerHTML = `
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-1">
                    <i class="${tool.icon} text-${categoryColor} me-2"></i>
                    <strong>${tool.name}</strong>
                    ${statusBadge}
                </div>
                <p class="mb-1 text-muted small">${tool.description}</p>
                <small class="text-muted">연결 방식: ${tool.connectionType}</small>
            </div>
            <div class="btn-group-vertical btn-group-sm">
                ${tool.status === 'connected' ? 
                    `<button class="btn btn-outline-danger btn-sm" onclick="disconnectTool('${tool.id}')">
                        <i class="fas fa-unlink"></i>
                    </button>` :
                    `<button class="btn btn-outline-${categoryColor} btn-sm" onclick="connectTool('${tool.id}')">
                        <i class="fas fa-link"></i>
                    </button>`
                }
                <button class="btn btn-outline-secondary btn-sm" onclick="configureTool('${tool.id}')">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
        `;
        
        button.onclick = (e) => {
            if (!e.target.closest('.btn-group-vertical')) {
                this.openTool(tool.id);
            }
        };
        
        return button;
    }

    // 도구 연결
    connectTool(toolId) {
        const tool = this.findToolById(toolId);
        if (!tool) return;

        // 연결 시뮬레이션
        showToast(`${tool.name} 연결 중...`, 'info');
        
        setTimeout(() => {
            tool.status = 'connected';
            
            // 연결된 도구 정보를 전체 도구 정보와 함께 저장
            const existingConnected = this.connectedTools.find(t => t.id === toolId);
            if (!existingConnected) {
                this.connectedTools.push({
                    ...tool, // 전체 도구 정보 포함
                    connectedAt: new Date().toISOString(),
                    lastActivity: new Date().toISOString()
                });
            }
            
            localStorage.setItem('connectedTools', JSON.stringify(this.connectedTools));
            this.renderToolCategories();
            this.updateConnectedToolsList();
            
            showToast(`${tool.name}이(가) 성공적으로 연결되었습니다.`, 'success');
            
            // 로그 추가
            if (window.logsManager) {
                window.logsManager.addSystemLog('INFO', 'ExternalTools', `외부 도구 연결: ${tool.name}`);
                window.logsManager.addActivityHistory('admin', 'TOOL_CONNECTED', tool.name);
            }
        }, 1500);
    }

    // 도구 연결 해제
    disconnectTool(toolId) {
        const tool = this.findToolById(toolId);
        if (!tool) return;

        if (confirm(`${tool.name}과의 연결을 해제하시겠습니까?`)) {
            tool.status = 'available';
            this.connectedTools = this.connectedTools.filter(t => t.id !== toolId);
            
            localStorage.setItem('connectedTools', JSON.stringify(this.connectedTools));
            this.renderToolCategories();
            this.updateConnectedToolsList();
            
            showToast(`${tool.name}과의 연결이 해제되었습니다.`, 'info');
            
            // 로그 추가
            if (window.logsManager) {
                window.logsManager.addSystemLog('INFO', 'ExternalTools', `외부 도구 연결 해제: ${tool.name}`);
                window.logsManager.addActivityHistory('admin', 'TOOL_DISCONNECTED', tool.name);
            }
        }
    }

    // 도구 설정
    configureTool(toolId) {
        const tool = this.findToolById(toolId);
        if (!tool) return;

        const config = this.toolConfigurations[toolId] || this.getDefaultConfig(tool);
        this.showConfigurationModal(tool, config);
    }

    // 도구 실행
    openTool(toolId) {
        const tool = this.findToolById(toolId);
        if (!tool) return;

        if (tool.status !== 'connected') {
            showToast('먼저 도구를 연결해주세요.', 'warning');
            return;
        }

        this.showToolWorkspace(tool);
    }

    // 도구 ID로 찾기
    findToolById(toolId) {
        for (const category of Object.values(this.availableTools)) {
            const tool = category.find(t => t.id === toolId);
            if (tool) return tool;
        }
        return null;
    }

    // 기본 설정 반환
    getDefaultConfig(tool) {
        const baseConfig = {
            timeout: 30000,
            retryCount: 3,
            enableLogging: true
        };

        switch (tool.connectionType) {
            case 'OPC-UA':
                return { ...baseConfig, endpoint: 'opc.tcp://localhost:4840', securityMode: 'None' };
            case 'MQTT':
                return { ...baseConfig, broker: 'mqtt://localhost:1883', clientId: 'ai-agent-platform' };
            case 'HTTP/HTTPS':
                return { ...baseConfig, baseUrl: 'https://api.example.com', apiKey: '' };
            default:
                return baseConfig;
        }
    }

    // 설정 모달 표시
    showConfigurationModal(tool, config) {
        const workspace = document.getElementById('tool-workspace');
        if (!workspace) return;

        workspace.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5><i class="${tool.icon} me-2"></i>${tool.name} 설정</h5>
                </div>
                <div class="card-body">
                    <form id="tool-config-form">
                        <div class="row">
                            ${this.generateConfigFields(tool, config)}
                        </div>
                        <div class="mt-3">
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save me-1"></i>설정 저장
                            </button>
                            <button type="button" class="btn btn-secondary ms-2" onclick="testToolConnection('${tool.id}')">
                                <i class="fas fa-plug me-1"></i>연결 테스트
                            </button>
                            <button type="button" class="btn btn-outline-secondary ms-2" onclick="resetToolWorkspace()">
                                <i class="fas fa-times me-1"></i>취소
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // 폼 제출 이벤트
        document.getElementById('tool-config-form').onsubmit = (e) => {
            e.preventDefault();
            this.saveToolConfiguration(tool.id);
        };
    }

    // 설정 필드 생성
    generateConfigFields(tool, config) {
        let fields = '';

        Object.entries(config).forEach(([key, value]) => {
            const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const inputType = typeof value === 'boolean' ? 'checkbox' : 
                             key.toLowerCase().includes('password') || key.toLowerCase().includes('key') ? 'password' : 'text';

            if (inputType === 'checkbox') {
                fields += `
                    <div class="col-md-6 mb-3">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input" id="${key}" name="${key}" ${value ? 'checked' : ''}>
                            <label class="form-check-label" for="${key}">${fieldName}</label>
                        </div>
                    </div>
                `;
            } else {
                fields += `
                    <div class="col-md-6 mb-3">
                        <label for="${key}" class="form-label">${fieldName}</label>
                        <input type="${inputType}" class="form-control" id="${key}" name="${key}" value="${value}">
                    </div>
                `;
            }
        });

        return fields;
    }

    // 도구 워크스페이스 표시
    showToolWorkspace(tool) {
        const workspace = document.getElementById('tool-workspace');
        if (!workspace) return;

        const mockData = this.generateMockToolData(tool);

        workspace.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5><i class="${tool.icon} me-2"></i>${tool.name}</h5>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="refreshToolData('${tool.id}')">
                            <i class="fas fa-sync"></i> 새로고침
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="resetToolWorkspace()">
                            <i class="fas fa-times"></i> 닫기
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    ${mockData}
                </div>
            </div>
        `;
    }

    // Mock 도구 데이터 생성
    generateMockToolData(tool) {
        switch (tool.id) {
            case 'sensor-gateway':
                return this.generateSensorGatewayData();
            case 'rest-api':
                return this.generateApiClientData();
            case 'message-queue':
                return this.generateMessageQueueData();
            default:
                return `
                    <div class="text-center py-4">
                        <i class="${tool.icon} fa-3x text-muted mb-3"></i>
                        <h5>${tool.name}</h5>
                        <p class="text-muted">${tool.description}</p>
                        <div class="mt-3">
                            <p><strong>기능:</strong></p>
                            <ul class="list-unstyled">
                                ${tool.features.map(feature => `<li><i class="fas fa-check text-success me-2"></i>${feature}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                `;
        }
    }

    // 센서 게이트웨이 데이터
    generateSensorGatewayData() {
        return `
            <div class="row">
                <div class="col-md-8">
                    <h6>실시간 센서 데이터</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>센서 ID</th>
                                    <th>타입</th>
                                    <th>값</th>
                                    <th>단위</th>
                                    <th>상태</th>
                                    <th>마지막 업데이트</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>TEMP_01</td>
                                    <td>온도</td>
                                    <td>25.4</td>
                                    <td>°C</td>
                                    <td><span class="badge bg-success">정상</span></td>
                                    <td>방금 전</td>
                                </tr>
                                <tr>
                                    <td>PRES_01</td>
                                    <td>압력</td>
                                    <td>1.03</td>
                                    <td>bar</td>
                                    <td><span class="badge bg-success">정상</span></td>
                                    <td>2초 전</td>
                                </tr>
                                <tr>
                                    <td>VIBR_01</td>
                                    <td>진동</td>
                                    <td>0.02</td>
                                    <td>mm/s</td>
                                    <td><span class="badge bg-warning">주의</span></td>
                                    <td>5초 전</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-4">
                    <h6>연결 통계</h6>
                    <div class="list-group list-group-flush">
                        <div class="list-group-item d-flex justify-content-between">
                            <span>연결된 센서</span>
                            <strong>24</strong>
                        </div>
                        <div class="list-group-item d-flex justify-content-between">
                            <span>활성 센서</span>
                            <strong>22</strong>
                        </div>
                        <div class="list-group-item d-flex justify-content-between">
                            <span>오프라인 센서</span>
                            <strong>2</strong>
                        </div>
                        <div class="list-group-item d-flex justify-content-between">
                            <span>메시지/분</span>
                            <strong>1,440</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // API 클라이언트 데이터
    generateApiClientData() {
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6>API 요청</h6>
                    <form class="mb-3">
                        <div class="mb-2">
                            <select class="form-select form-select-sm">
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                        </div>
                        <div class="mb-2">
                            <input type="text" class="form-control form-control-sm" placeholder="API 엔드포인트" value="/api/sensors">
                        </div>
                        <div class="mb-2">
                            <textarea class="form-control form-control-sm" rows="3" placeholder="요청 본문 (JSON)"></textarea>
                        </div>
                        <button type="button" class="btn btn-primary btn-sm">
                            <i class="fas fa-paper-plane me-1"></i>전송
                        </button>
                    </form>
                </div>
                <div class="col-md-6">
                    <h6>응답</h6>
                    <div class="bg-light p-3 rounded">
                        <small class="text-muted">Status: 200 OK</small>
                        <pre class="mb-0 mt-2"><code>{
  "sensors": [
    {
      "id": "TEMP_01",
      "value": 25.4,
      "status": "normal"
    }
  ]
}</code></pre>
                    </div>
                </div>
            </div>
        `;
    }

    // 메시지 큐 데이터
    generateMessageQueueData() {
        return `
            <div class="row">
                <div class="col-md-8">
                    <h6>큐 상태</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>큐 이름</th>
                                    <th>메시지 수</th>
                                    <th>소비자</th>
                                    <th>상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>sensor-data</td>
                                    <td>142</td>
                                    <td>3</td>
                                    <td><span class="badge bg-success">활성</span></td>
                                </tr>
                                <tr>
                                    <td>alerts</td>
                                    <td>5</td>
                                    <td>2</td>
                                    <td><span class="badge bg-success">활성</span></td>
                                </tr>
                                <tr>
                                    <td>commands</td>
                                    <td>0</td>
                                    <td>1</td>
                                    <td><span class="badge bg-secondary">대기</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-4">
                    <h6>통계</h6>
                    <div class="list-group list-group-flush">
                        <div class="list-group-item d-flex justify-content-between">
                            <span>총 메시지</span>
                            <strong>147</strong>
                        </div>
                        <div class="list-group-item d-flex justify-content-between">
                            <span>처리율</span>
                            <strong>98.2%</strong>
                        </div>
                        <div class="list-group-item d-flex justify-content-between">
                            <span>평균 지연</span>
                            <strong>12ms</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 도구 설정 저장
    saveToolConfiguration(toolId) {
        const form = document.getElementById('tool-config-form');
        if (!form) return;

        const formData = new FormData(form);
        const config = {};

        for (const [key, value] of formData.entries()) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input.type === 'checkbox') {
                config[key] = input.checked;
            } else if (input.type === 'number') {
                config[key] = parseFloat(value);
            } else {
                config[key] = value;
            }
        }

        this.toolConfigurations[toolId] = config;
        localStorage.setItem('toolConfigurations', JSON.stringify(this.toolConfigurations));

        showToast('설정이 저장되었습니다.', 'success');
        
        // 로그 추가
        if (window.logsManager) {
            const tool = this.findToolById(toolId);
            window.logsManager.addActivityHistory('admin', 'TOOL_CONFIGURED', tool.name);
        }
    }

    // 연결된 도구 목록 업데이트
    updateConnectedToolsList() {
        // 연결된 도구들을 표시할 영역 업데이트
        const connectedSection = document.querySelector('.connected-tools-section');
        if (connectedSection) {
            if (this.connectedTools.length > 0) {
                connectedSection.innerHTML = `
                    <div class="alert alert-success small mb-3">
                        <i class="fas fa-check-circle me-2"></i>
                        <strong>${this.connectedTools.length}개의 외부 도구</strong>가 연결되어 있습니다.
                    </div>
                    <div class="row">
                        ${this.connectedTools.map(tool => `
                            <div class="col-md-6 mb-2">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center">
                                        <i class="${tool.icon || 'fas fa-plug'} text-success me-2"></i>
                                        <span class="small">${tool.name}</span>
                                    </div>
                                    <button class="btn btn-outline-danger btn-xs" onclick="disconnectTool('${tool.id}')" title="연결 해제">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                connectedSection.innerHTML = `
                    <div class="alert alert-secondary small">
                        <i class="fas fa-info-circle me-2"></i>
                        현재 연동된 외부 도구가 없습니다.<br>
                        <span class="text-decoration-none">
                            위의 도구 목록에서 연결하기 버튼을 클릭하세요.
                        </span>
                    </div>
                `;
            }
        }
    }
}

// 전역 함수들
function loadAvailableTools() {
    if (typeof window.toolsManager === 'undefined') {
        window.toolsManager = new ExternalToolsManager();
    }
    window.toolsManager.loadAvailableTools();
}

function connectTool(toolId) {
    if (window.toolsManager) {
        window.toolsManager.connectTool(toolId);
    }
}

function disconnectTool(toolId) {
    if (window.toolsManager) {
        window.toolsManager.disconnectTool(toolId);
    }
}

function configureTool(toolId) {
    if (window.toolsManager) {
        window.toolsManager.configureTool(toolId);
    }
}

function openTool(toolId) {
    if (window.toolsManager) {
        window.toolsManager.openTool(toolId);
    }
}

function testToolConnection(toolId) {
    showToast('연결 테스트 중...', 'info');
    
    setTimeout(() => {
        const success = Math.random() > 0.2; // 80% 성공률
        if (success) {
            showToast('연결 테스트 성공!', 'success');
        } else {
            showToast('연결 테스트 실패. 설정을 확인해주세요.', 'error');
        }
    }, 2000);
}

function refreshToolData(toolId) {
    if (window.toolsManager) {
        const tool = window.toolsManager.findToolById(toolId);
        if (tool) {
            window.toolsManager.showToolWorkspace(tool);
            showToast('데이터가 새로고침되었습니다.', 'success');
        }
    }
}

function resetToolWorkspace() {
    const workspace = document.getElementById('tool-workspace');
    if (workspace) {
        workspace.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-mouse-pointer fa-3x mb-3"></i>
                <p>위에서 도구를 선택하여 실행하세요</p>
            </div>
        `;
    }
}

// 연결된 외부 도구 조회 함수 (전역 함수)
function getConnectedExternalTools() {
    const connectedTools = JSON.parse(localStorage.getItem('connectedTools') || '[]');
    return connectedTools;
}

// 전역 스코프에 함수들 할당
window.loadAvailableTools = loadAvailableTools;
window.connectTool = connectTool;
window.disconnectTool = disconnectTool;
window.configureTool = configureTool;
window.openTool = openTool;
window.testToolConnection = testToolConnection;
window.refreshToolData = refreshToolData;
window.resetToolWorkspace = resetToolWorkspace;
window.getConnectedExternalTools = getConnectedExternalTools;
