from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import View
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import MonitoringData, AnomalyAlert, MonitoringDashboard
import json
from datetime import datetime, timedelta

def dashboard(request):
    """모니터링 대시보드"""
    context = {
        'title': '모니터링 AI 에이전트',
        'description': '실시간 제조 공정 모니터링 및 이상 탐지',
    }
    return render(request, 'monitoring_agent/dashboard.html', context)

@api_view(['GET'])
def get_monitoring_data(request):
    """모니터링 데이터 조회"""
    try:
        # 최근 24시간 데이터 조회
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=24)
        
        data = MonitoringData.objects.filter(
            timestamp__range=(start_time, end_time)
        ).order_by('-timestamp')[:100]
        
        result = []
        for item in data:
            result.append({
                'sensor_id': item.sensor_id,
                'sensor_name': item.sensor_name,
                'location': item.location,
                'timestamp': item.timestamp.isoformat(),
                'value': item.value,
                'unit': item.unit,
                'anomaly_type': item.anomaly_type,
                'anomaly_score': item.anomaly_score,
                'explanation': item.explanation,
            })
        
        return Response({
            'success': True,
            'data': result,
            'total_count': len(result)
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_anomaly_alerts(request):
    """이상 알림 조회"""
    try:
        alerts = AnomalyAlert.objects.filter(
            is_acknowledged=False
        ).order_by('-created_at')[:20]
        
        result = []
        for alert in alerts:
            result.append({
                'id': alert.id,
                'title': alert.title,
                'description': alert.description,
                'priority': alert.priority,
                'sensor_id': alert.monitoring_data.sensor_id,
                'sensor_name': alert.monitoring_data.sensor_name,
                'location': alert.monitoring_data.location,
                'recommended_actions': alert.recommended_actions,
                'created_at': alert.created_at.isoformat(),
            })
        
        return Response({
            'success': True,
            'data': result,
            'total_count': len(result)
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def acknowledge_alert(request, alert_id):
    """알림 확인"""
    try:
        alert = AnomalyAlert.objects.get(id=alert_id)
        alert.is_acknowledged = True
        alert.acknowledged_by = request.user
        alert.acknowledged_at = datetime.now()
        alert.save()
        
        return Response({
            'success': True,
            'message': '알림이 확인되었습니다.'
        })
    except AnomalyAlert.DoesNotExist:
        return Response({
            'success': False,
            'error': '알림을 찾을 수 없습니다.'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_dashboard_config(request):
    """대시보드 설정 조회"""
    try:
        dashboard_config = MonitoringDashboard.objects.filter(
            is_default=True
        ).first()
        
        if not dashboard_config:
            # 기본 설정 생성
            dashboard_config = MonitoringDashboard.objects.create(
                name='기본 대시보드',
                description='기본 모니터링 대시보드',
                layout_config={
                    'widgets': [
                        {'type': 'chart', 'title': '실시간 센서 데이터'},
                        {'type': 'alert', 'title': '이상 알림'},
                        {'type': 'status', 'title': '시스템 상태'},
                    ]
                },
                sensor_groups=['temperature', 'pressure', 'vibration'],
                refresh_interval=5,
                is_default=True,
                created_by=request.user
            )
        
        return Response({
            'success': True,
            'data': {
                'name': dashboard_config.name,
                'description': dashboard_config.description,
                'layout_config': dashboard_config.layout_config,
                'sensor_groups': dashboard_config.sensor_groups,
                'refresh_interval': dashboard_config.refresh_interval,
            }
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
