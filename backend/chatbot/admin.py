from django.contrib import admin

from .models import ChatConversation, KnowledgeBase


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "session_id", "intent", "confidence", "is_flagged", "created_at")
    list_filter = ("intent", "is_flagged", "escalated_to_admin", "created_at")
    search_fields = ("user__username", "user_message", "bot_response", "session_id")
    readonly_fields = ("created_at", "updated_at")


@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ("id", "question", "category", "priority", "is_pinned", "is_active", "created_at")
    list_filter = ("category", "priority", "is_pinned", "is_active")
    search_fields = ("question", "answer", "category")
    readonly_fields = ("created_at", "updated_at")
