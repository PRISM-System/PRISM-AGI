/**
 * 고급 분석 기능
 */

class AdvancedAnalyticsManager {
    constructor() {
        this.analysisResults = JSON.parse(localStorage.getItem('analysisResults') || '[]');
        this.analysisModules = this.initializeAnalysisModules();
        this.currentAnalysis = null;
    }

    // 분석 모듈 초기화
    initializeAnalysisModules() {
        return {
            trend: {
                id: 'trend',
                name: '트렌드 분석',
                description: '시계열 데이터의 추세와 패턴 분석',
                icon: 'fas fa-chart-line',
                color: 'primary',
                features: ['선형/비선형 추세 분석', '계절성 패턴 탐지', '이동평균 계산', '변화점 탐지'],
                parameters: [
                    { name: 'period', label: '분석 기간', type: 'select', options: ['1시간', '1일', '1주', '1달'], default: '1일' },
                    { name: 'smoothing', label: '스무딩 정도', type: 'range', min: 1, max: 10, default: 5 },
                    { name: 'confidence', label: '신뢰도 수준', type: 'range', min: 90, max: 99, default: 95 }
                ]
            },
            anomaly: {
                id: 'anomaly',
                name: '이상 패턴 탐지',
                description: '머신러닝 기반 이상 패턴 자동 탐지',
                icon: 'fas fa-search-plus',
                color: 'success',
                features: ['통계적 이상 탐지', 'ML 기반 이상 탐지', '임계값 기반 탐지', '패턴 학습'],
                parameters: [
                    { name: 'algorithm', label: '탐지 알고리즘', type: 'select', options: ['Isolation Forest', 'One-Class SVM', 'Local Outlier Factor'], default: 'Isolation Forest' },
                    { name: 'sensitivity', label: '민감도', type: 'range', min: 1, max: 10, default: 5 },
                    { name: 'threshold', label: '임계값', type: 'number', min: 0.01, max: 0.1, step: 0.01, default: 0.05 }
                ]
            },
            prediction: {
                id: 'prediction',
                name: '예측 모델링',
                description: 'AI 기반 미래 값 예측 및 시나리오 분석',
                icon: 'fas fa-brain',
                color: 'info',
                features: ['시계열 예측', '회귀 분석', '시나리오 모델링', '불확실성 분석'],
                parameters: [
                    { name: 'horizon', label: '예측 기간', type: 'select', options: ['1시간', '6시간', '1일', '1주'], default: '1일' },
                    { name: 'model', label: '예측 모델', type: 'select', options: ['ARIMA', 'Prophet', 'LSTM'], default: 'Prophet' },
                    { name: 'interval', label: '예측 간격', type: 'select', options: ['1분', '5분', '15분', '1시간'], default: '15분' }
                ]
            },
            correlation: {
                id: 'correlation',
                name: '상관관계 분석',
                description: '변수 간 상관관계 및 인과관계 분석',
                icon: 'fas fa-project-diagram',
                color: 'warning',
                features: ['피어슨 상관계수', '스피어만 상관계수', '편상관 분석', '인과관계 테스트'],
                parameters: [
                    { name: 'method', label: '분석 방법', type: 'select', options: ['Pearson', 'Spearman', 'Kendall'], default: 'Pearson' },
                    { name: 'significance', label: '유의수준', type: 'select', options: ['0.01', '0.05', '0.1'], default: '0.05' },
                    { name: 'lag', label: '시차 고려', type: 'range', min: 0, max: 24, default: 0 }
                ]
            }
        };
    }

    // 분석 모듈 로드
    loadAnalyticsModules() {
        this.renderAnalyticsCards();
    }

    // 분석 카드 렌더링
    renderAnalyticsCards() {
        // 카드들이 이미 HTML에 정의되어 있으므로 클릭 이벤트만 바인딩
        Object.values(this.analysisModules).forEach(module => {
            const button = document.querySelector(`button[onclick="openAnalysis('${module.id}')"]`);
            if (button) {
                button.onclick = () => this.openAnalysis(module.id);
            }
        });
    }

    // 분석 시작
    openAnalysis(analysisType) {
        const module = this.analysisModules[analysisType];
        if (!module) return;

        this.currentAnalysis = { type: analysisType, module: module };
        this.showAnalysisConfiguration(module);
    }

    // 분석 설정 표시
    showAnalysisConfiguration(module) {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h6><i class="${module.icon} text-${module.color} me-2"></i>${module.name} 설정</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>분석 매개변수</h6>
                            <form id="analysis-config-form">
                                ${this.generateParameterFields(module.parameters)}
                                <div class="mt-3">
                                    <button type="submit" class="btn btn-${module.color}">
                                        <i class="fas fa-play me-1"></i>분석 시작
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary ms-2" onclick="resetAnalysisResults()">
                                        <i class="fas fa-times me-1"></i>취소
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div class="col-md-6">
                            <h6>기능 설명</h6>
                            <p class="text-muted">${module.description}</p>
                            <ul class="list-unstyled">
                                ${module.features.map(feature => `
                                    <li><i class="fas fa-check text-${module.color} me-2"></i>${feature}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 폼 제출 이벤트
        document.getElementById('analysis-config-form').onsubmit = (e) => {
            e.preventDefault();
            this.startAnalysis();
        };
    }

    // 매개변수 필드 생성
    generateParameterFields(parameters) {
        return parameters.map(param => {
            switch (param.type) {
                case 'select':
                    return `
                        <div class="mb-3">
                            <label for="${param.name}" class="form-label">${param.label}</label>
                            <select class="form-select" id="${param.name}" name="${param.name}">
                                ${param.options.map(option => `
                                    <option value="${option}" ${option === param.default ? 'selected' : ''}>${option}</option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                case 'range':
                    return `
                        <div class="mb-3">
                            <label for="${param.name}" class="form-label">${param.label}: <span id="${param.name}-value">${param.default}</span></label>
                            <input type="range" class="form-range" id="${param.name}" name="${param.name}" 
                                min="${param.min}" max="${param.max}" value="${param.default}"
                                oninput="document.getElementById('${param.name}-value').textContent = this.value">
                        </div>
                    `;
                case 'number':
                    return `
                        <div class="mb-3">
                            <label for="${param.name}" class="form-label">${param.label}</label>
                            <input type="number" class="form-control" id="${param.name}" name="${param.name}" 
                                min="${param.min}" max="${param.max}" step="${param.step}" value="${param.default}">
                        </div>
                    `;
                default:
                    return `
                        <div class="mb-3">
                            <label for="${param.name}" class="form-label">${param.label}</label>
                            <input type="text" class="form-control" id="${param.name}" name="${param.name}" value="${param.default}">
                        </div>
                    `;
            }
        }).join('');
    }

    // 분석 시작
    startAnalysis() {
        if (!this.currentAnalysis) return;

        const form = document.getElementById('analysis-config-form');
        const formData = new FormData(form);
        const parameters = {};

        for (const [key, value] of formData.entries()) {
            parameters[key] = value;
        }

        this.showAnalysisProgress();
        
        // 시뮬레이션된 분석 실행
        setTimeout(() => {
            this.generateMockResults(this.currentAnalysis.type, parameters);
        }, 3000);
    }

    // 분석 진행상황 표시
    showAnalysisProgress() {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-body text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">분석 중...</span>
                    </div>
                    <h5>분석 진행 중</h5>
                    <p class="text-muted">데이터를 분석하고 있습니다. 잠시만 기다려주세요.</p>
                    <div class="progress mt-3" style="height: 10px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" style="width: 0%" id="analysis-progress"></div>
                    </div>
                </div>
            </div>
        `;

        // 진행률 애니메이션
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            document.getElementById('analysis-progress').style.width = progress + '%';
        }, 200);
    }

    // Mock 결과 생성
    generateMockResults(analysisType, parameters) {
        const module = this.analysisModules[analysisType];
        let results;

        switch (analysisType) {
            case 'trend':
                results = this.generateTrendResults(parameters);
                break;
            case 'anomaly':
                results = this.generateAnomalyResults(parameters);
                break;
            case 'prediction':
                results = this.generatePredictionResults(parameters);
                break;
            case 'correlation':
                results = this.generateCorrelationResults(parameters);
                break;
            default:
                results = this.generateGenericResults(parameters);
        }

        const analysisResult = {
            id: Date.now(),
            type: analysisType,
            module: module.name,
            parameters,
            results,
            timestamp: new Date().toISOString(),
            status: 'completed'
        };

        this.analysisResults.unshift(analysisResult);
        localStorage.setItem('analysisResults', JSON.stringify(this.analysisResults));
        
        this.showAnalysisResults(analysisResult);

        // 로그 추가
        if (window.logsManager) {
            window.logsManager.addSystemLog('INFO', 'AdvancedAnalytics', `${module.name} 분석 완료`);
            window.logsManager.addActivityHistory('admin', 'ANALYSIS_EXECUTED', module.name);
        }
    }

    // 트렌드 분석 결과
    generateTrendResults(parameters) {
        return {
            summary: {
                trend: '상승',
                strength: 0.76,
                seasonality: true,
                changePoints: 3
            },
            statistics: {
                mean: 25.4,
                std: 2.1,
                min: 19.8,
                max: 31.2,
                slope: 0.023
            },
            recommendations: [
                '온도가 꾸준히 상승하는 추세를 보입니다.',
                '주간 단위의 계절성 패턴이 감지되었습니다.',
                '3개의 유의미한 변화점이 발견되었습니다.',
                '예방적 냉각 시스템 점검을 권장합니다.'
            ],
            chartData: this.generateTimeSeriesData(100)
        };
    }

    // 이상 탐지 결과
    generateAnomalyResults(parameters) {
        const anomalies = [
            { timestamp: '2024-01-15 14:23:00', value: 45.2, score: 0.92, severity: 'high' },
            { timestamp: '2024-01-15 16:15:00', value: 12.1, score: 0.85, severity: 'medium' },
            { timestamp: '2024-01-15 19:47:00', value: 38.9, score: 0.78, severity: 'medium' }
        ];

        return {
            summary: {
                totalAnomalies: anomalies.length,
                highSeverity: anomalies.filter(a => a.severity === 'high').length,
                mediumSeverity: anomalies.filter(a => a.severity === 'medium').length,
                averageScore: 0.85
            },
            anomalies,
            recommendations: [
                '3건의 이상 패턴이 감지되었습니다.',
                '높은 심각도 이상이 1건 발견되었습니다.',
                '오후 시간대에 이상이 집중되어 있습니다.',
                '임계값 조정 또는 추가 센서 설치를 고려해보세요.'
            ],
            chartData: this.generateAnomalyChartData()
        };
    }

    // 예측 분석 결과
    generatePredictionResults(parameters) {
        return {
            summary: {
                accuracy: 0.89,
                rmse: 1.23,
                mae: 0.87,
                forecastPeriod: parameters.horizon
            },
            predictions: this.generatePredictionData(24),
            confidence: {
                lower: this.generatePredictionData(24, -2),
                upper: this.generatePredictionData(24, 2)
            },
            recommendations: [
                '예측 정확도가 89%로 신뢰할 만합니다.',
                '향후 24시간 동안 온도 상승이 예상됩니다.',
                '오후 2-4시경 최고치에 도달할 것으로 예측됩니다.',
                '냉각 시스템 가동 시점을 조정하는 것을 권장합니다.'
            ],
            chartData: this.generatePredictionChartData()
        };
    }

    // 상관관계 분석 결과
    generateCorrelationResults(parameters) {
        const correlations = [
            { var1: '온도', var2: '압력', coefficient: 0.84, pValue: 0.001, significance: 'high' },
            { var1: '온도', var2: '진동', coefficient: 0.67, pValue: 0.023, significance: 'medium' },
            { var1: '압력', var2: '진동', coefficient: 0.45, pValue: 0.156, significance: 'low' }
        ];

        return {
            summary: {
                totalPairs: correlations.length,
                significantPairs: correlations.filter(c => c.significance === 'high').length,
                strongestCorrelation: 0.84
            },
            correlations,
            recommendations: [
                '온도와 압력 간에 강한 양의 상관관계가 있습니다.',
                '온도와 진동 간에 중간 정도의 상관관계가 관찰됩니다.',
                '압력과 진동 간의 상관관계는 통계적으로 유의하지 않습니다.',
                '온도 변화를 통해 압력을 예측할 수 있을 것으로 보입니다.'
            ],
            chartData: this.generateCorrelationMatrix()
        };
    }

    // 분석 결과 표시
    showAnalysisResults(analysisResult) {
        const resultsContainer = document.getElementById('analysis-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h6><i class="${this.analysisModules[analysisResult.type].icon} me-2"></i>${analysisResult.module} 결과</h6>
                    <div>
                        <button class="btn btn-sm btn-outline-primary" onclick="saveAnalysisReport()">
                            <i class="fas fa-save me-1"></i>보고서 저장
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="exportAnalysisData()">
                            <i class="fas fa-download me-1"></i>데이터 내보내기
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    ${this.renderResultsContent(analysisResult)}
                </div>
            </div>
        `;
    }

    // 결과 콘텐츠 렌더링
    renderResultsContent(analysisResult) {
        const { results } = analysisResult;
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <h6>분석 요약</h6>
                    ${this.renderSummary(results.summary)}
                </div>
                <div class="col-md-6">
                    <h6>권장사항</h6>
                    <div class="alert alert-info">
                        <ul class="mb-0">
                            ${results.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
            <div class="row mt-4">
                <div class="col-12">
                    <h6>세부 결과</h6>
                    ${this.renderDetailedResults(analysisResult.type, results)}
                </div>
            </div>
        `;
    }

    // 요약 렌더링
    renderSummary(summary) {
        return `
            <div class="list-group list-group-flush">
                ${Object.entries(summary).map(([key, value]) => `
                    <div class="list-group-item d-flex justify-content-between">
                        <span>${this.formatKey(key)}</span>
                        <strong>${this.formatValue(value)}</strong>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 세부 결과 렌더링
    renderDetailedResults(type, results) {
        switch (type) {
            case 'anomaly':
                return this.renderAnomalyTable(results.anomalies);
            case 'correlation':
                return this.renderCorrelationTable(results.correlations);
            default:
                return '<p class="text-muted">차트 및 세부 데이터가 여기에 표시됩니다.</p>';
        }
    }

    // 이상 탐지 테이블
    renderAnomalyTable(anomalies) {
        return `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>시간</th>
                            <th>값</th>
                            <th>이상 점수</th>
                            <th>심각도</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${anomalies.map(anomaly => `
                            <tr>
                                <td>${anomaly.timestamp}</td>
                                <td>${anomaly.value}</td>
                                <td>${anomaly.score.toFixed(2)}</td>
                                <td>
                                    <span class="badge bg-${anomaly.severity === 'high' ? 'danger' : 'warning'}">
                                        ${anomaly.severity === 'high' ? '높음' : '보통'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 상관관계 테이블
    renderCorrelationTable(correlations) {
        return `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>변수 1</th>
                            <th>변수 2</th>
                            <th>상관계수</th>
                            <th>p-값</th>
                            <th>유의성</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${correlations.map(corr => `
                            <tr>
                                <td>${corr.var1}</td>
                                <td>${corr.var2}</td>
                                <td>${corr.coefficient.toFixed(3)}</td>
                                <td>${corr.pValue.toFixed(3)}</td>
                                <td>
                                    <span class="badge bg-${corr.significance === 'high' ? 'success' : corr.significance === 'medium' ? 'warning' : 'secondary'}">
                                        ${corr.significance === 'high' ? '높음' : corr.significance === 'medium' ? '보통' : '낮음'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 유틸리티 함수들
    formatKey(key) {
        const keyMap = {
            trend: '추세',
            strength: '강도',
            seasonality: '계절성',
            changePoints: '변화점',
            mean: '평균',
            std: '표준편차',
            min: '최소값',
            max: '최대값',
            slope: '기울기',
            totalAnomalies: '총 이상 수',
            highSeverity: '높은 심각도',
            mediumSeverity: '보통 심각도',
            averageScore: '평균 점수',
            accuracy: '정확도',
            rmse: 'RMSE',
            mae: 'MAE',
            forecastPeriod: '예측 기간',
            totalPairs: '총 변수 쌍',
            significantPairs: '유의한 쌍',
            strongestCorrelation: '최강 상관관계'
        };
        return keyMap[key] || key;
    }

    formatValue(value) {
        if (typeof value === 'boolean') {
            return value ? '있음' : '없음';
        }
        if (typeof value === 'number') {
            return value % 1 === 0 ? value.toString() : value.toFixed(3);
        }
        return value;
    }

    // Mock 데이터 생성 함수들
    generateTimeSeriesData(count) {
        const data = [];
        const now = new Date();
        for (let i = 0; i < count; i++) {
            data.push({
                timestamp: new Date(now.getTime() - (count - i) * 3600000).toISOString(),
                value: 25 + Math.sin(i * 0.1) * 5 + Math.random() * 2
            });
        }
        return data;
    }

    generateAnomalyChartData() {
        return this.generateTimeSeriesData(100).map((point, index) => ({
            ...point,
            isAnomaly: [23, 45, 78].includes(index)
        }));
    }

    generatePredictionData(count, offset = 0) {
        const data = [];
        const now = new Date();
        for (let i = 0; i < count; i++) {
            data.push({
                timestamp: new Date(now.getTime() + i * 3600000).toISOString(),
                value: 25 + Math.sin(i * 0.1) * 5 + offset + Math.random()
            });
        }
        return data;
    }

    generatePredictionChartData() {
        return {
            historical: this.generateTimeSeriesData(24),
            predicted: this.generatePredictionData(24)
        };
    }

    generateCorrelationMatrix() {
        return [
            ['온도', '압력', '진동'],
            [1.00, 0.84, 0.67],
            [0.84, 1.00, 0.45],
            [0.67, 0.45, 1.00]
        ];
    }
}

// 전역 함수들
function loadAnalyticsModules() {
    if (typeof window.analyticsManager === 'undefined') {
        window.analyticsManager = new AdvancedAnalyticsManager();
    }
    window.analyticsManager.loadAnalyticsModules();
}

function openAnalysis(analysisType) {
    if (window.analyticsManager) {
        window.analyticsManager.openAnalysis(analysisType);
    }
}

function resetAnalysisResults() {
    const resultsContainer = document.getElementById('analysis-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="fas fa-chart-bar fa-3x mb-3"></i>
                <p>분석을 시작하면 결과가 여기에 표시됩니다</p>
            </div>
        `;
    }
}

function saveAnalysisReport() {
    if (window.analyticsManager && window.analyticsManager.analysisResults.length > 0) {
        const latestResult = window.analyticsManager.analysisResults[0];
        const content = JSON.stringify(latestResult, null, 2);
        const filename = `analysis_report_${latestResult.type}_${new Date().toISOString().split('T')[0]}.json`;
        
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('분석 보고서가 저장되었습니다.', 'success');
    } else {
        showToast('저장할 분석 결과가 없습니다.', 'warning');
    }
}

function exportAnalysisData() {
    if (window.analyticsManager && window.analyticsManager.analysisResults.length > 0) {
        const allResults = window.analyticsManager.analysisResults;
        const content = JSON.stringify(allResults, null, 2);
        const filename = `all_analysis_data_${new Date().toISOString().split('T')[0]}.json`;
        
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('분석 데이터가 내보내졌습니다.', 'success');
    } else {
        showToast('내보낼 분석 데이터가 없습니다.', 'warning');
    }
}

// 전역 스코프에 함수들 할당
window.loadAnalyticsModules = loadAnalyticsModules;
window.openAnalysis = openAnalysis;
window.resetAnalysisResults = resetAnalysisResults;
window.saveAnalysisReport = saveAnalysisReport;
window.exportAnalysisData = exportAnalysisData;
