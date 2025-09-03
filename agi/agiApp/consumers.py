"""
WebSocket consumers for real-time chat and orchestrate updates.
"""

import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer

# 로깅 설정을 더 상세하게
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    """일반 채팅 WebSocket 컨슈머"""
    
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"Chat WebSocket connected: session_id={self.session_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"Chat WebSocket disconnected: session_id={self.session_id}")

    async def receive(self, text_data):
        """클라이언트로부터 메시지 수신"""
        try:
            text_data_json = json.loads(text_data)
            message = text_data_json['message']
            message_type = text_data_json.get('type', 'chat')

            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'message_type': message_type
                }
            )
        except Exception as e:
            logger.error(f"Error receiving WebSocket message: {e}")

    async def chat_message(self, event):
        """그룹으로부터 메시지 수신 후 클라이언트로 전송"""
        message = event['message']
        message_type = event['message_type']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'type': message_type
        }))


class OrchestrateConsumer(AsyncWebsocketConsumer):
    """Orchestrate API 실시간 업데이트 컨슈머"""
    
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'orchestrate_{self.session_id}'
        
        logger.info(f"WebSocket connection attempt: session_id={self.session_id}")
        logger.info(f"URL route kwargs: {self.scope['url_route']['kwargs']}")
        logger.info(f"Full scope path: {self.scope.get('path', 'No path')}")

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"Orchestrate WebSocket connected: session_id={self.session_id}")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"Orchestrate WebSocket disconnected: session_id={self.session_id}")

    async def receive(self, text_data):
        """외부 서버로부터 단계별 업데이트 수신"""
        try:
            text_data_json = json.loads(text_data)
            
            # 외부 서버에서 받은 데이터를 그룹으로 브로드캐스트
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'orchestrate_update',
                    'data': text_data_json
                }
            )
        except Exception as e:
            logger.error(f"Error receiving orchestrate update: {e}")

    async def orchestrate_update(self, event):
        """단계별 업데이트를 클라이언트로 전송"""
        data = event['data']

        # Send update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'orchestrate_update',
            'data': data
        }))

    async def orchestrate_message(self, event):
        """API에서 전송된 orchestrate 메시지를 클라이언트로 전송"""
        message = event['message']
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps(message))

    async def send_step_update(self, event):
        """외부에서 호출할 수 있는 단계별 업데이트 메서드"""
        step_data = event['step_data']
        
        await self.send(text_data=json.dumps({
            'type': 'step_update',
            'step_name': step_data.get('step_name'),
            'status': step_data.get('status'),
            'content': step_data.get('content'),
            'progress': step_data.get('progress', 0)
        }))
