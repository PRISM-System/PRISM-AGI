from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import re
import uuid
import random
from datetime import datetime, timedelta
import time
import threading
from agents.monitoring_agent.models import MonitoringData, AnomalyAlert

# 임시 워크플로우 저장소 (실제로는 데이터베이스 사용)
active_workflows = {}

# 자동 모니터링 시스템
class AutoMonitoringSystem:
    """자동 모니터링 및 이상감지 시스템"""
    
    def __init__(self):
        self.monitoring_active = True
        self.alert_callbacks = []
    
    def start_monitoring(self):
        """모니터링 시작"""
        if not self.monitoring_active:
            self.monitoring_active = True
            threading.Thread(target=self._monitoring_loop, daemon=True).start()
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.monitoring_active = False
    
    def _monitoring_loop(self):
        """모니터링 루프 (실제로는 센서에서 데이터 수신)"""
        while self.monitoring_active:
            try:
                # 시뮬레이션: 센서 데이터 생성 및 이상 감지
                sensor_data = self._simulate_sensor_data()
                
                for data in sensor_data:
                    anomaly_detected = self._detect_anomaly(data)
                    if anomaly_detected:
                        self._create_alert(data, anomaly_detected)
                
                time.sleep(10)  # 10초마다 체크
            except Exception as e:
                print(f"Monitoring error: {e}")
                time.sleep(5)
    
    def _simulate_sensor_data(self):
        """센서 데이터 시뮬레이션"""
        sensors = [
            {'id': 'TEMP_001', 'name': '온도센서_01', 'location': '제조라인_A', 'unit': '°C', 'normal_range': (65, 75)},
            {'id': 'TEMP_002', 'name': '온도센서_02', 'location': '제조라인_B', 'unit': '°C', 'normal_range': (60, 70)},
            {'id': 'PRESS_001', 'name': '압력센서_01', 'location': '압축기실', 'unit': 'bar', 'normal_range': (1.0, 1.5)},
            {'id': 'VIB_001', 'name': '진동센서_01', 'location': '모터실', 'unit': 'mm/s', 'normal_range': (0, 2.5)},
        ]
        
        sensor_data = []
        for sensor in sensors:
            # 90% 확률로 정상 데이터, 10% 확률로 이상 데이터
            if random.random() < 0.9:  # 정상 데이터
                value = random.uniform(sensor['normal_range'][0], sensor['normal_range'][1])
            else:  # 이상 데이터
                if random.random() < 0.5:  # 상한값 초과
                    value = random.uniform(sensor['normal_range'][1], sensor['normal_range'][1] * 1.3)
                else:  # 하한값 미만
                    value = random.uniform(sensor['normal_range'][0] * 0.7, sensor['normal_range'][0])
            
            sensor_data.append({
                'sensor_id': sensor['id'],
                'sensor_name': sensor['name'],
                'location': sensor['location'],
                'value': round(value, 2),
                'unit': sensor['unit'],
                'normal_range': sensor['normal_range'],
                'timestamp': datetime.now()
            })
        
        return sensor_data
    
    def _detect_anomaly(self, data):
        """이상 감지 알고리즘"""
        min_val, max_val = data['normal_range']
        value = data['value']
        
        if value < min_val:
            return {
                'type': 'low_threshold',
                'severity': 'high' if value < min_val * 0.8 else 'medium',
                'description': f"값이 하한선({min_val})보다 낮습니다: {value}",
                'score': min(1.0, (min_val - value) / min_val)
            }
        elif value > max_val:
            return {
                'type': 'high_threshold', 
                'severity': 'high' if value > max_val * 1.2 else 'medium',
                'description': f"값이 상한선({max_val})보다 높습니다: {value}",
                'score': min(1.0, (value - max_val) / max_val)
            }
        
        return None
    
    def _create_alert(self, sensor_data, anomaly):
        """알림 생성 및 저장"""
        try:
            # MonitoringData 저장
            monitoring_data = MonitoringData.objects.create(
                sensor_id=sensor_data['sensor_id'],
                sensor_name=sensor_data['sensor_name'],
                location=sensor_data['location'],
                timestamp=sensor_data['timestamp'],
                value=sensor_data['value'],
                unit=sensor_data['unit'],
                anomaly_type='critical' if anomaly['severity'] == 'high' else 'warning',
                anomaly_score=anomaly['score'],
                threshold_min=sensor_data['normal_range'][0],
                threshold_max=sensor_data['normal_range'][1],
                explanation=anomaly['description']
            )
            
            # Alert 생성
            alert = AnomalyAlert.objects.create(
                monitoring_data=monitoring_data,
                title=f"{sensor_data['sensor_name']} 이상 감지",
                description=f"{anomaly['description']}\n\n원인 분석: {self._analyze_cause(sensor_data, anomaly)}\n\n권장 조치: {self._recommend_action(sensor_data, anomaly)}",
                priority=anomaly['severity']
            )
            
            # 콜백 실행 (실시간 알림)
            for callback in self.alert_callbacks:
                callback(alert)
                
            print(f"[ALERT] {alert.title}: {anomaly['description']}")
            
        except Exception as e:
            print(f"Error creating alert: {e}")
    
    def _analyze_cause(self, sensor_data, anomaly):
        """원인 분석"""
        sensor_type = sensor_data['sensor_id'].split('_')[0]
        
        if sensor_type == 'TEMP':
            if anomaly['type'] == 'high_threshold':
                return "냉각 시스템 문제, 외부 온도 상승, 또는 장비 과부하가 원인일 수 있습니다."
            else:
                return "냉각 시스템 과도 작동 또는 센서 오류가 원인일 수 있습니다."
        elif sensor_type == 'PRESS':
            if anomaly['type'] == 'high_threshold':
                return "압력 조절 밸브 문제, 시스템 막힘, 또는 압축기 과부하가 원인일 수 있습니다."
            else:
                return "압력 누수, 밸브 과도 개방, 또는 압축기 문제가 원인일 수 있습니다."
        elif sensor_type == 'VIB':
            return "베어링 마모, 정렬 불량, 또는 기계적 결함이 원인일 수 있습니다."
        
        return "추가 분석이 필요합니다."
    
    def _recommend_action(self, sensor_data, anomaly):
        """권장 조치"""
        sensor_type = sensor_data['sensor_id'].split('_')[0]
        
        if sensor_type == 'TEMP':
            if anomaly['type'] == 'high_threshold':
                return "1. 냉각 시스템 점검\n2. 장비 부하 감소\n3. 환기 시스템 확인"
            else:
                return "1. 온도 센서 점검\n2. 냉각 시스템 설정 확인"
        elif sensor_type == 'PRESS':
            if anomaly['type'] == 'high_threshold':
                return "1. 압력 조절 밸브 점검\n2. 시스템 막힘 확인\n3. 압축기 상태 점검"
            else:
                return "1. 누수 지점 확인\n2. 밸브 설정 점검\n3. 압축기 동작 확인"
        elif sensor_type == 'VIB':
            return "1. 베어링 상태 점검\n2. 정렬 상태 확인\n3. 윤활 상태 점검"
        
        return "전문가 점검이 필요합니다."
    
    def add_alert_callback(self, callback):
        """알림 콜백 추가"""
        self.alert_callbacks.append(callback)

# 전역 모니터링 시스템 인스턴스
auto_monitoring = AutoMonitoringSystem()

def index(request):
    """메인 페이지"""
    return render(request, 'index.html')

@csrf_exempt
@require_http_methods(["POST"])
def analyze_query(request):
    """자연어 질의 분석 및 AI 에이전트 추천"""
    try:
        data = json.loads(request.body)
        question = data.get('question', '').strip()
        
        if not question:
            return JsonResponse({'success': False, 'error': '질문이 비어있습니다.'})
        
        # 자연어 분석 (실제로는 LLM이나 NLP 모델 사용)
        try:
            analysis_result = analyze_natural_language(question)
            print(f"Analysis result: {analysis_result}")
        except Exception as e:
            print(f"Analysis error: {e}")
            return JsonResponse({'success': False, 'error': f'분석 중 오류 발생: {str(e)}'})
        
        # 에이전트 추천
        try:
            recommended_agents = recommend_agents(analysis_result)
            print(f"Recommended agents: {recommended_agents}")
        except Exception as e:
            print(f"Agent recommendation error: {e}")
            return JsonResponse({'success': False, 'error': f'에이전트 추천 중 오류 발생: {str(e)}'})
        
        # 워크플로우 생성
        workflow_id = str(uuid.uuid4())
        try:
            workflow = create_workflow(workflow_id, question, analysis_result, recommended_agents)
            active_workflows[workflow_id] = workflow
            print(f"Workflow created: {workflow_id}")
        except Exception as e:
            print(f"Workflow creation error: {e}")
            return JsonResponse({'success': False, 'error': f'워크플로우 생성 중 오류 발생: {str(e)}'})
        
        # 워크플로우 실행 시작 (비동기)
        threading.Thread(target=execute_workflow_async, args=(workflow_id,)).start()
        
        # 안전한 응답 데이터 구성
        response_data = {
            'success': True,
            'workflow_id': workflow_id,
            'original_question': question,
            'analysis': analysis_result.get('summary', '분석이 완료되었습니다.'),
            'recommended_agents': [agent.get('name', '알 수 없는 에이전트') for agent in recommended_agents],
            'intent': analysis_result.get('intent', 'general'),
            'entities': {
                'sensors': analysis_result.get('sensors', []),
                'risk_level': analysis_result.get('risk_level', 'low'),
                'complexity': analysis_result.get('complexity', 'medium')
            }
        }
        
        print(f"Final response: {response_data}")
        return JsonResponse(response_data)
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'JSON 파싱 오류'})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return JsonResponse({'success': False, 'error': f'예상치 못한 오류: {str(e)}'})

@require_http_methods(["GET"])
def workflow_status(request, workflow_id):
    """워크플로우 실행 상태 확인"""
    try:
        workflow = active_workflows.get(workflow_id)
        if not workflow:
            return JsonResponse({'success': False, 'error': '워크플로우를 찾을 수 없습니다.'})
        
        return JsonResponse({
            'success': True,
            'workflow': {
                'id': workflow['id'],
                'status': workflow['status'],
                'progress': workflow['progress'],
                'original_query': workflow['question'],
                'started_at': workflow.get('started_at'),
                'completed_at': workflow.get('completed_at'),
                'current_step': sum(1 for execution in workflow['executions'] if execution['status'] in ['completed', 'running']),
                'total_steps': len(workflow['executions']),
                'executions': [
                    {
                        'id': execution['id'],
                        'agent_name': execution['agent_name'],
                        'agent_type': execution['agent_type'],
                        'status': execution['status'],
                        'started_at': execution.get('started_at'),
                        'completed_at': execution.get('completed_at'),
                        'execution_time': calculate_execution_time(execution.get('started_at'), execution.get('completed_at')),
                        'output_data': execution.get('output_data', {})
                    }
                    for execution in workflow['executions']
                ]
            }
        })
        
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def analyze_natural_language(question):
    """자연어 분석 (간단한 규칙 기반 - 실제로는 LLM 사용)"""
    
    # 키워드 분석
    keywords = {
        'monitoring': ['모니터링', '감시', '상태', '체크', '확인', '검사'],
        'prediction': ['예측', '예상', '추정', '미래', '향후', '전망'],
        'control': ['제어', '조치', '조정', '수정', '개선', '자동'],
        'orchestration': ['전체', '통합', '조합', '협력', '연동', '관리']
    }
    
    # 센서/장비 키워드
    sensor_keywords = ['온도', '압력', '진동', '습도', '전력', '센서', '장비']
    
    # 위험도 키워드
    risk_keywords = ['이상', '비정상', '높', '낮', '문제', '오류', '고장']
    
    detected_categories = []
    detected_sensors = []
    risk_level = 'low'
    
    for category, words in keywords.items():
        if any(word in question for word in words):
            detected_categories.append(category)
    
    for sensor in sensor_keywords:
        if sensor in question:
            detected_sensors.append(sensor)
    
    for risk_word in risk_keywords:
        if risk_word in question:
            risk_level = 'high'
            break
    
    # 의도(intent) 결정
    if detected_categories:
        intent = detected_categories[0]
    else:
        intent = 'general'

    return {
        'summary': f"질문을 분석한 결과, {', '.join(detected_categories) if detected_categories else 'general'} 관련 작업이 필요합니다.",
        'categories': detected_categories,
        'sensors': detected_sensors,
        'risk_level': risk_level,
        'complexity': 'high' if len(detected_categories) > 2 else 'medium',
        'intent': intent
    }

def recommend_agents(analysis_result):
    """분석 결과를 바탕으로 AI 에이전트 추천"""
    
    agents = []
    categories = analysis_result.get('categories', [])
    
    # 기본적으로 모니터링 에이전트부터 시작
    if 'monitoring' in categories or analysis_result.get('risk_level') == 'high':
        agents.append({
            'name': 'Monitoring Agent',
            'type': 'monitoring',
            'priority': 1,
            'description': '시스템 상태 모니터링 및 이상 탐지'
        })
    
    # 예측 에이전트
    if 'prediction' in categories:
        agents.append({
            'name': 'Prediction Agent',
            'type': 'prediction',
            'priority': 2,
            'description': '미래 상태 예측 및 추세 분석'
        })
    
    # 제어 에이전트
    if 'control' in categories:
        agents.append({
            'name': 'Control Agent',
            'type': 'control',
            'priority': 3,
            'description': '자동 제어 및 조치 실행'
        })
    
    # 오케스트레이션 에이전트 (복잡한 작업의 경우)
    if len(categories) > 2 or 'orchestration' in categories:
        agents.append({
            'name': 'Orchestration Agent',
            'type': 'orchestration',
            'priority': 4,
            'description': '에이전트 간 협력 및 통합 관리'
        })
    
    # 기본 에이전트 (아무것도 매치되지 않은 경우)
    if not agents:
        agents.append({
            'name': 'Monitoring Agent',
            'type': 'monitoring',
            'priority': 1,
            'description': '기본 시스템 모니터링'
        })
    
    return sorted(agents, key=lambda x: x['priority'])

def create_workflow(workflow_id, question, analysis_result, recommended_agents):
    """워크플로우 생성"""
    
    return {
        'id': workflow_id,
        'question': question,
        'analysis': analysis_result,
        'status': 'created',
        'progress': 0,
        'created_at': datetime.now(),
        'started_at': None,
        'completed_at': None,
        'executions': [
            {
                'id': f"{workflow_id}_{i}",
                'agent_type': agent['type'],
                'agent_name': agent['name'],
                'parameters': agent.get('parameters', {}),
                'status': 'pending',
                'input_data': {},
                'output_data': {},
                'started_at': None,
                'completed_at': None,
                'execution_time': 0
            } for i, agent in enumerate(recommended_agents)
        ]
    }

def execute_workflow_async(workflow_id):
    """워크플로우 비동기 실행"""
    try:
        workflow = active_workflows.get(workflow_id)
        if not workflow:
            print(f"Workflow {workflow_id} not found")
            return
        
        # 워크플로우 시작
        workflow['status'] = 'running'
        workflow['started_at'] = datetime.now()
        
        total_executions = len(workflow['executions'])
        
        for i, execution in enumerate(workflow['executions']):
            # 진행률 업데이트 (시작 전)
            workflow['progress'] = int((i / total_executions) * 100)
            
            # 에이전트 실행
            execute_agent(execution, workflow)
            
            # 진행률 업데이트 (완료 후)
            workflow['progress'] = int(((i + 1) / total_executions) * 100)
            
            # 실행 간 딜레이 (실제 처리 시뮬레이션)
            time.sleep(1)
        
        # 워크플로우 완료
        workflow['status'] = 'completed'
        workflow['progress'] = 100
        workflow['completed_at'] = datetime.now()
        
        print(f"Workflow {workflow_id} completed successfully")
        
    except Exception as e:
        print(f"Error executing workflow {workflow_id}: {e}")
        workflow['status'] = 'failed'
        workflow['error'] = str(e)
        workflow['completed_at'] = datetime.now()
        
    except Exception as e:
        workflow['status'] = 'failed'
        workflow['error'] = str(e)

def simulate_agent_execution(agent_type, question):
    """에이전트 실행 시뮬레이션 (실제로는 각 에이전트의 실제 로직 호출)"""
    
    # 질문에서 센서 타입 추출
    sensor_types = []
    if '온도' in question:
        sensor_types.append('temperature')
    if '압력' in question:
        sensor_types.append('pressure')
    if '진동' in question:
        sensor_types.append('vibration')
    if '습도' in question:
        sensor_types.append('humidity')
    
    # 기본 센서 타입
    if not sensor_types:
        sensor_types = ['temperature', 'pressure']
    
    # 위험도 계산
    risk_level = 'high' if any(word in question for word in ['이상', '비정상', '높', '문제']) else 'medium'
    
    results = {
        'monitoring': {
            'summary': f'시스템 모니터링 완료: {", ".join(sensor_types)} 센서에서 {"이상 신호" if risk_level == "high" else "정상 신호"} 감지',
            'data': {
                '온도': '85.2°C' if 'temperature' in sensor_types else 'N/A',
                '압력': '1.2 bar' if 'pressure' in sensor_types else 'N/A',
                '진동': '0.5 Hz' if 'vibration' in sensor_types else 'N/A',
                '습도': '45%' if 'humidity' in sensor_types else 'N/A',
                '상태': '경고' if risk_level == 'high' else '정상'
            },
            'execution_time': '2.1초',
            'anomalies_count': 3 if risk_level == 'high' else 0,
            'risk_level': risk_level,
            'primary_sensors': sensor_types
        },
        'prediction': {
            'summary': f'예측 분석 완료: 향후 2시간 내 {"온도 상승" if "temperature" in sensor_types else "시스템 변화"} 예상',
            'data': {
                '예측값': '92.5°C' if 'temperature' in sensor_types else '1.5 bar',
                '신뢰도': '89%',
                '위험도': '중간' if risk_level == 'medium' else '높음',
                '권장 조치': '즉시 점검' if risk_level == 'high' else '정기 점검'
            },
            'execution_time': '3.7초',
            'predicted_value': 92.5 if 'temperature' in sensor_types else 1.5,
            'confidence': 0.89,
            'prediction_horizon': 120
        },
        'control': {
            'summary': f'자동 제어 완료: {"냉각 시스템" if "temperature" in sensor_types else "압력 조절"} 활성화',
            'data': {
                '조치': '냉각 팬 가동' if 'temperature' in sensor_types else '압력 밸브 조절',
                '설정값': '75°C' if 'temperature' in sensor_types else '1.0 bar',
                '현재값': '78.3°C' if 'temperature' in sensor_types else '1.1 bar',
                '상태': '정상화 중'
            },
            'execution_time': '1.8초',
            'executed_commands': 2,
            'control_status': 'active',
            'safety_checked': True
        },
        'orchestration': {
            'summary': '통합 관리 완료: 전체 시스템 최적화 및 에이전트 협력 완료',
            'data': {
                '처리된 에이전트': '3개',
                '총 처리 시간': '7.6초',
                '최적화 결과': '98%',
                '권장 사항': '정기 점검' if risk_level == 'medium' else '즉시 대응'
            },
            'execution_time': '1.2초'
        }
    }
    
    return results.get(agent_type, {
        'summary': f'{agent_type} 에이전트 실행 완료',
        'data': {'결과': '성공'},
        'execution_time': '2.0초'
    })
    """자연어 분석 (간단한 규칙 기반, 실제로는 LLM 사용)"""
    query_lower = query.lower()
    
    # 의도 분석
    intent = 'general'
    if any(word in query_lower for word in ['모니터링', '감시', '확인', '상태', '이상']):
        intent = 'monitoring'
    elif any(word in query_lower for word in ['예측', '미래', '향후', '전망', '예상']):
        intent = 'prediction'
    elif any(word in query_lower for word in ['제어', '조치', '조절', '설정', '변경']):
        intent = 'control'
    elif any(word in query_lower for word in ['분석', '종합', '전체', '통합']):
        intent = 'orchestration'
    
    # 개체 추출
    entities = {}
    
    # 센서 유형
    sensor_types = ['온도', '압력', '진동', '습도', '전류', '전압']
    for sensor_type in sensor_types:
        if sensor_type in query_lower:
            entities['sensor_type'] = sensor_type
            break
    
    # 시간 표현
    time_patterns = [
        (r'(\d+)\s*시간', 'hours'),
        (r'(\d+)\s*분', 'minutes'),
        (r'(\d+)\s*일', 'days')
    ]
    for pattern, unit in time_patterns:
        match = re.search(pattern, query)
        if match:
            entities['time_duration'] = {
                'value': int(match.group(1)),
                'unit': unit
            }
            break
    
    # 위치/장비
    locations = ['생산라인', '라인', '설비', '장비', '시스템']
    for location in locations:
        if location in query_lower:
            entities['location'] = location
            break
    
    return {
        'intent': intent,
        'entities': entities,
        'confidence': 0.85  # 실제로는 모델에서 계산
    }


def execute_agent(execution, workflow):
    """개별 AI 에이전트 실행 시뮬레이션"""
    execution['status'] = 'running'
    execution['started_at'] = datetime.now()
    
    # 실제로는 각 에이전트의 실제 로직을 호출
    time.sleep(3)  # 처리 시간 시뮬레이션
    
    agent_type = execution['agent_type']
    
    # 에이전트별 더미 결과 생성 (상세 데이터 포함)
    if agent_type == 'monitoring':
        # 실제 모니터링 데이터 조회 및 이상감지
        try:
            # 최근 1시간 동안의 데이터 조회
            end_time = datetime.now()
            start_time = end_time - timedelta(hours=1)
            
            recent_data = MonitoringData.objects.filter(
                timestamp__range=(start_time, end_time)
            ).order_by('-timestamp')
            
            # 이상 데이터 필터링
            anomalies = recent_data.filter(anomaly_type__in=['warning', 'critical'])
            
            # 센서별 상태 집계
            all_sensors = recent_data.values('sensor_id', 'sensor_name').distinct()
            sensor_status = {}
            
            for sensor in all_sensors:
                sensor_id = sensor['sensor_id']
                sensor_anomalies = anomalies.filter(sensor_id=sensor_id)
                
                if sensor_anomalies.exists():
                    latest_anomaly = sensor_anomalies.first()
                    sensor_status[sensor_id] = {
                        'name': latest_anomaly.sensor_name,
                        'status': 'abnormal',
                        'anomaly_type': latest_anomaly.anomaly_type,
                        'anomaly_score': latest_anomaly.anomaly_score,
                        'latest_value': latest_anomaly.value,
                        'threshold_min': latest_anomaly.threshold_min,
                        'threshold_max': latest_anomaly.threshold_max,
                        'explanation': latest_anomaly.explanation
                    }
                else:
                    latest_data = recent_data.filter(sensor_id=sensor_id).first()
                    if latest_data:
                        sensor_status[sensor_id] = {
                            'name': latest_data.sensor_name,
                            'status': 'normal',
                            'latest_value': latest_data.value,
                            'threshold_min': latest_data.threshold_min,
                            'threshold_max': latest_data.threshold_max
                        }
            
            # 결과 구성
            anomaly_list = []
            for anomaly in anomalies[:10]:  # 최근 10개
                anomaly_list.append({
                    'sensor_id': anomaly.sensor_id,
                    'sensor_name': anomaly.sensor_name,
                    'anomaly_type': anomaly.get_anomaly_type_display(),
                    'anomaly_score': round(anomaly.anomaly_score, 2),
                    'current_value': anomaly.value,
                    'normal_range': f"{anomaly.threshold_min}-{anomaly.threshold_max}{anomaly.unit}",
                    'detected_at': anomaly.timestamp.isoformat(),
                    'explanation': anomaly.explanation
                })
            
            # 자동 모니터링 시작 (아직 시작되지 않았다면)
            if not auto_monitoring.monitoring_active:
                auto_monitoring.start_monitoring()
            
            execution['output_data'] = {
                'summary': f'{len(anomaly_list)}개의 이상 상황이 감지되었습니다. 자동 모니터링이 활성화되었습니다.',
                'anomalies': anomaly_list,
                'risk_level': 'high' if any(a['anomaly_score'] > 0.7 for a in anomaly_list) else 'medium' if anomaly_list else 'low',
                'monitored_sensors': len(all_sensors),
                'normal_sensors': len([s for s in sensor_status.values() if s['status'] == 'normal']),
                'abnormal_sensors': len([s for s in sensor_status.values() if s['status'] == 'abnormal']),
                'sensor_status': sensor_status,
                'auto_monitoring_active': auto_monitoring.monitoring_active,
                'recommendations': [
                    '실시간 자동 모니터링이 활성화되었습니다.',
                    '이상 감지 시 즉시 알림이 발송됩니다.',
                    '심각한 이상의 경우 자동 제어 시스템이 개입됩니다.'
                ] + ([f'{len(anomaly_list)}개의 이상 상황에 대한 즉시 점검이 필요합니다.'] if anomaly_list else [])
            }
            
        except Exception as e:
            # 데이터베이스에 데이터가 없거나 오류가 발생한 경우 시뮬레이션 데이터 사용
            print(f"Database error, using simulation: {e}")
            
            # 시뮬레이션 데이터 생성
            anomalies = [
                {
                    'sensor_id': 'TEMP_001',
                    'sensor_name': '온도센서_01',
                    'anomaly_type': '과열 감지',
                    'anomaly_score': round(random.uniform(0.7, 0.95), 2),
                    'current_value': round(random.uniform(75, 85), 1),
                    'normal_range': '65-75°C',
                    'detected_at': datetime.now().isoformat(),
                    'explanation': '정상 범위를 초과한 온도가 감지되었습니다. 냉각 시스템 점검이 필요합니다.'
                },
                {
                    'sensor_id': 'PRESS_003',
                    'sensor_name': '압력센서_03',
                    'anomaly_type': '압력 변동',
                    'anomaly_score': round(random.uniform(0.6, 0.8), 2),
                    'current_value': round(random.uniform(1.8, 2.2), 2),
                    'normal_range': '1.0-1.5 bar',
                    'detected_at': datetime.now().isoformat(),
                    'explanation': '정상 범위를 벗어난 압력 변동이 감지되었습니다. 압력 조절 밸브 점검이 필요합니다.'
                }
            ]
            
            # 자동 모니터링 시작
            if not auto_monitoring.monitoring_active:
                auto_monitoring.start_monitoring()
            
            execution['output_data'] = {
                'summary': f'{len(anomalies)}개의 이상 상황이 감지되었습니다. 자동 모니터링이 활성화되었습니다.',
                'anomalies': anomalies,
                'risk_level': 'medium',
                'monitored_sensors': 12,
                'normal_sensors': 10,
                'abnormal_sensors': len(anomalies),
                'sensor_status': {
                    'temperature_sensors': {'total': 4, 'normal': 3, 'abnormal': 1},
                    'pressure_sensors': {'total': 3, 'normal': 2, 'abnormal': 1},
                    'vibration_sensors': {'total': 3, 'normal': 3, 'abnormal': 0},
                    'flow_sensors': {'total': 2, 'normal': 2, 'abnormal': 0}
                },
                'auto_monitoring_active': auto_monitoring.monitoring_active,
                'recommendations': [
                    '실시간 자동 모니터링이 활성화되었습니다.',
                    '이상 감지 시 즉시 알림이 발송됩니다.',
                    '온도센서_01 지역의 즉시 점검이 필요합니다.',
                    '압력센서_03의 압력 조절 밸브 확인이 필요합니다.',
                    '향후 30분간 집중 모니터링이 권장됩니다.'
                ]
            }
    
    elif agent_type == 'prediction':
        # 더 상세한 예측 결과 생성
        predictions = []
        base_value = 75.0
        for i in range(1, 13):  # 12시간 예측
            value = base_value + random.uniform(-5, 10) + (i * 0.5)  # 점진적 증가 트렌드
            predictions.append({
                'timestamp': (datetime.now() + timedelta(hours=i)).strftime('%H:%M'),
                'value': round(value, 1),
                'unit': '°C',
                'confidence': round(random.uniform(0.75, 0.95), 2)
            })
        
        execution['output_data'] = {
            'summary': '향후 12시간 동안 온도가 점진적으로 상승할 것으로 예측됩니다.',
            'predictions': predictions,
            'confidence': 0.87,
            'prediction_horizon': '12시간',
            'trend': '상승 경향',
            'model_used': 'LSTM 시계열 예측 모델',
            'risk_assessment': 'medium',
            'peak_predicted': {
                'time': '14:00',
                'value': 82.5,
                'confidence': 0.84
            },
            'recommendations': [
                '오후 2시경 최고점 도달 예상',
                '예방적 냉각 시스템 가동 권장',
                '지속적인 모니터링 필요'
            ]
        }
    
    elif agent_type == 'control':
        # 더 상세한 제어 결과 생성
        commands = [
            {
                'device_id': 'COOL_001',
                'device_name': '냉각 시스템 #1',
                'action': '냉각 시스템 가동',
                'status': 'success',
                'executed_at': datetime.now().isoformat(),
                'parameters': {'power': '75%', 'target_temp': '70°C'}
            },
            {
                'device_id': 'VALVE_003',
                'device_name': '압력 조절 밸브 #3',
                'action': '압력 조절',
                'status': 'success',
                'executed_at': datetime.now().isoformat(),
                'parameters': {'opening': '65%', 'target_pressure': '1.2 bar'}
            },
            {
                'device_id': 'ALARM_SYS',
                'device_name': '알림 시스템',
                'action': '알림 발송',
                'status': 'success',
                'executed_at': datetime.now().isoformat(),
                'parameters': {'recipients': 3, 'priority': 'medium'}
            }
        ]
        
        execution['output_data'] = {
            'summary': '3개의 제어 명령이 성공적으로 실행되었습니다.',
            'commands': commands,
            'successful_commands': len([c for c in commands if c['status'] == 'success']),
            'failed_commands': len([c for c in commands if c['status'] == 'failed']),
            'control_status': 'success',
            'safety_checked': True,
            'system_response': {
                'temperature_change': '-2.5°C (예상)',
                'pressure_stabilized': True,
                'alert_sent': True
            },
            'recommendations': [
                '30분 후 제어 효과 재확인',
                '시스템 안정화까지 대기',
                '추가 조치 준비 상태 유지'
            ]
        }
    
    elif agent_type == 'orchestration':
        # 더 상세한 오케스트레이션 결과 생성
        execution['output_data'] = {
            'summary': '4개 에이전트 간 협력 작업이 성공적으로 조정되었습니다.',
            'managed_agents': 4,
            'coordinated_tasks': 8,
            'optimization_level': 85,
            'workflow_efficiency': 92,
            'agent_coordination': {
                'monitoring_agent': {'status': 'completed', 'contribution': '이상 감지'},
                'prediction_agent': {'status': 'completed', 'contribution': '미래 예측'},
                'control_agent': {'status': 'completed', 'contribution': '자동 제어'},
                'orchestration_agent': {'status': 'running', 'contribution': '통합 관리'}
            },
            'recommendations': [
                '전체 시스템 최적화율 85% 달성',
                '예방적 유지보수 스케줄 수립 권장',
                '에너지 효율성 15% 개선 가능'
            ]
        }
    
    execution['status'] = 'completed'
    execution['completed_at'] = datetime.now()
    execution['execution_time'] = 3.0

@require_http_methods(["GET"])
def workflow_status(request, workflow_id):
    """워크플로우 상태 조회"""
    if workflow_id not in active_workflows:
        return JsonResponse({'success': False, 'error': 'Workflow not found'})
    
    workflow = active_workflows[workflow_id]
    
    # datetime 객체를 문자열로 변환 (안전한 처리)
    workflow_copy = workflow.copy()
    if workflow_copy.get('created_at'):
        if hasattr(workflow_copy['created_at'], 'isoformat'):
            workflow_copy['created_at'] = workflow_copy['created_at'].isoformat()
    if workflow_copy.get('completed_at'):
        if hasattr(workflow_copy['completed_at'], 'isoformat'):
            workflow_copy['completed_at'] = workflow_copy['completed_at'].isoformat()
    
    for execution in workflow_copy['executions']:
        if execution.get('started_at'):
            if hasattr(execution['started_at'], 'isoformat'):
                execution['started_at'] = execution['started_at'].isoformat()
        if execution.get('completed_at'):
            if hasattr(execution['completed_at'], 'isoformat'):
                execution['completed_at'] = execution['completed_at'].isoformat()
    
    return JsonResponse({
        'success': True,
        'workflow': workflow_copy
    })

def calculate_execution_time(started_at, completed_at):
    """실행 시간 계산 헬퍼 함수"""
    if not started_at or not completed_at:
        return 0
    
    try:
        # datetime 객체인 경우
        if hasattr(started_at, 'timestamp'):
            start = started_at
        else:
            # 문자열인 경우
            if isinstance(started_at, str):
                start = datetime.fromisoformat(started_at.replace('Z', '+00:00'))
            else:
                return 0
            
        if hasattr(completed_at, 'timestamp'):
            end = completed_at
        else:
            # 문자열인 경우
            if isinstance(completed_at, str):
                end = datetime.fromisoformat(completed_at.replace('Z', '+00:00'))
            else:
                return 0
            
        return (end - start).total_seconds()
    except Exception as e:
        print(f"Error calculating execution time: {e}")
        return 0

@require_http_methods(["GET"])
def get_recent_alerts(request):
    """최근 알림 조회"""
    try:
        alerts = AnomalyAlert.objects.filter(
            is_acknowledged=False
        ).order_by('-created_at')[:10]
        
        alert_data = []
        for alert in alerts:
            alert_data.append({
                'id': alert.id,
                'title': alert.title,
                'description': alert.description,
                'priority': alert.priority,
                'sensor_id': alert.monitoring_data.sensor_id,
                'sensor_name': alert.monitoring_data.sensor_name,
                'location': alert.monitoring_data.location,
                'value': alert.monitoring_data.value,
                'unit': alert.monitoring_data.unit,
                'anomaly_score': alert.monitoring_data.anomaly_score,
                'created_at': alert.created_at.isoformat(),
                'recommended_actions': alert.recommended_actions if hasattr(alert, 'recommended_actions') else None
            })
        
        return JsonResponse({
            'success': True,
            'alerts': alert_data,
            'monitoring_active': auto_monitoring.monitoring_active
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
@require_http_methods(["POST"])
def acknowledge_alert(request, alert_id):
    """알림 확인 처리"""
    try:
        alert = AnomalyAlert.objects.get(id=alert_id)
        alert.is_acknowledged = True
        alert.acknowledged_at = datetime.now()
        if hasattr(request, 'user') and request.user.is_authenticated:
            alert.acknowledged_by = request.user
        alert.save()
        
        return JsonResponse({
            'success': True,
            'message': '알림이 확인 처리되었습니다.'
        })
        
    except AnomalyAlert.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': '알림을 찾을 수 없습니다.'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
@require_http_methods(["POST"])
def start_monitoring(request):
    """모니터링 시스템 시작"""
    try:
        if not auto_monitoring.monitoring_active:
            auto_monitoring.start_monitoring()
        
        return JsonResponse({
            'success': True,
            'message': '자동 모니터링이 시작되었습니다.',
            'monitoring_active': auto_monitoring.monitoring_active
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

@csrf_exempt
@require_http_methods(["POST"]) 
def stop_monitoring(request):
    """모니터링 시스템 중지"""
    try:
        auto_monitoring.stop_monitoring()
        
        return JsonResponse({
            'success': True,
            'message': '자동 모니터링이 중지되었습니다.',
            'monitoring_active': auto_monitoring.monitoring_active
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })