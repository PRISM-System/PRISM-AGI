from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
import json
import os
from datetime import datetime

def index(request):
    return render(request, 'index.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        remember_me = request.POST.get('remember_me')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            
            # 로그인 상태 유지 설정
            if not remember_me:
                request.session.set_expiry(0)  # 브라우저 종료시 세션 삭제
            
            return redirect('index')
        else:
            return render(request, 'auth/login.html', {
                'error_message': '이메일 또는 비밀번호가 올바르지 않습니다.',
                'username': username
            })
    
    return render(request, 'auth/login.html')

def register_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        username = request.POST.get('username')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        agree_terms = request.POST.get('agree_terms')
        
        # 기본 유효성 검사
        if not all([email, username, password1, password2]):
            return render(request, 'auth/register.html', {
                'error_message': '모든 필드를 입력해주세요.',
                'form': request.POST
            })
        
        if password1 != password2:
            return render(request, 'auth/register.html', {
                'error_message': '비밀번호가 일치하지 않습니다.',
                'form': request.POST
            })
        
        if not agree_terms:
            return render(request, 'auth/register.html', {
                'error_message': '이용약관에 동의해주세요.',
                'form': request.POST
            })
        
        # 사용자 중복 검사
        if User.objects.filter(username=username).exists():
            return render(request, 'auth/register.html', {
                'error_message': '이미 사용중인 사용자명입니다.',
                'form': request.POST
            })
        
        if User.objects.filter(email=email).exists():
            return render(request, 'auth/register.html', {
                'error_message': '이미 사용중인 이메일입니다.',
                'form': request.POST
            })
        
        # 사용자 생성
        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password1
            )
            
            # 자동 로그인
            login(request, user)
            messages.success(request, '회원가입이 완료되었습니다!')
            return redirect('index')
        
        except Exception as e:
            return render(request, 'auth/register.html', {
                'error_message': '회원가입 중 오류가 발생했습니다.',
                'form': request.POST
            })
    
    return render(request, 'auth/register.html')

@login_required
def logout_view(request):
    logout(request)
    messages.info(request, '로그아웃되었습니다.')
    return redirect('login')

def password_reset_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        
        try:
            user = User.objects.get(email=email)
            # 여기에 이메일 발송 로직 추가
            # send_password_reset_email(user)
            
            return render(request, 'auth/password_reset.html', {
                'success_message': '비밀번호 재설정 링크를 이메일로 보내드렸습니다.',
                'email': email
            })
        except User.DoesNotExist:
            return render(request, 'auth/password_reset.html', {
                'error_message': '등록되지 않은 이메일입니다.',
                'email': email
            })
    
    return render(request, 'auth/password_reset.html')

@require_http_methods(["POST"])
def check_email_api(request):
    """이메일 중복 검사 API"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        
        if not email:
            return JsonResponse({'error': '이메일이 필요합니다.'}, status=400)
        
        exists = User.objects.filter(email=email).exists()
        return JsonResponse({'exists': exists})
    
    except json.JSONDecodeError:
        return JsonResponse({'error': '잘못된 JSON 형식입니다.'}, status=400)
    except Exception as e:
        return JsonResponse({'error': '서버 오류가 발생했습니다.'}, status=500)


def create_agent_page(request):
    """에이전트 생성 페이지"""
    return render(request, 'create_agent.html')

def manage_agents_page(request):
    """에이전트 관리 페이지"""
    return render(request, 'manage_agents.html')

def register_tool_page(request):
    """도구 등록 페이지"""
    return render(request, 'register_tool.html')

def manage_tools_page(request):
    """도구 관리 페이지"""
    return render(request, 'manage_tools.html')

def user_logs_page(request):
    """사용자 로그 페이지"""
    return render(request, 'user_logs.html')

def server_logs_page(request):
    """서버 로그 페이지"""
    from django.conf import settings
    
    log_file_path = os.path.join(settings.BASE_DIR, 'logs', 'agi.log')
    logs = []
    
    try:
        if os.path.exists(log_file_path):
            # 다양한 인코딩 시도 (한국어 환경 고려)
            encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
            
            for encoding in encodings:
                try:
                    with open(log_file_path, 'r', encoding=encoding, errors='ignore') as f:
                        all_lines = f.readlines()
                        
                        # 최신 5000줄만 가져오기 (더 많은 로그 표시)
                        recent_lines = all_lines[-5000:] if len(all_lines) > 5000 else all_lines
                        
                        # 빈 줄도 포함하되, 연속된 빈 줄은 하나로 압축
                        processed_logs = []
                        prev_empty = False
                        
                        for line in recent_lines:
                            stripped_line = line.strip()
                            if stripped_line:  # 내용이 있는 줄
                                processed_logs.append(stripped_line)
                                prev_empty = False
                            elif not prev_empty:  # 첫 번째 빈 줄만 추가
                                processed_logs.append('')
                                prev_empty = True
                        
                        # 로그를 시간 순으로 내림차순 정렬 (최신 로그가 위로)
                        def extract_timestamp(log_line):
                            if not log_line or not log_line.strip():
                                return datetime.min  # 빈 줄은 가장 아래로
                            
                            # 타임스탬프 패턴 찾기
                            import re
                            timestamp_pattern = r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:,\d{3})?'
                            match = re.search(timestamp_pattern, log_line)
                            
                            if match:
                                timestamp_str = match.group()
                                try:
                                    # 밀리초가 있는 경우와 없는 경우 모두 처리
                                    if ',' in timestamp_str:
                                        return datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S,%f')
                                    else:
                                        return datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
                                except ValueError:
                                    pass
                            
                            return datetime.min
                        
                        # 타임스탬프가 있는 로그만 정렬하고, 빈 줄은 그대로 유지
                        timestamped_logs = []
                        empty_logs = []
                        
                        for log in processed_logs:
                            if log and log.strip():
                                timestamped_logs.append(log)
                            else:
                                empty_logs.append(log)
                        
                        # 타임스탬프가 있는 로그를 내림차순 정렬
                        timestamped_logs.sort(key=extract_timestamp, reverse=True)
                        
                        # 정렬된 로그와 빈 줄을 합침 (빈 줄은 맨 아래)
                        logs = timestamped_logs + empty_logs
                        break
                except UnicodeDecodeError:
                    continue
        else:
            # 로그 파일이 없는 경우 디버그 정보 제공
            logs = [
                f"로그 파일을 찾을 수 없습니다: {log_file_path}",
                "가능한 원인:",
                "1. 서버가 아직 로그를 생성하지 않았습니다",
                "2. 로그 디렉토리가 존재하지 않습니다",
                "3. 권한 문제로 로그 파일에 접근할 수 없습니다"
            ]
                    
    except Exception as e:
        error_msg = f"로그 파일 읽기 오류: {e}"
        print(error_msg)
        logs = [
            error_msg,
            f"시도한 파일 경로: {log_file_path}",
            "서버 관리자에게 문의하세요."
        ]
    
    return render(request, 'server_logs.html', {'logs': logs})

@api_view(['GET'])
@permission_classes([AllowAny])
def refresh_server_logs(request):
    """서버 로그 새로고침 API"""
    from django.conf import settings
    
    log_file_path = os.path.join(settings.BASE_DIR, 'logs', 'agi.log')
    logs = []
    
    try:
        if os.path.exists(log_file_path):
            encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
            
            for encoding in encodings:
                try:
                    with open(log_file_path, 'r', encoding=encoding, errors='ignore') as f:
                        all_lines = f.readlines()
                        
                        # 최신 5000줄만 가져오기
                        recent_lines = all_lines[-5000:] if len(all_lines) > 5000 else all_lines
                        
                        # 빈 줄도 포함하되, 연속된 빈 줄은 하나로 압축
                        processed_logs = []
                        prev_empty = False
                        
                        for line in recent_lines:
                            stripped_line = line.strip()
                            if stripped_line:  # 내용이 있는 줄
                                processed_logs.append(stripped_line)
                                prev_empty = False
                            elif not prev_empty:  # 첫 번째 빈 줄만 추가
                                processed_logs.append('')
                                prev_empty = True
                        
                        logs = processed_logs
                        break
                except UnicodeDecodeError:
                    continue
        else:
            logs = ["로그 파일이 존재하지 않습니다."]
                    
        return JsonResponse({
            'success': True,
            'logs': logs,
            'count': len(logs),
            'timestamp': datetime.now().isoformat()
        })
                    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'logs': [f"로그 읽기 오류: {str(e)}"]
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def export_server_logs(request):
    """서버 로그 TXT 파일 내보내기 API"""
    from django.conf import settings
    
    try:
        # 요청 데이터에서 필터 정보 가져오기
        data = json.loads(request.body) if request.body else {}
        search_term = data.get('search_term', '')
        level_filter = data.get('level_filter', '')
        type_filter = data.get('type_filter', '')
        
        log_file_path = os.path.join(settings.BASE_DIR, 'logs', 'agi.log')
        logs = []
        
        if os.path.exists(log_file_path):
            encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
            
            for encoding in encodings:
                try:
                    with open(log_file_path, 'r', encoding=encoding, errors='ignore') as f:
                        all_lines = f.readlines()
                        logs = [line.strip() for line in all_lines if line.strip()]
                        break
                except UnicodeDecodeError:
                    continue
        
        # 필터 적용
        filtered_logs = []
        for log in logs:
            if search_term and search_term.lower() not in log.lower():
                continue
            if level_filter and level_filter not in log:
                continue
            if type_filter and type_filter not in log:
                continue
            filtered_logs.append(log)
        
        # TXT 파일 내용 생성
        header = f"""PRISM-AGI 서버 로그 파일
생성 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
총 로그 수: {len(filtered_logs)}개
필터 조건: {f'검색어="{search_term}" ' if search_term else ''}{f'레벨="{level_filter}" ' if level_filter else ''}{f'타입="{type_filter}"' if type_filter else ''}

{'=' * 80}

"""
        
        log_entries = []
        for i, log in enumerate(filtered_logs, 1):
            timestamp = ''
            level = 'LOG'
            message = log
            
            # 타임스탬프 추출
            if log[:23] and log[4] == '-' and log[7] == '-':
                timestamp = log[:23]
                message = log[24:] if len(log) > 24 else log
            
            # 레벨 추출
            for l in ['ERROR', 'WARNING', 'INFO', 'DEBUG', 'CRITICAL']:
                if l in log:
                    level = l
                    break
            
            log_entries.append(f"[{i}] {timestamp} | {level}\n{message}\n{'-' * 40}")
        
        content = header + '\n\n'.join(log_entries)
        content += f"\n\n{'=' * 80}\n로그 파일 끝 - 총 {len(filtered_logs)}개 항목\n"
        
        # HTTP 응답으로 파일 다운로드
        response = HttpResponse(content, content_type='text/plain; charset=utf-8')
        filename = f"server_logs_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)