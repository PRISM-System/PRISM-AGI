// auth.js - 로그인/회원가입 페이지 JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // 폼 유효성 검사
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });
    });
    
    // 비밀번호 입력 필드 실시간 검증
    const passwordField = document.getElementById('password1');
    const confirmPasswordField = document.getElementById('password2');
    
    if (passwordField && confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            validatePasswordMatch();
        });
        
        passwordField.addEventListener('input', function() {
            validatePasswordStrength(this.value);
        });
    }
    
    // 이메일 중복 검사 (회원가입 페이지에서)
    const emailField = document.getElementById('email');
    if (emailField && window.location.pathname.includes('register')) {
        emailField.addEventListener('blur', function() {
            checkEmailDuplicate(this.value);
        });
    }
});

// 폼 유효성 검사
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, '이 필드는 필수입니다.');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    // 이메일 형식 검사
    const emailField = form.querySelector('input[type="email"]');
    if (emailField && emailField.value) {
        if (!isValidEmail(emailField.value)) {
            showFieldError(emailField, '올바른 이메일 형식이 아닙니다.');
            isValid = false;
        }
    }
    
    // 비밀번호 확인 검사 (회원가입)
    const password1 = form.querySelector('#password1');
    const password2 = form.querySelector('#password2');
    if (password1 && password2) {
        if (password1.value !== password2.value) {
            showFieldError(password2, '비밀번호가 일치하지 않습니다.');
            isValid = false;
        }
    }
    
    return isValid;
}

// 비밀번호 일치 확인
function validatePasswordMatch() {
    const password1 = document.getElementById('password1');
    const password2 = document.getElementById('password2');
    
    if (password1 && password2) {
        if (password1.value !== password2.value) {
            showFieldError(password2, '비밀번호가 일치하지 않습니다.');
        } else {
            clearFieldError(password2);
        }
    }
}

// 비밀번호 강도 검사
function validatePasswordStrength(password) {
    const passwordField = document.getElementById('password1');
    if (!passwordField) return;
    
    let strength = 0;
    let message = '';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (password.length < 8) {
        message = '비밀번호는 최소 8자 이상이어야 합니다.';
        showFieldError(passwordField, message);
    } else if (strength < 3) {
        message = '비밀번호가 너무 약합니다. 대소문자, 숫자, 특수문자를 포함해주세요.';
        showFieldError(passwordField, message);
    } else {
        clearFieldError(passwordField);
    }
}

// 이메일 중복 검사
async function checkEmailDuplicate(email) {
    if (!isValidEmail(email)) return;
    
    try {
        const response = await fetch('/django/api/check-email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        const emailField = document.getElementById('email');
        
        if (data.exists) {
            showFieldError(emailField, '이미 사용중인 이메일입니다.');
        } else {
            clearFieldError(emailField);
        }
    } catch (error) {
        console.error('이메일 중복 검사 오류:', error);
    }
}

// 이메일 형식 검증
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 필드 오류 표시
function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#dc2626';
}

// 필드 오류 제거
function clearFieldError(field) {
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    field.style.borderColor = '#d1d5db';
}

// CSRF 토큰 가져오기
function getCsrfToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : '';
}

// 로딩 상태 표시
function showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"></circle><path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> 처리중...';
}

// 로딩 상태 해제
function hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}
