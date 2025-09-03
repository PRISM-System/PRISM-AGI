"""
Proxy views for handling external API requests and WebSocket updates.
"""

import json
import logging
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

logger = logging.getLogger(__name__)

# 외부 서버 설정
ORCHESTRATE_API_BASE_URL = 'http://147.47.39.144:8100'


@csrf_exempt
@require_http_methods(["POST"])
def proxy_orchestrate(request):
    """
    Orchestrate API 전용 프록시 - 147.47.39.144:8100으로 전달
    """
    try:
        # 요청 데이터 파싱
        request_data = json.loads(request.body) if request.body else {}
        session_id = request_data.get('session_id')
        
        if not session_id:
            return JsonResponse({
                'error': 'session_id is required'
            }, status=400)
        
        # 외부 Orchestrate API 호출
        external_url = f"{ORCHESTRATE_API_BASE_URL}/api/v1/orchestrate/"
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
        
        logger.info(f"Sending orchestrate request to: {external_url}")
        logger.info(f"Request data: {request_data}")
        
        response = requests.post(
            external_url,
            json=request_data,
            headers=headers,
            timeout=600
        )
        
        response_data = response.json() if response.content else {}
        
        return JsonResponse(response_data, status=response.status_code)
        
    except json.JSONDecodeError:
        return JsonResponse({
            'error': 'Invalid JSON in request body'
        }, status=400)
    except requests.RequestException as e:
        logger.error(f"Orchestrate API request failed: {e}")
        return JsonResponse({
            'error': 'External API request failed',
            'details': str(e)
        }, status=500)
    except Exception as e:
        logger.error(f"Orchestrate proxy error: {e}")
        return JsonResponse({
            'error': 'Internal server error',
            'details': str(e)
        }, status=500)


def send_websocket_update(session_id, data):
    """
    WebSocket을 통해 업데이트 전송
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'orchestrate_{session_id}',
                {
                    'type': 'orchestrate_message',
                    'message': data
                }
            )
            logger.info(f"WebSocket update sent to session {session_id}: {data}")
        else:
            logger.warning("Channel layer not configured")
    except Exception as e:
        logger.error(f"Failed to send WebSocket update: {e}")


@method_decorator(csrf_exempt, name='dispatch')
class WebSocketUpdateView(APIView):
    """
    외부 서버가 WebSocket 업데이트를 보낼 수 있는 엔드포인트
    grnd.bimatrix.co.kr/django/api/websocket/orchestrate/update/ 로 들어오는 요청 처리
    """
    permission_classes = [AllowAny]
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def options(self, request, *args, **kwargs):
        """CORS preflight 요청 처리"""
        return Response(status=status.HTTP_200_OK)
    
    @swagger_auto_schema(
        operation_description="외부 서버에서 WebSocket 단계별 업데이트를 전송하는 엔드포인트",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['session_id'],
            properties={
                'session_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='WebSocket 세션 ID (예: user_1234_task_940)'
                ),
                'step_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='현재 단계 이름 (예: monitoring, analysis)'
                ),
                'content': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='단계별 업데이트 내용 (Markdown 형식)'
                ),
                'end_time': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='완료 시간 (ISO 8601 형식)'
                ),
                'status': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='단계 상태 (completed, in_progress, error)'
                ),
                'progress': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='진행률 (0-100)'
                )
            },
            example={
                "session_id": "user_1234_task_940",
                "step_name": "monitoring",
                "content": "## 🔍 모니터링 완료\n\n**시스템 상태:** 정상\n**검출된 이슈:** 없음",
                "end_time": "2025-09-03T10:45:30Z",
                "status": "completed",
                "progress": 100
            }
        ),
        responses={
            200: openapi.Response(
                description="WebSocket 업데이트 전송 성공",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: openapi.Response(description="잘못된 요청"),
            500: openapi.Response(description="서버 오류")
        }
    )
    def post(self, request):
        """
        WebSocket 단계별 업데이트 전송
        """
        try:
            data = request.data
            session_id = data.get('session_id')
            
            if not session_id:
                return Response({
                    'error': 'session_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # WebSocket으로 업데이트 전송
            send_websocket_update(session_id, {
                'type': 'step_update',
                'step_name': data.get('step_name'),
                'content': data.get('content'),
                'end_time': data.get('end_time'),
                'status': data.get('status', 'completed'),
                'progress': data.get('progress', 100)
            })
            
            return Response({
                'status': 'success',
                'message': 'WebSocket update sent'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"WebSocket update endpoint error: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 기존 함수 기반 뷰는 호환성을 위해 유지
@csrf_exempt
@require_http_methods(["POST"])
def websocket_update_endpoint(request):
    """
    레거시 지원을 위한 함수 기반 엔드포인트
    """
    view = WebSocketUpdateView.as_view()
    return view(request)
