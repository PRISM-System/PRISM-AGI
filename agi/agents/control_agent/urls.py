from django.urls import path
from . import views

app_name = 'control_agent'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/commands/', views.get_commands, name='get_commands'),
    path('api/commands/create/', views.create_command, name='create_command'),
    path('api/commands/<str:command_id>/approve/', views.approve_command, name='approve_command'),
    path('api/systems/', views.get_systems, name='get_systems'),
]
