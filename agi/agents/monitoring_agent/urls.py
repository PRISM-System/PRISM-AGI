from django.urls import path
from . import views

app_name = 'monitoring_agent'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/data/', views.get_monitoring_data, name='get_monitoring_data'),
    path('api/alerts/', views.get_anomaly_alerts, name='get_anomaly_alerts'),
    path('api/alerts/<int:alert_id>/acknowledge/', views.acknowledge_alert, name='acknowledge_alert'),
    path('api/dashboard/config/', views.get_dashboard_config, name='get_dashboard_config'),
]
