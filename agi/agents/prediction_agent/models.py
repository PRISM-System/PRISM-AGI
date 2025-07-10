from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class PredictionModel(models.Model):
    """예측 모델 정의"""
    MODEL_TYPES = [
        ('timeseries', '시계열 예측'),
        ('regression', '회귀 예측'),
        ('classification', '분류 예측'),
        ('anomaly', '이상 예측'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='모델 이름')
    model_type = models.CharField(max_length=20, choices=MODEL_TYPES, verbose_name='모델 유형')
    description = models.TextField(verbose_name='모델 설명')
    algorithm = models.CharField(max_length=100, verbose_name='알고리즘')
    parameters = models.JSONField(default=dict, verbose_name='모델 파라미터')
    training_data_source = models.CharField(max_length=200, verbose_name='학습 데이터 소스')
    accuracy_score = models.FloatField(default=0.0, verbose_name='정확도')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '예측 모델'
        verbose_name_plural = '예측 모델'
    
    def __str__(self):
        return self.name

class PredictionRequest(models.Model):
    """예측 요청"""
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('processing', '처리중'),
        ('completed', '완료'),
        ('failed', '실패'),
    ]
    
    request_id = models.CharField(max_length=100, unique=True, verbose_name='요청 ID')
    model = models.ForeignKey(PredictionModel, on_delete=models.CASCADE, verbose_name='예측 모델')
    target_variable = models.CharField(max_length=100, verbose_name='예측 대상')
    sensor_locations = models.JSONField(default=list, verbose_name='센서 위치')
    time_range_start = models.DateTimeField(verbose_name='시작 시간')
    time_range_end = models.DateTimeField(verbose_name='종료 시간')
    prediction_horizon = models.IntegerField(verbose_name='예측 기간(분)')
    input_data = models.JSONField(default=dict, verbose_name='입력 데이터')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='상태')
    estimated_completion_time = models.DateTimeField(null=True, blank=True, verbose_name='예상 완료 시간')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='요청자')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '예측 요청'
        verbose_name_plural = '예측 요청'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.request_id} - {self.target_variable}"

class PredictionResult(models.Model):
    """예측 결과"""
    RISK_LEVELS = [
        ('low', '낮음'),
        ('medium', '보통'),
        ('high', '높음'),
        ('critical', '심각'),
    ]
    
    request = models.OneToOneField(PredictionRequest, on_delete=models.CASCADE, verbose_name='예측 요청')
    predicted_values = models.JSONField(default=list, verbose_name='예측값')
    confidence_scores = models.JSONField(default=list, verbose_name='신뢰도')
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS, verbose_name='위험 수준')
    explanation = models.TextField(verbose_name='결과 설명')
    feature_importance = models.JSONField(default=dict, verbose_name='특성 중요도')
    recommended_actions = models.JSONField(default=list, verbose_name='권장 조치')
    reference_data = models.JSONField(default=dict, verbose_name='참고 데이터')
    accuracy_metrics = models.JSONField(default=dict, verbose_name='정확도 지표')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '예측 결과'
        verbose_name_plural = '예측 결과'
    
    def __str__(self):
        return f"{self.request.request_id} - 결과"

class PredictionScenario(models.Model):
    """예측 시나리오"""
    name = models.CharField(max_length=200, verbose_name='시나리오 이름')
    description = models.TextField(verbose_name='시나리오 설명')
    scenario_data = models.JSONField(default=dict, verbose_name='시나리오 데이터')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '예측 시나리오'
        verbose_name_plural = '예측 시나리오'
    
    def __str__(self):
        return self.name

class DataPreprocessing(models.Model):
    """데이터 전처리 설정"""
    PREPROCESSING_TYPES = [
        ('missing_value', '결측치 처리'),
        ('outlier', '이상치 처리'),
        ('normalization', '정규화'),
        ('scaling', '스케일링'),
        ('feature_engineering', '특성 공학'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='전처리 이름')
    preprocessing_type = models.CharField(max_length=30, choices=PREPROCESSING_TYPES, verbose_name='전처리 유형')
    parameters = models.JSONField(default=dict, verbose_name='전처리 파라미터')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '데이터 전처리'
        verbose_name_plural = '데이터 전처리'
    
    def __str__(self):
        return self.name
