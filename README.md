# PRISM-AGI: 자율 제조 AI 에이전트 플랫폼

## 1. 프로젝트 개요

PRISM-AGI는 자율적인 제조 공정 운영을 위한 AI 에이전트 플랫폼입니다. 본 플랫폼은 웹 기반 인터페이스를 통해 접근 가능하며, 가상 제조 공정 데이터를 기반으로 AI 에이전트들이 실시간 모니터링, 예측, 제어를 수행합니다. 이를 통해 공정 효율을 극대화하고, 생산성을 향상시키는 것을 목표로 합니다.

### 주요 특징
- **웹 플랫폼 호환성**: 10개 이상의 웹 브라우저를 지원하는 크로스 브라우저 API 및 반응형 UI 제공
- **대용량 데이터 처리**: 연간 1억 건 이상의 데이터를 처리할 수 있는 가상 제조 공정 DB 구축
- **실시간 데이터 파이프라인**: 300ms 내 처리가 가능한 실시간 데이터 수집 및 스트리밍 파이프라인
- **통합 데이터 관리**: 내외부 DB 연동 및 98% 이상의 데이터 정합성 유지

## 2. 시스템 아키텍처

PRISM-AGI는 마이크로서비스 아키텍처를 기반으로 하며, 각 기능별로 독립적인 AI 에이전트 서브모듈로 구성됩니다.

- **[PRISM-Orch](./Orch/README.md)**: 멀티 AI 에이전트의 작업을 조율하고 관리하는 오케스트레이션 에이전트
- **[PRISM-Monitor](./Monitor/README.md)**: 제조 공정을 실시간으로 모니터링하고 이상 상태를 탐지하는 에이전트
- **[PRISM-Pred](./Pred/README.md)**: 멀티모달 데이터를 기반으로 공정 결과를 예측하는 에이전트
- **[PRISM-AutoControl](./AutoControl/README.md)**: 예측 결과를 바탕으로 최적의 제어 액션을 결정하고 수행하는 자율제어 에이전트

## 3. 시스템 통합 및 연동

- **에이전트 간 통신**: 메시지 큐(Kafka) 기반의 비동기 통신으로 에이전트 간 데이터 교환 및 상태 동기화
- **데이터 흐름 관리**: 실시간 스트림 및 배치 데이터 처리 파이프라인을 통한 데이터 변환, 정규화 및 캐싱
- **성능 모니터링**: Prometheus와 Grafana를 활용한 실시간 시스템 성능 모니터링, 병목 탐지 및 자동 스케일링

## 4. 핵심 기술 스택

| 구분 | 기술 |
| --- | --- |
| **실시간 처리** | `Apache Kafka`, `Redis`, `WebSocket` |
| **AI/ML** | `PyTorch`, `TensorFlow`, `Transformers`, `Scikit-learn`, `LangChain` |
| **데이터베이스** | `PostgreSQL`, `InfluxDB`, `Elasticsearch`, `Vector DB` |
| **모니터링** | `Grafana`, `Prometheus`, `ELK Stack` |

## 5. 성능 목표

| 구분 | 지표 | 목표 |
| --- | --- | --- |
| **플랫폼** | 웹 브라우저 호환성 | 10개 이상 |
| | 가상 제조공정 DB 처리량 | 연간 1억 건 |
| | 실시간 제어 명령 처리 속도 | 150ms 이내 |
| | 공정 성능 개선율 | 25%p |
| **오케스트레이션** | RAG 검색 개선율 | 70% |
| | RAG 생성 정합성 | 10% 향상 |
| | 제약 위반 탐지 정확도 | 90% |
| **모니터링** | 시계열 이상 탐지 (PA F1) | 0.9 이상 |
| | 데이터 정합성 유지율 | 98% |
| | 이벤트 설명 생성 상관계수 | 0.5 이상 |
| **예측** | 예측 오차 | 5% 이내 |
| | 예측 위험 평가 상관계수 | 0.5 이상 |
| **자율제어** | AI 모델 근사 정확도 (RMSE) | 0.220 이하 |
| | 자율제어 성공률 | 99% |
| | 의사결정 위험 평가 상관계수 | 0.5 이상 |

## 6. 설치 및 실행 가이드

### 6.1 시스템 요구사항

- **Python**: 3.11 이상
- **Node.js**: 16.x 이상 (프론트엔드 개발 시)
- **Redis**: 6.2 이상
- **PostgreSQL**: 13 이상 (선택사항)
- **OS**: Windows 10/11, Ubuntu 20.04 이상, macOS 11 이상

### 6.2 로컬 개발 환경 설정

#### Step 1: 저장소 클론
```bash
git clone https://github.com/your-org/prism-agi.git
cd prism-agi
```

#### Step 2: Python 가상환경 설정
```bash
# Windows (PowerShell)
python -m venv env
.\env\Scripts\Activate.ps1

# Linux/macOS
python -m venv env
source env/bin/activate
```

#### Step 3: 의존성 설치
```bash
pip install -r requirements.txt
```

#### Step 4: 데이터베이스 설정
```bash
cd agi
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

#### Step 5: 정적 파일 수집
```bash
python manage.py collectstatic
```

### 6.3 서비스 실행

#### 개발 서버 실행
```bash
# Django 개발 서버 실행
cd agi
python manage.py runserver

# 기본 접속 주소: http://localhost:8000
```

#### 프로덕션 환경 실행
```bash
# Gunicorn을 사용한 프로덕션 서버
pip install gunicorn
gunicorn --bind 0.0.0.0:8000 agi.wsgi:application

# 또는 Docker 사용
docker-compose up -d
```

### 6.4 각 에이전트 모듈 실행

#### 오케스트레이션 에이전트 (PRISM-Orch)
```bash
cd Orch
python main.py --config config/production.yaml
```

#### 모니터링 에이전트 (PRISM-Monitor)
```bash
cd Monitor
python monitor_agent.py --mode realtime
```

#### 예측 에이전트 (PRISM-Pred)
```bash
cd Pred
python prediction_service.py --model-path models/latest/
```

#### 자율제어 에이전트 (PRISM-AutoControl)
```bash
cd AutoControl
python control_agent.py --policy-file policies/default.json
```

## 7. 개발 환경 구성

### 7.1 IDE 설정
- **권장 IDE**: VS Code, PyCharm Professional
- **필수 확장프로그램**: 
  - Python
  - Django
  - Redis
  - Docker

### 7.2 코드 스타일 및 린팅
```bash
# Black 포매터 설치 및 실행
pip install black
black .

# Flake8 린터 설치 및 실행
pip install flake8
flake8 .

# 타입 체킹 (mypy)
pip install mypy
mypy .
```

### 7.3 테스트 실행
```bash
# Django 테스트
cd agi
python manage.py test

# 각 에이전트별 테스트
cd Monitor
python -m pytest tests/

cd Pred
python -m pytest tests/

cd AutoControl
python -m pytest tests/
```

## 8. API 문서

### 8.1 REST API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| `GET` | `/api/v1/agents/status/` | 모든 에이전트 상태 조회 |
| `POST` | `/api/v1/agents/orchestration/execute/` | 오케스트레이션 작업 실행 |
| `GET` | `/api/v1/monitoring/metrics/` | 실시간 모니터링 메트릭 |
| `POST` | `/api/v1/prediction/forecast/` | 예측 요청 |
| `POST` | `/api/v1/control/action/` | 제어 액션 실행 |

### 8.2 WebSocket 엔드포인트
- `ws://localhost:8000/ws/monitoring/` - 실시간 모니터링 데이터
- `ws://localhost:8000/ws/alerts/` - 실시간 알림
- `ws://localhost:8000/ws/control/` - 제어 명령 스트림

### 8.3 API 문서 접속
- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

## 9. 환경 변수 설정

### 9.1 필수 환경 변수
```bash
# .env 파일 생성
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
KAFKA_BROKERS=localhost:9092

# AI 모델 설정
MODEL_STORAGE_PATH=/path/to/models
HUGGINGFACE_TOKEN=your-token-here

# 외부 서비스 연동
GRAFANA_URL=http://localhost:3000
PROMETHEUS_URL=http://localhost:9090
```

### 9.2 프로덕션 환경 변수
```bash
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost
DATABASE_URL=postgresql://user:password@localhost:5432/prism_agi
REDIS_URL=redis://redis-server:6379/0
```

## 10. 배포 가이드

### 10.1 Docker를 사용한 배포
```bash
# Docker 이미지 빌드
docker build -t prism-agi:latest .

# Docker Compose 실행
docker-compose -f docker-compose.prod.yml up -d
```

### 10.2 Kubernetes 배포
```bash
# Kubernetes 매니페스트 적용
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

## 11. 모니터링 및 로깅

### 11.1 로그 파일 위치
- **Django 로그**: `logs/agi.log`
- **에이전트 로그**: `logs/agents/`
- **시스템 로그**: `/var/log/prism-agi/`

### 11.2 모니터링 대시보드
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Kibana**: http://localhost:5601

## 12. 문제 해결

### 12.1 자주 발생하는 문제

#### Django 서버가 시작되지 않는 경우
```bash
# 데이터베이스 연결 확인
python manage.py dbshell

# 마이그레이션 상태 확인
python manage.py showmigrations

# 포트 충돌 해결
netstat -ano | findstr :8000
```

#### Redis 연결 실패
```bash
# Redis 서버 상태 확인
redis-cli ping

# Redis 서비스 재시작 (Windows)
net stop redis
net start redis
```

#### 에이전트 간 통신 오류
```bash
# Kafka 상태 확인
kafka-topics.sh --list --bootstrap-server localhost:9092

# 네트워크 연결 테스트
telnet localhost 9092
```

### 12.2 성능 최적화

#### 데이터베이스 최적화
```python
# settings.py에서 데이터베이스 연결 풀 설정
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 20,
            'conn_max_age': 600,
        }
    }
}
```

#### Redis 캐시 최적화
```python
# 캐시 설정 최적화
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'CONNECTION_POOL_KWARGS': {'max_connections': 50},
        }
    }
}
```

## 13. 기여 가이드

### 13.1 개발 프로세스
1. Issue 생성 또는 기존 Issue 할당
2. 기능 브랜치 생성 (`feature/기능명` 또는 `bugfix/이슈번호`)
3. 코드 작성 및 테스트
4. Pull Request 생성
5. 코드 리뷰 및 병합

### 13.2 커밋 메시지 규칙
```
type(scope): subject

body

footer
```

**Type 종류:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드 프로세스 또는 도구 변경

### 13.3 코드 리뷰 체크리스트
- [ ] 코드 스타일 가이드 준수
- [ ] 단위 테스트 작성 및 통과
- [ ] 문서 업데이트
- [ ] 성능 영향 검토
- [ ] 보안 취약점 확인

## 14. 라이선스

본 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 15. 지원 및 연락처

- **이슈 신고**: [GitHub Issues](https://github.com/your-org/prism-agi/issues)
- **기술 문의**: tech-support@prism-agi.com
- **비즈니스 문의**: business@prism-agi.com
- **문서**: [공식 문서 사이트](https://docs.prism-agi.com)

---

**개발팀**: PRISM-AGI Development Team  
**마지막 업데이트**: 2025년 7월 10일