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
from django.shortcuts import get_object_or_404
from .models import ChatSession, ChatMessage, UserActivityLog
import json


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
        새로운 에이전트 생성
        """
        try:
            # 요청 데이터 검증
            name = request.data.get('name')
            description = request.data.get('description')
            role_prompt = request.data.get('role_prompt')
            
            if not all([name, description, role_prompt]):
                return Response(
                    {"error": "name, description, role_prompt 필드가 모두 필요합니다."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 새로운 에이전트 생성 (현재는 시뮬레이션)
            new_agent = {
                "id": len(self.get_agents()) + 1,
                "name": name,
                "description": description,
                "role_prompt": role_prompt,
                "created_at": "2025-08-21T00:00:00Z",
                "status": "active"
            }
            
            # 실제로는 데이터베이스에 저장해야 함
            # 현재는 성공 응답만 반환
            return Response(
                {
                    "message": "에이전트가 성공적으로 생성되었습니다.",
                    "agent": new_agent
                },
                status=status.HTTP_201_CREATED
            )
            
        except Exception as e:
            return Response(
                {"error": "에이전트 생성 중 오류가 발생했습니다: {}".format(str(e))},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_agents(self):
        """
        기존 에이전트 목록 반환 (헬퍼 메서드)
        현재는 빈 목록을 반환
        """
        return []
    
    def get(self, request):
        """
        에이전트 목록 반환 (GET 요청)
        """
        agents = self.get_agents()
        return Response(agents, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class ChatSessionsListView(APIView):
    """
    채팅 세션 목록 관리 API - /api/chat/sessions/
    """
    permission_classes = [AllowAny]
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def get(self, request):
        """
        사용자의 채팅 세션 목록 반환
        """
        user_id = request.GET.get('user_id')
        if not user_id:
            return Response({
                'error': 'user_id 파라미터가 필요합니다.',
                'message': '기관별 사용자 식별을 위해 user_id를 제공해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        sessions = ChatSession.objects.filter(user_id=user_id, is_active=True)
        
        data = []
        for session in sessions:
            last_message = session.messages.last()
            data.append({
                'id': str(session.id),
                'title': session.title,
                'created_at': session.created_at.isoformat(),
                'updated_at': session.updated_at.isoformat(),
                'last_message': last_message.content[:100] if last_message else None,
                'message_count': session.messages.count()
            })
        
        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        새로운 채팅 세션 생성
        """
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({
                'error': 'user_id가 필요합니다.',
                'message': '기관별 사용자 식별을 위해 user_id를 제공해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        title = request.data.get('title', '')
        
        session = ChatSession.objects.create(
            user_id=user_id,
            title=title
        )
        
        return Response({
            'id': str(session.id),
            'title': session.title,
            'created_at': session.created_at.isoformat(),
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')  
class ChatSessionDetailView(APIView):
    """
    개별 채팅 세션 관리 API - /api/chat/sessions/{session_id}/
    """
    permission_classes = [AllowAny]
    http_method_names = ['get', 'post', 'put', 'delete', 'options']
    
    def dispatch(self, request, *args, **kwargs):
        # 디버깅을 위한 로그 추가
        print("ChatSessionDetailView - Method: {}, Path: {}".format(request.method, request.path))
        print("kwargs: {}".format(kwargs))
        
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def get(self, request, *args, **kwargs):
        """
        특정 채팅 세션 정보 조회
        """
        session_id = kwargs.get('session_id')
        if not session_id:
            return Response({'error': 'session_id가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = get_object_or_404(ChatSession, id=session_id)
            return Response({
                'id': str(session.id),
                'title': session.title,
                'created_at': session.created_at.isoformat(),
                'updated_at': session.updated_at.isoformat(),
                'message_count': session.messages.count()
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, *args, **kwargs):
        """
        채팅 세션 정보 수정 (제목 변경)
        """
        return self._update_session_title(request, *args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        """
        채팅 세션 정보 수정 (제목 변경) - POST 메서드로도 지원
        """
        # title_update 액션이 있는 경우에만 업데이트 처리
        if request.data.get('action') == 'update_title':
            return self._update_session_title(request, *args, **kwargs)
        else:
            return Response({'error': '지원하지 않는 액션입니다.'}, status=status.HTTP_400_BAD_REQUEST)
    
    def _update_session_title(self, request, *args, **kwargs):
        """
        실제 제목 변경 로직
        """
        session_id = kwargs.get('session_id')
        if not session_id:
            return Response({'error': 'session_id가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = get_object_or_404(ChatSession, id=session_id)
            
            # 새로운 제목 가져오기
            new_title = request.data.get('title')
            if not new_title:
                return Response({'error': '새로운 제목이 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 제목 길이 제한 (200자)
            if len(new_title) > 200:
                return Response({'error': '제목은 200자를 초과할 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 제목 업데이트
            session.title = new_title.strip()
            session.save()
            
            return Response({
                'id': str(session.id),
                'title': session.title,
                'updated_at': session.updated_at.isoformat(),
                'message': '채팅방 이름이 변경되었습니다.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, *args, **kwargs):
        """
        채팅 세션 삭제 (소프트 삭제)
        """
        session_id = kwargs.get('session_id')
        if not session_id:
            return Response({'error': 'session_id가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = get_object_or_404(ChatSession, id=session_id)
            
            # 소프트 삭제 (is_active = False)
            session.is_active = False
            session.save()
            
            return Response({'message': '채팅 세션이 삭제되었습니다.'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')  
class ChatSessionUpdateTitleView(APIView):
    """
    채팅 세션 제목 변경 전용 API - /api/chat/sessions/{session_id}/update-title/
    ASGI 서버 호환성을 위해 POST 메서드만 사용
    """
    permission_classes = [AllowAny]
    http_method_names = ['post', 'options']
    
    def dispatch(self, request, *args, **kwargs):
        # 디버깅을 위한 로그 추가
        print("ChatSessionUpdateTitleView - Method: {}, Path: {}".format(request.method, request.path))
        print("kwargs: {}".format(kwargs))
        
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        """
        채팅 세션 제목 변경
        """
        session_id = kwargs.get('session_id')
        if not session_id:
            return Response({'error': 'session_id가 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            session = get_object_or_404(ChatSession, id=session_id)
            
            # 새로운 제목 가져오기
            new_title = request.data.get('title')
            if not new_title:
                return Response({'error': '새로운 제목이 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 제목 길이 제한 (200자)
            if len(new_title) > 200:
                return Response({'error': '제목은 200자를 초과할 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # 이전 제목 백업 (로그용)
            old_title = session.title
            
            # 제목 업데이트
            session.title = new_title.strip()
            session.save()
            
            # 사용자 활동 로그 기록
            UserActivityLog.log_activity(
                action_type='session_rename',
                message='채팅방 이름을 "{}"에서 "{}"로 변경했습니다.'.format(old_title, session.title),
                level='INFO',
                details={
                    'session_id': str(session.id),
                    'old_title': old_title,
                    'new_title': session.title,
                    'user_id': session.user_id
                },
                user_id=session.user_id,
                request=request
            )
            
            return Response({
                'id': str(session.id),
                'title': session.title,
                'updated_at': session.updated_at.isoformat(),
                'message': '채팅방 이름이 변경되었습니다.'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ChatMessagesView(APIView):
    """
    채팅 메시지 관리 API
    """
    permission_classes = [AllowAny]
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Max-Age"] = "86400"
        return response
        
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def get(self, request, session_id):
        """
        특정 세션의 메시지 목록 반환
        """
        try:
            session = get_object_or_404(ChatSession, id=session_id)
            messages = session.messages.all()
            
            data = []
            for message in messages:
                data.append({
                    'id': message.id,
                    'role': message.role,
                    'content': message.content,
                    'timestamp': message.timestamp.isoformat(),
                    'metadata': message.metadata
                })
            
            return Response({
                'session_id': str(session.id),
                'session_title': session.title,
                'messages': data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def post(self, request, session_id):
        """
        세션에 새 메시지 추가
        """
        try:
            session = get_object_or_404(ChatSession, id=session_id)
            
            role = request.data.get('role')
            content = request.data.get('content')
            metadata = request.data.get('metadata', {})
            
            if not role or not content:
                return Response(
                    {'error': 'role과 content는 필수입니다.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message = ChatMessage.objects.create(
                session=session,
                role=role,
                content=content,
                metadata=metadata
            )
            
            # 첫 번째 사용자 메시지인 경우 세션 제목을 질문 내용으로 자동 설정
            if role == 'user' and (not session.title or session.title.strip() == ''):
                # 질문 내용을 제목으로 설정 (최대 50자)
                session.title = content[:50] + ('...' if len(content) > 50 else '')
                session.save()
            else:
                # 세션 업데이트 시간만 갱신
                session.save()
            
            return Response({
                'id': message.id,
                'role': message.role,
                'content': message.content,
                'timestamp': message.timestamp.isoformat(),
                'session_title': session.title
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserActivityLogsView(APIView):
    """
    사용자 활동 로그 API
    GET /api/user-logs/ - 로그 목록 조회
    POST /api/user-logs/ - 새 로그 생성
    """
    permission_classes = [AllowAny]
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def get(self, request):
        """로그 목록 조회"""
        try:
            from .models import UserActivityLog
            from django.utils import timezone

            # 쿼리 파라미터 처리
            user_id = request.GET.get('user_id')
            if not user_id:
                return Response({
                    'error': 'user_id 파라미터가 필요합니다.',
                    'message': '기관별 사용자 식별을 위해 user_id를 제공해주세요.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            action_type = request.GET.get('action_type')
            level = request.GET.get('level')
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')
            search = request.GET.get('search')
            page = int(request.GET.get('page', 1))
            per_page = int(request.GET.get('per_page', 50))
            
            # 기본 쿼리셋
            logs = UserActivityLog.objects.filter(user_id=user_id)
            
            # 필터링
            if action_type:
                logs = logs.filter(action_type=action_type)
            if level:
                logs = logs.filter(level=level)
            if start_date:
                from datetime import datetime
                start_dt = datetime.fromisoformat(start_date)
                logs = logs.filter(timestamp__gte=start_dt)
            if end_date:
                from datetime import datetime
                end_dt = datetime.fromisoformat(end_date)
                logs = logs.filter(timestamp__lte=end_dt)
            if search:
                logs = logs.filter(message__icontains=search)
            
            # 총 개수
            total_count = logs.count()
            
            # 페이지네이션
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            page_logs = logs[start_idx:end_idx]
            
            # 통계 계산
            today = timezone.now().date()
            stats = {
                'total': UserActivityLog.objects.filter(user_id=user_id).count(),
                'today': UserActivityLog.objects.filter(
                    user_id=user_id, 
                    timestamp__date=today
                ).count(),
                'warning': UserActivityLog.objects.filter(
                    user_id=user_id, 
                    level='WARNING'
                ).count(),
                'error': UserActivityLog.objects.filter(
                    user_id=user_id, 
                    level='ERROR'
                ).count(),
            }
            
            # 응답 데이터 구성
            logs_data = []
            for log in page_logs:
                logs_data.append({
                    'id': log.id,
                    'user': log.user_id,  # 사용자 정보 추가
                    'action_type': log.action_type,
                    'action_type_display': log.get_action_type_display(),
                    'level': log.level,
                    'level_display': log.get_level_display(),
                    'message': log.message,
                    'details': log.details,
                    'timestamp': log.timestamp.isoformat(),
                    'ip_address': log.ip_address,
                    'user_agent': log.user_agent,
                })
            
            return Response({
                'logs': logs_data,
                'pagination': {
                    'current_page': page,
                    'per_page': per_page,
                    'total': total_count,
                    'total_pages': (total_count + per_page - 1) // per_page
                },
                'statistics': stats
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """새 로그 생성"""
        try:
            from .models import UserActivityLog
            
            action_type = request.data.get('action_type')
            message = request.data.get('message')
            level = request.data.get('level', 'INFO')
            details = request.data.get('details', {})
            user_id = request.data.get('user_id')
            
            if not action_type or not message:
                return Response(
                    {'error': 'action_type과 message는 필수입니다.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not user_id:
                return Response({
                    'error': 'user_id가 필요합니다.',
                    'message': '기관별 사용자 식별을 위해 user_id를 제공해주세요.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            log = UserActivityLog.log_activity(
                action_type=action_type,
                message=message,
                level=level,
                details=details,
                user_id=user_id,
                request=request
            )
            
            return Response({
                'id': log.id,
                'message': '로그가 성공적으로 생성되었습니다.'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


# Swagger 문서화를 위한 임포트
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import requests
import logging

logger = logging.getLogger(__name__)

# LLM 서버 설정
LLM_SERVER = 'http://192.168.11.105:11300'
LLM_MODEL = '/root/models/openai/gpt-oss-120b'


@method_decorator(csrf_exempt, name='dispatch')
class LLMAgentView(APIView):
    """
    LLM Agent API - gpt-oss-120b 모델 호출
    192.168.11.105:11300의 OpenAI 호환 API를 프록시합니다.
    """
    permission_classes = [AllowAny]
    
    @swagger_auto_schema(
        operation_description="LLM Agent API - gpt-oss-120b 모델을 사용하여 채팅 응답 생성",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['messages'],
            properties={
                'model': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='사용할 모델 (기본값: /root/models/openai/gpt-oss-120b)',
                    default='/root/models/openai/gpt-oss-120b'
                ),
                'messages': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description='대화 메시지 배열',
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'role': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='메시지 역할 (user, assistant, system)',
                                enum=['user', 'assistant', 'system']
                            ),
                            'content': openapi.Schema(
                                type=openapi.TYPE_STRING,
                                description='메시지 내용'
                            )
                        }
                    )
                ),
                'max_tokens': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='최대 생성 토큰 수',
                    default=100
                ),
                'temperature': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='응답 다양성 (0.0 ~ 2.0)',
                    default=0.7
                ),
                'top_p': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Nucleus sampling 파라미터',
                    default=1.0
                ),
                'stream': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='스트리밍 응답 여부',
                    default=False
                )
            },
            example={
                "model": "/root/models/openai/gpt-oss-120b",
                "messages": [
                    {"role": "user", "content": "안녕하세요. 간단히 인사해주세요."}
                ],
                "max_tokens": 100,
                "temperature": 0.7
            }
        ),
        responses={
            200: openapi.Response(
                description='성공적으로 응답 생성',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'id': openapi.Schema(type=openapi.TYPE_STRING, description='응답 ID'),
                        'object': openapi.Schema(type=openapi.TYPE_STRING, description='객체 타입'),
                        'created': openapi.Schema(type=openapi.TYPE_INTEGER, description='생성 시간'),
                        'model': openapi.Schema(type=openapi.TYPE_STRING, description='사용된 모델'),
                        'choices': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            description='응답 선택지',
                            items=openapi.Schema(
                                type=openapi.TYPE_OBJECT,
                                properties={
                                    'index': openapi.Schema(type=openapi.TYPE_INTEGER),
                                    'message': openapi.Schema(
                                        type=openapi.TYPE_OBJECT,
                                        properties={
                                            'role': openapi.Schema(type=openapi.TYPE_STRING),
                                            'content': openapi.Schema(type=openapi.TYPE_STRING)
                                        }
                                    ),
                                    'finish_reason': openapi.Schema(type=openapi.TYPE_STRING)
                                }
                            )
                        ),
                        'usage': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            description='토큰 사용량',
                            properties={
                                'prompt_tokens': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'completion_tokens': openapi.Schema(type=openapi.TYPE_INTEGER),
                                'total_tokens': openapi.Schema(type=openapi.TYPE_INTEGER)
                            }
                        )
                    }
                )
            ),
            400: openapi.Response(description='잘못된 요청'),
            500: openapi.Response(description='서버 오류'),
            503: openapi.Response(description='LLM 서버 연결 실패'),
            504: openapi.Response(description='LLM 서버 타임아웃')
        }
    )
    def post(self, request):
        """
        LLM 모델에 채팅 요청을 보내고 응답을 반환합니다.
        """
        try:
            # 요청 데이터 파싱
            request_data = request.data if request.data else {}
            
            # 모델이 지정되지 않은 경우 기본 모델 사용
            if 'model' not in request_data:
                request_data['model'] = LLM_MODEL
            
            # messages 필드 검증
            if 'messages' not in request_data:
                return Response({
                    'error': 'messages field is required',
                    'details': 'Please provide messages array in the request body'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # LLM 서버로 요청 전달
            url = f"{LLM_SERVER}/v1/chat/completions"
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer TEST'
            }
            
            logger.info(f"Proxying LLM request to {url}")
            logger.info(f"Request data: {json.dumps(request_data, ensure_ascii=False)[:200]}...")
            
            # 원격 LLM 서버 호출
            remote_response = requests.post(
                url,
                json=request_data,
                headers=headers,
                timeout=60  # LLM 응답 대기 시간
            )
            
            logger.info(f"LLM server response: {remote_response.status_code}")
            
            # 응답 처리
            try:
                data = remote_response.json()
                return Response(data, status=remote_response.status_code)
            except json.JSONDecodeError:
                return Response({
                    'error': 'Failed to parse LLM server response',
                    'details': remote_response.text
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except requests.exceptions.Timeout:
            logger.error("LLM server timeout")
            return Response({
                'error': 'LLM server timeout',
                'details': 'Request to LLM server timed out',
                'llm_server': LLM_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            logger.error(f"LLM server connection failed: {e}")
            return Response({
                'error': 'LLM server connection failed',
                'details': str(e),
                'llm_server': LLM_SERVER
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error in LLM proxy: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """CORS preflight 요청 처리"""
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreAgentsView(APIView):
    """
    PRISM Core Agents API Proxy
    GET /django/agi/core/api/agents/ -> http://192.168.0.57:8000/api/agents
    
    외부 PRISM Core 서버의 에이전트 목록을 프록시합니다.
    """
    permission_classes = [AllowAny]
    
    # 외부 Core 서버 설정
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버의 에이전트 목록 조회 (192.168.0.57:8000/api/agents)",
        responses={
            200: openapi.Response(
                description='에이전트 목록',
                schema=openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'name': openapi.Schema(type=openapi.TYPE_STRING, description='에이전트 이름'),
                            'description': openapi.Schema(type=openapi.TYPE_STRING, description='에이전트 설명'),
                            'role_prompt': openapi.Schema(type=openapi.TYPE_STRING, description='에이전트 역할 프롬프트'),
                            'created_at': openapi.Schema(type=openapi.TYPE_STRING, description='생성 시간'),
                            'status': openapi.Schema(type=openapi.TYPE_STRING, description='에이전트 상태'),
                        }
                    )
                )
            ),
            503: openapi.Response(description='외부 서버 연결 실패'),
            504: openapi.Response(description='외부 서버 응답 시간 초과'),
        }
    )
    def get(self, request):
        """
        외부 Core 서버에서 에이전트 목록 조회
        """
        try:
            # 외부 API 호출
            external_url = f"{self.CORE_SERVER}/api/agents"
            logger.info(f"Proxying GET request to {external_url}")
            
            response = requests.get(
                external_url,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            logger.info(f"Core server response: {response.status_code}")
            
            # 응답 처리
            if response.status_code == 200:
                try:
                    data = response.json()
                    return Response(data, status=status.HTTP_200_OK)
                except json.JSONDecodeError:
                    logger.warning("Failed to parse JSON response, returning empty list")
                    return Response([], status=status.HTTP_200_OK)
            else:
                logger.error(f"Core server error: {response.status_code} - {response.text}")
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code,
                    'details': response.text[:200]
                }, status=response.status_code)
                
        except requests.exceptions.Timeout:
            logger.error("Core server timeout")
            return Response({
                'error': 'Core server timeout',
                'details': 'Request to Core server timed out',
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            logger.error(f"Core server connection failed: {e}")
            return Response({
                'error': 'Core server connection failed',
                'details': str(e),
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error in Core proxy: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버에 새 에이전트 생성 (192.168.0.57:8000/api/agents)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'description', 'role_prompt'],
            properties={
                'name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='에이전트 이름 (필수)',
                    example='MyAgent'
                ),
                'description': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='에이전트 설명 (필수)',
                    example='This is a helpful agent'
                ),
                'role_prompt': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='에이전트 역할 프롬프트 (필수)',
                    example='You are a helpful assistant that...'
                ),
                'tools': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description='에이전트가 사용할 도구 목록 (선택, 기본값: [])',
                    items=openapi.Schema(type=openapi.TYPE_STRING),
                    example=['tool1', 'tool2']
                ),
            }
        ),
        responses={
            201: openapi.Response(
                description='에이전트 생성 성공',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                        'agent': openapi.Schema(type=openapi.TYPE_OBJECT),
                    }
                )
            ),
            400: openapi.Response(description='잘못된 요청 (필수 필드 누락)'),
            503: openapi.Response(description='외부 서버 연결 실패'),
        }
    )
    def post(self, request):
        """
        외부 Core 서버에 새 에이전트 생성
        """
        try:
            # 요청 데이터 검증
            name = request.data.get('name', '').strip()
            description = request.data.get('description', '').strip()
            role_prompt = request.data.get('role_prompt', '').strip()
            tools = request.data.get('tools', [])
            
            # 필수 필드 검증
            if not all([name, description, role_prompt]):
                return Response({
                    'error': 'Missing required fields',
                    'details': 'name, description, role_prompt are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 요청 데이터 구성
            payload = {
                'name': name,
                'description': description,
                'role_prompt': role_prompt,
                'tools': tools
            }
            
            # 외부 API 호출
            external_url = f"{self.CORE_SERVER}/api/agents"
            logger.info(f"Proxying POST request to {external_url} with data: {payload}")
            
            response = requests.post(
                external_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            logger.info(f"Core server response: {response.status_code}")
            
            # 응답 처리
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    return Response(data, status=status.HTTP_201_CREATED)
                except json.JSONDecodeError:
                    return Response({
                        'message': '에이전트가 성공적으로 생성되었습니다.',
                        'agent': payload
                    }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Core server error: {response.status_code} - {response.text}")
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code,
                    'details': response.text[:200]
                }, status=response.status_code)
                
        except requests.exceptions.Timeout:
            logger.error("Core server timeout")
            return Response({
                'error': 'Core server timeout',
                'details': 'Request to Core server timed out',
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            logger.error(f"Core server connection failed: {e}")
            return Response({
                'error': 'Core server connection failed',
                'details': str(e),
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error in Core proxy POST: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """CORS preflight 요청 처리"""
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreAgentDetailView(APIView):
    """
    PRISM Core Agent Detail API Proxy
    DELETE /django/agi/core/api/agents/{agent_name}/ -> http://192.168.0.57:8000/api/agents/{agent_name}
    
    외부 PRISM Core 서버의 특정 에이전트를 삭제합니다.
    """
    permission_classes = [AllowAny]
    
    # 외부 Core 서버 설정
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버에서 특정 에이전트 삭제 (192.168.0.57:8000/api/agents/{agent_name})",
        responses={
            200: openapi.Response(
                description='에이전트 삭제 성공',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            404: openapi.Response(description='에이전트를 찾을 수 없음'),
            503: openapi.Response(description='외부 서버 연결 실패'),
        }
    )
    def delete(self, request, agent_name):
        """
        외부 Core 서버에서 특정 에이전트 삭제
        URL path parameter로 agent_name을 받습니다.
        """
        try:
            # 외부 API 호출
            external_url = f"{self.CORE_SERVER}/api/agents/{agent_name}"
            logger.info(f"Proxying DELETE request to {external_url}")
            
            response = requests.delete(
                external_url,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            logger.info(f"Core server response: {response.status_code}")
            
            # 응답 처리
            if response.status_code in [200, 204]:
                return Response({
                    'message': f"에이전트 '{agent_name}'가 성공적으로 삭제되었습니다."
                }, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({
                    'error': 'Agent not found',
                    'details': f"에이전트 '{agent_name}'를 찾을 수 없습니다."
                }, status=status.HTTP_404_NOT_FOUND)
            else:
                logger.error(f"Core server error: {response.status_code} - {response.text}")
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code,
                    'details': response.text[:200]
                }, status=response.status_code)
                
        except requests.exceptions.Timeout:
            logger.error("Core server timeout")
            return Response({
                'error': 'Core server timeout',
                'details': 'Request to Core server timed out',
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            logger.error(f"Core server connection failed: {e}")
            return Response({
                'error': 'Core server connection failed',
                'details': str(e),
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error in Core proxy DELETE: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """CORS preflight 요청 처리"""
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreAgentToolsView(APIView):
    """
    PRISM Core Agent Tools API Proxy
    POST /django/agi/core/api/agents/{agent_name}/tools -> http://192.168.0.57:8000/api/agents/{agent_name}/tools
    
    에이전트에 도구를 추가합니다.
    """
    permission_classes = [AllowAny]
    
    # 외부 Core 서버 설정
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버의 에이전트에 도구 추가 (192.168.0.57:8000/api/agents/{agent_name}/tools)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['agent_name', 'tool_names'],
            properties={
                'agent_name': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='에이전트 이름 (필수)',
                    example='MyAgent'
                ),
                'tool_names': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description='추가할 도구 이름 목록 (필수)',
                    items=openapi.Schema(type=openapi.TYPE_STRING),
                    example=['tool1', 'tool2']
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description='도구 추가 성공',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING),
                    }
                )
            ),
            400: openapi.Response(description='잘못된 요청 (필수 필드 누락)'),
            404: openapi.Response(description='에이전트를 찾을 수 없음'),
            503: openapi.Response(description='외부 서버 연결 실패'),
        }
    )
    def post(self, request, agent_name):
        """
        에이전트에 도구 추가
        """
        try:
            # 요청 데이터 검증
            body_agent_name = request.data.get('agent_name', '').strip()
            tool_names = request.data.get('tool_names', [])
            
            # 필수 필드 검증
            if not body_agent_name or not tool_names:
                return Response({
                    'error': 'Missing required fields',
                    'details': 'agent_name and tool_names are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # tool_names가 리스트인지 확인
            if not isinstance(tool_names, list):
                return Response({
                    'error': 'Invalid tool_names',
                    'details': 'tool_names must be an array'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 요청 데이터 구성
            payload = {
                'agent_name': body_agent_name,
                'tool_names': tool_names
            }
            
            # 외부 API 호출
            external_url = f"{self.CORE_SERVER}/api/agents/{agent_name}/tools"
            logger.info(f"Proxying POST request to {external_url} with data: {payload}")
            
            response = requests.post(
                external_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            logger.info(f"Core server response: {response.status_code}")
            
            # 응답 처리
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    return Response(data, status=status.HTTP_200_OK)
                except json.JSONDecodeError:
                    return Response({
                        'message': f"에이전트 '{agent_name}'에 도구가 추가되었습니다."
                    }, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({
                    'error': 'Agent not found',
                    'details': f"에이전트 '{agent_name}'를 찾을 수 없습니다."
                }, status=status.HTTP_404_NOT_FOUND)
            else:
                logger.error(f"Core server error: {response.status_code} - {response.text}")
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code,
                    'details': response.text[:200]
                }, status=response.status_code)
                
        except requests.exceptions.Timeout:
            logger.error("Core server timeout")
            return Response({
                'error': 'Core server timeout',
                'details': 'Request to Core server timed out',
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            logger.error(f"Core server connection failed: {e}")
            return Response({
                'error': 'Core server connection failed',
                'details': str(e),
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error in Core proxy POST tools: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """CORS preflight 요청 처리"""
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreAgentInvokeView(APIView):
    """
    PRISM Core Agent Invoke API Proxy
    POST /django/agi/core/api/agents/{agent_name}/invoke -> http://192.168.0.57:8000/api/agents/{agent_name}/invoke
    
    에이전트를 호출하여 응답을 생성합니다.
    """
    permission_classes = [AllowAny]
    
    # 외부 Core 서버 설정
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버의 에이전트 호출 (192.168.0.57:8000/api/agents/{agent_name}/invoke)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['prompt'],
            properties={
                'prompt': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='사용자 프롬프트 (필수)',
                    example='Hello, how are you?'
                ),
                'max_tokens': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='최대 토큰 수 (선택, 기본값: 1024)',
                    default=1024,
                    example=1024
                ),
                'temperature': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description='Temperature (선택, 기본값: 0.7)',
                    default=0.7,
                    example=0.7
                ),
                'stop': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description='Stop 시퀀스 (선택)',
                    items=openapi.Schema(type=openapi.TYPE_STRING),
                    example=['stop_seq']
                ),
                'use_tools': openapi.Schema(
                    type=openapi.TYPE_BOOLEAN,
                    description='도구 사용 여부 (선택, 기본값: true)',
                    default=True,
                    example=True
                ),
                'max_tool_calls': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description='최대 도구 호출 횟수 (선택, 기본값: 3)',
                    default=3,
                    example=3
                ),
                'extra_body': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='추가 바디 파라미터 (선택)',
                    example={'chat_template_kwargs': {'enable_thinking': True}}
                ),
                'user_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='사용자 ID (선택)',
                    example='user123'
                ),
                'session_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='세션 ID (선택)',
                    example='session456'
                ),
                'tool_for_use': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    description='사용할 도구 목록 (선택)',
                    items=openapi.Schema(type=openapi.TYPE_STRING),
                    example=['tool1', 'tool2']
                ),
            }
        ),
        responses={
            200: openapi.Response(
                description='에이전트 호출 성공',
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'response': openapi.Schema(type=openapi.TYPE_STRING, description='에이전트 응답'),
                    }
                )
            ),
            400: openapi.Response(description='잘못된 요청 (필수 필드 누락)'),
            404: openapi.Response(description='에이전트를 찾을 수 없음'),
            503: openapi.Response(description='외부 서버 연결 실패'),
        }
    )
    def post(self, request, agent_name):
        """
        에이전트 호출
        """
        try:
            # 요청 데이터 검증
            prompt = request.data.get('prompt', '').strip()
            
            # 필수 필드 검증
            if not prompt:
                return Response({
                    'error': 'Missing required field',
                    'details': 'prompt is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 요청 데이터 구성 (선택적 필드 포함)
            payload = {
                'prompt': prompt,
                'max_tokens': request.data.get('max_tokens', 1024),
                'temperature': request.data.get('temperature', 0.7),
                'use_tools': request.data.get('use_tools', True),
                'max_tool_calls': request.data.get('max_tool_calls', 3),
            }
            
            # 선택적 필드 추가
            if 'stop' in request.data:
                payload['stop'] = request.data['stop']
            if 'extra_body' in request.data:
                payload['extra_body'] = request.data['extra_body']
            if 'user_id' in request.data:
                payload['user_id'] = request.data['user_id']
            if 'session_id' in request.data:
                payload['session_id'] = request.data['session_id']
            if 'tool_for_use' in request.data:
                payload['tool_for_use'] = request.data['tool_for_use']
            
            # 외부 API 호출
            external_url = f"{self.CORE_SERVER}/api/agents/{agent_name}/invoke"
            logger.info(f"Proxying POST request to {external_url}")
            
            response = requests.post(
                external_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=60  # 에이전트 호출은 시간이 걸릴 수 있음
            )
            
            logger.info(f"Core server response: {response.status_code}")
            
            # 응답 처리
            if response.status_code == 200:
                try:
                    data = response.json()
                    return Response(data, status=status.HTTP_200_OK)
                except json.JSONDecodeError:
                    return Response({
                        'response': response.text
                    }, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({
                    'error': 'Agent not found',
                    'details': f"에이전트 '{agent_name}'를 찾을 수 없습니다."
                }, status=status.HTTP_404_NOT_FOUND)
            else:
                logger.error(f"Core server error: {response.status_code} - {response.text}")
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code,
                    'details': response.text[:200]
                }, status=response.status_code)
                
        except requests.exceptions.Timeout:
            logger.error("Core server timeout")
            return Response({
                'error': 'Core server timeout',
                'details': 'Request to Core server timed out (60s)',
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            logger.error(f"Core server connection failed: {e}")
            return Response({
                'error': 'Core server connection failed',
                'details': str(e),
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            logger.error(f"Unexpected error in Core proxy invoke: {e}")
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """CORS preflight 요청 처리"""
        return Response(status=status.HTTP_200_OK)


# ==================== Tools API ====================

@method_decorator(csrf_exempt, name='dispatch')
class CoreToolsView(APIView):
    """
    PRISM Core Tools API Proxy
    GET /django/agi/core/api/tools/ -> http://192.168.0.57:8000/api/tools
    POST /django/agi/core/api/tools/ -> http://192.168.0.57:8000/api/tools
    
    도구 목록 조회 및 도구 생성
    """
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버의 도구 목록 조회",
        responses={
            200: openapi.Response(
                description='도구 목록',
                schema=openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'name': openapi.Schema(type=openapi.TYPE_STRING),
                            'description': openapi.Schema(type=openapi.TYPE_STRING),
                            'tool_type': openapi.Schema(type=openapi.TYPE_STRING),
                        }
                    )
                )
            ),
            503: openapi.Response(description='외부 서버 연결 실패'),
        }
    )
    def get(self, request):
        """도구 목록 조회"""
        try:
            external_url = f"{self.CORE_SERVER}/api/tools"
            logger.info(f"Proxying GET request to {external_url}")
            
            response = requests.get(
                external_url,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            logger.info(f"Core server response: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    return Response(data, status=status.HTTP_200_OK)
                except json.JSONDecodeError:
                    return Response([], status=status.HTTP_200_OK)
            else:
                logger.error(f"Core server error: {response.status_code}")
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code
                }, status=response.status_code)
                
        except requests.exceptions.Timeout:
            return Response({
                'error': 'Core server timeout',
                'core_server': self.CORE_SERVER
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.RequestException as e:
            return Response({
                'error': 'Core server connection failed',
                'details': str(e)
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="PRISM Core 서버에 새 도구 생성",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'description', 'parameters_schema', 'tool_type'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='도구 이름 (필수)', example='my_tool'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='도구 설명 (필수)', example='A helpful tool'),
                'parameters_schema': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='파라미터 스키마 (필수)',
                    example={'type': 'object', 'properties': {'param1': {'type': 'string'}}}
                ),
                'tool_type': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description='도구 타입 (필수)',
                    enum=['database', 'api', 'calculation', 'function'],
                    example='function'
                ),
            }
        ),
        responses={
            201: openapi.Response(description='도구 생성 성공'),
            400: openapi.Response(description='잘못된 요청'),
            503: openapi.Response(description='외부 서버 연결 실패'),
        }
    )
    def post(self, request):
        """새 도구 생성"""
        try:
            name = request.data.get('name', '').strip()
            description = request.data.get('description', '').strip()
            parameters_schema = request.data.get('parameters_schema')
            tool_type = request.data.get('tool_type', '').strip()
            
            if not all([name, description, parameters_schema, tool_type]):
                return Response({
                    'error': 'Missing required fields',
                    'details': 'name, description, parameters_schema, tool_type are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            payload = {
                'name': name,
                'description': description,
                'parameters_schema': parameters_schema,
                'tool_type': tool_type
            }
            
            external_url = f"{self.CORE_SERVER}/api/tools"
            logger.info(f"Proxying POST request to {external_url}")
            
            response = requests.post(
                external_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                try:
                    data = response.json()
                    return Response(data, status=status.HTTP_201_CREATED)
                except json.JSONDecodeError:
                    return Response({'message': '도구가 생성되었습니다.'}, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Core server error',
                    'status_code': response.status_code
                }, status=response.status_code)
                
        except Exception as e:
            return Response({
                'error': 'Internal server error',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreToolsRegisterWithCodeView(APIView):
    """
    POST /django/agi/core/api/tools/register-with-code/ -> http://192.168.0.57:8000/api/tools/register-with-code
    
    코드와 함께 도구 등록
    """
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="코드와 함께 도구 등록",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['name', 'description', 'parameters_schema', 'tool_type'],
            properties={
                'name': openapi.Schema(type=openapi.TYPE_STRING, description='도구 이름 (필수)'),
                'description': openapi.Schema(type=openapi.TYPE_STRING, description='도구 설명 (필수)'),
                'parameters_schema': openapi.Schema(type=openapi.TYPE_OBJECT, description='파라미터 스키마 (필수)'),
                'tool_type': openapi.Schema(type=openapi.TYPE_STRING, description='도구 타입 (필수)', example='custom'),
                'function_code': openapi.Schema(type=openapi.TYPE_STRING, description='Python 코드 (선택)'),
                'config': openapi.Schema(type=openapi.TYPE_OBJECT, description='설정 (선택)'),
            }
        ),
        responses={
            201: openapi.Response(description='도구 등록 성공'),
            400: openapi.Response(description='잘못된 요청'),
        }
    )
    def post(self, request):
        try:
            name = request.data.get('name', '').strip()
            description = request.data.get('description', '').strip()
            parameters_schema = request.data.get('parameters_schema')
            tool_type = request.data.get('tool_type', '').strip()
            
            if not all([name, description, parameters_schema, tool_type]):
                return Response({
                    'error': 'Missing required fields'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            payload = {
                'name': name,
                'description': description,
                'parameters_schema': parameters_schema,
                'tool_type': tool_type
            }
            
            if 'function_code' in request.data:
                payload['function_code'] = request.data['function_code']
            if 'config' in request.data:
                payload['config'] = request.data['config']
            
            external_url = f"{self.CORE_SERVER}/api/tools/register-with-code"
            response = requests.post(external_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
            
            if response.status_code in [200, 201]:
                try:
                    return Response(response.json(), status=status.HTTP_201_CREATED)
                except:
                    return Response({'message': '도구가 등록되었습니다.'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'error': 'Core server error', 'status_code': response.status_code}, status=response.status_code)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreToolDetailView(APIView):
    """
    GET /django/agi/core/api/tools/{tool_name}/ -> http://192.168.0.57:8000/api/tools/{tool_name}
    DELETE /django/agi/core/api/tools/{tool_name}/ -> http://192.168.0.57:8000/api/tools/{tool_name}
    
    특정 도구 조회 및 삭제
    """
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="특정 도구 정보 조회",
        responses={
            200: openapi.Response(description='도구 정보'),
            404: openapi.Response(description='도구를 찾을 수 없음'),
        }
    )
    def get(self, request, tool_name):
        try:
            external_url = f"{self.CORE_SERVER}/api/tools/{tool_name}"
            response = requests.get(external_url, headers={'Content-Type': 'application/json'}, timeout=10)
            
            if response.status_code == 200:
                try:
                    return Response(response.json(), status=status.HTTP_200_OK)
                except:
                    return Response({'name': tool_name}, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Tool not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Core server error'}, status=response.status_code)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @swagger_auto_schema(
        operation_description="특정 도구 삭제",
        responses={
            200: openapi.Response(description='도구 삭제 성공'),
            404: openapi.Response(description='도구를 찾을 수 없음'),
        }
    )
    def delete(self, request, tool_name):
        try:
            external_url = f"{self.CORE_SERVER}/api/tools/{tool_name}"
            response = requests.delete(external_url, headers={'Content-Type': 'application/json'}, timeout=10)
            
            if response.status_code in [200, 204]:
                return Response({'message': f"도구 '{tool_name}'가 삭제되었습니다."}, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Tool not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Core server error'}, status=response.status_code)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreToolConfigView(APIView):
    """
    PUT /django/agi/core/api/tools/{tool_name}/config/ -> http://192.168.0.57:8000/api/tools/{tool_name}/config
    
    도구 설정 업데이트
    """
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="도구 설정 업데이트",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            description='설정 키-값 쌍',
            example={'key1': 'value1', 'key2': 'value2'}
        ),
        responses={
            200: openapi.Response(description='설정 업데이트 성공'),
            404: openapi.Response(description='도구를 찾을 수 없음'),
        }
    )
    def put(self, request, tool_name):
        try:
            config = request.data
            
            external_url = f"{self.CORE_SERVER}/api/tools/{tool_name}/config"
            response = requests.put(external_url, json=config, headers={'Content-Type': 'application/json'}, timeout=10)
            
            if response.status_code == 200:
                try:
                    return Response(response.json(), status=status.HTTP_200_OK)
                except:
                    return Response({'message': '설정이 업데이트되었습니다.'}, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Tool not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Core server error'}, status=response.status_code)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreToolExecuteView(APIView):
    """
    POST /django/agi/core/api/tools/execute/ -> http://192.168.0.57:8000/api/tools/execute
    
    도구 실행
    """
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="도구 실행",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['tool_name'],
            properties={
                'tool_name': openapi.Schema(type=openapi.TYPE_STRING, description='도구 이름 (필수)', example='my_tool'),
                'parameters': openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    description='도구 파라미터 (선택, 기본값: {})',
                    example={'param1': 'value1', 'param2': 'value2'}
                ),
            }
        ),
        responses={
            200: openapi.Response(description='도구 실행 성공'),
            400: openapi.Response(description='잘못된 요청'),
            404: openapi.Response(description='도구를 찾을 수 없음'),
        }
    )
    def post(self, request):
        try:
            tool_name = request.data.get('tool_name', '').strip()
            parameters = request.data.get('parameters', {})
            
            if not tool_name:
                return Response({
                    'error': 'Missing required field',
                    'details': 'tool_name is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            payload = {
                'tool_name': tool_name,
                'parameters': parameters
            }
            
            external_url = f"{self.CORE_SERVER}/api/tools/execute"
            logger.info(f"Proxying POST request to {external_url}")
            
            response = requests.post(external_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
            
            if response.status_code == 200:
                try:
                    return Response(response.json(), status=status.HTTP_200_OK)
                except:
                    return Response({'result': response.text}, status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Tool not found'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'error': 'Core server error', 'status_code': response.status_code}, status=response.status_code)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


# ==================== Database API ====================

@method_decorator(csrf_exempt, name='dispatch')
class CoreDatabaseInfoView(APIView):
    """GET /django/agi/core/api/db/ -> http://192.168.0.57:8000/api/db"""
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="데이터베이스 통계 및 정보 조회",
        tags=['Database'],
        responses={200: openapi.Response(description='데이터베이스 정보')}
    )
    def get(self, request):
        try:
            external_url = f"{self.CORE_SERVER}/api/db"
            response = requests.get(external_url, headers={'Content-Type': 'application/json'}, timeout=10)
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            return Response({'error': 'Core server error'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreDatabaseTablesView(APIView):
    """GET /django/agi/core/api/db/tables/ -> http://192.168.0.57:8000/api/db/tables"""
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="데이터베이스 테이블 목록 조회",
        tags=['Database']
    )
    def get(self, request):
        try:
            external_url = f"{self.CORE_SERVER}/api/db/tables"
            response = requests.get(external_url, headers={'Content-Type': 'application/json'}, timeout=10)
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            return Response({'error': 'Core server error'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreDatabaseTableSchemaView(APIView):
    """GET /django/agi/core/api/db/tables/{table_name}/schema/"""
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="특정 테이블의 스키마 조회",
        tags=['Database']
    )
    def get(self, request, table_name):
        try:
            external_url = f"{self.CORE_SERVER}/api/db/tables/{table_name}/schema"
            response = requests.get(external_url, headers={'Content-Type': 'application/json'}, timeout=10)
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Table not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'error': 'Core server error'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreDatabaseTableDataView(APIView):
    """GET /django/agi/core/api/db/tables/{table_name}/data/"""
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="특정 테이블의 데이터 조회",
        tags=['Database'],
        manual_parameters=[
            openapi.Parameter('limit', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=10),
            openapi.Parameter('offset', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, default=0),
            openapi.Parameter('where_clause', openapi.IN_QUERY, type=openapi.TYPE_STRING),
            openapi.Parameter('order_by', openapi.IN_QUERY, type=openapi.TYPE_STRING),
        ]
    )
    def get(self, request, table_name):
        try:
            params = {
                'limit': request.query_params.get('limit', 10),
                'offset': request.query_params.get('offset', 0)
            }
            if request.query_params.get('where_clause'):
                params['where_clause'] = request.query_params.get('where_clause')
            if request.query_params.get('order_by'):
                params['order_by'] = request.query_params.get('order_by')
            
            external_url = f"{self.CORE_SERVER}/api/db/tables/{table_name}/data"
            response = requests.get(external_url, params=params, headers={'Content-Type': 'application/json'}, timeout=10)
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Table not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'error': 'Core server error'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreDatabaseQueryView(APIView):
    """POST /django/agi/core/api/db/query/"""
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="SELECT 쿼리 실행 (SELECT만 허용)",
        tags=['Database'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['query'],
            properties={
                'query': openapi.Schema(type=openapi.TYPE_STRING, example='SELECT * FROM table_name'),
                'params': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING)),
            }
        )
    )
    def post(self, request):
        try:
            query = request.data.get('query', '').strip()
            if not query:
                return Response({'error': 'query is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            payload = {'query': query, 'params': request.data.get('params', [])}
            external_url = f"{self.CORE_SERVER}/api/db/query"
            response = requests.post(external_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
            
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            elif response.status_code == 400:
                return Response({'error': 'Invalid query (only SELECT allowed)'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Core server error'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class CoreDatabaseTableQueryView(APIView):
    """POST /django/agi/core/api/db/tables/{table_name}/query/"""
    permission_classes = [AllowAny]
    CORE_SERVER = 'http://192.168.0.57:8000'
    
    @swagger_auto_schema(
        operation_description="특정 테이블 쿼리 (조건부 조회)",
        tags=['Database'],
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'table_name': openapi.Schema(type=openapi.TYPE_STRING),
                'limit': openapi.Schema(type=openapi.TYPE_INTEGER, default=10),
                'offset': openapi.Schema(type=openapi.TYPE_INTEGER, default=0),
                'where_clause': openapi.Schema(type=openapi.TYPE_STRING),
                'order_by': openapi.Schema(type=openapi.TYPE_STRING),
            }
        )
    )
    def post(self, request, table_name):
        try:
            payload = {
                'table_name': request.data.get('table_name', table_name),
                'limit': request.data.get('limit', 10),
                'offset': request.data.get('offset', 0),
            }
            if 'where_clause' in request.data:
                payload['where_clause'] = request.data['where_clause']
            if 'order_by' in request.data:
                payload['order_by'] = request.data['order_by']
            
            external_url = f"{self.CORE_SERVER}/api/db/tables/{table_name}/query"
            response = requests.post(external_url, json=payload, headers={'Content-Type': 'application/json'}, timeout=30)
            
            if response.status_code == 200:
                return Response(response.json(), status=status.HTTP_200_OK)
            elif response.status_code == 404:
                return Response({'error': 'Table not found'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'error': 'Core server error'}, status=response.status_code)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    POST /api/login/
    기관 계정 로그인 API
    """
    permission_classes = [AllowAny]
    
    # 기관별 계정 정보
    INSTITUTION_ACCOUNTS = {
        'seoul': {'password': 'seoul1234', 'user_id': 'user_1111', 'institution': '서울대학교', 'username': 'seoul'},
        'hanyang': {'password': 'hanyang1234', 'user_id': 'user_2222', 'institution': '한양대학교', 'username': 'hanyang'},
        'sunkyunkwan': {'password': 'skku1234', 'user_id': 'user_3333', 'institution': '성균관대학교', 'username': 'sunkyunkwan'},
        'kaist': {'password': 'kaist1234', 'user_id': 'user_4444', 'institution': '카이스트', 'username': 'kaist'},
        'bimatrix': {'password': 'bimatrix1234', 'user_id': 'user_1234', 'institution': '비아이매트릭스', 'username': 'bimatrix'},
    }
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def post(self, request):
        try:
            username = request.data.get('username', '').strip().lower()
            password = request.data.get('password', '')
            
            if not username or not password:
                return Response({'success': False, 'message': '아이디와 비밀번호를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
            
            account = self.INSTITUTION_ACCOUNTS.get(username)
            
            if account and account['password'] == password:
                # 세션에 사용자 정보 저장
                request.session['user_id'] = account['user_id']
                request.session['institution'] = account['institution']
                request.session['username'] = account['username']
                request.session['is_authenticated'] = True
                
                return Response({'success': True, 'user_id': account['user_id'], 'institution': account['institution'], 'username': account['username']}, status=status.HTTP_200_OK)
            else:
                return Response({'success': False, 'message': '아이디 또는 비밀번호가 올바르지 않습니다.'}, status=status.HTTP_401_UNAUTHORIZED)
                
        except Exception as e:
            return Response({'success': False, 'message': f'로그인 처리 중 오류가 발생했습니다: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    """
    POST /api/logout/
    로그아웃 API - 세션 삭제
    """
    permission_classes = [AllowAny]
    
    def dispatch(self, request, *args, **kwargs):
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        return response
    
    def options(self, request, *args, **kwargs):
        return Response(status=status.HTTP_200_OK)
    
    def post(self, request):
        """
        로그아웃 처리 - 세션 클리어
        
        Response:
        {
            "success": true,
            "message": "로그아웃되었습니다."
        }
        """
        try:
            # 세션 전체 삭제
            request.session.flush()
            
            return Response({
                'success': True,
                'message': '로그아웃되었습니다.'
            }, status=status.HTTP_200_OK)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': f'로그아웃 처리 중 오류가 발생했습니다: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
