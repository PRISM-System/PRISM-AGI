from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json
import uuid


class UserActivityLog(models.Model):
    ACTION_TYPES = [
        ('agent_create', '에이전트 생성'),
        ('agent_delete', '에이전트 삭제'),
        ('tool_register', '도구 등록'),
        ('tool_delete', '도구 삭제'),
        ('chat_query', '자연어 질의'),
        ('session_create', '채팅 세션 생성'),
        ('session_delete', '채팅 세션 삭제'),
        ('session_rename', '채팅 세션 이름 변경'),
        ('orchestrate_error', '에이전트 연결 실패'),
        ('system_error', '시스템 오류'),
    ]
    
    LEVEL_CHOICES = [
        ('INFO', '정보'),
        ('WARNING', '경고'),
        ('ERROR', '오류'),
        ('DEBUG', '디버그'),
    ]
    
    user_id = models.CharField(max_length=100)  # 기관별 사용자 ID
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default='INFO')
    message = models.TextField()
    details = models.JSONField(default=dict, blank=True)  # 추가 세부 정보
    timestamp = models.DateTimeField(default=timezone.now)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user_id', 'action_type']),
            models.Index(fields=['timestamp']),
            models.Index(fields=['level']),
        ]
    
    def __str__(self):
        return f"{self.get_action_type_display()} - {self.message[:50]}"
    
    @classmethod
    def log_activity(cls, action_type, message, level='INFO', details=None, user_id=None, request=None):
        """활동 로그 생성 헬퍼 메서드"""
        if not user_id:
            # user_id가 제공되지 않으면 기본값 사용
            user_id = 'user_1234'
            
        log_data = {
            'user_id': user_id,
            'action_type': action_type,
            'level': level,
            'message': message,
            'details': details or {},
        }
        
        if request:
            log_data['ip_address'] = cls.get_client_ip(request)
            log_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        return cls.objects.create(**log_data)
    
    @staticmethod
    def get_client_ip(request):
        """클라이언트 IP 주소 추출"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ChatSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.CharField(max_length=100)  # 기관별 사용자 ID
    title = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title or 'New Chat'} - {self.user_id}"
    
    def save(self, *args, **kwargs):
        if not self.title:
            # 첫 번째 메시지가 있으면 그것을 제목으로 사용
            first_message = self.messages.filter(role='user').first()
            if first_message:
                self.title = first_message.content[:50] + ('...' if len(first_message.content) > 50 else '')
            else:
                self.title = f"Chat {self.created_at.strftime('%m/%d %H:%M')}"
        super().save(*args, **kwargs)


class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    session_user_id = models.CharField(max_length=100, blank=True, help_text="user_1234_task_숫자 형식")
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)  # 추가 정보 저장용
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."
    
    def save(self, *args, **kwargs):
        # session_user_id가 없으면 자동 생성
        if not self.session_user_id:
            self.session_user_id = self.generate_session_user_id()
        super().save(*args, **kwargs)
    
    def generate_session_user_id(self):
        """session_user_id 자동 생성: {user_id}_task_숫자 형식"""
        # session의 user_id 사용 (기관별 user_id)
        user_id = self.session.user_id
        
        # 현재 session에서 가장 큰 task 번호 찾기
        last_message = ChatMessage.objects.filter(
            session=self.session,
            session_user_id__startswith=f"{user_id}_task_"
        ).order_by('-id').first()
        
        if last_message and last_message.session_user_id:
            try:
                # session_user_id에서 task 번호 추출
                parts = last_message.session_user_id.split('_')
                if len(parts) >= 3 and parts[2] == 'task':
                    last_task_num = int(parts[3])
                    next_task_num = last_task_num + 1
                else:
                    next_task_num = 1
            except (ValueError, IndexError):
                next_task_num = 1
        else:
            next_task_num = 1
        
        return f"{user_id}_task_{next_task_num}"