from django.db import models
from accounts.models import User


class ChatConversation(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    message = models.TextField()

    ai_response = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class KnowledgeBase(models.Model):

    question = models.TextField()

    answer = models.TextField()

    category = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
