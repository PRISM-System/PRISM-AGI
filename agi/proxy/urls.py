"""
Proxy App URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    # /api/agents로 직접 매핑 (에이전트 관리)
    path('', views.agents_api, name='agents-api'),
    
    # /api/agents/{agent_name}으로 매핑 (특정 에이전트 삭제)
    path('<str:agent_name>/', views.agents_api, name='agents-api-detail'),
    
    # /api/agents/generate로 매핑 (텍스트 생성)
    path('generate/', views.proxy_generate, name='proxy-generate'),
    
    # /api/clients/user/tools로 매핑 (도구 등록)
    path('clients/user/tools/', views.tools_api, name='tools-api'),
]
