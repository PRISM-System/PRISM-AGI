# agi/agiApp/urls.py
from django.urls import path
from . import views
from . import api_views
from . import websocket_views
from . import test_swagger
from proxy.views import proxy_tools

urlpatterns = [
    path('', views.landing, name='landing'),  # /django/ -> landing 페이지
    path('index/', views.index, name='index'),  # /django/index/ -> 채팅 페이지
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('create-agent/', views.create_agent_page, name='create_agent'),
    path('manage-agents/', views.manage_agents_page, name='manage_agents'),
    path('register-tool/', views.register_tool_page, name='register_tool'),
    path('manage-tools/', views.manage_tools_page, name='manage_tools'),
    path('manage-regulations/', views.manage_regulations_page, name='manage_regulations'),
    path('user-logs/', views.user_logs_page, name='user_logs'),
    path('server-logs/', views.server_logs_page, name='server_logs'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    path('check-email/', views.check_email_api, name='check_email_api'),

    # 채팅 관련 API
    path('api/chat/sessions/', api_views.ChatSessionsListView.as_view(), name='chat_sessions_list_api'),
    path('api/chat/sessions/<str:session_id>/', api_views.ChatSessionDetailView.as_view(), name='chat_session_detail_api'),
    path('api/chat/sessions/<str:session_id>/messages/', api_views.ChatMessagesView.as_view(), name='chat_messages_api'),

    # 사용자 활동 로그 API
    path('api/user-logs/', api_views.UserActivityLogsView.as_view(), name='user_logs_api'),

    # 에이전트 관리 API는 프록시를 통해 외부 서버로 처리됨 (main urls.py에서 처리)
    # path('django/api/agents/', api_views.AgentsListView.as_view(), name='agents_api'),

    # 도구 관리 API (프록시를 통한 외부 API)
    path('api/tools/', proxy_tools, name='tools_api'),

    # WebSocket 상태 API (메인 WebSocket API는 main urls.py에서 처리)
    path('api/websocket/status/', websocket_views.websocket_status, name='websocket_status'),

    # Swagger 테스트 API
    path('api/test/swagger/', test_swagger.test_swagger_api, name='test_swagger_api'),

    # 서버 로그 API
    path('api/server-logs/refresh/', views.refresh_server_logs, name='refresh_server_logs_api'),
    path('api/server-logs/export/', views.export_server_logs, name='export_server_logs_api'),

    # WebSocket 테스트 페이지
    path('websocket-test/', views.websocket_test, name='websocket_test'),

    # 로그인 및 회원가입(아직 사용 안할 예정)
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
]
