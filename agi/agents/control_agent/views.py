from django.shortcuts import render
from django.http import JsonResponse

def dashboard(request):
    """자율제어 AI 에이전트 대시보드"""
    context = {
        'title': '자율제어 AI 에이전트',
        'description': '제조 시스템 자동 제어 및 최적화',
    }
    return render(request, 'control_agent/dashboard.html', context)

def get_commands(request):
    """제어 명령 목록 조회"""
    return JsonResponse({'success': True, 'data': []})

def create_command(request):
    """제어 명령 생성"""
    return JsonResponse({'success': True, 'message': '제어 명령 생성 기능 준비 중'})

def approve_command(request, command_id):
    """제어 명령 승인"""
    return JsonResponse({'success': True, 'message': '명령 승인 완료'})

def get_systems(request):
    """제어 시스템 목록 조회"""
    return JsonResponse({'success': True, 'data': []})
