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
def proxy_tools(request):
    """
    /api/tools 요청을 원격 서버로 프록시합니다.
    """
    
    # OPTIONS 요청 (CORS 프리플라이트)
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    # GET, POST 요청 허용 (tools 조회 및 생성)
    if request.method not in ['GET', 'POST']:
        return create_error_response("Method not allowed. Use GET for listing or POST for creating tools.", 405)
    
    try:
        # 원격 서버로 요청 전달
        url = f"{REMOTE_SERVER}/api/tools"
        logger.info(f"Proxying {request.method} request to {url}")
        
        # 요청 메서드에 따라 처리
        headers = {'Content-Type': 'application/json'}
        
        if request.method == 'GET':
            remote_response = requests.get(url, timeout=10)
        elif request.method == 'POST':
            body = request.body.decode('utf-8') if request.body else '{}'
            remote_response = requests.post(url, data=body, headers=headers, timeout=10)
        
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
def proxy_generate(request):
    """
    /api/generate 요청을 원격 서버로 프록시합니다.
    """
    
    # OPTIONS 요청 (CORS 프리플라이트)
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    # POST 요청만 허용 (텍스트 생성은 POST만 사용)
    if request.method != 'POST':
        return create_error_response("Method not allowed. Use POST for text generation.", 405)
    
    try:
        # 원격 서버로 요청 전달
        url = f"{REMOTE_SERVER}/api/generate"
        logger.info(f"Proxying {request.method} request to {url}")
        
        # POST 데이터 전달
        headers = {'Content-Type': 'application/json'}
        body = request.body.decode('utf-8') if request.body else '{}'
        logger.debug(f"POST body: {body}")
        remote_response = requests.post(url, data=body, headers=headers, timeout=30)  # 텍스트 생성은 시간이 걸릴 수 있음
        
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

@csrf_exempt
def proxy_tool_detail(request, tool_name):
    """
    개별 도구에 대한 API 요청을 원격 서버로 프록시합니다.
    /api/tools/<tool_name> -> {REMOTE_SERVER}/api/tools/<tool_name>
    """
    
    # OPTIONS 요청 처리
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    try:
        url = f"{REMOTE_SERVER}/api/tools/{tool_name}"
        logger.info(f"Proxying {request.method} request to {url}")
        
        # 요청 메서드에 따라 처리
        headers = {'Content-Type': 'application/json'}
        
        if request.method == 'GET':
            remote_response = requests.get(url, timeout=10)
        elif request.method == 'PUT':
            body = request.body.decode('utf-8') if request.body else '{}'
            remote_response = requests.put(url, data=body, headers=headers, timeout=10)
        elif request.method == 'DELETE':
            remote_response = requests.delete(url, timeout=10)
        else:
            return create_error_response(f"Method {request.method} not allowed for tool detail", 405)
        
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
            details={"message": str(e), "remote_server": REMOTE_SERVER, "tool_name": tool_name}
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


@csrf_exempt
def agents_api(request, agent_name=None):
    """
    /api/agents/ 요청을 처리합니다.
    GET: 에이전트 목록 조회
    POST: 새 에이전트 생성
    DELETE: 특정 에이전트 삭제 (agent_name 필요)
    """
    
    # OPTIONS 요청 (CORS 프리플라이트)
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    if request.method == 'GET':
        try:
            # 외부 API에서 에이전트 목록 가져오기
            external_api_url = "http://147.47.39.144:8000/api/agents"
            
            external_response = requests.get(
                external_api_url,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if external_response.status_code == 200:
                # 외부 API 성공 응답
                try:
                    agents_data = external_response.json()
                    response = JsonResponse(agents_data, safe=False)
                except:
                    # JSON 파싱 실패 시 빈 배열 반환
                    response = JsonResponse([], safe=False)
            else:
                # 외부 API 오류 시 빈 배열 반환
                logger.error(f"External API GET error: {external_response.status_code} - {external_response.text}")
                response = JsonResponse([], safe=False)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"External API GET request failed: {e}")
            # 연결 실패 시 빈 배열 반환
            response = JsonResponse([], safe=False)
            
        add_cors_headers(response)
        return response
    
    elif request.method == 'POST':
        try:
            # 요청 본문 파싱
            raw_body = request.body.decode('utf-8')
            
            # 빈 요청 본문 체크
            if not raw_body.strip():
                return create_error_response(
                    "요청 본문이 비어있습니다. JSON 데이터를 전송해주세요.",
                    400
                )
            
            # 요청 데이터 파싱
            try:
                data = json.loads(raw_body)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                return create_error_response(
                    f"잘못된 JSON 형식입니다: {str(e)}",
                    400
                )
            
            # 필수 필드 검증
            name = data.get('name', "").strip()
            description = data.get('description', "").strip()
            role_prompt = data.get('role_prompt', "").strip()
            
            if not all([name, description, role_prompt]):
                return create_error_response(
                    "name, description, role_prompt 필드가 모두 필요합니다.",
                    400
                )
            
            # 외부 API로 전달
            external_api_url = "http://147.47.39.144:8000/api/agents"
            
            try:
                # 외부 API 호출
                external_response = requests.post(
                    external_api_url,
                    json={
                        "name": name,
                        "description": description,
                        "role_prompt": role_prompt
                    },
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if external_response.status_code == 201:
                    # 외부 API 성공 응답
                    try:
                        external_data = external_response.json()
                        response = JsonResponse(external_data, status=201)
                    except:
                        # JSON 파싱 실패 시 기본 응답
                        response_data = {
                            "message": "에이전트가 성공적으로 생성되었습니다.",
                            "agent": {
                                "name": name,
                                "description": description,
                                "role_prompt": role_prompt
                            }
                        }
                        response = JsonResponse(response_data, status=201)
                else:
                    # 외부 API 오류 응답
                    logger.error(f"External API error: {external_response.status_code} - {external_response.text}")
                    return create_error_response(
                        f"외부 API 오류: {external_response.status_code}",
                        external_response.status_code
                    )
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"External API request failed: {e}")
                return create_error_response(
                    f"외부 API 연결 실패: {str(e)}",
                    503
                )
            
            add_cors_headers(response)
            return response
            
        except json.JSONDecodeError:
            return create_error_response("잘못된 JSON 형식입니다.", 400)
        except Exception as e:
            logger.error(f"Agent creation error: {e}")
            return create_error_response(f"에이전트 생성 중 오류가 발생했습니다: {str(e)}", 500)
    
    # PUT 방식은 외부 API에서 지원하지 않으므로 주석 처리
    # 외부 API는 같은 이름으로 POST 요청을 보내면 기존 에이전트를 수정함
    # elif request.method == 'PUT':
    #     ... (PUT 처리 코드)
    
    elif request.method == 'DELETE':
        try:
            # URL 파라미터에서 agent_name 사용
            if not agent_name or not agent_name.strip():
                return create_error_response("에이전트 이름이 필요합니다.", 400)
            
            # 외부 API로 DELETE 요청
            external_api_url = f"http://147.47.39.144:8000/api/agents/{agent_name}"
            
            try:
                external_response = requests.delete(
                    external_api_url,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if external_response.status_code == 200 or external_response.status_code == 204:
                    # 삭제 성공
                    response = JsonResponse({"message": f"에이전트 '{agent_name}'가 성공적으로 삭제되었습니다."})
                elif external_response.status_code == 404:
                    # 에이전트를 찾을 수 없음
                    response = JsonResponse({"error": f"에이전트 '{agent_name}'를 찾을 수 없습니다."}, status=404)
                else:
                    # 기타 오류
                    logger.error(f"External API DELETE error: {external_response.status_code} - {external_response.text}")
                    response = JsonResponse({"error": f"에이전트 삭제 중 오류가 발생했습니다: {external_response.status_code}"}, status=external_response.status_code)
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"External API DELETE request failed: {e}")
                return create_error_response(f"외부 API 연결 실패: {str(e)}", 503)
            
            add_cors_headers(response)
            return response
            
        except Exception as e:
            logger.error(f"Agent deletion error: {e}")
            return create_error_response(f"에이전트 삭제 중 오류가 발생했습니다: {str(e)}", 500)
    
    else:
        return create_error_response("Method not allowed. Use GET, POST, or DELETE.", 405)


@csrf_exempt
def tools_api(request):
    """
    /api/clients/user/tools/ 요청을 처리합니다.
    GET: 도구 목록 조회
    POST: 새 도구 등록
    """
    
    # OPTIONS 요청 (CORS 프리플라이트)
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    if request.method == 'GET':
        try:
            # 외부 API에서 도구 목록 가져오기
            external_api_url = "http://147.47.39.144:8000/api/clients/user/tools"
            
            external_response = requests.get(
                external_api_url,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            if external_response.status_code == 200:
                # 외부 API 성공 응답
                try:
                    tools_data = external_response.json()
                    response = JsonResponse(tools_data, safe=False)
                except:
                    # JSON 파싱 실패 시 빈 배열 반환
                    response = JsonResponse([], safe=False)
            else:
                # 외부 API 오류 시 빈 배열 반환
                logger.error(f"External API GET error: {external_response.status_code} - {external_response.text}")
                response = JsonResponse([], safe=False)
                
        except requests.exceptions.RequestException as e:
            logger.error(f"External API GET request failed: {e}")
            # 연결 실패 시 빈 배열 반환
            response = JsonResponse([], safe=False)
            
        add_cors_headers(response)
        return response
    
    elif request.method == 'POST':
        try:
            # 요청 본문 파싱
            raw_body = request.body.decode('utf-8')
            
            # 빈 요청 본문 체크
            if not raw_body.strip():
                return create_error_response(
                    "요청 본문이 비어있습니다. JSON 데이터를 전송해주세요.",
                    400
                )
            
            # 요청 데이터 파싱
            try:
                data = json.loads(raw_body)
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {e}")
                return create_error_response(
                    f"잘못된 JSON 형식입니다: {str(e)}",
                    400
                )
            
            # 필수 필드 검증
            required_fields = ['name', 'description', 'input_schema', 'endpoint']
            for field in required_fields:
                if field not in data:
                    return create_error_response(
                        f"필수 필드 '{field}'가 누락되었습니다.",
                        400
                    )
            
            # endpoint 필드 검증
            endpoint = data.get('endpoint', {})
            if not isinstance(endpoint, dict):
                return create_error_response("endpoint는 객체여야 합니다.", 400)
            
            endpoint_required_fields = ['url', 'method']
            for field in endpoint_required_fields:
                if field not in endpoint:
                    return create_error_response(
                        f"endpoint.{field} 필드가 필요합니다.",
                        400
                    )
            
            # 외부 API로 전달
            external_api_url = "http://147.47.39.144:8000/api/clients/user/tools"
            
            try:
                external_response = requests.post(
                    external_api_url,
                    json=data,
                    headers={'Content-Type': 'application/json'},
                    timeout=30
                )
                
                if external_response.status_code == 200:
                    # 외부 API 성공 응답
                    try:
                        external_data = external_response.json()
                        response = JsonResponse(external_data, status=200)
                    except:
                        # JSON 파싱 실패 시 기본 응답
                        response_data = {
                            "message": "도구가 성공적으로 등록되었습니다.",
                            "tool": {
                                "name": data.get('name'),
                                "description": data.get('description')
                            }
                        }
                        response = JsonResponse(response_data, status=200)
                else:
                    # 외부 API 오류 응답
                    logger.error(f"External API error: {external_response.status_code} - {external_response.text}")
                    return create_error_response(
                        f"외부 API 오류: {external_response.status_code}",
                        external_response.status_code
                    )
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"External API request failed: {e}")
                return create_error_response(
                    f"외부 API 연결 실패: {str(e)}",
                    503
                )
            
            add_cors_headers(response)
            return response
            
        except json.JSONDecodeError:
            return create_error_response("잘못된 JSON 형식입니다.", 400)
        except Exception as e:
            logger.error(f"Tool registration error: {e}")
            return create_error_response(f"도구 등록 중 오류가 발생했습니다: {str(e)}", 500)
    
    else:
        return create_error_response("Method not allowed. Use GET or POST.", 405)

@csrf_exempt
def proxy_agent_detail(request, agent_name):
    """
    개별 에이전트에 대한 API 요청을 원격 서버로 프록시합니다.
    /api/agents/<agent_name> -> {REMOTE_SERVER}/api/agents/<agent_name>
    """
    
    # OPTIONS 요청 처리
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    try:
        url = f"{REMOTE_SERVER}/api/agents/{agent_name}"
        logger.info(f"Proxying {request.method} request to {url}")
        
        # 요청 메서드에 따라 처리
        headers = {'Content-Type': 'application/json'}
        
        if request.method == 'GET':
            remote_response = requests.get(url, timeout=10)
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
            details={"message": str(e), "remote_server": REMOTE_SERVER, "agent_name": agent_name}
        )

@csrf_exempt
def proxy_agent_invoke(request, agent_name):
    """
    에이전트 호출(invoke) API 요청을 원격 서버로 프록시합니다.
    /api/agents/<agent_name>/invoke -> {REMOTE_SERVER}/api/agents/<agent_name>/invoke
    """
    
    # OPTIONS 요청 처리
    if request.method == 'OPTIONS':
        return create_cors_response()
    
    # POST 요청만 허용 (에이전트 호출은 POST만 사용)
    if request.method != 'POST':
        return create_error_response("Method not allowed. Use POST for agent invocation.", 405)
    
    try:
        url = f"{REMOTE_SERVER}/api/agents/{agent_name}/invoke"
        logger.info(f"Proxying agent invoke request to {url}")
        
        # POST 데이터 전달
        headers = {'Content-Type': 'application/json'}
        body = request.body.decode('utf-8') if request.body else '{}'
        logger.info(f"Agent invoke POST body: {body}")
        
        remote_response = requests.post(url, data=body, headers=headers, timeout=30)  # 에이전트 호출은 시간이 걸릴 수 있음
        
        logger.info(f"Remote server response: {remote_response.status_code}")
        if remote_response.status_code >= 400:
            logger.error(f"Remote server error response: {remote_response.text}")
        
        # JSON 응답 파싱 시도
        try:
            data = remote_response.json()
            response = JsonResponse(data, safe=False, status=remote_response.status_code)
        except:
            # JSON이 아닌 경우 원본 응답 전달
            logger.warning(f"Non-JSON response from remote server: {remote_response.text[:500]}")
            response = HttpResponse(
                remote_response.content,
                content_type=remote_response.headers.get('content-type', 'application/json'),
                status=remote_response.status_code
            )
        
        # CORS 헤더 추가
        add_cors_headers(response)
        return response
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Agent invoke connection failed: {e}")
        return create_error_response(
            "에이전트 호출 실패",
            503,
            details={"message": str(e), "remote_server": REMOTE_SERVER, "agent_name": agent_name}
        )
