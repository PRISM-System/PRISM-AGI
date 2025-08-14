// ===============================
// 환경 설정(필요에 맞게 바꿔 사용)
// ===============================
const API_BASE = 'http://127.0.0.1:8000'; // 로컬 서버 (프록시 서버)
const USE_PROXY = true;                   // 항상 프록시 사용 (로컬 API 제거됨)
const USE_GET_FOR_LIST = false;           // true면 GET으로 목록 우회(프리플라이트 줄이기)
const USE_CREDENTIALS = false;            // 세션/쿠키 사용 시 true + 서버 CORS allow_credentials 필요
const ACCESS_TOKEN_KEY = 'access_token';  // 로컬스토리지 토큰 키 이름

// 토큰 가져오기(필요 없으면 비워 둬도 됨)
function getAccessToken() {
    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
    } catch (_) {
        return '';
    }
}

// ===============================
// 공정 진행 상태 관리
// ===============================
class ProcessManager {
    constructor() {
        this.processSidebar = document.getElementById('processSidebar');
        this.processStatus = document.getElementById('processStatus');
        this.processSteps = document.getElementById('processSteps');
        this.processDetails = document.getElementById('processDetails');
        this.processCloseBtn = document.getElementById('processCloseBtn');
        this.resizeHandle = document.querySelector('.resize-handle');
        this.chatLayout = document.querySelector('.chat-layout');
        
        // 에이전트 상태 관리
        this.agentElements = {
            prediction: document.getElementById('predictionAgent'),
            monitoring: document.getElementById('monitoringAgent'),
            control: document.getElementById('controlAgent')
        };
        
        this.currentSteps = [];
        this.currentStepIndex = 0;
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        
        this.initEventListeners();
        this.initializeAgentStatus();
    }
    
    initEventListeners() {
        console.log('Initializing event listeners');
        console.log('Process close button:', this.processCloseBtn);
        console.log('Resize handle:', this.resizeHandle);
        
        if (this.processCloseBtn) {
            this.processCloseBtn.addEventListener('click', () => {
                console.log('Close button clicked');
                this.hideSidebar();
            });
        }
        
        // 크기 조절 핸들 이벤트
        if (this.resizeHandle) {
            this.resizeHandle.addEventListener('mousedown', (e) => this.startResize(e));
        }
        
        // 전역 마우스 이벤트
        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', () => this.stopResize());
    }
    
    startResize(e) {
        this.isResizing = true;
        this.startX = e.clientX;
        this.startWidth = parseInt(document.defaultView.getComputedStyle(this.processSidebar).width, 10);
        document.body.style.cursor = 'ew-resize';
        e.preventDefault();
    }
    
    handleResize(e) {
        if (!this.isResizing) return;
        
        const dx = this.startX - e.clientX; // 좌측으로 드래그할 때 양수
        const newWidth = this.startWidth + dx;
        
        // 최소/최대 너비 제한
        const minWidth = 400;  // 최소 너비 증가
        const maxWidth = window.innerWidth * 0.9;  // 최대 너비도 증가
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            this.processSidebar.style.width = newWidth + 'px';
        }
    }
    
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            document.body.style.cursor = '';
        }
    }
    
    showSidebar() {
        console.log('Showing sidebar');
        this.processSidebar.classList.add('active');
        this.chatLayout.classList.add('process-active');
        // 스타일 초기화 (CSS 클래스가 적용되도록)
        this.processSidebar.style.width = '';
    }
    
    hideSidebar() {
        console.log('Hiding sidebar');
        this.processSidebar.classList.remove('active');
        this.chatLayout.classList.remove('process-active');
        // 강제로 width를 0으로 설정
        this.processSidebar.style.width = '0px';
    }
    
    updateStatus(text, type = 'processing') {
        const indicator = this.processStatus.querySelector('.status-indicator');
        const statusText = this.processStatus.querySelector('span');
        
        indicator.className = `status-indicator ${type}`;
        statusText.textContent = text;
    }
    
    initializeSteps(query) {
        // 제조 공정 관련 키워드 감지하여 적절한 단계 설정
        let steps = [];
        
        if (query.includes('품질') || query.includes('검사') || query.includes('불량')) {
            steps = [
                { title: '품질 데이터 분석', description: '품질 관리 시스템에서 데이터 수집' },
                { title: '불량 패턴 감지', description: '머신러닝 모델로 불량 패턴 분석' },
                { title: '원인 분석', description: '공정 파라미터와 품질 결과 상관관계 분석' },
                { title: '개선안 도출', description: '최적화된 공정 조건 제안' },
                { title: '보고서 생성', description: '종합 분석 결과 정리' }
            ];
        } else if (query.includes('생산') || query.includes('스케줄') || query.includes('계획')) {
            steps = [
                { title: '생산 현황 조회', description: '실시간 생산 데이터 수집' },
                { title: '자원 가용성 확인', description: '설비 및 인력 현황 분석' },
                { title: '수요 예측 분석', description: 'AI 모델로 수요량 예측' },
                { title: '최적 스케줄 계산', description: '제약 조건을 고려한 스케줄링' },
                { title: '실행 계획 수립', description: '상세 작업 지시서 생성' }
            ];
        } else if (query.includes('설비') || query.includes('장비') || query.includes('유지보수')) {
            steps = [
                { title: '설비 상태 진단', description: '센서 데이터로 설비 상태 확인' },
                { title: '예측 정비 분석', description: '고장 예측 모델 실행' },
                { title: '부품 수명 평가', description: '핵심 부품 잔여 수명 계산' },
                { title: '정비 계획 수립', description: '예방 정비 스케줄 최적화' },
                { title: '비용 효과 분석', description: '정비 비용 대비 효과 평가' }
            ];
        } else {
            // 기본 AI 처리 단계
            steps = [
                { title: '요청 분석', description: '사용자 질문 의도 파악' },
                { title: '데이터 수집', description: '관련 정보 및 데이터 검색' },
                { title: 'AI 모델 실행', description: '최적 AI 모델로 분석 처리' },
                { title: '결과 검증', description: '생성된 답변의 정확성 검토' },
                { title: '응답 생성', description: '사용자 친화적 형태로 결과 정리' }
            ];
        }
        
        this.currentSteps = steps;
        this.currentStepIndex = 0;
        
        // 에이전트 활성화
        this.activateAgents();
        
        this.renderSteps();
        this.updateDetails(query);
    }
    
    renderSteps() {
        this.processSteps.innerHTML = '';
        
        // 가로 진행바 생성
        const progressBar = document.createElement('div');
        progressBar.className = 'process-progress-bar';
        
        this.currentSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'progress-step';
            
            // 현재 진행 상태에 따라 클래스와 내용 설정
            let indicatorContent = index + 1;
            let stepClass = '';
            let indicatorClass = 'progress-indicator';
            let labelClass = 'progress-label';
            
            if (index < this.currentStepIndex) {
                // 완료된 단계
                stepClass = 'completed';
                indicatorClass += ' completed';
                labelClass += ' completed';
                indicatorContent = '✓';
            } else if (index === this.currentStepIndex) {
                // 현재 진행 중인 단계
                stepClass = 'active';
                indicatorClass += ' active';
                labelClass += ' active';
            }
            
            stepElement.className = `progress-step ${stepClass}`;
            stepElement.innerHTML = `
                <div class="${indicatorClass}">${indicatorContent}</div>
                <div class="${labelClass}">${step.title}</div>
            `;
            progressBar.appendChild(stepElement);
        });
        
        // 진행바만 추가
        this.processSteps.appendChild(progressBar);
    }
    
    nextStep() {
        if (this.currentStepIndex < this.currentSteps.length) {
            const progressBar = this.processSteps.querySelector('.process-progress-bar');
            
            // 이전 단계 완료 처리
            if (this.currentStepIndex > 0) {
                const prevStep = progressBar.children[this.currentStepIndex - 1];
                prevStep.classList.add('completed');
                prevStep.classList.remove('active');
                const prevIndicator = prevStep.querySelector('.progress-indicator');
                const prevLabel = prevStep.querySelector('.progress-label');
                prevIndicator.classList.add('completed');
                prevIndicator.classList.remove('active');
                prevIndicator.innerHTML = '✓';
                prevLabel.classList.add('completed');
                prevLabel.classList.remove('active');
                
                // 라이브 대시보드에서 이전 단계 완료 처리
                this.addStepToLiveDashboard(this.currentSteps[this.currentStepIndex - 1], this.currentStepIndex - 1, 'completed');
            }
            
            // 현재 단계 활성화
            if (this.currentStepIndex < this.currentSteps.length) {
                const currentStep = progressBar.children[this.currentStepIndex];
                
                currentStep.classList.add('active');
                const currentIndicator = currentStep.querySelector('.progress-indicator');
                const currentLabel = currentStep.querySelector('.progress-label');
                currentIndicator.classList.add('active');
                currentLabel.classList.add('active');
                
                // 단계별 에이전트 통신 상태 시뮬레이션
                this.simulateAgentCommunication(this.currentStepIndex);
                
                // 현재 단계의 상세 정보 표시
                this.updateStepDetails(this.currentSteps[this.currentStepIndex]);
            }
            
            this.currentStepIndex++;
        }
    }
    
    completeProcess() {
        // 마지막 단계 완료 처리
        if (this.currentStepIndex > 0 && this.currentStepIndex <= this.currentSteps.length) {
            const lastStepIndex = this.currentStepIndex - 1;
            this.addStepToLiveDashboard(this.currentSteps[lastStepIndex], lastStepIndex, 'completed');
        }
        
        // currentStepIndex를 모든 단계 완료로 설정
        this.currentStepIndex = this.currentSteps.length;
        
        const progressBar = this.processSteps.querySelector('.process-progress-bar');
        
        // 모든 단계 완료 표시
        for (let i = 0; i < this.currentSteps.length; i++) {
            const step = progressBar.children[i];
            step.classList.add('completed');
            step.classList.remove('active');
            const indicator = step.querySelector('.progress-indicator');
            const label = step.querySelector('.progress-label');
            indicator.classList.add('completed');
            indicator.classList.remove('active');
            indicator.innerHTML = '✓';
            label.classList.add('completed');
            label.classList.remove('active');
        }
        
        this.updateStatus('처리 완료', 'success');
        
        // 모든 에이전트 비활성화
        this.deactivateAgents();
        
        this.finalizeLiveDashboard();
    }
    
    finalizeLiveDashboard() {
        const liveBadge = this.processDetails.querySelector('.live-badge');
        if (liveBadge) {
            liveBadge.textContent = '완료';
            liveBadge.className = 'completion-badge';
        }
        
        const dashboardTitle = this.processDetails.querySelector('.dashboard-title');
        if (dashboardTitle) {
            dashboardTitle.textContent = '🎯 작업 완료 대시보드';
        }
    }
    
    handleProcessError(errorMessage, failedStepIndex = null) {
        // 현재 진행 중인 단계를 실패로 표시
        if (failedStepIndex !== null && failedStepIndex < this.currentSteps.length) {
            this.addStepToLiveDashboard(this.currentSteps[failedStepIndex], failedStepIndex, 'failed');
        }
        
        // 상태를 에러로 업데이트
        this.updateStatus('처리 실패', 'error');
        
        // 관련 에이전트를 오류 상태로 표시
        const agents = ['prediction', 'monitoring', 'control'];
        const errorAgent = agents[failedStepIndex % agents.length] || 'monitoring';
        this.setAgentError(errorAgent);
        
        // 잠시 후 모든 에이전트 비활성화
        setTimeout(() => {
            this.deactivateAgents();
        }, 2000);
        
        // 에러 대시보드 표시
        this.showErrorDashboard(errorMessage, failedStepIndex);
    }
    
    showErrorDashboard(errorMessage, failedStepIndex) {
        const failedTime = new Date().toLocaleTimeString('ko-KR');
        const failedStep = failedStepIndex !== null ? this.currentSteps[failedStepIndex] : null;
        
        // 기존 라이브 대시보드가 있으면 에러 상태로 전환
        const liveBadge = this.processDetails.querySelector('.live-badge');
        if (liveBadge) {
            liveBadge.textContent = '실패';
            liveBadge.className = 'error-badge';
        }
        
        const dashboardTitle = this.processDetails.querySelector('.dashboard-title');
        if (dashboardTitle) {
            dashboardTitle.textContent = '❌ 처리 실패';
        }
        
        // 에러 정보 섹션 추가
        const liveSteps = this.processDetails.querySelector('#liveSteps');
        if (liveSteps) {
            const errorSection = document.createElement('div');
            errorSection.className = 'error-section';
            errorSection.innerHTML = `
                <div class="error-header">
                    <h5 class="error-title">오류 정보</h5>
                    <div class="error-time">${failedTime}</div>
                </div>
                <div class="error-details">
                    <div class="error-item">
                        <span class="error-label">오류 메시지</span>
                        <span class="error-value">${errorMessage}</span>
                    </div>
                    ${failedStep ? `
                        <div class="error-item">
                            <span class="error-label">실패 단계</span>
                            <span class="error-value">${failedStep.title}</span>
                        </div>
                    ` : ''}
                    <div class="error-item">
                        <span class="error-label">권장 조치</span>
                        <span class="error-value">잠시 후 다시 시도해주세요. 문제가 지속되면 관리자에게 문의하세요.</span>
                    </div>
                </div>
                <div class="retry-section">
                    <button class="retry-button" onclick="location.reload()">다시 시도</button>
                </div>
            `;
            liveSteps.appendChild(errorSection);
        }
    }
    
    updateDetails(query) {
        const startTime = new Date().toLocaleTimeString();
        this.processDetails.innerHTML = `
            <div class="detail-item">
                <span class="detail-label">요청 내용</span>
                <span class="detail-value">${query.substring(0, 30)}${query.length > 30 ? '...' : ''}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">시작 시간</span>
                <span class="detail-value">${startTime}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">진행 상태</span>
                <span class="detail-value">처리 중...</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">예상 소요 시간</span>
                <span class="detail-value">15-30초</span>
            </div>
        `;
    }
    
    updateStepDetails(step) {
        const now = new Date();
        const startTime = now.toLocaleTimeString('ko-KR');
        
        // 기존 대시보드에 현재 단계 추가 또는 초기화
        if (!this.processDetails.querySelector('.live-dashboard')) {
            this.initializeLiveDashboard();
        }
        
        this.addStepToLiveDashboard(step, this.currentStepIndex, 'processing');
    }
    
    initializeLiveDashboard() {
        this.processDetails.innerHTML = `
            <div class="live-dashboard">
                <div class="dashboard-header">
                    <h4 class="dashboard-title">📋 실시간 작업 진행</h4>
                    <div class="live-badge">진행중</div>
                </div>
                <div class="live-steps" id="liveSteps">
                    <!-- 단계별 작업이 실시간으로 추가됩니다 -->
                </div>
            </div>
        `;
    }
    
    addStepToLiveDashboard(step, stepIndex, status = 'processing') {
        const liveSteps = this.processDetails.querySelector('#liveSteps');
        const stepId = `live-step-${stepIndex}`;
        
        // 이미 존재하는 단계인지 확인
        let stepElement = document.getElementById(stepId);
        
        if (!stepElement) {
            // 새로운 단계 요소 생성
            stepElement = document.createElement('div');
            stepElement.id = stepId;
            stepElement.className = 'live-step';
            liveSteps.appendChild(stepElement);
        }
        
        const currentTime = new Date().toLocaleTimeString('ko-KR');
        const stepResult = this.getStepResult(step, stepIndex);
        
        if (status === 'processing') {
            stepElement.innerHTML = `
                <div class="step-header processing">
                    <div class="step-number processing">${stepIndex + 1}</div>
                    <div class="step-info">
                        <div class="step-name">${step.title}</div>
                        <div class="step-status">
                            <div class="thinking-animation">
                                <span></span><span></span><span></span>
                            </div>
                            <span class="status-text">작업 중...</span>
                        </div>
                    </div>
                </div>
                <div class="step-description">${step.description}</div>
                <div class="step-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">처리 중...</div>
                </div>
            `;
            
            // 프로그레스 바 애니메이션 시작
            setTimeout(() => {
                const progressFill = stepElement.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = '100%';
                }
            }, 100);
            
        } else if (status === 'completed') {
            stepElement.innerHTML = `
                <div class="step-header completed">
                    <div class="step-number completed">✓</div>
                    <div class="step-info">
                        <div class="step-name">${step.title}</div>
                        <div class="step-time">${currentTime} - 완료</div>
                    </div>
                </div>
                <div class="step-description">${step.description}</div>
                <div class="step-result completed">
                    ${stepResult}
                </div>
            `;
            
            stepElement.classList.add('completed');
        } else if (status === 'failed') {
            stepElement.innerHTML = `
                <div class="step-header failed">
                    <div class="step-number failed">✗</div>
                    <div class="step-info">
                        <div class="step-name">${step.title}</div>
                        <div class="step-time">${currentTime} - 실패</div>
                    </div>
                </div>
                <div class="step-description">${step.description}</div>
                <div class="step-result failed">
                    ❌ 처리 중 오류가 발생했습니다.
                </div>
            `;
            
            stepElement.classList.add('failed');
        }
    }
    
    showCompletedDashboard() {
        const completedTime = new Date().toLocaleTimeString('ko-KR');
        const totalDuration = Math.floor(Math.random() * 15) + 10; // 10-25초 랜덤
        
        this.processDetails.innerHTML = `
            <div class="dashboard-header">
                <h4 class="dashboard-title">🎯 처리 완료 대시보드</h4>
                <div class="completion-badge">성공</div>
            </div>
            
            <div class="dashboard-summary">
                <div class="summary-item">
                    <span class="summary-label">총 처리 시간</span>
                    <span class="summary-value">${totalDuration}초</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">완료 시각</span>
                    <span class="summary-value">${completedTime}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">처리 단계</span>
                    <span class="summary-value">${this.currentSteps.length}단계</span>
                </div>
            </div>
            
            <div class="dashboard-steps">
                <h5 class="steps-title">단계별 상세 작업 내역</h5>
                ${this.currentSteps.map((step, index) => {
                    const stepDuration = Math.floor(Math.random() * 5) + 2; // 2-7초 랜덤
                    const stepTime = new Date(Date.now() - (this.currentSteps.length - index) * stepDuration * 1000).toLocaleTimeString('ko-KR');
                    
                    return `
                        <div class="dashboard-step">
                            <div class="step-header">
                                <div class="step-number">✓</div>
                                <div class="step-info">
                                    <div class="step-name">${step.title}</div>
                                    <div class="step-time">${stepTime} (${stepDuration}초 소요)</div>
                                </div>
                            </div>
                            <div class="step-description">${step.description}</div>
                            <div class="step-result">
                                ${this.getStepResult(step, index)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    getStepResult(step, index) {
        // 단계별로 다른 결과 표시
        const results = [
            "📊 데이터 수집 완료: 1,247개 레코드 처리",
            "🔍 패턴 분석 완료: 3개 주요 패턴 발견",
            "⚙️ AI 모델 실행 완료: 95.3% 신뢰도",
            "✅ 검증 완료: 모든 조건 충족",
            "📝 보고서 생성 완료: 상세 분석 결과 포함"
        ];
        
        return results[index] || "✅ 처리 완료";
    }
    
    // ===============================
    // 에이전트 상태 관리
    // ===============================
    initializeAgentStatus() {
        // 모든 에이전트를 오프라인 상태로 초기화
        Object.keys(this.agentElements).forEach(agentType => {
            this.updateAgentStatus(agentType, 'offline');
        });
    }
    
    updateAgentStatus(agentType, status) {
        const agentElement = this.agentElements[agentType];
        if (!agentElement) return;
        
        const indicator = agentElement.querySelector('.agent-indicator');
        const statusText = agentElement.querySelector('.agent-status-text');
        if (!indicator) return;
        
        // 모든 상태 클래스 제거 (agentElement와 indicator 모두)
        agentElement.classList.remove('offline', 'online', 'communicating', 'error');
        indicator.classList.remove('offline', 'online', 'communicating', 'error');
        
        // 새 상태 적용 (agentElement와 indicator 모두)
        agentElement.classList.add(status);
        indicator.classList.add(status);
        
        // 상태 텍스트 업데이트
        const statusTexts = {
            offline: '오프라인',
            online: '온라인',
            communicating: '통신중',
            error: '오류'
        };
        
        if (statusText) {
            statusText.textContent = statusTexts[status];
        }
        
        // 툴팁 업데이트
        agentElement.title = `${this.getAgentDisplayName(agentType)}: ${statusTexts[status]}`;
        
        // 통신 중일 때 추가 시각적 효과
        if (status === 'communicating') {
            this.addCommunicationEffect(agentElement);
        }
    }
    
    addCommunicationEffect(agentElement) {
        // 이미 효과가 있으면 제거
        const existingEffect = agentElement.querySelector('.comm-effect');
        if (existingEffect) {
            existingEffect.remove();
        }
        
        // 새로운 통신 효과 요소 생성
        const commEffect = document.createElement('div');
        commEffect.className = 'comm-effect';
        commEffect.style.cssText = `
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border: 2px solid #3b82f6;
            border-radius: inherit;
            animation: comm-pulse 1s infinite;
            pointer-events: none;
            z-index: 0;
        `;
        
        agentElement.appendChild(commEffect);
        
        // 3초 후 효과 제거
        setTimeout(() => {
            if (commEffect.parentNode) {
                commEffect.remove();
            }
        }, 3000);
    }
    
    getAgentDisplayName(agentType) {
        const displayNames = {
            prediction: '예측 에이전트',
            monitoring: '모니터링 에이전트',
            control: '제어 에이전트'
        };
        return displayNames[agentType] || agentType;
    }
    
    // 공정 시작 시 에이전트들을 온라인 상태로 변경
    activateAgents() {
        this.updateAgentStatus('prediction', 'online');
        this.updateAgentStatus('monitoring', 'online');
        this.updateAgentStatus('control', 'online');
    }
    
    // 특정 에이전트를 통신 중 상태로 변경
    setAgentCommunicating(agentType) {
        this.updateAgentStatus(agentType, 'communicating');
    }
    
    // 에이전트 오류 상태 표시
    setAgentError(agentType) {
        this.updateAgentStatus(agentType, 'error');
    }
    
    // 공정 완료 시 모든 에이전트를 오프라인으로
    deactivateAgents() {
        Object.keys(this.agentElements).forEach(agentType => {
            this.updateAgentStatus(agentType, 'offline');
        });
    }
    
    // 단계별 에이전트 통신 시뮬레이션
    simulateAgentCommunication(stepIndex) {
        const agents = ['prediction', 'monitoring', 'control'];
        
        // 단계별로 다른 에이전트가 통신
        const agentCycle = stepIndex % agents.length;
        const communicatingAgent = agents[agentCycle];
        
        // 선택된 에이전트를 통신 중으로 설정
        this.setAgentCommunicating(communicatingAgent);
        
        // 1-3초 후 다시 온라인 상태로 복귀
        setTimeout(() => {
            this.updateAgentStatus(communicatingAgent, 'online');
        }, Math.random() * 2000 + 1000);
    }
}

// ===============================
// 사이드바 토글 기능
// ===============================
function initSidebarToggle() {
    const sidebar = document.getElementById('chatSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    let isCollapsed = false;

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        if (isCollapsed) sidebar.classList.add('collapsed');
        else sidebar.classList.remove('collapsed');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
}

// ===============================
// 채팅 기능
// ===============================
function initChatFeatures() {
    // 공정 관리자 초기화
    const processManager = new ProcessManager();
    
    // 재바인딩이 필요하므로 let 사용
    let chatInput = document.getElementById('chatInput');
    let sendButton = document.getElementById('sendButton');

    const bottomChatInput = document.getElementById('bottomChatInput');
    const bottomSendButton = document.getElementById('bottomSendButton');
    const chatMessages = document.getElementById('chatMessages');
    const newChatBtn = document.getElementById('newChatBtn');

    // ---------------------------
    // 메시지 전송
    // ---------------------------
    function sendMessage() {
        // 현재 활성 입력창에서 메시지 가져오기
        let message = '';
        let activeInput = null;

        if (chatInput && !chatMessages.classList.contains('empty')) {
            // 환영 상태가 아니면 하단 입력창 사용
            message = bottomChatInput ? bottomChatInput.value.trim() : '';
            activeInput = bottomChatInput;
        } else if (chatInput) {
            // 환영 상태면 상단 입력창 사용
            message = chatInput.value.trim();
            activeInput = chatInput;
        }

        if (!message) return;

        // 빈 상태 해제 및 환영 메시지 제거
        chatMessages.classList.remove('empty');
        const welcomeMessage = chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) welcomeMessage.remove();

        // 사용자 메시지 출력
        const userMessage = createMessageElement('user', message);
        chatMessages.appendChild(userMessage);

        // 입력창 초기화
        if (activeInput) {
            activeInput.value = '';
            activeInput.style.height = 'auto';
        }

        // 스크롤 하단
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 즉시 "생각하는 중..." 메시지 표시
        const thinkingMessageId = showThinkingMessage();

        // 공정 사이드바 활성화 및 단계 초기화
        if (window.processManager) {
            window.processManager.showSidebar();
            window.processManager.updateStatus('요청 분석 중...', 'processing');
            window.processManager.initializeSteps(message);
        }

        // 사용자 메시지를 기반으로 텍스트 생성 요청
        generateResponse(message, window.processManager, thinkingMessageId);
    }

    // ---------------------------
    // 생각하는 중 메시지 표시
    // ---------------------------
    function showThinkingMessage() {
        // 빈 메시지 요소 생성
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        // 유니크한 ID 생성 (타임스탬프 기반)
        const thinkingId = 'thinking-message-' + Date.now();
        messageDiv.id = thinkingId;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar assistant-avatar';
        avatarDiv.textContent = 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content thinking-message';
        
        // 생각하는 중 애니메이션 표시
        contentDiv.innerHTML = `
            <div class="thinking-content">
                <div class="thinking-animation">
                    <span></span><span></span><span></span>
                </div>
                <span class="thinking-text">생각하는 중...</span>
            </div>
        `;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);

        // 스크롤 하단으로
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 생성된 메시지의 ID 반환
        return thinkingId;
    }

    // ---------------------------
    // AI 응답 생성 요청
    // ---------------------------
    async function generateResponse(userMessage, processManager, thinkingMessageId = null) {
        try {
            // 단계별 진행 시뮬레이션
            const stepInterval = setInterval(() => {
                processManager.nextStep();
            }, 1500); // 1.5초마다 다음 단계로

            const token = getAccessToken();

            // 공통 헤더
            const headers = { 
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // fetch 옵션
            const fetchOpts = {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    prompt: userMessage,
                    max_tokens: 1024,
                    temperature: 0.7,
                    stop: ["string"]
                })
            };
            if (USE_CREDENTIALS) fetchOpts.credentials = 'include';

            // /api/generate로 요청
            const endpoint = '/api/generate';
            const url = `${API_BASE}${endpoint}`;
            
            console.log(`Sending POST request to ${url} with prompt: "${userMessage}"`);
            const response = await fetch(url, fetchOpts);

            // 상태 체크
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const data = await response.json();
            
            // 단계 진행 중지 및 완료 처리
            clearInterval(stepInterval);
            processManager.completeProcess();
            
            // AI 응답을 타이핑 효과로 표시
            const aiResponseText = data.response || data.text || data.content || '응답을 생성했습니다.';
            displayTypingResponse(aiResponseText, processManager, thinkingMessageId);
            
        } catch (error) {
            console.error('AI 응답 생성 실패:', error);
            
            // 단계 진행 중지
            clearInterval(stepInterval);
            
            // 현재 진행 중인 단계 인덱스 계산
            const currentFailedStep = Math.min(processManager.currentStepIndex, processManager.currentSteps.length - 1);
            
            // 에러 메시지 생성
            let errorMessage = 'AI 서버와의 연결에 실패했습니다.';
            if (error.message.includes('HTTP 500')) {
                errorMessage = '서버 내부 오류가 발생했습니다.';
            } else if (error.message.includes('HTTP 404')) {
                errorMessage = '요청한 서비스를 찾을 수 없습니다.';
            } else if (error.message.includes('HTTP 429')) {
                errorMessage = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
            } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
                errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
            }
            
            // ProcessManager를 통한 에러 처리
            if (processManager) {
                processManager.handleProcessError(errorMessage, currentFailedStep);
            }
            
            // 에러 메시지 표시
            displayTypingResponse(`❌ ${errorMessage}`, processManager, thinkingMessageId);
        }
    }

    // ---------------------------
    // 타이핑 효과로 응답 표시
    // ---------------------------
    function displayTypingResponse(text, processManager = null, thinkingMessageId = null) {
        let thinkingMessage = null;
        
        if (thinkingMessageId) {
            // 특정 ID의 메시지를 찾음
            thinkingMessage = document.getElementById(thinkingMessageId);
        } else {
            // 가장 최근의 "생각하는 중..." 메시지를 찾아서 업데이트
            const thinkingMessages = document.querySelectorAll('[id^="thinking-message-"]');
            thinkingMessage = thinkingMessages.length > 0 ? thinkingMessages[thinkingMessages.length - 1] : null;
        }
        
        if (thinkingMessage) {
            // 기존 메시지의 콘텐츠 부분을 찾아서 교체
            const contentDiv = thinkingMessage.querySelector('.message-content');
            contentDiv.className = 'message-content typing';
            contentDiv.textContent = '';
            
            // ID 제거하여 다음 메시지에서 재사용되지 않도록 함
            thinkingMessage.removeAttribute('id');
            
            // 타이핑 효과 시작
            typeText(contentDiv, text, 0, processManager);
        } else {
            // 기존 메시지가 없으면 새로 생성 (폴백)
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message assistant';

            const avatarDiv = document.createElement('div');
            avatarDiv.className = 'message-avatar assistant-avatar';
            avatarDiv.textContent = 'AI';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content typing';
            contentDiv.textContent = '';

            messageDiv.appendChild(avatarDiv);
            messageDiv.appendChild(contentDiv);
            chatMessages.appendChild(messageDiv);

            // 타이핑 효과 시작
            typeText(contentDiv, text, 0, processManager);
        }
    }

    // ---------------------------
    // 텍스트 타이핑 효과
    // ---------------------------
    function typeText(element, text, index, processManager = null) {
        if (index < text.length) {
            const char = text.charAt(index);
            element.textContent += char;
            
            // 스크롤을 하단으로 유지
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // 문자 타입에 따라 다른 딜레이 적용
            let delay;
            if (char === ' ' || char === '\n') {
                // 공백이나 줄바꿈은 빠르게
                delay = 10;
            } else if (char === '.' || char === ',' || char === '!' || char === '?') {
                // 구두점은 약간 긴 딜레이
                delay = Math.random() * 15 + 25;
            } else {
                // 일반 문자는 빠른 타이핑 (10-25ms)
                delay = Math.random() * 15 + 10;
            }
            
            setTimeout(() => typeText(element, text, index + 1, processManager), delay);
        } else {
            // 타이핑 완료 후 커서 제거
            element.classList.remove('typing');
            
            // 공정 진행 상태 아티팩트 추가
            if (processManager && processManager.currentSteps.length > 0) {
                addProcessArtifact(element, processManager);
            }
            
            // 마지막 스크롤
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    // ---------------------------
    // 메시지 요소 생성
    // ---------------------------
    function createMessageElement(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = `message-avatar ${type}-avatar`;
        avatarDiv.textContent = type === 'user' ? 'U' : 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (typeof content === 'string' && content.includes('현재 사용 가능한 AI 에이전트 목록입니다:')) {
            contentDiv.innerHTML = formatAgentList(content);
        } else if (typeof content === 'string') {
            contentDiv.textContent = content;
        } else {
            contentDiv.textContent = JSON.stringify(content, null, 2);
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        return messageDiv;
    }

    // ---------------------------
    // 에이전트 목록 포맷팅
    // ---------------------------
    function formatAgentList(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>')
            .replace(/(\d+\.) /g, '<br><strong>$1</strong> ');
    }

    // ---------------------------
    // 새 채팅 시작
    // ---------------------------
    function startNewChat() {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <h2 class="welcome-title">무엇을 도와드릴까요?</h2>
                <p class="welcome-subtitle">PRISM-AGI Assistant에게 무엇이든 물어보세요.</p>

                <div class="welcome-input-area">
                    <div class="chat-input-container">
                        <textarea
                            class="chat-input"
                            id="chatInput"
                            placeholder="메시지를 보내주세요..."
                            rows="1"
                        ></textarea>
                        <button class="send-button" id="sendButton">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        chatMessages.classList.add('empty');

        // 새로 생긴 입력 요소들에 이벤트 재연결
        reinitializeInputEvents();
    }

    // ---------------------------
    // 이벤트 리스너 재연결
    // ---------------------------
    function reinitializeInputEvents() {
        const newChatInput = document.getElementById('chatInput');
        const newSendButton = document.getElementById('sendButton');

        if (newSendButton) {
            newSendButton.addEventListener('click', sendMessage);
        }

        if (newChatInput) {
            newChatInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
            newChatInput.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }

        // 재바인딩
        chatInput = newChatInput;
        sendButton = newSendButton;
    }

    // ---------------------------
    // 이벤트 리스너 등록
    // ---------------------------
    if (sendButton) sendButton.addEventListener('click', sendMessage);
    if (bottomSendButton) bottomSendButton.addEventListener('click', sendMessage);

    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    if (bottomChatInput) {
        bottomChatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        bottomChatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });
    }

    if (newChatBtn) newChatBtn.addEventListener('click', startNewChat);
}

// ---------------------------
// 공정 진행 상태 아티팩트 추가
// ---------------------------
function addProcessArtifact(messageElement, processManager) {
    // processManager나 currentSteps가 없으면 아티팩트를 추가하지 않음
    if (!processManager || !processManager.currentSteps || processManager.currentSteps.length === 0) {
        console.log('ProcessManager or steps not available, skipping artifact');
        return;
    }
    
    const artifactDiv = document.createElement('div');
    artifactDiv.className = 'process-artifact';
    
    // 완료된 단계 수 계산
    const completedCount = processManager.currentSteps.filter((_, index) => index <= processManager.currentStepIndex).length;
    
    artifactDiv.innerHTML = `
        <div class="artifact-header">
            <span class="artifact-title">공정 진행 상태</span>
            <span class="artifact-subtitle">${completedCount}/${processManager.currentSteps.length}단계 완료</span>
        </div>
        <div class="artifact-preview">
            ${processManager.currentSteps.slice(0, 3).map((step, index) => {
                let status = 'pending';
                if (index <= processManager.currentStepIndex) {
                    status = 'completed';
                } else if (index === processManager.currentStepIndex + 1) {
                    status = 'active';
                }
                return `<div class="preview-step ${status}">${step.title || '단계'}</div>`;
            }).join('')}
            ${processManager.currentSteps.length > 3 ? '<div class="preview-more">...</div>' : ''}
        </div>
        <button class="artifact-button">진행 상태 확인</button>
    `;

    // 클릭 이벤트 추가
    const button = artifactDiv.querySelector('.artifact-button');
    button.addEventListener('click', () => {
        // 저장된 단계 정보로 사이드바 다시 표시
        processManager.showSidebar();
        processManager.renderSteps();
    });

    messageElement.appendChild(artifactDiv);
}

// ===============================
// 초기화
// ===============================
document.addEventListener('DOMContentLoaded', function () {
    initSidebarToggle();
    initChatFeatures();
    
    // ProcessManager 초기화
    window.processManager = new ProcessManager();
    console.log('ProcessManager initialized:', window.processManager);
    
    // 사이드바 메뉴 이벤트 리스너 추가
    initSidebarMenuEvents();
});

// ===============================
// 사이드바 메뉴 이벤트 처리
// ===============================
function initSidebarMenuEvents() {
    const createAgentMenu = document.getElementById('createAgentMenu');
    const manageAgentsMenu = document.getElementById('manageAgentsMenu');
    
    if (createAgentMenu) {
        createAgentMenu.addEventListener('click', () => {
            window.location.href = '/create-agent/';
        });
    }
    
    if (manageAgentsMenu) {
        manageAgentsMenu.addEventListener('click', () => {
            window.location.href = '/manage-agents/';
        });
    }
}
