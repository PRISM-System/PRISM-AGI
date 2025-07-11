# Generated by Django 5.2.4 on 2025-07-08 08:00

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ExternalReference',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='제목')),
                ('reference_type', models.CharField(choices=[('document', '문서'), ('data_source', '데이터 소스'), ('research_paper', '연구 논문'), ('manual', '매뉴얼'), ('regulation', '규정')], max_length=20, verbose_name='참고 유형')),
                ('url', models.URLField(blank=True, verbose_name='URL')),
                ('content', models.TextField(blank=True, verbose_name='내용')),
                ('metadata', models.JSONField(default=dict, verbose_name='메타데이터')),
                ('is_active', models.BooleanField(default=True, verbose_name='활성 상태')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': '외부 참고 자료',
                'verbose_name_plural': '외부 참고 자료',
            },
        ),
        migrations.CreateModel(
            name='NaturalLanguageQuery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query_id', models.CharField(max_length=100, unique=True, verbose_name='질의 ID')),
                ('original_query', models.TextField(verbose_name='원본 질의')),
                ('processed_query', models.TextField(verbose_name='처리된 질의')),
                ('intent', models.CharField(max_length=100, verbose_name='의도')),
                ('entities', models.JSONField(default=dict, verbose_name='개체')),
                ('confidence_score', models.FloatField(default=0.0, verbose_name='신뢰도')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='생성자')),
            ],
            options={
                'verbose_name': '자연어 질의',
                'verbose_name_plural': '자연어 질의',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='AgentRecommendation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('agent_type', models.CharField(max_length=50, verbose_name='에이전트 유형')),
                ('agent_name', models.CharField(max_length=200, verbose_name='에이전트 이름')),
                ('recommendation_score', models.FloatField(verbose_name='추천 점수')),
                ('reasoning', models.TextField(verbose_name='추천 근거')),
                ('parameters', models.JSONField(default=dict, verbose_name='파라미터')),
                ('execution_order', models.IntegerField(verbose_name='실행 순서')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('query', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='orchestration_agent.naturallanguagequery', verbose_name='질의')),
            ],
            options={
                'verbose_name': '에이전트 추천',
                'verbose_name_plural': '에이전트 추천',
                'ordering': ['execution_order'],
            },
        ),
        migrations.CreateModel(
            name='OrchestrationWorkflow',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('workflow_id', models.CharField(max_length=100, unique=True, verbose_name='워크플로우 ID')),
                ('name', models.CharField(max_length=200, verbose_name='워크플로우 이름')),
                ('description', models.TextField(verbose_name='설명')),
                ('agent_sequence', models.JSONField(default=list, verbose_name='에이전트 순서')),
                ('current_step', models.IntegerField(default=0, verbose_name='현재 단계')),
                ('status', models.CharField(choices=[('created', '생성'), ('running', '실행중'), ('paused', '일시정지'), ('completed', '완료'), ('failed', '실패'), ('cancelled', '취소')], default='created', max_length=20, verbose_name='상태')),
                ('execution_context', models.JSONField(default=dict, verbose_name='실행 컨텍스트')),
                ('results', models.JSONField(default=dict, verbose_name='결과')),
                ('estimated_completion_time', models.DateTimeField(blank=True, null=True, verbose_name='예상 완료 시간')),
                ('started_at', models.DateTimeField(blank=True, null=True, verbose_name='시작 시간')),
                ('completed_at', models.DateTimeField(blank=True, null=True, verbose_name='완료 시간')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='생성자')),
                ('query', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='orchestration_agent.naturallanguagequery', verbose_name='원본 질의')),
            ],
            options={
                'verbose_name': '오케스트레이션 워크플로우',
                'verbose_name_plural': '오케스트레이션 워크플로우',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ConversationHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('session_id', models.CharField(max_length=100, verbose_name='세션 ID')),
                ('message', models.TextField(verbose_name='메시지')),
                ('response', models.TextField(verbose_name='응답')),
                ('intent', models.CharField(blank=True, max_length=100, verbose_name='의도')),
                ('entities', models.JSONField(default=dict, verbose_name='개체')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='사용자')),
                ('workflow', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='orchestration_agent.orchestrationworkflow', verbose_name='워크플로우')),
            ],
            options={
                'verbose_name': '대화 이력',
                'verbose_name_plural': '대화 이력',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='AgentExecution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('agent_type', models.CharField(max_length=50, verbose_name='에이전트 유형')),
                ('agent_name', models.CharField(max_length=200, verbose_name='에이전트 이름')),
                ('execution_order', models.IntegerField(verbose_name='실행 순서')),
                ('input_data', models.JSONField(default=dict, verbose_name='입력 데이터')),
                ('output_data', models.JSONField(default=dict, verbose_name='출력 데이터')),
                ('status', models.CharField(choices=[('pending', '대기중'), ('running', '실행중'), ('completed', '완료'), ('failed', '실패'), ('skipped', '건너뜀')], default='pending', max_length=20, verbose_name='상태')),
                ('execution_time', models.FloatField(blank=True, null=True, verbose_name='실행 시간(초)')),
                ('error_message', models.TextField(blank=True, verbose_name='오류 메시지')),
                ('started_at', models.DateTimeField(blank=True, null=True, verbose_name='시작 시간')),
                ('completed_at', models.DateTimeField(blank=True, null=True, verbose_name='완료 시간')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('workflow', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='orchestration_agent.orchestrationworkflow', verbose_name='워크플로우')),
            ],
            options={
                'verbose_name': '에이전트 실행',
                'verbose_name_plural': '에이전트 실행',
                'ordering': ['execution_order'],
            },
        ),
        migrations.CreateModel(
            name='WorkflowTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='템플릿 이름')),
                ('description', models.TextField(verbose_name='설명')),
                ('category', models.CharField(max_length=100, verbose_name='카테고리')),
                ('agent_sequence_template', models.JSONField(default=list, verbose_name='에이전트 순서 템플릿')),
                ('parameters_template', models.JSONField(default=dict, verbose_name='파라미터 템플릿')),
                ('is_public', models.BooleanField(default=False, verbose_name='공개')),
                ('usage_count', models.IntegerField(default=0, verbose_name='사용 횟수')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='생성자')),
            ],
            options={
                'verbose_name': '워크플로우 템플릿',
                'verbose_name_plural': '워크플로우 템플릿',
            },
        ),
    ]
