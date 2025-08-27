// ===============================
// 에이전트 생성 페이지 JavaScript
// ===============================

// 전역 변수
let uploadedFiles = [];
let codeFiles = [];
let nextFileId = 1;

document.addEventListener('DOMContentLoaded', function() {
    initializeAgentCreator();
});

function initializeAgentCreator() {
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
}

function setupEventListeners() {
    // 기본 버튼들
    const backButton = document.getElementById('backToChat');
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
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

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
    return `
        <div class="code-file-item" data-file-id="${file.id}">
            <div class="code-file-header">
                <div class="file-info">
                    <input type="text" class="file-name-input" placeholder="filename.py" value="${file.name}">
                    <select class="file-language-select">
                        <option value="python" ${file.language === 'python' ? 'selected' : ''}>Python</option>
                        <option value="javascript" ${file.language === 'javascript' ? 'selected' : ''}>JavaScript</option>
                        <option value="java" ${file.language === 'java' ? 'selected' : ''}>Java</option>
                        <option value="cpp" ${file.language === 'cpp' ? 'selected' : ''}>C++</option>
                        <option value="csharp" ${file.language === 'csharp' ? 'selected' : ''}>C#</option>
                        <option value="go" ${file.language === 'go' ? 'selected' : ''}>Go</option>
                        <option value="rust" ${file.language === 'rust' ? 'selected' : ''}>Rust</option>
                    </select>
                </div>
                <button type="button" class="file-remove-btn" onclick="removeCodeFile(${file.id})" ${file.id === 0 ? 'style="display: none;"' : ''}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                    </svg>
                </button>
            </div>
            <div class="code-editor-container">
                <textarea class="form-textarea code-textarea" 
                          placeholder="# 여기에 ${file.language} 코드를 입력하세요" 
                          rows="10">${file.content}</textarea>
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
                textarea.placeholder = `# 여기에 ${e.target.value} 코드를 입력하세요`;
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

// 에이전트 생성
async function createAgent() {
    const formData = gatherFormData();
    const createButton = document.getElementById('createAgent');

    if (!formData.name || !formData.description) {
        alert('필수 필드를 모두 입력해주세요.');
        return;
    }

    // 코드 입력 방식에 따른 검증
    if (formData.input_method === 'direct-code') {
        if (codeFiles.length === 0 || codeFiles.every(file => !file.content.trim())) {
            alert('최소 하나의 코드 파일에 내용을 입력해주세요.');
            return;
        }
    } else if (formData.input_method === 'file-upload' && uploadedFiles.length === 0) {
        alert('알고리즘 파일을 업로드해주세요.');
        return;
    }

    // 버튼 상태 변경
    const originalText = createButton.innerHTML;
    createButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
            <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364-7.364l-2.828 2.828M9.464 19.192l-2.828-2.828m12.728 0l-2.828-2.828M9.464 4.808L6.636 7.636"/>
        </svg>
        생성 중...
    `;
    createButton.disabled = true;

    try {
        // FormData 객체 생성 (파일 업로드를 위해)
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('description', formData.description);
        submitData.append('input_method', formData.input_method);

        if (formData.input_method === 'direct-code') {
            submitData.append('code_files', JSON.stringify(formData.code_files));
            submitData.append('dependencies', formData.dependencies);
            submitData.append('entry_point', formData.entry_point);
        } else {
            submitData.append('entry_point', formData.entry_point);
            uploadedFiles.forEach((file, index) => {
                submitData.append(`files_${index}`, file);
            });
        }

        const response = await fetch('/django/api/agents', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCsrfToken()
            },
            body: submitData
        });

        if (response.ok) {
            const result = await response.json();
            
            // 성공 메시지 표시
            alert('에이전트가 성공적으로 생성되었습니다!');
            
            // 폼 초기화
            document.getElementById('agentForm').reset();
            codeFiles = [{
                id: 0,
                name: 'main.py',
                language: 'python',
                content: ''
            }];
            uploadedFiles = [];
            document.getElementById('uploadedFiles').innerHTML = '';
            
            // 코드 파일 목록 초기화
            const codeFilesList = document.getElementById('codeFilesList');
            codeFilesList.innerHTML = createCodeFileItemHtml(codeFiles[0]);
            setupCodeFileEvents(0);
            updateRemoveButtons();
            
            // 채팅 페이지로 이동
            setTimeout(() => {
                window.location.href = '/django/';
            }, 1000);
            
        } else {
            const error = await response.json();
            alert('에이전트 생성에 실패했습니다: ' + (error.detail || '알 수 없는 오류'));
        }
    } catch (error) {
        console.error('에이전트 생성 오류:', error);
        alert('에이전트 생성 중 오류가 발생했습니다.');
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
