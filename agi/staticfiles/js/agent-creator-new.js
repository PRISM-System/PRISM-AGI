// ===============================
// 에이전트 생성 페이지 JavaScript
// ===============================

// 전역 변수
let uploadedFiles = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeAgentCreator();
});

function initializeAgentCreator() {
    // 엘리먼트 참조
    const backButton = document.getElementById('backToChat');
    const agentForm = document.getElementById('agentForm');
    const previewButton = document.getElementById('previewAgent');
    const createButton = document.getElementById('createAgent');
    const previewModal = document.getElementById('previewModal');
    const closePreviewButton = document.getElementById('closePreview');

    // 탭 관련 엘리먼트
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 파일 업로드 관련 엘리먼트
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('algorithmFile');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');

    // 이벤트 리스너 설정
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    // 탭 전환 이벤트
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetTab = e.currentTarget.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });

    // 파일 업로드 이벤트
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

    // 탭 전환 함수
    function switchTab(targetTab) {
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

    // 파일 업로드 처리 함수
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
            <button type="button" class="file-remove" onclick="removeFile('${file.name}', ${file.size})">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
            </button>
        `;
        
        uploadedFilesContainer.appendChild(fileItem);
    }

    // 파일 제거
    window.removeFile = function(fileName, fileSize) {
        uploadedFiles = uploadedFiles.filter(f => !(f.name === fileName && f.size === fileSize));
        updateFileUI();
    };

    // 파일 UI 업데이트
    function updateFileUI() {
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
    if (activeTab === 'direct-code' && !formData.agent_code) {
        alert('에이전트 코드를 입력해주세요.');
        return;
    }
    if (activeTab === 'file-upload' && uploadedFiles.length === 0) {
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
                <p><strong>언어:</strong> ${formData.code_language}</p>
                <p><strong>의존성:</strong> ${formData.dependencies || '없음'}</p>
                <div style="margin-top: 12px;">
                    <strong>코드 미리보기:</strong>
                    <pre style="background: #1e1e1e; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; color: #d4d4d4; margin-top: 8px;">${formData.agent_code.substring(0, 500)}${formData.agent_code.length > 500 ? '...' : ''}</pre>
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

// 폼 데이터 수집
function gatherFormData() {
    const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
    
    const baseData = {
        name: document.getElementById('agentName').value.trim(),
        description: document.getElementById('agentDescription').value.trim(),
        input_method: activeTab
    };

    if (activeTab === 'direct-code') {
        return {
            ...baseData,
            code_language: document.getElementById('codeLanguage').value,
            agent_code: document.getElementById('agentCode').value.trim(),
            dependencies: document.getElementById('dependencies').value.trim()
        };
    } else {
        return {
            ...baseData,
            uploaded_files: uploadedFiles,
            entry_point: document.getElementById('entryPoint').value.trim()
        };
    }
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
    if (formData.input_method === 'direct-code' && !formData.agent_code) {
        alert('에이전트 코드를 입력해주세요.');
        return;
    }
    if (formData.input_method === 'file-upload' && uploadedFiles.length === 0) {
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
            submitData.append('code_language', formData.code_language);
            submitData.append('agent_code', formData.agent_code);
            submitData.append('dependencies', formData.dependencies);
        } else {
            submitData.append('entry_point', formData.entry_point);
            uploadedFiles.forEach((file, index) => {
                submitData.append(`files_${index}`, file);
            });
        }

        const response = await fetch('/api/agents', {
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
            uploadedFiles = [];
            document.getElementById('uploadedFiles').innerHTML = '';
            
            // 채팅 페이지로 이동
            setTimeout(() => {
                window.location.href = '/';
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

// 파일 크기 포맷팅 (전역 함수)
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
