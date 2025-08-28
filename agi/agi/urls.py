"""
URL configuration for agi project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from proxy import views as proxy_views
from agiApp import views as agi_views

urlpatterns = [
    path('', agi_views.landing, name='landing'),  # 루트는 랜딩 페이지
    path('django/', include('agiApp.urls')),
    path('django/admin/', admin.site.urls),
    
    # API 엔드포인트들 - 더 구체적인 것부터 먼저 배치
    path('django/api/generate/', include('proxy.urls')),  # 프록시를 통한 외부 API 연결
    path('django/api/vi/orchestrate/', proxy_views.proxy_orchestrate, name='proxy-orchestrate'),  # orchestrate API 프록시
    
    # 도구 관리 API - 직접 뷰 함수 매핑
    path('django/api/tools/', proxy_views.proxy_api, {'path': 'api/tools'}, name='proxy-tools-list'),
    path('django/api/tools/<str:tool_name>/', proxy_views.proxy_tool_detail, name='proxy-tool-detail'),
    
    # 에이전트 관리 API - 외부 서버로 프록시
    path('django/api/agents/', proxy_views.proxy_api, {'path': 'api/agents'}, name='proxy-agents-list'),
    path('django/api/agents/<str:agent_name>/invoke', proxy_views.proxy_agent_invoke, name='proxy-agent-invoke'),
    path('django/api/agents/<str:agent_name>/', proxy_views.proxy_agent_detail, name='proxy-agent-detail'),
    
    path('django/api/monitoring/', include('agents.monitoring_agent.urls')),
    path('django/api/prediction/', include('agents.prediction_agent.urls')),
    path('django/api/control/', include('agents.control_agent.urls')),
    path('django/api/orchestration/', include('agents.orchestration_agent.urls')),
    
    path('django/api/', include('agiApp.urls')),  # 일반적인 API는 마지막에
]

# 개발 환경에서 미디어 파일 서빙
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
