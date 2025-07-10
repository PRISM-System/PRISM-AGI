from django.apps import AppConfig


class MonitoringAgentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'agents.monitoring_agent'
    verbose_name = '모니터링 AI 에이전트'
    
    def ready(self):
        # 앱이 준비되었을 때 실행할 코드
        pass
