from django.urls import path

from chatbot.views import (
    ChatBotMessageView,
    ChatHistoryView,
    ChatbotHealthView,
    KnowledgeBaseDetailView,
    KnowledgeBaseListCreateView,
)

urlpatterns = [
    path("health/", ChatbotHealthView.as_view(), name="chatbot-health"),
    path("message/", ChatBotMessageView.as_view(), name="chatbot-message"),
    path("history/", ChatHistoryView.as_view(), name="chatbot-history"),
    path("knowledge-base/", KnowledgeBaseListCreateView.as_view(), name="knowledge-base-list-create"),
    path("knowledge-base/<int:pk>/", KnowledgeBaseDetailView.as_view(), name="knowledge-base-detail"),
]
