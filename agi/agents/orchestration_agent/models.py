from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class NaturalLanguageQuery(models.Model):
    """자연어 질의"""
    query_id = models.CharField(max_length=100, unique=True, verbose_name='질의 ID')
    original_query = models.TextField(verbose_name='원본 질의')
    processed_query = models.TextField(verbose_name='처리된 질의')
    intent = models.CharField(max_length=100, verbose_name='의도')
    entities = models.JSONField(default=dict, verbose_name='개체')
    confidence_score = models.FloatField(default=0.0, verbose_name='신뢰도')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '자연어 질의'
        verbose_name_plural = '자연어 질의'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.query_id} - {self.intent}"

class AgentRecommendation(models.Model):
    """에이전트 추천"""
    query = models.ForeignKey(NaturalLanguageQuery, on_delete=models.CASCADE, verbose_name='질의')
    agent_type = models.CharField(max_length=50, verbose_name='에이전트 유형')
    agent_name = models.CharField(max_length=200, verbose_name='에이전트 이름')
    recommendation_score = models.FloatField(verbose_name='추천 점수')
    reasoning = models.TextField(verbose_name='추천 근거')
    parameters = models.JSONField(default=dict, verbose_name='파라미터')
    execution_order = models.IntegerField(verbose_name='실행 순서')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '에이전트 추천'
        verbose_name_plural = '에이전트 추천'
        ordering = ['execution_order']
    
    def __str__(self):
        return f"{self.agent_name} (점수: {self.recommendation_score})"

class OrchestrationWorkflow(models.Model):
    """오케스트레이션 워크플로우"""
    WORKFLOW_STATUS = [
        ('created', '생성'),
        ('running', '실행중'),
        ('paused', '일시정지'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('cancelled', '취소'),
    ]
    
    workflow_id = models.CharField(max_length=100, unique=True, verbose_name='워크플로우 ID')
    name = models.CharField(max_length=200, verbose_name='워크플로우 이름')
    description = models.TextField(verbose_name='설명')
    query = models.ForeignKey(NaturalLanguageQuery, on_delete=models.CASCADE, verbose_name='원본 질의')
    agent_sequence = models.JSONField(default=list, verbose_name='에이전트 순서')
    current_step = models.IntegerField(default=0, verbose_name='현재 단계')
    status = models.CharField(max_length=20, choices=WORKFLOW_STATUS, default='created', verbose_name='상태')
    execution_context = models.JSONField(default=dict, verbose_name='실행 컨텍스트')
    results = models.JSONField(default=dict, verbose_name='결과')
    estimated_completion_time = models.DateTimeField(null=True, blank=True, verbose_name='예상 완료 시간')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='시작 시간')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='완료 시간')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '오케스트레이션 워크플로우'
        verbose_name_plural = '오케스트레이션 워크플로우'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name

class AgentExecution(models.Model):
    """에이전트 실행"""
    EXECUTION_STATUS = [
        ('pending', '대기중'),
        ('running', '실행중'),
        ('completed', '완료'),
        ('failed', '실패'),
        ('skipped', '건너뜀'),
    ]
    
    workflow = models.ForeignKey(OrchestrationWorkflow, on_delete=models.CASCADE, verbose_name='워크플로우')
    agent_type = models.CharField(max_length=50, verbose_name='에이전트 유형')
    agent_name = models.CharField(max_length=200, verbose_name='에이전트 이름')
    execution_order = models.IntegerField(verbose_name='실행 순서')
    input_data = models.JSONField(default=dict, verbose_name='입력 데이터')
    output_data = models.JSONField(default=dict, verbose_name='출력 데이터')
    status = models.CharField(max_length=20, choices=EXECUTION_STATUS, default='pending', verbose_name='상태')
    execution_time = models.FloatField(null=True, blank=True, verbose_name='실행 시간(초)')
    error_message = models.TextField(blank=True, verbose_name='오류 메시지')
    started_at = models.DateTimeField(null=True, blank=True, verbose_name='시작 시간')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='완료 시간')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '에이전트 실행'
        verbose_name_plural = '에이전트 실행'
        ordering = ['execution_order']
    
    def __str__(self):
        return f"{self.agent_name} - {self.get_status_display()}"

class ExternalReference(models.Model):
    """외부 참고 자료"""
    REFERENCE_TYPES = [
        ('document', '문서'),
        ('data_source', '데이터 소스'),
        ('research_paper', '연구 논문'),
        ('manual', '매뉴얼'),
        ('regulation', '규정'),
    ]
    
    title = models.CharField(max_length=200, verbose_name='제목')
    reference_type = models.CharField(max_length=20, choices=REFERENCE_TYPES, verbose_name='참고 유형')
    url = models.URLField(blank=True, verbose_name='URL')
    content = models.TextField(blank=True, verbose_name='내용')
    metadata = models.JSONField(default=dict, verbose_name='메타데이터')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '외부 참고 자료'
        verbose_name_plural = '외부 참고 자료'
    
    def __str__(self):
        return self.title

class ConversationHistory(models.Model):
    """대화 이력"""
    session_id = models.CharField(max_length=100, verbose_name='세션 ID')
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='사용자')
    message = models.TextField(verbose_name='메시지')
    response = models.TextField(verbose_name='응답')
    intent = models.CharField(max_length=100, blank=True, verbose_name='의도')
    entities = models.JSONField(default=dict, verbose_name='개체')
    workflow = models.ForeignKey(OrchestrationWorkflow, on_delete=models.SET_NULL, 
                                null=True, blank=True, verbose_name='워크플로우')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '대화 이력'
        verbose_name_plural = '대화 이력'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.created_at}"

class WorkflowTemplate(models.Model):
    """워크플로우 템플릿"""
    name = models.CharField(max_length=200, verbose_name='템플릿 이름')
    description = models.TextField(verbose_name='설명')
    category = models.CharField(max_length=100, verbose_name='카테고리')
    agent_sequence_template = models.JSONField(default=list, verbose_name='에이전트 순서 템플릿')
    parameters_template = models.JSONField(default=dict, verbose_name='파라미터 템플릿')
    is_public = models.BooleanField(default=False, verbose_name='공개')
    usage_count = models.IntegerField(default=0, verbose_name='사용 횟수')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '워크플로우 템플릿'
        verbose_name_plural = '워크플로우 템플릿'
    
    def __str__(self):
        return self.name
