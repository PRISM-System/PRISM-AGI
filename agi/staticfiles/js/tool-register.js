// 도구 등록 페이지 JavaScript

class ToolRegister {
    constructor() {
        this.form = document.getElementById('toolRegisterForm');
        this.submitButton = document.getElementById('submitButton');
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSchemaTemplates();
    }

    bindEvents() {
        // 폼 제출
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // 뒤로가기 버튼
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = '/';
            });
        }

        // 도구 관리 버튼
        const manageToolsButton = document.getElementById('manageToolsButton');
        if (manageToolsButton) {
            manageToolsButton.addEventListener('click', () => {
                // 추후 도구 관리 페이지 구현 시 경로 변경
                alert('도구 관리 페이지는 추후 구현 예정입니다.');
            });
        }

        // 취소 버튼
        const cancelButton = document.getElementById('cancelButton');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                if (confirm('작성 중인 내용이 모두 사라집니다. 정말 취소하시겠습니까?')) {
                    window.location.href = '/';
                }
            });
        }

        // JSON 형식 검증
        const inputSchemaTextarea = document.getElementById('inputSchema');
        const endpointHeadersTextarea = document.getElementById('endpointHeaders');
        
        if (inputSchemaTextarea) {
            inputSchemaTextarea.addEventListener('blur', () => {
                this.validateJSON(inputSchemaTextarea, 'JSON 스키마');
            });
        }

        if (endpointHeadersTextarea) {
            endpointHeadersTextarea.addEventListener('blur', () => {
                this.validateJSON(endpointHeadersTextarea, 'HTTP 헤더', true);
            });
        }

        // 스키마 템플릿 클릭
        const schemaTemplates = document.querySelectorAll('.schema-template');
        schemaTemplates.forEach(template => {
            template.addEventListener('click', () => {
                const templateType = template.dataset.template;
                this.applySchemaTemplate(templateType);
            });
        });
    }

    validateJSON(textarea, fieldName, allowEmpty = false) {
        const value = textarea.value.trim();
        
        if (!value && allowEmpty) {
            this.clearFieldError(textarea);
            return true;
        }

        if (!value) {
            this.showFieldError(textarea, `${fieldName}를 입력해주세요.`);
            return false;
        }

        try {
            JSON.parse(value);
            this.clearFieldError(textarea);
            return true;
        } catch (error) {
            this.showFieldError(textarea, `올바르지 않은 JSON 형식입니다: ${error.message}`);
            return false;
        }
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #dc2626;
            font-size: 0.8rem;
            margin-top: 0.25rem;
        `;
        errorDiv.textContent = message;
        
        field.style.borderColor = '#dc2626';
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '#e5e7eb';
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async handleSubmit() {
        try {
            // 로딩 상태 시작
            this.setLoadingState(true);

            // 폼 데이터 수집 및 검증
            const formData = this.collectFormData();
            if (!this.validateFormData(formData)) {
                this.setLoadingState(false);
                return;
            }

            // API 요청 - 외부 API를 통해 도구 등록
            const response = await fetch('/api/tools/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                
                // 사용자 활동 로그 기록
                if (window.logToolRegister) {
                    window.logToolRegister(formData.name, {
                        description: formData.description,
                        endpoint: formData.endpoint,
                        schema_size: JSON.stringify(formData.parameters_schema).length
                    });
                }
                
                this.showSuccess('도구가 성공적으로 등록되었습니다!');
                
                // 3초 후 메인 페이지로 이동
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `등록 실패: ${response.status}`);
            }

        } catch (error) {
            console.error('도구 등록 실패:', error);
            this.showError(error.message || '도구 등록 중 오류가 발생했습니다.');
        } finally {
            this.setLoadingState(false);
        }
    }

    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};

        // 기본 필드
        data.name = formData.get('name').trim();
        data.description = formData.get('description').trim();
        data.tool_type = formData.get('tool_type');

        // additionalProp1 객체 구성
        const additionalProp1 = {};
        const parameterItems = document.querySelectorAll('.parameter-item');
        
        parameterItems.forEach(item => {
            const keyInput = item.querySelector('.parameter-key');
            const valueInput = item.querySelector('.parameter-value');
            
            if (keyInput && valueInput && keyInput.value.trim() && valueInput.value.trim()) {
                const key = keyInput.value.trim();
                let value = valueInput.value.trim();
                
                // header 필드인 경우 JSON 파싱 시도
                if (key === 'header') {
                    try {
                        value = JSON.parse(value);
                    } catch (error) {
                        // JSON 파싱 실패시 문자열 그대로 사용
                        console.warn('Header JSON 파싱 실패, 문자열로 처리:', value);
                    }
                }
                
                // additionalProp1 객체에 속성 추가
                additionalProp1[key] = value;
            }
        });

        // API URL 추가
        const apiUrl = formData.get('endpoint_url')?.trim();
        if (apiUrl) {
            additionalProp1.url = apiUrl;
        }

        // HTTP 메서드 추가
        const httpMethod = formData.get('endpoint_method');
        if (httpMethod) {
            additionalProp1.method = httpMethod;
        }

        // HTTP 헤더 추가 (사용자가 직접 정의하지 않은 경우)
        const httpHeaders = formData.get('endpoint_headers')?.trim();
        if (httpHeaders && !additionalProp1.header) {
            try {
                additionalProp1.header = JSON.parse(httpHeaders);
            } catch (error) {
                console.warn('헤더 JSON 파싱 실패:', httpHeaders);
            }
        }

        data.parameters_schema = {
            properties: {
                additionalProp1: additionalProp1
            }
        };

        return data;
    }

    validateFormData(data) {
        const errors = [];

        // 필수 필드 검증
        if (!data.name) errors.push('도구 이름을 입력해주세요.');
        if (!data.description) errors.push('도구 설명을 입력해주세요.');
        if (!data.tool_type) errors.push('도구 타입을 선택해주세요.');
        
        const apiUrl = document.getElementById('endpointUrl')?.value?.trim();
        if (!apiUrl) errors.push('API URL을 입력해주세요.');
        
        const httpMethod = document.getElementById('endpointMethod')?.value;
        if (!httpMethod) errors.push('HTTP 메서드를 선택해주세요.');

        // 도구 이름 형식 검증
        if (data.name && !/^[a-zA-Z0-9_]+$/.test(data.name)) {
            errors.push('도구 이름은 영문, 숫자, 언더스코어만 사용할 수 있습니다.');
        }

        // URL 형식 검증
        if (apiUrl) {
            try {
                new URL(apiUrl);
            } catch (error) {
                errors.push('올바른 URL 형식을 입력해주세요.');
            }
        }

        if (errors.length > 0) {
            this.showError(errors.join('<br>'));
            return false;
        }

        return true;
    }

    setLoadingState(isLoading) {
        const buttonText = this.submitButton.querySelector('.button-text');
        const buttonSpinner = this.submitButton.querySelector('.button-spinner');

        if (isLoading) {
            this.submitButton.disabled = true;
            buttonText.style.display = 'none';
            buttonSpinner.style.display = 'block';
            this.form.classList.add('form-loading');
        } else {
            this.submitButton.disabled = false;
            buttonText.style.display = 'block';
            buttonSpinner.style.display = 'none';
            this.form.classList.remove('form-loading');
        }
    }

    getCsrfToken() {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            return csrfInput.value;
        }
        
        const csrfCookie = document.cookie.split(';')
            .find(cookie => cookie.trim().startsWith('csrftoken='));
        if (csrfCookie) {
            return csrfCookie.split('=')[1];
        }
        
        return '';
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type) {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 새 메시지 생성
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = message;

        // 폼 상단에 삽입
        this.form.insertBefore(messageDiv, this.form.firstChild);

        // 메시지로 스크롤
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // 에러 메시지는 자동으로 사라지지 않음, 성공 메시지는 자동으로 사라짐
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    loadSchemaTemplates() {
        // 스키마 템플릿 데이터
        this.templates = {
            weather: {
                name: 'weather_api',
                description: '도시별 현재 날씨 정보를 조회합니다.',
                input_schema: {
                    type: 'object',
                    properties: {
                        city: {
                            type: 'string',
                            description: '도시 이름'
                        },
                        unit: {
                            type: 'string',
                            enum: ['celsius', 'fahrenheit'],
                            description: '온도 단위',
                            default: 'celsius'
                        }
                    },
                    required: ['city']
                },
                endpoint: {
                    url: 'https://api.openweathermap.org/data/2.5/weather',
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            },
            search: {
                name: 'search_api',
                description: '키워드를 기반으로 웹 검색을 수행합니다.',
                input_schema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '검색할 키워드'
                        },
                        limit: {
                            type: 'integer',
                            description: '검색 결과 수',
                            minimum: 1,
                            maximum: 50,
                            default: 10
                        }
                    },
                    required: ['query']
                },
                endpoint: {
                    url: 'https://api.example.com/search',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_API_KEY'
                    }
                }
            },
            translation: {
                name: 'translate_api',
                description: '텍스트를 다른 언어로 번역합니다.',
                input_schema: {
                    type: 'object',
                    properties: {
                        text: {
                            type: 'string',
                            description: '번역할 텍스트'
                        },
                        source_lang: {
                            type: 'string',
                            description: '원본 언어 코드',
                            default: 'auto'
                        },
                        target_lang: {
                            type: 'string',
                            description: '대상 언어 코드'
                        }
                    },
                    required: ['text', 'target_lang']
                },
                endpoint: {
                    url: 'https://api.example.com/translate',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer YOUR_API_KEY'
                    }
                }
            }
        };
    }

    applySchemaTemplate(templateType) {
        const template = this.templates[templateType];
        if (!template) return;

        // 확인 대화상자
        if (!confirm(`${template.name} 템플릿을 적용하시겠습니까? 현재 입력된 내용이 덮어쓰여집니다.`)) {
            return;
        }

        // 폼 필드에 템플릿 적용
        document.getElementById('toolName').value = template.name;
        document.getElementById('toolDescription').value = template.description;
        document.getElementById('inputSchema').value = JSON.stringify(template.input_schema, null, 2);
        document.getElementById('endpointUrl').value = template.endpoint.url;
        document.getElementById('endpointMethod').value = template.endpoint.method;
        
        if (template.endpoint.headers) {
            document.getElementById('endpointHeaders').value = JSON.stringify(template.endpoint.headers, null, 2);
        }

        // 성공 메시지
        this.showSuccess(`${template.name} 템플릿이 적용되었습니다. 필요에 따라 수정해주세요.`);
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.toolRegister = new ToolRegister();
});
