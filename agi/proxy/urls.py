"""
Proxy App URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    # /api/agents로 직접 매핑
    path('', views.proxy_agents, name='proxy-agents-root'),
]
