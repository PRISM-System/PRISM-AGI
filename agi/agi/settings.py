"""
Django settings for agi project.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-h^l^qa_6n@e9!qj#u*!_f&501fx&9)t3m0bpnjwow(b#@nmepf'
DEBUG = True
ALLOWED_HOSTS = ['*']

# ----------------------
# CORS / CSRF
# ----------------------
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://grnd.bimatrix.co.kr",
    "http://192.168.0.57:8080",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://147.47.39.144:8000",  # 클라이언트 IP 추가
]
CORS_ALLOW_CREDENTIALS = False  # 세션/쿠키 cross-site 필요 시 True로 (그땐 화이트리스트 필수)
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
CORS_ALLOW_HEADERS = ["content-type", "authorization", "x-csrftoken", "x-requested-with"]

CSRF_TRUSTED_ORIGINS = [
    "https://grnd.bimatrix.co.kr",
    "http://192.168.0.57:8080",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://147.47.39.144:8000",  # 클라이언트 IP 추가
]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'channels',
    'corsheaders',

    'agiApp',
    'proxy',  # 프록시 서버 앱 추가
    'agents.monitoring_agent',
    'agents.prediction_agent',
    'agents.control_agent',
    'agents.orchestration_agent',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← 반드시 최상단
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # authentication_classes=[]로 CSRF 영향 제거됨
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'agi.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'agi.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/django/static/'
STATICFILES_DIRS = [BASE_DIR / 'agiApp' / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    # 기본은 인증 필요; 개별 뷰에서 authentication_classes=[] 로 무력화
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}

ASGI_APPLICATION = 'agi.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {"hosts": [('127.0.0.1', 6379)]},
    },
}

CELERY_BROKER_URL = 'redis://localhost:6379'
CELERY_RESULT_BACKEND = 'redis://localhost:6379'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

OPENAI_API_KEY = ''
ANTHROPIC_API_KEY = ''

# Proxy Server 설정
PROXY_REMOTE_SERVER = 'http://147.47.39.144:8000'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'detailed': {
            'format': '{asctime} [{levelname}] {name}: {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',  # DEBUG 레벨로 변경하여 더 상세한 로그 수집
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'agi.log',
            'formatter': 'detailed',
            'encoding': 'utf-8',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'DEBUG',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.server': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',  # HTTP 요청 로그 활성화
            'propagate': False,
        },
        'agents': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'agiApp': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'urllib3': {  # HTTP 연결 로그
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'requests': {  # requests 라이브러리 로그
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
