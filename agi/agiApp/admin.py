from django.contrib import admin
from .models import UserActivityLog, ChatSession, ChatMessage
import json


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'action_type', 'level', 'message_preview', 'timestamp']
    list_filter = ['action_type', 'level', 'timestamp', 'user_id']
    search_fields = ['user_id', 'message', 'details']
    readonly_fields = ['timestamp', 'ip_address', 'user_agent']
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('user_id', 'action_type', 'level', 'message')
        }),
        ('상세 정보', {
            'fields': ('details_display', 'timestamp'),
            'classes': ('collapse',)
        }),
        ('요청 정보', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
    )
    
    def message_preview(self, obj):
        return obj.message[:50] + ('...' if len(obj.message) > 50 else '')
    message_preview.short_description = '메시지 미리보기'
    
    def details_display(self, obj):
        if obj.details:
            return json.dumps(obj.details, ensure_ascii=False, indent=2)
        return '-'
    details_display.short_description = '상세 정보 (JSON)'
    details_display.help_text = '추가 세부 정보를 JSON 형식으로 표시합니다.'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # 수정 시
            return self.readonly_fields + ['user_id', 'action_type', 'details_display']
        return self.readonly_fields


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'title', 'message_count', 'created_at', 'updated_at', 'is_active']
    list_filter = ['is_active', 'created_at', 'updated_at', 'user_id']
    search_fields = ['title', 'user_id', 'messages__content']
    readonly_fields = ['id', 'created_at', 'updated_at', 'message_count']
    date_hierarchy = 'created_at'
    ordering = ['-updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'user_id', 'title', 'is_active')
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('통계', {
            'fields': ('message_count',),
            'classes': ('collapse',)
        }),
    )
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = '메시지 수'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('messages')


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['timestamp', 'content_preview', 'metadata_display', 'session_user_id']
    fields = ['role', 'session_user_id', 'content', 'timestamp']
    
    def content_preview(self, obj):
        return obj.content[:100] + ('...' if len(obj.content) > 100 else '')
    content_preview.short_description = '내용 미리보기'
    
    def metadata_display(self, obj):
        if obj.metadata:
            return json.dumps(obj.metadata, ensure_ascii=False, indent=2)[:100]
        return '-'
    metadata_display.short_description = '메타데이터'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['session', 'session_user_id', 'role', 'content_preview', 'timestamp']
    list_filter = ['role', 'timestamp', 'session__user_id']
    search_fields = ['content', 'session_user_id', 'session__title', 'session__user_id']
    readonly_fields = ['timestamp', 'session_user_id']
    date_hierarchy = 'timestamp'
    ordering = ['-timestamp']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('session', 'session_user_id', 'role', 'content')
        }),
        ('메타데이터', {
            'fields': ('metadata_display', 'timestamp'),
            'classes': ('collapse',)
        }),
    )
    
    def content_preview(self, obj):
        return obj.content[:50] + ('...' if len(obj.content) > 50 else '')
    content_preview.short_description = '내용 미리보기'
    
    def metadata_display(self, obj):
        if obj.metadata:
            return json.dumps(obj.metadata, ensure_ascii=False, indent=2)
        return '-'
    metadata_display.short_description = '메타데이터 (JSON)'
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # 수정 시
            return self.readonly_fields + ['session', 'metadata_display']
        return self.readonly_fields


# ChatSession에 ChatMessage 인라인 추가
ChatSessionAdmin.inlines = [ChatMessageInline]
