# AGI Django Project

이 디렉토리는 PRISM-AGI 시스템의 웹 애플리케이션입니다. AGI 에이전트 관리 및 제어를 위한 웹 인터페이스를 제공합니다.

## 📁 프로젝트 구조

```
agi/
├── manage.py                 # Django 관리 명령어 실행 파일
├── db.sqlite3               # SQLite 데이터베이스(Django 기본 제공)
├── agi/                     # Django 프로젝트 설정 디렉토리
│   ├── __init__.py
│   ├── settings.py          # 프로젝트 설정
│   ├── urls.py              # 메인 URL 설정
│   ├── wsgi.py              # WSGI 설정
│   └── asgi.py              # ASGI 설정 (웹소켓 지원)
├── agiApp/                  # 메인 애플리케이션
│   ├── models.py            # 데이터 모델
│   ├── views.py             # 뷰 로직
│   ├── urls.py              # URL 패턴
│   ├── templates/           # HTML 템플릿
│   ├── static/              # CSS, JS, 이미지 파일
│   └── migrations/          # 데이터베이스 마이그레이션
├── proxy/                   # 외부 API 프록시 앱
├── agents/                  # AGI 에이전트 모듈들
│   ├── monitoring_agent/    # 모니터링 에이전트
│   ├── prediction_agent/    # 예측 에이전트
│   ├── control_agent/       # 제어 에이전트
│   └── orchestration_agent/ # 오케스트레이션 에이전트
├── staticfiles/             # 정적 파일 수집 디렉토리
└── logs/                    # 로그 파일 저장
```

## 주요 기능

### 1. 웹 인터페이스
- **에이전트 관리**: 에이전트 생성, 조회, 삭제(완료)
- **대시보드**: AGI 시스템 상태 모니터링(준비중)
- **도구 등록**: 외부 API 도구 등록 및 관리(준비중)
- **사용자 인증**: 로그인, 회원가입, 패스워드 리셋(기능 불필요)

### 2. API 프록시
- **외부 API 연동**: 에이전트 서버와의 통신
- **CORS 설정**: 크로스 도메인 요청 처리
- **데이터 중계**: 프론트엔드와 외부 AGI 서버 간 데이터 중계

## 기술 스택

- **Framework**: Django 5.2.4
- **Database**: SQLite (개발용)
- **API**: Django REST Framework 3.16.0
- **WebSocket**: Django Channels 4.2.2
- **CORS**: django-cors-headers 4.7.0
- **Cache**: Redis (channels_redis 4.2.1)

## 설정 파일 주요 내용

### settings.py
- **CORS 설정**: 허용된 오리진 및 헤더 설정
- **CSRF 보안**: 신뢰할 수 있는 오리진 설정
- **설치된 앱**: agiApp, proxy, agents 모듈들
- **정적 파일**: staticfiles 설정

## 데이터베이스

SQLite 데이터베이스 (`db.sqlite3`)를 사용하여 다음과 같은 정보를 저장:
- 사용자 계정 정보(준비중)
- 세션 데이터
- 애플리케이션별 모델 데이터(에이전트별로 처리내역 관리 예정)

## 로그 시스템

`logs/` 디렉토리에 애플리케이션 로그를 저장:
- `agi.log` - 메인 애플리케이션 로그
- 에이전트별 로그 파일

## 개발 환경 설정

```bash
# 가상환경 활성화
cd d:\agi
.\env\Scripts\Activate.ps1

# Django 프로젝트 디렉토리로 이동(manage.py가 있는 디렉토리)
cd PRISM-AGI\agi

# 마이그레이션 실행
python manage.py makemigrations && python manage.py migrate

# 개발 서버 실행
python manage.py runserver

## 주요 앱 설명

### agiApp
메인 웹 애플리케이션으로 사용자 인터페이스와 기본 기능을 제공

### proxy
외부 API 서버와의 통신을 중계하는 프록시 역할

### agents
각종 AGI 에이전트들의 모듈화된 구현체들

---

이 Django 프로젝트는 PRISM-AGI 시스템의 웹 인터페이스 레이어로서, 사용자와 AGI 에이전트들 간의 상호작용을 담당합니다.
