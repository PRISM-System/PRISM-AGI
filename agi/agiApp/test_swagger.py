"""
Swagger 테스트용 간단한 API
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@swagger_auto_schema(
    operation_description="Swagger 테스트용 간단한 API",
    manual_parameters=[
        openapi.Parameter(
            'test_param',
            openapi.IN_QUERY,
            description='테스트 파라미터',
            type=openapi.TYPE_STRING,
            required=False
        ),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'message': openapi.Schema(type=openapi.TYPE_STRING, description='테스트 메시지'),
        }
    ),
    responses={
        200: openapi.Response('성공'),
        400: openapi.Response('잘못된 요청'),
    }
)
def test_swagger_api(request):
    """Swagger 테스트 API"""
    if request.method == 'GET':
        test_param = request.GET.get('test_param', 'default')
        return Response({
            'message': 'GET 요청 성공',
            'test_param': test_param
        })
    elif request.method == 'POST':
        return Response({
            'message': 'POST 요청 성공',
            'data': request.data
        })
