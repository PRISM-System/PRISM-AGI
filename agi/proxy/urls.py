"""
Proxy App URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    # /api/generate/로 직접 매핑 (텍스트 생성)
    path('', views.proxy_generate, name='proxy-generate'),
]
