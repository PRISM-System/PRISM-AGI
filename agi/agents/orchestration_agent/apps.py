from django.apps import AppConfig


class OrchestrationAgentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'agents.orchestration_agent'
    verbose_name = '오케스트레이션 AI 에이전트'
    
    def ready(self):
        # 앱이 준비되었을 때 실행할 코드
        pass
