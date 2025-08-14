# agi/agiApp/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('create-agent/', views.create_agent_page, name='create_agent'),
    path('manage-agents/', views.manage_agents_page, name='manage_agents'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    path('check-email/', views.check_email_api, name='check_email_api'),

    # 로그인 및 회원가입
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
]
