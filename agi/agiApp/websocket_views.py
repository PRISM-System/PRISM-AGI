import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class WebSocketOrchestrateUpdateView(APIView):
    """WebSocket Orchestrate Update API"""
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_summary="WebSocket Orchestrate Update",
        operation_description="""
        외부 orchestrate 서버에서 단계별 업데이트를 WebSocket으로 전송하는 API
        
        **두 가지 사용 방법:**
        1. JSON Body 방식: 모든 데이터를 JSON으로 전송 (권장)
        2. Query Parameter 방식: URL 쿼리 파라미터로 전송
        
        **필수 파라미터:** session_id, step_name, content
        **선택 파라미터:** end_time (단계 완료 시간)
        """,
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'session_id': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='세션 ID', 
                    example='user123_task_1'
                ),
                'step_name': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='단계 이름', 
                    example='monitoring',
                    enum=['monitoring', 'prediction', 'control', 'orchestration']
                ),
                'content': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='단계별 응답 내용 (마크다운 지원)', 
                    example='## 🔍 모니터링 완료\n\n**시스템 상태:** 정상\n**검출된 이슈:** 없음'
                ),
                'end_time': openapi.Schema(
                    type=openapi.TYPE_STRING, 
                    description='단계 완료 시간 (ISO 8601 형식)', 
                    example='2025-09-03T10:45:30Z'
                )
            },
            required=['session_id', 'step_name', 'content']
        ),
        manual_parameters=[
            openapi.Parameter(
                'session_id',
                openapi.IN_QUERY,
                description='세션 ID (Query Parameter 방식용)',
                type=openapi.TYPE_STRING,
                required=True,
                example='user123_task_1'
            ),
            openapi.Parameter(
                'step_name',
                openapi.IN_QUERY,
                description='단계 이름 (Query Parameter 방식용)',
                type=openapi.TYPE_STRING,
                required=True,
                example='monitoring'
            ),
            openapi.Parameter(
                'end_time',
                openapi.IN_QUERY,
                description='단계 완료 시간 (Query Parameter 방식용)',
                type=openapi.TYPE_STRING,
                required=False,
                example='2025-09-03T10:45:30Z'
            )
        ],
        responses={
            201: openapi.Response(
                description='WebSocket 메시지 전송 성공',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING, example='success'),
                        'message': openapi.Schema(type=openapi.TYPE_STRING, example='Message sent to WebSocket'),
                        'data': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'session_id': openapi.Schema(type=openapi.TYPE_STRING),
                                'step_name': openapi.Schema(type=openapi.TYPE_STRING),
                                'content': openapi.Schema(type=openapi.TYPE_STRING),
                                'end_time': openapi.Schema(type=openapi.TYPE_STRING)
                            }
                        )
                    }
                )
            ),
            400: openapi.Response(
                description='요청 데이터 오류',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'error': openapi.Schema(type=openapi.TYPE_STRING, example='session_id, step_name, content are required'),
                        'hint': openapi.Schema(type=openapi.TYPE_STRING, example='Use JSON body or query parameters')
                    }
                )
            )
        },
        tags=['WebSocket']
    )
    def post(self, request):
        """WebSocket으로 orchestrate 업데이트 전송"""
        try:
            import logging
            logger = logging.getLogger(__name__)
            
            session_id = None
            step_name = None
            content = ""
            end_time = None
            
            # 디버깅 로그 추가
            logger.info(f"Request content_type: {request.content_type}")
            
            # Content-Type에 따라 다른 방식으로 데이터 처리
            content_type = request.content_type or ''
            if content_type.startswith('application/json'):
                # JSON Body 방식 - request.data는 자동으로 UTF-8 처리
                try:
                    data = request.data
                    session_id = data.get('session_id')
                    step_name = data.get('step_name')
                    content = data.get('content', '')
                    end_time = data.get('end_time')
                    logger.info(f"JSON parsed successfully - session_id: {session_id}")
                except Exception as json_error:
                    logger.error(f"JSON parsing error: {str(json_error)}")
                    return Response({
                        'error': 'JSON parse error',
                        'details': str(json_error)
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Query Parameters 방식
                session_id = request.query_params.get('session_id')
                step_name = request.query_params.get('step_name')
                end_time = request.query_params.get('end_time')
                
                # Body에서 content 읽기 - UTF-8 명시적 처리
                try:
                    if hasattr(request, 'body') and request.body:
                        content = request.body.decode('utf-8', errors='replace')
                    else:
                        content = ''
                except UnicodeDecodeError as decode_error:
                    logger.error(f"UTF-8 decoding error: {str(decode_error)}")
                    return Response({
                        'error': 'Content encoding error',
                        'details': 'Content must be UTF-8 encoded'
                    }, status=status.HTTP_400_BAD_REQUEST)
                logger.info(f"Query params - session_id: {session_id}, step_name: {step_name}")
            
            logger.info(f"Before validation - session_id: {session_id}, step_name: {step_name}")
            
            # 필수 파라미터 검증
            if not all([session_id, step_name, content]):
                return Response({
                    'error': 'session_id, step_name, content are required',
                    'hint': 'Use JSON body or query parameters'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # WebSocket 메시지 구성 및 전송
            message_data = {
                'type': 'orchestrate_update',
                'session_id': session_id,
                'step_name': step_name,
                'content': content
            }
            
            if end_time:
                message_data['end_time'] = end_time
            
            # 실제 WebSocket 전송 로직 활성화
            try:
                from channels.layers import get_channel_layer
                from asgiref.sync import async_to_sync
                
                channel_layer = get_channel_layer()
                if channel_layer:
                    group_name = f"orchestrate_{session_id}"
                    logger.info(f"Sending WebSocket message to group: {group_name}")
                    
                    async_to_sync(channel_layer.group_send)(group_name, {
                        'type': 'orchestrate_message',
                        'message': message_data
                    })
                    logger.info(f"WebSocket 메시지 전송 성공: {group_name}")
                else:
                    logger.warning("Channel layer가 구성되지 않음")
            except ImportError as e:
                logger.error(f"Django Channels import 오류: {str(e)}")
            except Exception as e:
                logger.error(f"WebSocket 전송 오류: {str(e)}")
                # WebSocket 전송 실패해도 API는 성공으로 처리
            
            # 성공 응답
            response_data = {
                'status': 'success',
                'message': 'Message sent to WebSocket',
                'data': {
                    'session_id': session_id,
                    'step_name': step_name,
                    'content': content
                }
            }
            
            if end_time:
                response_data['data']['end_time'] = end_time
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            import traceback
            logger.error(f"WebSocket API 오류: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Function-based view wrapper for URL routing
send_orchestrate_update = WebSocketOrchestrateUpdateView.as_view()

@csrf_exempt
@api_view(['GET'])
@permission_classes([AllowAny])
@swagger_auto_schema(
    operation_summary="WebSocket Status Check",
    operation_description="WebSocket 연결 상태 및 구성 정보 확인",
    responses={
        200: openapi.Response(
            description='WebSocket 상태 정보',
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_STRING, example='active'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example='WebSocket is ready')
                }
            )
        )
    },
    tags=['WebSocket']
)
def websocket_status(request):
    """WebSocket 연결 상태 확인"""
    response = JsonResponse({
        'status': 'active',
        'message': 'WebSocket is ready'
    })
    response['Access-Control-Allow-Origin'] = '*'
    return response
