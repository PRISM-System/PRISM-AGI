from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class MonitoringData(models.Model):
    """실시간 모니터링 데이터"""
    ANOMALY_TYPES = [
        ('normal', '정상'),
        ('warning', '경고'),
        ('critical', '심각'),
        ('unknown', '알 수 없음'),
    ]
    
    sensor_id = models.CharField(max_length=100, verbose_name='센서 ID')
    sensor_name = models.CharField(max_length=200, verbose_name='센서 이름')
    location = models.CharField(max_length=200, verbose_name='위치')
    timestamp = models.DateTimeField(verbose_name='측정 시간')
    value = models.FloatField(verbose_name='측정값')
    unit = models.CharField(max_length=50, verbose_name='단위', blank=True)
    anomaly_type = models.CharField(max_length=20, choices=ANOMALY_TYPES, 
                                   default='normal', verbose_name='이상 유형')
    anomaly_score = models.FloatField(default=0.0, verbose_name='이상 점수')
    threshold_min = models.FloatField(null=True, blank=True, verbose_name='최소 임계값')
    threshold_max = models.FloatField(null=True, blank=True, verbose_name='최대 임계값')
    explanation = models.TextField(blank=True, verbose_name='이상 설명')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '모니터링 데이터'
        verbose_name_plural = '모니터링 데이터'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.sensor_name} - {self.timestamp}"

class AnomalyAlert(models.Model):
    """이상 상태 알림"""
    PRIORITY_LEVELS = [
        ('low', '낮음'),
        ('medium', '보통'),
        ('high', '높음'),
        ('critical', '심각'),
    ]
    
    monitoring_data = models.ForeignKey(MonitoringData, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, verbose_name='알림 제목')
    description = models.TextField(verbose_name='알림 내용')
    priority = models.CharField(max_length=20, choices=PRIORITY_LEVELS, 
                               default='medium', verbose_name='우선순위')
    is_acknowledged = models.BooleanField(default=False, verbose_name='확인됨')
    acknowledged_by = models.ForeignKey(User, on_delete=models.SET_NULL, 
                                       null=True, blank=True, verbose_name='확인자')
    acknowledged_at = models.DateTimeField(null=True, blank=True, verbose_name='확인 시간')
    recommended_actions = models.JSONField(default=list, verbose_name='권장 조치')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = '이상 알림'
        verbose_name_plural = '이상 알림'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title

class MonitoringDashboard(models.Model):
    """모니터링 대시보드 설정"""
    name = models.CharField(max_length=200, verbose_name='대시보드 이름')
    description = models.TextField(verbose_name='설명')
    layout_config = models.JSONField(default=dict, verbose_name='레이아웃 설정')
    sensor_groups = models.JSONField(default=list, verbose_name='센서 그룹')
    refresh_interval = models.IntegerField(default=5, verbose_name='새로고침 간격(초)')
    is_default = models.BooleanField(default=False, verbose_name='기본 대시보드')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='생성자')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = '모니터링 대시보드'
        verbose_name_plural = '모니터링 대시보드'
    
    def __str__(self):
        return self.name
