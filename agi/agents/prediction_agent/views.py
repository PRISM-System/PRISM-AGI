from django.shortcuts import render
from django.http import JsonResponse

def dashboard(request):
    """예측 AI 에이전트 대시보드"""
    context = {
        'title': '예측 AI 에이전트',
        'description': '데이터 기반 예측 분석 및 위험 평가',
    }
    return render(request, 'prediction_agent/dashboard.html', context)

def create_prediction(request):
    """예측 생성"""
    return JsonResponse({'success': True, 'message': '예측 생성 기능 준비 중'})

def get_predictions(request):
    """예측 목록 조회"""
    return JsonResponse({'success': True, 'data': []})

def get_prediction_result(request, request_id):
    """예측 결과 조회"""
    return JsonResponse({'success': True, 'data': {}})

def get_models(request):
    """모델 목록 조회"""
    return JsonResponse({'success': True, 'data': []})
