from django.urls import path
from . import views

app_name = 'prediction_agent'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('api/predict/', views.create_prediction, name='create_prediction'),
    path('api/predictions/', views.get_predictions, name='get_predictions'),
    path('api/predictions/<str:request_id>/', views.get_prediction_result, name='get_prediction_result'),
    path('api/models/', views.get_models, name='get_models'),
]
