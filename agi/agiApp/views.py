from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
import json

class AgentsView(APIView):
    permission_classes = [AllowAny]  # 공개가 아니면 적절히 수정

    # 프리플라이트 대응
    def options(self, request, *args, **kwargs):
        return Response(status=204)

    # 목록 조회 (GET)
    def get(self, request, *args, **kwargs):
        # TODO: 실제 목록 로직
        data = [
            # 예시 데이터
            {"name": "freezing-funny-bot", "description": "쓸쓸개그 봇"}
        ]
        return Response(data)

    # 생성 (POST)
    def post(self, request, *args, **kwargs):
        # TODO: 실제 생성 로직
        return Response({"ok": True})
        

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