// ===============================
// 에이전트 생성 페이지 JavaScript
// ===============================

// 전역 변수
let uploadedFiles = [];
let codeFiles = [];
let nextFileId = 1;
let availableTools = [];
let selectedTools = [];
// edit 모드 관련 변수들은 현재 사용하지 않음
// let isEditMode = false;
// let editAgentName = null;

document.addEventListener('DOMContentLoaded', function() {
    // console.log('DOMContentLoaded 이벤트 발생 (agiApp/static)');
    // console.log('현재 페이지 body 클래스:', document.body.className);
    
    // 에이전트 생성 페이지인지 확인
    if (document.body.classList.contains('create-agent-page')) {
        // console.log('에이전트 생성 페이지 감지, 초기화 시작');
        initializeAgentCreator();
    } else {
        console.log('에이전트 생성 페이지가 아님');
    }
});

function initializeAgentCreator() {
    // URL 파라미터 확인 (현재 비활성화)
    // checkEditMode();
    
    // 첫 번째 코드 파일 초기화
    codeFiles.push({
        id: 0,
        name: 'main.py',
        language: 'python',
        content: ''
    });

    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 첫 번째 파일의 이벤트 설정
    setupCodeFileEvents(0);
    
    // 도구 목록 로드
    loadAvailableTools();
    
    // edit 모드인 경우 에이전트 정보 로드 (현재 비활성화)
    // if (isEditMode && editAgentName) {
    //     loadAgentForEdit(editAgentName);
    // }
}

// URL 파라미터에서 edit 모드 확인
function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get('edit');
    
    if (editParam && editParam !== 'undefined') {
        isEditMode = true;
        editAgentName = decodeURIComponent(editParam);
        // console.log('Edit mode detected for agent:', editAgentName);
        
        // 페이지 제목 변경
        const titleElement = document.querySelector('.creator-title');
        if (titleElement) {
            titleElement.textContent = '에이전트 수정';
        }
        
        const subtitleElement = document.querySelector('.creator-subtitle');
        if (subtitleElement) {
            subtitleElement.textContent = `${editAgentName} 에이전트를 수정합니다`;
        }
        
        // 생성 버튼을 수정 버튼으로 변경
        const createButton = document.getElementById('createAgent');
        if (createButton) {
            createButton.textContent = '에이전트 수정';
        }
    }
}

// 수정할 에이전트 정보 로드
async function loadAgentForEdit(agentName) {
    try {
        // console.log('Loading agent for edit:', agentName);
        
        // 에이전트 목록에서 해당 에이전트 찾기
        const response = await fetch('https://grnd.bimatrix.co.kr/django/api/agents/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const agents = data.agents || [];
            const agent = agents.find(a => a.name === agentName);
            
            if (agent) {
                // console.log('Found agent:', agent);
                populateFormWithAgentData(agent);
            } else {
                console.error('Agent not found:', agentName);
                alert('해당 에이전트를 찾을 수 없습니다.');
                window.location.href = '/manage-agents/';
            }
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading agent:', error);
        alert('에이전트 정보를 불러오는 중 오류가 발생했습니다.');
        window.location.href = '/manage-agents/';
    }
}

// 폼에 에이전트 데이터 채우기
function populateFormWithAgentData(agent) {
    try {
        // 기본 정보 채우기
        const nameInput = document.getElementById('agentName');
        const descInput = document.getElementById('agentDescription');
        const rolesInput = document.getElementById('agentRoles');
        const instructionsInput = document.getElementById('agentInstructions');
        const languageSelect = document.getElementById('agentLanguage');
        
        if (nameInput) nameInput.value = agent.name || '';
        if (descInput) descInput.value = agent.description || '';
        if (rolesInput) rolesInput.value = agent.roles || '';
        if (instructionsInput) instructionsInput.value = agent.instructions || '';
        if (languageSelect) languageSelect.value = agent.language || 'python';
        
        // 코드 파일 정보가 있으면 채우기
        if (agent.code_files && agent.code_files.length > 0) {
            // 기존 코드 파일 초기화
            codeFiles = [];
            
            agent.code_files.forEach((file, index) => {
                codeFiles.push({
                    id: index,
                    name: file.name || `file_${index}.py`,
                    language: file.language || 'python',
                    content: file.content || ''
                });
            });
            
            // 코드 파일 UI 업데이트
            updateCodeFilesList();
            if (codeFiles.length > 0) {
                selectCodeFile(0);
            }
        }
        
        // console.log('Agent data populated successfully');
    } catch (error) {
        console.error('Error populating form with agent data:', error);
    }
}

function setupEventListeners() {
    // 기본 버튼들
    const previewButton = document.getElementById('previewAgent');
    const createButton = document.getElementById('createAgent');
    const closePreviewButton = document.getElementById('closePreview');
    const previewModal = document.getElementById('previewModal');
    const agentForm = document.getElementById('agentForm');

    // 코드 파일 관리
    const addCodeFileButton = document.getElementById('addCodeFile');

    // 탭 관련
    const tabButtons = document.querySelectorAll('.tab-button');

    // 파일 업로드 관련
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('algorithmFile');

    // 이벤트 리스너 등록
    if (addCodeFileButton) {
        addCodeFileButton.addEventListener('click', addNewCodeFile);
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    if (fileUploadArea && fileInput) {
        fileUploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            handleFileUpload(files);
        });

        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            handleFileUpload(files);
        });
    }

    if (previewButton) {
        previewButton.addEventListener('click', showPreview);
    }

    if (createButton) {
        createButton.addEventListener('click', createAgent);
    }

    if (closePreviewButton) {
        closePreviewButton.addEventListener('click', closePreview);
    }

    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                closePreview();
            }
        });
    }

    if (agentForm) {
        agentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            createAgent();
        });
    }

    // 도구 검색 이벤트
    const toolsSearch = document.getElementById('toolsSearch');
    if (toolsSearch) {
        toolsSearch.addEventListener('input', (e) => {
            filterTools(e.target.value);
        });
    }
}

// 탭 전환 함수
function switchTab(targetTab) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 모든 탭 버튼 비활성화
    tabButtons.forEach(btn => btn.classList.remove('active'));
    // 모든 탭 콘텐츠 숨기기
    tabContents.forEach(content => content.classList.remove('active'));

    // 선택된 탭 활성화
    const targetButton = document.querySelector(`[data-tab="${targetTab}"]`);
    const targetContent = document.getElementById(targetTab);

    if (targetButton && targetContent) {
        targetButton.classList.add('active');
        targetContent.classList.add('active');
    }
}

// 새 코드 파일 추가
function addNewCodeFile() {
    const fileId = nextFileId++;
    const newFile = {
        id: fileId,
        name: `file${fileId}.py`,
        language: 'python',
        content: ''
    };
    
    codeFiles.push(newFile);
    
    const codeFilesList = document.getElementById('codeFilesList');
    const fileItemHtml = createCodeFileItemHtml(newFile);
    codeFilesList.insertAdjacentHTML('beforeend', fileItemHtml);
    
    // 새로 추가된 파일의 이벤트 리스너 설정
    setupCodeFileEvents(fileId);
    
    // 삭제 버튼 표시/숨김 업데이트
    updateRemoveButtons();
}

// 코드 파일 HTML 생성
function createCodeFileItemHtml(file) {
    const fileId = file.id;
    const fileName = file.name;
    const fileLanguage = file.language;
    const fileContent = file.content;
    const hideRemoveBtn = fileId === 0 ? 'style="display: none;"' : '';
    
    return `
        <div class="code-file-item" data-file-id="${fileId}">
            <div class="code-file-header">
                <div class="file-info">
                    <input type="text" class="file-name-input" placeholder="filename.py" value="${fileName}">
                    <select class="file-language-select">
                        <option value="python" ${fileLanguage === 'python' ? 'selected' : ''}>Python</option>
                        <option value="javascript" ${fileLanguage === 'javascript' ? 'selected' : ''}>JavaScript</option>
                        <option value="java" ${fileLanguage === 'java' ? 'selected' : ''}>Java</option>
                        <option value="cpp" ${fileLanguage === 'cpp' ? 'selected' : ''}>C++</option>
                        <option value="csharp" ${fileLanguage === 'csharp' ? 'selected' : ''}>C#</option>
                        <option value="go" ${fileLanguage === 'go' ? 'selected' : ''}>Go</option>
                        <option value="rust" ${fileLanguage === 'rust' ? 'selected' : ''}>Rust</option>
                    </select>
                </div>
                <button type="button" class="file-remove-btn" onclick="removeCodeFile(${fileId})" ${hideRemoveBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
            <div class="code-editor-container">
                <textarea class="form-textarea code-textarea" 
                          placeholder="# 여기에 ${fileLanguage} 코드를 입력하세요" 
                          rows="10">${fileContent}</textarea>
            </div>
        </div>
    `;
}

// 코드 파일 이벤트 설정
function setupCodeFileEvents(fileId) {
    const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
    if (!fileItem) return;

    const nameInput = fileItem.querySelector('.file-name-input');
    const languageSelect = fileItem.querySelector('.file-language-select');
    const textarea = fileItem.querySelector('.code-textarea');

    // 파일명 변경 이벤트
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            const file = codeFiles.find(f => f.id === fileId);
            if (file) file.name = e.target.value;
        });
    }

    // 언어 변경 이벤트
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            const file = codeFiles.find(f => f.id === fileId);
            if (file) file.language = e.target.value;
            
            // 파일 확장자 자동 변경
            updateFileExtension(fileId, e.target.value);
            
            // placeholder 업데이트
            if (textarea) {
                textarea.placeholder = '# 여기에 ' + e.target.value + ' 코드를 입력하세요';
            }
        });
    }

    // 코드 내용 변경 이벤트
    if (textarea) {
        textarea.addEventListener('input', (e) => {
            const file = codeFiles.find(f => f.id === fileId);
            if (file) file.content = e.target.value;
        });
    }
}

// 파일 확장자 자동 변경
function updateFileExtension(fileId, language) {
    const extensions = {
        python: '.py',
        javascript: '.js',
        java: '.java',
        cpp: '.cpp',
        csharp: '.cs',
        go: '.go',
        rust: '.rs'
    };

    const file = codeFiles.find(f => f.id === fileId);
    if (!file) return;

    const nameInput = document.querySelector(`[data-file-id="${fileId}"] .file-name-input`);
    if (!nameInput) return;

    const currentName = nameInput.value;
    const baseName = currentName.replace(/\.[^.]*$/, ''); // 확장자 제거
    const newName = baseName + (extensions[language] || '.txt');
    
    nameInput.value = newName;
    file.name = newName;
}

// 코드 파일 제거
function removeCodeFile(fileId) {
    if (codeFiles.length <= 1) {
        alert('최소 하나의 코드 파일은 있어야 합니다.');
        return;
    }

    // 배열에서 제거
    codeFiles = codeFiles.filter(file => file.id !== fileId);
    
    // DOM에서 제거
    const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
    if (fileItem) {
        fileItem.remove();
    }
    
    // 삭제 버튼 표시/숨김 업데이트
    updateRemoveButtons();
}

// 삭제 버튼 표시/숨김 업데이트
function updateRemoveButtons() {
    const removeButtons = document.querySelectorAll('.file-remove-btn');
    removeButtons.forEach(btn => {
        if (codeFiles.length <= 1) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'flex';
        }
    });
}

// 파일 업로드 처리
function handleFileUpload(files) {
    files.forEach(file => {
        // 파일 확장자 검증
        const allowedExtensions = ['.py', '.js', '.java', '.cpp', '.cs', '.go', '.rs', '.txt'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            alert(`지원하지 않는 파일 형식입니다: ${file.name}`);
            return;
        }

        // 중복 파일 검사
        if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            alert(`이미 업로드된 파일입니다: ${file.name}`);
            return;
        }

        // 파일을 배열에 추가
        uploadedFiles.push(file);
        
        // UI에 파일 추가
        addFileToUI(file);
    });
}

// UI에 파일 추가
function addFileToUI(file) {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    if (!uploadedFilesContainer) return;

    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <div class="file-info">
            <svg class="file-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            <div class="file-details">
                <h4>${file.name}</h4>
                <p>${formatFileSize(file.size)} • ${getFileType(file.name)}</p>
            </div>
        </div>
        <button type="button" class="file-remove" onclick="removeUploadedFile('${file.name}', ${file.size})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
            </svg>
        </button>
    `;
    
    uploadedFilesContainer.appendChild(fileItem);
}

// 업로드된 파일 제거
function removeUploadedFile(fileName, fileSize) {
    uploadedFiles = uploadedFiles.filter(f => !(f.name === fileName && f.size === fileSize));
    updateUploadedFileUI();
}

// 업로드된 파일 UI 업데이트
function updateUploadedFileUI() {
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    if (!uploadedFilesContainer) return;
    
    uploadedFilesContainer.innerHTML = '';
    uploadedFiles.forEach(file => addFileToUI(file));
}

// 파일 크기 포맷팅
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 파일 타입 반환
function getFileType(fileName) {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    const types = {
        '.py': 'Python',
        '.js': 'JavaScript',
        '.java': 'Java',
        '.cpp': 'C++',
        '.cs': 'C#',
        '.go': 'Go',
        '.rs': 'Rust',
        '.txt': 'Text'
    };
    return types[extension] || 'Unknown';
}

// DOM에서 코드 파일 내용 업데이트
function updateCodeFilesFromDOM() {
    codeFiles.forEach(file => {
        const fileItem = document.querySelector(`[data-file-id="${file.id}"]`);
        if (fileItem) {
            const nameInput = fileItem.querySelector('.file-name-input');
            const languageSelect = fileItem.querySelector('.file-language-select');
            const textarea = fileItem.querySelector('.code-textarea');
            
            if (nameInput) file.name = nameInput.value;
            if (languageSelect) file.language = languageSelect.value;
            if (textarea) file.content = textarea.value;
        }
    });
}

// 폼 데이터 수집
function gatherFormData() {
    const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
    
    const baseData = {
        name: document.getElementById('agentName').value.trim(),
        description: document.getElementById('agentDescription').value.trim(),
        input_method: activeTab
    };

    if (activeTab === 'direct-code') {
        // 모든 코드 파일의 최신 내용 업데이트
        updateCodeFilesFromDOM();
        
        return {
            ...baseData,
            code_files: codeFiles,
            dependencies: document.getElementById('dependencies').value.trim(),
            entry_point: document.getElementById('entryPointCode').value.trim()
        };
    } else {
        return {
            ...baseData,
            uploaded_files: uploadedFiles,
            entry_point: document.getElementById('entryPoint').value.trim()
        };
    }
}

// 미리보기 표시
function showPreview() {
    const formData = gatherFormData();
    const previewContent = document.getElementById('previewContent');
    const modal = document.getElementById('previewModal');

    if (!formData.name || !formData.description) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
    }

    // 코드 입력 방식에 따른 검증
    const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
    if (activeTab === 'direct-code') {
        updateCodeFilesFromDOM();
        if (codeFiles.length === 0 || codeFiles.every(file => !file.content.trim())) {
            alert('최소 하나의 코드 파일에 내용을 입력해주세요.');
            return;
        }
    } else if (activeTab === 'file-upload' && uploadedFiles.length === 0) {
        alert('알고리즘 파일을 업로드해주세요.');
        return;
    }

    // 미리보기 콘텐츠 생성
    previewContent.innerHTML = `
        <div class="preview-section">
            <h4>기본 정보</h4>
            <p><strong>이름:</strong> ${formData.name}</p>
            <p><strong>설명:</strong> ${formData.description}</p>
        </div>
        
        <div class="preview-section">
            <h4>코드 정보</h4>
            <p><strong>입력 방식:</strong> ${activeTab === 'direct-code' ? '직접 코드 입력' : '파일 업로드'}</p>
            ${activeTab === 'direct-code' ? `
                <p><strong>코드 파일 수:</strong> ${codeFiles.length}개</p>
                <p><strong>의존성:</strong> ${formData.dependencies || '없음'}</p>
                <p><strong>진입점:</strong> ${formData.entry_point || '지정되지 않음'}</p>
                <div style="margin-top: 12px;">
                    <strong>코드 파일 목록:</strong>
                    <ul style="margin: 8px 0; padding-left: 20px;">
                        ${codeFiles.map(file => `<li>${file.name} (${file.language}) - ${file.content.length > 0 ? file.content.length + '자' : '비어있음'}</li>`).join('')}
                    </ul>
                </div>
            ` : `
                <p><strong>업로드된 파일:</strong> ${uploadedFiles.length}개</p>
                <p><strong>진입점:</strong> ${formData.entry_point || '지정되지 않음'}</p>
                <div style="margin-top: 12px;">
                    <strong>파일 목록:</strong>
                    <ul style="margin: 8px 0; padding-left: 20px;">
                        ${uploadedFiles.map(file => `<li>${file.name} (${formatFileSize(file.size)})</li>`).join('')}
                    </ul>
                </div>
            `}
        </div>
    `;

    modal.classList.add('show');
}

// 에이전트 생성/수정
async function createAgent() {
    const createButton = document.getElementById('createAgent');

    // 기본 정보 수집
    const name = document.getElementById('agentName').value.trim();
    const description = document.getElementById('agentDescription').value.trim();
    const rolePrompt = document.getElementById('rolePrompt').value.trim();

    // 필수 필드 검증
    if (!name || !description || !rolePrompt) {
        alert('모든 필드를 입력해주세요.');
        return;
    }

        // 버튼 상태 변경
        const originalText = createButton.innerHTML;
        const actionText = '생성 중...';
        createButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
                <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364-7.364l-2.828 2.828M9.464 19.192l-2.828-2.828m12.728 0l-2.828-2.828M9.464 4.808L6.636 7.636"/>
            </svg>
            ${actionText}
        `;
        createButton.disabled = true;

        try {
            // API 요청 데이터 준비
            const requestData = {
                name: name,
                description: description,
                role_prompt: rolePrompt,
                tools: selectedTools  // 선택된 도구들 추가
            };

            // console.log('요청 데이터 (객체):', requestData);
            // console.log('선택된 도구들:', selectedTools);
            // console.log('요청 데이터 (JSON 문자열):', JSON.stringify(requestData));
            // console.log('CSRF 토큰:', getCsrfToken());

            // 에이전트 생성 (POST 방식만 사용)
            const url = 'https://grnd.bimatrix.co.kr/django/api/agents/';
            const method = 'POST';
            
            // console.log('Creating agent with URL:', url, 'Method:', method);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                },
                body: JSON.stringify(requestData)
            });

            // console.log('응답 상태:', response.status);
            // console.log('응답 상태 텍스트:', response.statusText);
            // console.log('응답 헤더:', [...response.headers.entries()]);

            if (response.ok) {
                const result = await response.json();
                // console.log('응답 결과:', result);
                
                // 사용자 활동 로그 기록
                if (window.logAgentCreate) {
                    window.logAgentCreate(name, {
                        description: description,
                        role_prompt_length: rolePrompt.length,
                        tools_count: selectedTools.length,
                        selected_tools: selectedTools
                    });
                }
                
                // 성공 메시지 표시
                const successMessage = '에이전트가 성공적으로 생성되었습니다!';
                alert(successMessage);
                
                // 폼 초기화
                document.getElementById('agentForm').reset();
                selectedTools = []; // 선택된 도구도 초기화
                updateSelectedToolsDisplay();
                
                // 채팅 페이지로 이동
                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const userId = urlParams.get('user_id');
                    if (userId) {
                        window.location.href = `/django/index/?user_id=${userId}`;
                    } else {
                        window.location.href = '/django/';
                    }
                }, 1000);
                
            } else {
                // 에러 응답 처리
                let errorMessage;
                try {
                    const errorData = await response.json();
                    console.error('API Error JSON:', errorData);
                    errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    const errorText = await response.text();
                    console.error('API Error Text:', errorText);
                    errorMessage = errorText;
                }
                
                console.error('API Error:', response.status, response.statusText, errorMessage);
                alert(`에이전트 생성에 실패했습니다: ${response.status} - ${errorMessage}`);
            }
    } catch (error) {
        console.error('에이전트 처리 오류:', error);
        alert(`에이전트 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
        // 버튼 상태 복원
        createButton.innerHTML = originalText;
        createButton.disabled = false;
    }
}

// 미리보기 닫기
function closePreview() {
    const modal = document.getElementById('previewModal');
    modal.classList.remove('show');
}

// CSRF 토큰 가져오기
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
}

// 스피너 애니메이션 CSS 추가
const style = document.createElement('style');
style.textContent = `
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ===============================
// 도구 관리 관련 함수들
// ===============================

// 사용 가능한 도구 목록 로드
async function loadAvailableTools() {
    const toolsList = document.getElementById('toolsList');
    
    // DOM 요소가 없으면 종료 (다른 페이지에서 로드된 경우)
    if (!toolsList) {
        console.log('toolsList 요소를 찾을 수 없습니다. 에이전트 생성 페이지가 아닙니다.');
        return;
    }
    
    console.log('도구 목록 로드 시작...');
    
    try {
        // console.log('API 요청 시작: https://grnd.bimatrix.co.kr/django/api/tools/');
        const response = await fetch('https://grnd.bimatrix.co.kr/django/api/tools/');
        // console.log('API 응답 상태:', response.status, response.statusText);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // console.log('받은 데이터:', data);
        
        availableTools = Array.isArray(data) ? data : (data.tools || []);
        // console.log('처리된 도구 목록:', availableTools);
        
        renderToolsList(availableTools);
        
    } catch (error) {
        console.error('도구 목록 로드 실패:', error);
        console.error('에러 스택:', error.stack);
        toolsList.innerHTML = `
            <div class="no-tools-message">
                도구 목록을 불러올 수 없습니다.<br>
                <small>오류: ${error.message}</small><br>
                <small>네트워크 연결을 확인해주세요.</small>
            </div>
        `;
    }
}

// 도구 목록 렌더링
function renderToolsList(tools) {
    const toolsList = document.getElementById('toolsList');
    
    // DOM 요소가 없으면 종료
    if (!toolsList) {
        console.log('toolsList 요소를 찾을 수 없습니다.');
        return;
    }
    
    // console.log('도구 목록 렌더링 시작, 도구 수:', tools.length);
    
    if (!tools || tools.length === 0) {
        toolsList.innerHTML = `
            <div class="no-tools-message">
                등록된 도구가 없습니다.<br>
                <small>먼저 도구를 등록해주세요.</small>
            </div>
        `;
        return;
    }
    
    const toolsHTML = tools.map(tool => {
        // console.log('도구 렌더링:', tool);
        return `
            <div class="tool-item">
                <label class="tool-checkbox">
                    <input type="checkbox" 
                           value="${escapeHtml(tool.name)}" 
                           ${selectedTools.includes(tool.name) ? 'checked' : ''}
                           onchange="toggleTool('${escapeHtml(tool.name)}')">
                    <div class="tool-info">
                        <div class="tool-name">${escapeHtml(tool.name)}</div>
                        <div class="tool-description">${escapeHtml(tool.description || '설명이 없습니다.')}</div>
                        <div class="tool-type">${escapeHtml(tool.tool_type || 'API Tool')}</div>
                    </div>
                </label>
            </div>
        `;
    }).join('');
    
    // console.log('렌더링된 HTML:', toolsHTML);
    toolsList.innerHTML = toolsHTML;
}

// 도구 필터링
function filterTools(searchTerm) {
    if (!searchTerm.trim()) {
        renderToolsList(availableTools);
        return;
    }
    
    const filtered = availableTools.filter(tool => 
        tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tool.description && tool.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    renderToolsList(filtered);
}

// 도구 선택/해제 토글
function toggleTool(toolName) {
    const index = selectedTools.indexOf(toolName);
    
    if (index > -1) {
        selectedTools.splice(index, 1);
    } else {
        selectedTools.push(toolName);
    }
    
    updateSelectedToolsDisplay();
}

// 선택된 도구 표시 업데이트
function updateSelectedToolsDisplay() {
    const selectedCount = document.getElementById('selectedCount');
    const selectedToolsList = document.getElementById('selectedToolsList');
    
    selectedCount.textContent = selectedTools.length;
    
    if (selectedTools.length === 0) {
        selectedToolsList.innerHTML = '<div style="color: #9ca3af; font-style: italic;">선택된 도구가 없습니다.</div>';
        return;
    }
    
    const selectedHTML = selectedTools.map(toolName => `
        <div class="selected-tool-tag">
            <span>${escapeHtml(toolName)}</span>
            <div class="remove-tool" onclick="removeTool('${escapeHtml(toolName)}')">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </div>
        </div>
    `).join('');
    
    selectedToolsList.innerHTML = selectedHTML;
}

// 선택된 도구 제거
function removeTool(toolName) {
    const index = selectedTools.indexOf(toolName);
    if (index > -1) {
        selectedTools.splice(index, 1);
        updateSelectedToolsDisplay();
        
        // 체크박스 상태도 업데이트
        const checkbox = document.querySelector(`input[value="${toolName}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
    }
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
