from django.shortcuts import render
from django.http import JsonResponse

def dashboard(request):
    """오케스트레이션 AI 에이전트 대시보드"""
    context = {
        'title': '오케스트레이션 AI 에이전트',
        'description': '자연어 기반 에이전트 협업 및 워크플로우',
    }
    return render(request, 'orchestration_agent/dashboard.html', context)

def process_query(request):
    """자연어 질의 처리"""
    return JsonResponse({'success': True, 'message': '질의 처리 기능 준비 중'})

def get_workflows(request):
    """워크플로우 목록 조회"""
    return JsonResponse({'success': True, 'data': []})

def get_workflow_detail(request, workflow_id):
    """워크플로우 상세 조회"""
    return JsonResponse({'success': True, 'data': {}})

def chat_interface(request):
    """채팅 인터페이스"""
    return JsonResponse({'success': True, 'message': '채팅 인터페이스 준비 중'})
