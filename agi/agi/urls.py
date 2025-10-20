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
from agiApp import proxy_views as agi_proxy_views
from agiApp import api_views  # Core API views 추가

# Swagger 설정
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="PRISM-AGI API",
      default_version='v1',
      description="PRISM-AGI WebSocket 및 Orchestrate API 문서",
      contact=openapi.Contact(email="admin@prism-agi.com"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
   url='https://grnd.bimatrix.co.kr/',  # 프록시 서버 URL로 설정
)

urlpatterns = [
    path('', agi_views.landing, name='landing'),  # 루트는 랜딩 페이지
    path('', include('agiApp.urls')),
    path('admin/', admin.site.urls),
    
    # Swagger API 문서
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API 엔드포인트들 - 더 구체적인 것부터 먼저 배치
    path('llm_agent/', proxy_views.proxy_llm_agent, name='proxy-llm-agent'),  # LLM Agent API (192.168.11.105:11300)
    path('api/generate/', include('proxy.urls')),  # 프록시를 통한 외부 API 연결
    path('api/v1/orchestrate/', agi_proxy_views.proxy_orchestrate, name='proxy-orchestrate'),  # orchestrate API 프록시
    
    # WebSocket API 엔드포인트 - 외부에서 단계별 업데이트를 받는 엔드포인트
    path('api/websocket/orchestrate/update/', agi_proxy_views.WebSocketUpdateView.as_view(), name='websocket_update_endpoint'),
    
    # PRISM-Core API - Agents (새로운 API)
    path('core/api/agents/', include([
        path('', api_views.CoreAgentsView.as_view(), name='prism_core_api'),
        path('<str:agent_name>/', api_views.CoreAgentDetailView.as_view(), name='prism_core_api_detail'),
        path('<str:agent_name>/tools/', api_views.CoreAgentToolsView.as_view(), name='prism_core_api_tools'),
        path('<str:agent_name>/invoke/', api_views.CoreAgentInvokeView.as_view(), name='prism_core_api_invoke'),
    ])),
    
    # PRISM-Core API - Tools (새로운 API)
    path('core/api/tools/', include([
        path('', api_views.CoreToolsView.as_view(), name='prism_core_tools'),
        path('register-with-code/', api_views.CoreToolsRegisterWithCodeView.as_view(), name='prism_core_tools_register_code'),
        path('execute/', api_views.CoreToolExecuteView.as_view(), name='prism_core_tools_execute'),
        path('<str:tool_name>/', api_views.CoreToolDetailView.as_view(), name='prism_core_tools_detail'),
        path('<str:tool_name>/config/', api_views.CoreToolConfigView.as_view(), name='prism_core_tools_config'),
    ])),
    
    # PRISM-Core API - Database (새로운 API)
    path('core/api/db/', include([
        path('', api_views.CoreDatabaseInfoView.as_view(), name='prism_core_db_info'),
        path('tables/', api_views.CoreDatabaseTablesView.as_view(), name='prism_core_db_tables'),
        path('tables/<str:table_name>/schema/', api_views.CoreDatabaseTableSchemaView.as_view(), name='prism_core_db_table_schema'),
        path('tables/<str:table_name>/data/', api_views.CoreDatabaseTableDataView.as_view(), name='prism_core_db_table_data'),
        path('query/', api_views.CoreDatabaseQueryView.as_view(), name='prism_core_db_query'),
        path('tables/<str:table_name>/query/', api_views.CoreDatabaseTableQueryView.as_view(), name='prism_core_db_table_query'),
    ])),
    
    # 도구 관리 API - 외부 서버로 프록시 (192.168.0.57:8000) - 구 API, 곧 제거 예정
    path('api/tools/', proxy_views.proxy_api, {'path': 'api/tools'}, name='proxy-tools-list'),
    path('api/tools/<str:tool_name>/', proxy_views.proxy_tool_detail, name='proxy-tool-detail'),
    
    # 에이전트 관리 API - 외부 서버로 프록시 (192.168.0.57:8000)
    path('api/agents/', proxy_views.proxy_api, {'path': 'api/agents'}, name='proxy-agents-list'),
    path('api/agents/<str:agent_name>/invoke', proxy_views.proxy_agent_invoke, name='proxy-agent-invoke'),
    path('api/agents/<str:agent_name>/', proxy_views.proxy_agent_detail, name='proxy-agent-detail'),
    
    path('api/monitoring/', include('agents.monitoring_agent.urls')),
    path('api/prediction/', include('agents.prediction_agent.urls')),
    path('api/control/', include('agents.control_agent.urls')),
    path('api/orchestration/', include('agents.orchestration_agent.urls')),
]

# 개발 환경에서 미디어 파일 서빙
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
