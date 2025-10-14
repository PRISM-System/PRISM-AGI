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
            
            # 세션 업데이트 시간 갱신
            session.save()
            
            # 첫 번째 사용자 메시지인 경우 세션 제목 업데이트
            if role == 'user' and not session.title:
                session.title = content[:50] + ('...' if len(content) > 50 else '')
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
