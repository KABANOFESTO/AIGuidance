from django.conf import settings
from django.db import models


class ChatConversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="chat_conversations")
    session_id = models.CharField(max_length=64, db_index=True)
    user_message = models.TextField()
    bot_response = models.TextField()
    intent = models.CharField(max_length=100, blank=True, default="general")
    confidence = models.FloatField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    is_flagged = models.BooleanField(default=False)
    escalated_to_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.intent}"


class KnowledgeBase(models.Model):
    CATEGORY_CHOICES = [
        ("general", "General"),
        ("courses", "Courses"),
        ("career", "Career"),
        ("performance", "Performance"),
        ("auth", "Authentication"),
        ("admin", "Admin"),
    ]

    question = models.TextField()
    answer = models.TextField()
    category = models.CharField(max_length=100)
    keywords = models.JSONField(default=list, blank=True)
    priority = models.PositiveIntegerField(default=1)
    is_pinned = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="knowledge_base_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_pinned", "-priority", "-created_at"]

    def __str__(self):
        return self.question[:60]
