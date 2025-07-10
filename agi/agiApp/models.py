from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

# AI 에이전트 유형 정의
class AgentType(models.Model):
    AGENT_TYPES = [
        ('monitoring', '모니터링 AI 에이전트'),
        ('prediction', '예측 AI 에이전트'),
        ('control', '자율제어 AI 에이전트'),
        ('orchestration', '오케스트레이션 AI 에이전트'),
    ]
    
    name = models.CharField(max_length=100, choices=AGENT_TYPES, unique=True)
    description = models.TextField()
    template_config = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.get_name_display()

# LLM 모델 관리
class LLMModel(models.Model):
    MODEL_PROVIDERS = [
        ('openai', 'OpenAI'),
        ('anthropic', 'Anthropic'),
        ('google', 'Google'),
        ('local', 'Local Model'),
    ]
    
    name = models.CharField(max_length=100)
    provider = models.CharField(max_length=50, choices=MODEL_PROVIDERS)
    version = models.CharField(max_length=50)
    api_key = models.CharField(max_length=500, blank=True)
    endpoint = models.URLField(blank=True)
    performance_score = models.FloatField(default=0.0)
    cost_per_token = models.DecimalField(max_digits=10, decimal_places=6, default=0.0)
    max_tokens = models.IntegerField(default=4096)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.provider} - {self.name}"

# AI 에이전트 정의
class Agent(models.Model):
    STATUS_CHOICES = [
        ('draft', '초안'),
        ('configured', '설정완료'),
        ('testing', '테스트중'),
        ('active', '활성'),
        ('inactive', '비활성'),
        ('error', '오류'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    agent_type = models.ForeignKey(AgentType, on_delete=models.CASCADE)
    llm_model = models.ForeignKey(LLMModel, on_delete=models.CASCADE)
    configuration = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

# 센서 및 외부 시스템 인터페이스
class ExternalInterface(models.Model):
    INTERFACE_TYPES = [
        ('sensor', '센서'),
        ('scada', 'SCADA'),
        ('api', 'API'),
        ('database', '데이터베이스'),
        ('mqtt', 'MQTT'),
    ]
    
    name = models.CharField(max_length=100)
    interface_type = models.CharField(max_length=20, choices=INTERFACE_TYPES)
    endpoint = models.CharField(max_length=500)
    authentication = models.JSONField(default=dict)
    configuration = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.get_interface_type_display()})"

# 에이전트 실행 작업
class AgentTask(models.Model):
    TASK_STATUS = [
        ('pending', '대기중'),
        ('running', '실행중'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('cancelled', '취소'),
    ]
    
    agent = models.ForeignKey(Agent, on_delete=models.CASCADE)
    task_id = models.CharField(max_length=100, unique=True)
    input_data = models.JSONField(default=dict)
    output_data = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=TASK_STATUS, default='pending')
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    execution_time = models.FloatField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.agent.name} - {self.task_id}"

# 시스템 알림
class SystemNotification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', '정보'),
        ('warning', '경고'),
        ('error', '오류'),
        ('success', '성공'),
    ]
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

# 규정 및 정책
class Regulation(models.Model):
    REGULATION_TYPES = [
        ('safety', '안전 규정'),
        ('legal', '법적 규정'),
        ('policy', '내부 정책'),
        ('standard', '표준'),
    ]
    
    title = models.CharField(max_length=200)
    regulation_type = models.CharField(max_length=20, choices=REGULATION_TYPES)
    content = models.TextField()
    version = models.CharField(max_length=50)
    effective_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title

# 시스템 로그
class SystemLog(models.Model):
    LOG_LEVELS = [
        ('debug', 'DEBUG'),
        ('info', 'INFO'),
        ('warning', 'WARNING'),
        ('error', 'ERROR'),
        ('critical', 'CRITICAL'),
    ]
    
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=20, choices=LOG_LEVELS)
    module = models.CharField(max_length=100)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    agent = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.timestamp} - {self.level} - {self.module}"
