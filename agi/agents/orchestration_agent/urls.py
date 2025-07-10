from django.urls import path
from . import views

app_name = 'orchestration_agent'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/query/', views.process_query, name='process_query'),
    path('api/workflows/', views.get_workflows, name='get_workflows'),
    path('api/workflows/<str:workflow_id>/', views.get_workflow_detail, name='get_workflow_detail'),
    path('api/chat/', views.chat_interface, name='chat_interface'),
]
