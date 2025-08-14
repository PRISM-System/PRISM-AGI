"""
Proxy App URLs
"""
from django.urls import path
from . import views

urlpatterns = [
    # /api/generate로 직접 매핑
    path('', views.proxy_generate, name='proxy-generate-root'),
]
