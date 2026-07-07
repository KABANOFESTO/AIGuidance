from rest_framework import generics, permissions, status
from rest_framework.response import Response

from authapi.permissions import IsAdmin, IsAdminOrLecturer, IsAdminOrStudentOrLecturer
from chatbot.models import ChatConversation, KnowledgeBase
from chatbot.serializers import ChatConversationSerializer, ChatRequestSerializer, KnowledgeBaseSerializer
from chatbot.services import build_chat_response


class ChatBotMessageView(generics.GenericAPIView):
    serializer_class = ChatRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = build_chat_response(
            user=request.user,
            message=serializer.validated_data["message"],
            session_id=serializer.validated_data.get("session_id"),
            response_mode=serializer.validated_data.get("response_mode", "medium"),
        )
        return Response(
            {
                "session_id": payload["session_id"],
                "intent": payload["intent"],
                "confidence": payload["confidence"],
                "response": payload["response"],
                "suggestions": payload["suggestions"],
                "follow_ups": payload["follow_ups"],
                "next_action": payload["next_action"],
                "response_mode": payload["response_mode"],
                "mode_label": payload["mode_label"],
                "conversation_id": payload["conversation"].id,
            },
            status=status.HTTP_200_OK,
        )


class ChatHistoryView(generics.ListAPIView):
    serializer_class = ChatConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get_queryset(self):
        queryset = ChatConversation.objects.select_related("user")
        session_id = self.request.query_params.get("session_id")
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if self.request.user.role == "Student":
            queryset = queryset.filter(user=self.request.user)
        return queryset


class KnowledgeBaseListCreateView(generics.ListCreateAPIView):
    queryset = KnowledgeBase.objects.select_related("created_by")
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class KnowledgeBaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = KnowledgeBase.objects.select_related("created_by")
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class ChatbotHealthView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "status": "ok",
                "message": "Chatbot service is running.",
            }
        )
