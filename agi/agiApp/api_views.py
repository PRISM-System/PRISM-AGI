"""
API Views for agiApp
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods


@method_decorator(csrf_exempt, name='dispatch')
class AgentsListView(APIView):
    """
    GET /api/agents
    에이전트 목록을 반환하는 API
    """
    permission_classes = [AllowAny]  # 인증 없이 접근 가능하도록 설정
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def options(self, request, *args, **kwargs):
        """
        CORS preflight 요청 처리
        """
        return Response(status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        에이전트 목록 반환 (POST 요청)
        """
        agents = [
            {
                "name": "monitoring_agent",
                "description": "시스템 모니터링 및 성능 추적을 담당하는 에이전트",
                "role_prompt": "당신은 시스템 모니터링 전문가입니다. 시스템의 성능, 리소스 사용량, 에러 로그 등을 실시간으로 모니터링하고 분석합니다."
            },
            {
                "name": "prediction_agent", 
                "description": "미래 트렌드 예측 및 데이터 분석을 담당하는 에이전트",
                "role_prompt": "당신은 데이터 분석 및 예측 전문가입니다. 다양한 데이터를 분석하여 미래 트렌드를 예측하고 인사이트를 제공합니다."
            },
            {
                "name": "control_agent",
                "description": "시스템 제어 및 자동화를 담당하는 에이전트", 
                "role_prompt": "당신은 시스템 제어 전문가입니다. 자동화된 작업 실행, 시스템 설정 변경, 프로세스 관리를 담당합니다."
            },
            {
                "name": "orchestration_agent",
                "description": "다른 에이전트들의 협업을 조율하는 오케스트레이션 에이전트",
                "role_prompt": "당신은 에이전트 오케스트레이션 전문가입니다. 여러 에이전트들 간의 협업을 조율하고 워크플로우를 관리합니다."
            }
        ]
        
        return Response(agents, status=status.HTTP_200_OK)
    
    def get(self, request):
        """
        에이전트 목록 반환 (GET 요청도 지원)
        """
        agents = [
            {
                "name": "monitoring_agent",
                "description": "시스템 모니터링 및 성능 추적을 담당하는 에이전트",
                "role_prompt": "당신은 시스템 모니터링 전문가입니다. 시스템의 성능, 리소스 사용량, 에러 로그 등을 실시간으로 모니터링하고 분석합니다."
            },
            {
                "name": "prediction_agent", 
                "description": "미래 트렌드 예측 및 데이터 분석을 담당하는 에이전트",
                "role_prompt": "당신은 데이터 분석 및 예측 전문가입니다. 다양한 데이터를 분석하여 미래 트렌드를 예측하고 인사이트를 제공합니다."
            },
            {
                "name": "control_agent",
                "description": "시스템 제어 및 자동화를 담당하는 에이전트", 
                "role_prompt": "당신은 시스템 제어 전문가입니다. 자동화된 작업 실행, 시스템 설정 변경, 프로세스 관리를 담당합니다."
            },
            {
                "name": "orchestration_agent",
                "description": "다른 에이전트들의 협업을 조율하는 오케스트레이션 에이전트",
                "role_prompt": "당신은 에이전트 오케스트레이션 전문가입니다. 여러 에이전트들 간의 협업을 조율하고 워크플로우를 관리합니다."
            }
        ]
        
        return Response(agents, status=status.HTTP_200_OK)
