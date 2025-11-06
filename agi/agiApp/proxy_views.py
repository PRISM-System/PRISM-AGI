# -*- coding: utf-8 -*-
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
from django.utils.dateparse import parse_datetime
from .models import ChatSession, ChatMessage, OrchestrateStepUpdate

logger = logging.getLogger(__name__)

# 외부 서버 설정
ORCHESTRATE_API_BASE_URL = 'http://147.47.39.119:8100'


@csrf_exempt
@require_http_methods(["POST"])
def proxy_orchestrate(request):
    """
    Orchestrate API 전용 프록시 - 147.47.39.119:8100으로 전달
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
            # 먼저 직접적인 세션 ID로 시도
            group_name = f'orchestrate_{session_id}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'orchestrate_message',
                    'message': data
                }
            )
            logger.info(f"WebSocket update sent to session {session_id}: {data}")
            
            # 만약 session_id가 단순한 user_id 형태라면, 활성 세션에서 실제 세션 ID 찾기
            if len(session_id.split('_')) <= 2:  # user_1234 형태
                from .consumers import ACTIVE_SESSIONS
                logger.info(f"Looking for active session for user_id: {session_id}")
                logger.info(f"Available active sessions: {ACTIVE_SESSIONS}")
                
                if session_id in ACTIVE_SESSIONS:
                    real_session_id = ACTIVE_SESSIONS[session_id]
                    logger.info(f"✅ Found active session mapping: {session_id} -> {real_session_id}")
                    
                    # 실제 세션 ID로 다시 전송
                    real_group_name = f'orchestrate_{real_session_id}'
                    async_to_sync(channel_layer.group_send)(
                        real_group_name,
                        {
                            'type': 'orchestrate_message',
                            'message': data
                        }
                    )
                    logger.info(f"✅ WebSocket update sent to real session {real_session_id}: {data}")
                else:
                    logger.warning(f"❌ No active session found for user_id: {session_id}")
                    logger.info(f"💡 Hint: External server should use full session ID like 'user_1234_task_XXX'")
                    
                    # 부분 매칭 시도 (최후의 수단)
                    matching_sessions = [sid for uid, sid in ACTIVE_SESSIONS.items() if session_id in uid]
                    if matching_sessions:
                        fallback_session = matching_sessions[0]  # 첫 번째 매칭 세션 사용
                        logger.warning(f"🔄 Fallback: Using partial match {fallback_session}")
                        
                        fallback_group_name = f'orchestrate_{fallback_session}'
                        async_to_sync(channel_layer.group_send)(
                            fallback_group_name,
                            {
                                'type': 'orchestrate_message',
                                'message': data
                            }
                        )
                        logger.info(f"🔄 WebSocket update sent to fallback session {fallback_session}: {data}")
                    else:
                        logger.error(f"💥 No matching sessions found for {session_id}")
                
        else:
            logger.warning("Channel layer not configured")
    except Exception as e:
        logger.error(f"Failed to send WebSocket update: {e}")


@method_decorator(csrf_exempt, name='dispatch')
class WebSocketUpdateView(APIView):
    """
    외부 서버가 WebSocket 업데이트를 보낼 수 있는 엔드포인트
    grnd.bimatrix.co.kr/django/agi/api/websocket/orchestrate/update/ 로 들어오는 요청 처리
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
                'agent_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='담당 에이전트 이름 (예: Monitoring Agent, Prediction Agent, Control Agent, Orchestration Agent)'
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
                "agent_name": "Monitoring Agent",
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
            
            # 🔧 세션 ID 자동 보완 로직
            original_session_id = session_id
            
            # user_1234 같은 불완전한 세션 ID인 경우 활성 세션에서 완전한 ID 찾기
            if len(session_id.split('_')) <= 2:  # user_1234 형태
                from .consumers import ACTIVE_SESSIONS
                logger.info(f"🔍 불완전한 세션 ID 감지: {session_id}")
                logger.info(f"📋 활성 세션 목록: {ACTIVE_SESSIONS}")
                
                if session_id in ACTIVE_SESSIONS:
                    # 활성 세션에서 완전한 세션 ID 가져오기
                    session_id = ACTIVE_SESSIONS[session_id]
                    logger.info(f"✅ 세션 ID 자동 보완: {original_session_id} -> {session_id}")
                else:
                    logger.warning(f"❌ 활성 세션에서 {session_id}를 찾을 수 없음")
                    # 부분 매칭 시도
                    matching_sessions = [sid for uid, sid in ACTIVE_SESSIONS.items() if session_id in uid]
                    if matching_sessions:
                        session_id = matching_sessions[0]  # 첫 번째 매칭 세션 사용
                        logger.info(f"🔄 부분 매칭으로 세션 ID 보완: {original_session_id} -> {session_id}")
                    else:
                        logger.error(f"💥 매칭되는 활성 세션이 없음: {session_id}")
                        return Response({
                            'error': f'No active session found for {session_id}',
                            'available_sessions': list(ACTIVE_SESSIONS.keys())
                        }, status=status.HTTP_404_NOT_FOUND)
            
            # WebSocket으로 업데이트 전송 (이제 완전한 세션 ID 사용)
            update_data = {
                'type': 'step_update',
                'agent_name': data.get('agent_name'),
                'step_name': data.get('step_name'),
                'content': data.get('content'),
                'end_time': data.get('end_time'),
                'status': data.get('status', 'completed'),
                'progress': data.get('progress', 100)
            }
            send_websocket_update(session_id, update_data)

            # 📦 데이터베이스에 업데이트 저장 (이전 채팅 기록 재현용)
            try:
                # session_id에서 실제 UUID 세션 찾기
                # session_id 형식: user_1111_task_721
                # ChatMessage의 session_user_id와 매칭
                from .models import ChatMessage, OrchestrateStepUpdate
                import re

                # session_id에서 user_id 부분 추출 (예: user_1111_task_721 -> user_1111)
                user_id_match = re.match(r'(user_\d+)_task_\d+', session_id)

                if user_id_match:
                    user_id = user_id_match.group(1)
                    # 해당 user_id로 시작하는 가장 최근 user 메시지 찾기
                    latest_message = ChatMessage.objects.filter(
                        session_user_id__startswith=user_id,
                        role='user'
                    ).order_by('-timestamp').first()
                else:
                    # 정확히 매칭 시도
                    latest_message = ChatMessage.objects.filter(
                        session_user_id=session_id,
                        role='user'
                    ).order_by('-timestamp').first()

                if latest_message:
                    # 해당 세션의 현재 sequence 번호 확인
                    last_update = OrchestrateStepUpdate.objects.filter(
                        session=latest_message.session
                    ).order_by('-sequence').first()

                    next_sequence = (last_update.sequence + 1) if last_update else 1

                    # end_time 파싱
                    end_time_parsed = None
                    if data.get('end_time'):
                        try:
                            end_time_parsed = parse_datetime(data.get('end_time'))
                        except:
                            pass

                    # 업데이트 저장
                    OrchestrateStepUpdate.objects.create(
                        session=latest_message.session,
                        message=latest_message,
                        session_user_id=session_id,
                        agent_name=data.get('agent_name', ''),
                        step_name=data.get('step_name', ''),
                        content=data.get('content', ''),
                        status=data.get('status', 'completed'),
                        progress=data.get('progress', 100),
                        end_time=end_time_parsed,
                        sequence=next_sequence
                    )
                    logger.info(f"✅ Step update saved to DB: session={session_id}, agent={data.get('agent_name')}, step={data.get('step_name')}, seq={next_sequence}")
                else:
                    logger.warning(f"⚠️ No matching ChatMessage found for session_id={session_id}, step update not saved to DB")
            except Exception as db_error:
                logger.error(f"❌ Failed to save step update to DB: {db_error}")
                # Continue anyway - WebSocket was sent successfully

            # 성공 응답 반환
            return Response({
                'status': 'success',
                'message': 'WebSocket update sent successfully'
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
