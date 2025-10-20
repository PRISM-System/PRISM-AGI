"""
WebSocket URL routing for agi project.
"""

from django.urls import re_path
from agiApp import consumers

websocket_urlpatterns = [
    # FORCE_SCRIPT_NAME을 고려한 전체 경로
    re_path(r'django/agi/ws/chat/(?P<session_id>[\w\-_]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'django/agi/ws/orchestrate/(?P<session_id>[\w\-_]+)/$', consumers.OrchestrateConsumer.as_asgi()),
    
    # 직접 접속용 (FORCE_SCRIPT_NAME이 제거된 경로)
    re_path(r'ws/chat/(?P<session_id>[\w\-_]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/orchestrate/(?P<session_id>[\w\-_]+)/$', consumers.OrchestrateConsumer.as_asgi()),
]
