# agi/agiApp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/analyze-query/', views.analyze_query, name='analyze_query'),
    path('api/workflow/<str:workflow_id>/status/', views.workflow_status, name='workflow_status'),
    path('api/alerts/recent/', views.get_recent_alerts, name='get_recent_alerts'),
    path('api/alerts/<int:alert_id>/acknowledge/', views.acknowledge_alert, name='acknowledge_alert'),
    path('api/monitoring/start/', views.start_monitoring, name='start_monitoring'),
    path('api/monitoring/stop/', views.stop_monitoring, name='stop_monitoring'),
]
