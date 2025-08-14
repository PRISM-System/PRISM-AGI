"""
Proxy App Views - 원격 서버로 요청을 중계하는 프록시 서버
"""
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

# 원격 서버 설정
REMOTE_SERVER = getattr(settings, 'PROXY_REMOTE_SERVER', 'http://147.47.39.144:8000')

@csrf_exempt
def proxy_agents(request):
    """
    /proxy/agents 요청을 원격 서버로 프록시합니다.
    """
    
    # OPTIONS 요청 (CORS 프리플라이트)
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    try:
        # 원격 서버로 요청 전달
        url = f"{REMOTE_SERVER}/api/agents"
        logger.info(f"Proxying {request.method} request to {url}")
        
        if request.method == 'GET':
            remote_response = requests.get(url, timeout=10)
        elif request.method == 'POST':
            # POST 데이터 전달
            headers = {'Content-Type': 'application/json'}
            body = request.body.decode('utf-8') if request.body else '{}'
            logger.debug(f"POST body: {body}")
            remote_response = requests.post(url, data=body, headers=headers, timeout=10)
        else:
            return create_error_response("Method not allowed", 405)
        
        logger.info(f"Remote server response: {remote_response.status_code}")
        
        # JSON 응답 파싱 시도
        try:
            data = remote_response.json()
            response = JsonResponse(data, safe=False, status=remote_response.status_code)
        except:
            # JSON이 아닌 경우 원본 응답 전달
            response = HttpResponse(
                remote_response.content,
                content_type=remote_response.headers.get('content-type', 'application/json'),
                status=remote_response.status_code
            )
        
        # CORS 헤더 추가
        add_cors_headers(response)
        return response
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Remote server connection failed: {e}")
        return create_error_response(
            "원격 서버 연결 실패",
            503,
            details={"message": str(e), "remote_server": REMOTE_SERVER}
        )

@csrf_exempt
def proxy_api(request, path):
    """
    일반적인 API 요청을 원격 서버로 프록시합니다.
    /proxy/api/<path> -> {REMOTE_SERVER}/<path>
    """
    
    # OPTIONS 요청 처리
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    try:
        url = f"{REMOTE_SERVER}/{path}"
        logger.info(f"Proxying {request.method} request to {url}")
        
        # 요청 메서드에 따라 처리
        headers = {'Content-Type': 'application/json'}
        
        if request.method == 'GET':
            remote_response = requests.get(url, timeout=10)
        elif request.method == 'POST':
            body = request.body.decode('utf-8') if request.body else '{}'
            remote_response = requests.post(url, data=body, headers=headers, timeout=10)
        elif request.method == 'PUT':
            body = request.body.decode('utf-8') if request.body else '{}'
            remote_response = requests.put(url, data=body, headers=headers, timeout=10)
        elif request.method == 'DELETE':
            remote_response = requests.delete(url, timeout=10)
        else:
            return create_error_response("Method not allowed", 405)
        
        logger.info(f"Remote server response: {remote_response.status_code}")
        
        # JSON 응답 파싱 시도
        try:
            data = remote_response.json()
            response = JsonResponse(data, safe=False, status=remote_response.status_code)
        except:
            # JSON이 아닌 경우 원본 응답 전달
            response = HttpResponse(
                remote_response.content,
                content_type=remote_response.headers.get('content-type', 'application/json'),
                status=remote_response.status_code
            )
        
        # CORS 헤더 추가
        add_cors_headers(response)
        return response
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Remote server connection failed: {e}")
        return create_error_response(
            "원격 서버 연결 실패",
            503,
            details={"message": str(e), "remote_server": REMOTE_SERVER, "requested_path": path}
        )

def create_cors_response():
    """CORS 프리플라이트 응답 생성"""
    response = HttpResponse()
    add_cors_headers(response)
    return response

def add_cors_headers(response):
    """응답에 CORS 헤더 추가"""
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    response["Access-Control-Max-Age"] = "86400"

def create_error_response(message, status_code, details=None):
    """에러 응답 생성"""
    error_data = {"error": message}
    if details:
        error_data.update(details)
    
    response = JsonResponse(error_data, status=status_code)
    add_cors_headers(response)
    return response
