// 에이전트 설정 관리 기능
class AgentTemplateManager {
    constructor() {
        this.templates = JSON.parse(localStorage.getItem('agentTemplates') || '[]');
        this.initializeEvents();
        this.loadSavedTemplates();
    }

    initializeEvents() {
        // 템플릿 폼 제출 이벤트
        const form = document.getElementById('agent-template-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTemplate();
            });
        }
    }

    saveTemplate() {
        const formData = {
            id: Date.now().toString(),
            type: document.getElementById('agent-type').value,
            name: document.getElementById('template-name').value,
            description: document.getElementById('template-description').value,
            sensorConfig: document.getElementById('sensor-config').value,
            actionConfig: document.getElementById('action-config').value,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // 유효성 검사
        if (!formData.type || !formData.name) {
            showToast('에이전트 유형과 템플릿 이름은 필수입니다.', 'error');
            return;
        }

        // JSON 유효성 검사
        try {
            if (formData.sensorConfig) JSON.parse(formData.sensorConfig);
            if (formData.actionConfig) JSON.parse(formData.actionConfig);
        } catch (e) {
            showToast('JSON 형식이 올바르지 않습니다.', 'error');
            return;
        }

        this.templates.push(formData);
        localStorage.setItem('agentTemplates', JSON.stringify(this.templates));
        
        showToast('템플릿이 성공적으로 저장되었습니다.', 'success');
        this.clearForm();
        this.loadSavedTemplates();
        
        // 로그에 기록
        logManager.addLog('template', `새 템플릿 생성: ${formData.name}`, formData);
    }

    loadSavedTemplates() {
        const container = document.getElementById('saved-templates');
        if (!container) return;

        if (this.templates.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-4">
                    <i class="fas fa-folder-open fa-3x mb-3"></i>
                    <p>저장된 템플릿이 없습니다</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.templates.map(template => `
            <div class="col-lg-4 col-md-6 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge bg-${this.getTypeColor(template.type)}">${this.getTypeLabel(template.type)}</span>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="templateManager.useTemplate('${template.id}')">
                                        <i class="fas fa-play me-2"></i>사용하기
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="templateManager.editTemplate('${template.id}')">
                                        <i class="fas fa-edit me-2"></i>편집
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="templateManager.duplicateTemplate('${template.id}')">
                                        <i class="fas fa-copy me-2"></i>복제
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="templateManager.deleteTemplate('${template.id}')">
                                        <i class="fas fa-trash me-2"></i>삭제
                                    </a></li>
                                </ul>
                            </div>
                        </div>
                        <h6 class="card-title">${template.name}</h6>
                        <p class="card-text text-muted small">${template.description || '설명 없음'}</p>
                        <small class="text-muted">
                            생성일: ${new Date(template.createdAt).toLocaleDateString()}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getTypeColor(type) {
        const colors = {
            'monitoring': 'primary',
            'prediction': 'success',
            'control': 'warning',
            'orchestration': 'danger'
        };
        return colors[type] || 'secondary';
    }

    getTypeLabel(type) {
        const labels = {
            'monitoring': '모니터링',
            'prediction': '예측',
            'control': '자율제어',
            'orchestration': '오케스트레이션'
        };
        return labels[type] || type;
    }

    useTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        // 템플릿을 사용하여 새로운 워크플로우 시작
        showToast(`템플릿 "${template.name}"을 사용하여 에이전트를 실행합니다.`, 'info');
        
        // 질문 섹션으로 이동하고 템플릿 정보 설정
        document.getElementById('nlp-query').value = `${template.name} 템플릿을 사용하여 ${this.getTypeLabel(template.type)} 작업을 수행해줘`;
        showSection('main-question');
        
        logManager.addLog('template', `템플릿 사용: ${template.name}`, template);
    }

    editTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        // 폼에 기존 데이터 채우기
        document.getElementById('agent-type').value = template.type;
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-description').value = template.description || '';
        document.getElementById('sensor-config').value = template.sensorConfig || '';
        document.getElementById('action-config').value = template.actionConfig || '';

        // 편집 모드로 설정
        document.getElementById('agent-template-form').setAttribute('data-edit-id', templateId);
        
        showToast('템플릿을 편집 모드로 불러왔습니다.', 'info');
    }

    duplicateTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        const newTemplate = {
            ...template,
            id: Date.now().toString(),
            name: template.name + ' (복사본)',
            createdAt: new Date().toISOString()
        };

        this.templates.push(newTemplate);
        localStorage.setItem('agentTemplates', JSON.stringify(this.templates));
        this.loadSavedTemplates();
        
        showToast('템플릿이 복제되었습니다.', 'success');
        logManager.addLog('template', `템플릿 복제: ${newTemplate.name}`, newTemplate);
    }

    deleteTemplate(templateId) {
        if (!confirm('정말로 이 템플릿을 삭제하시겠습니까?')) return;

        const templateIndex = this.templates.findIndex(t => t.id === templateId);
        if (templateIndex === -1) return;

        const deletedTemplate = this.templates[templateIndex];
        this.templates.splice(templateIndex, 1);
        localStorage.setItem('agentTemplates', JSON.stringify(this.templates));
        this.loadSavedTemplates();
        
        showToast('템플릿이 삭제되었습니다.', 'success');
        logManager.addLog('template', `템플릿 삭제: ${deletedTemplate.name}`, deletedTemplate);
    }

    clearForm() {
        const form = document.getElementById('agent-template-form');
        if (form) {
            form.reset();
            form.removeAttribute('data-edit-id');
        }
    }
}

// 전역 함수들
function clearTemplateForm() {
    if (window.templateManager) {
        window.templateManager.clearForm();
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    window.templateManager = new AgentTemplateManager();
});
