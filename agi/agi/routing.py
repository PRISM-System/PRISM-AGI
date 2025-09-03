"""
WebSocket URL routing for agi project.
"""

from django.urls import re_path
from agiApp import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<session_id>[\w\-_]+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/orchestrate/(?P<session_id>[\w\-_]+)/$', consumers.OrchestrateConsumer.as_asgi()),
]
