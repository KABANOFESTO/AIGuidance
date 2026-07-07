from rest_framework import serializers

from chatbot.models import ChatConversation, KnowledgeBase


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = KnowledgeBase
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "created_by")


class ChatConversationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ChatConversation
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "user",
            "bot_response",
            "intent",
            "confidence",
            "metadata",
        )


class ChatRequestSerializer(serializers.Serializer):
    RESPONSE_MODES = [
        ("short", "Short"),
        ("medium", "Medium"),
        ("detailed", "Detailed"),
    ]

    message = serializers.CharField()
    session_id = serializers.CharField(required=False, allow_blank=True)
    response_mode = serializers.ChoiceField(choices=RESPONSE_MODES, required=False, default="medium")
