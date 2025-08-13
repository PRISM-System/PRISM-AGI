# agi/agiApp/urls.py
from django.urls import path
from . import views
from .views import AgentsView

urlpatterns = [
    path('', views.index, name='index'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    path('api/check-email/', views.check_email_api, name='check_email_api'),
    
    
    # ✅ 슬래시 유무 둘 다 매칭 (OPTIONS는 리다이렉트가 없어서 중요)
    path('api/agents', AgentsView.as_view(), name='agents-no-slash'),
    path('api/agents/', AgentsView.as_view(), name='agents'),
]
