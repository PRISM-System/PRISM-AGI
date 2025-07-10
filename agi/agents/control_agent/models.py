from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class ControlSystem(models.Model):
    """제어 시스템 정의"""
    SYSTEM_TYPES = [
        ('plc', 'PLC'),
        ('scada', 'SCADA'),
        ('dcs', 'DCS'),
        ('api', 'API'),
        ('mqtt', 'MQTT'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='제어 시스템 이름')
    system_type = models.CharField(max_length=20, choices=SYSTEM_TYPES, verbose_name='시스템 유형')
    description = models.TextField(verbose_name='시스템 설명')
    endpoint = models.CharField(max_length=500, verbose_name='엔드포인트')
    authentication = models.JSONField(default=dict, verbose_name='인증 정보')
    configuration = models.JSONField(default=dict, verbose_name='설정')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '제어 시스템'
        verbose_name_plural = '제어 시스템'
    
    def __str__(self):
        return self.name

class ControlCommand(models.Model):
    """제어 명령"""
    COMMAND_TYPES = [
        ('start', '시작'),
        ('stop', '정지'),
        ('adjust', '조정'),
        ('reset', '리셋'),
        ('emergency_stop', '비상 정지'),
    ]
    
    COMMAND_STATUS = [
        ('pending', '대기중'),
        ('approved', '승인됨'),
        ('executing', '실행중'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('cancelled', '취소'),
    ]
    
    command_id = models.CharField(max_length=100, unique=True, verbose_name='명령 ID')
    control_system = models.ForeignKey(ControlSystem, on_delete=models.CASCADE, verbose_name='제어 시스템')
    command_type = models.CharField(max_length=20, choices=COMMAND_TYPES, verbose_name='명령 유형')
    parameters = models.JSONField(default=dict, verbose_name='명령 파라미터')
    priority = models.IntegerField(default=1, verbose_name='우선순위')
    approval_required = models.BooleanField(default=True, verbose_name='승인 필요')
    status = models.CharField(max_length=20, choices=COMMAND_STATUS, default='pending', verbose_name='상태')
    safety_check_passed = models.BooleanField(default=False, verbose_name='안전 검사 통과')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                   related_name='approved_commands', verbose_name='승인자')
    executed_at = models.DateTimeField(null=True, blank=True, verbose_name='실행 시간')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='완료 시간')
    result = models.JSONField(default=dict, verbose_name='실행 결과')
    error_message = models.TextField(blank=True, verbose_name='오류 메시지')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '제어 명령'
        verbose_name_plural = '제어 명령'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.command_id} - {self.get_command_type_display()}"

class SafetyRule(models.Model):
    """안전 규칙"""
    RULE_TYPES = [
        ('threshold', '임계값'),
        ('sequence', '순서'),
        ('condition', '조건'),
        ('interlock', '인터록'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='규칙 이름')
    rule_type = models.CharField(max_length=20, choices=RULE_TYPES, verbose_name='규칙 유형')
    description = models.TextField(verbose_name='규칙 설명')
    conditions = models.JSONField(default=dict, verbose_name='조건')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '안전 규칙'
        verbose_name_plural = '안전 규칙'
    
    def __str__(self):
        return self.name

class ControlAction(models.Model):
    """제어 액션"""
    ACTION_TYPES = [
        ('manual', '수동'),
        ('automatic', '자동'),
        ('emergency', '비상'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='액션 이름')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES, verbose_name='액션 유형')
    description = models.TextField(verbose_name='액션 설명')
    control_system = models.ForeignKey(ControlSystem, on_delete=models.CASCADE, verbose_name='제어 시스템')
    action_config = models.JSONField(default=dict, verbose_name='액션 설정')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '제어 액션'
        verbose_name_plural = '제어 액션'
    
    def __str__(self):
        return self.name

class ControlLog(models.Model):
    """제어 로그"""
    LOG_TYPES = [
        ('command', '명령'),
        ('action', '액션'),
        ('alarm', '알람'),
        ('safety', '안전'),
    ]
    
    timestamp = models.DateTimeField(verbose_name='시간')
    log_type = models.CharField(max_length=20, choices=LOG_TYPES, verbose_name='로그 유형')
    control_system = models.ForeignKey(ControlSystem, on_delete=models.CASCADE, verbose_name='제어 시스템')
    message = models.TextField(verbose_name='메시지')
    data = models.JSONField(default=dict, verbose_name='데이터')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='사용자')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '제어 로그'
        verbose_name_plural = '제어 로그'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.timestamp} - {self.get_log_type_display()}"
