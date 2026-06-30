from django.conf import settings
from django.db import models


class Feedback(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedback_entries")
    title = models.CharField(max_length=150, blank=True, default="")
    message = models.TextField()
    rating = models.IntegerField(
        choices=[
            (1, "Poor"),
            (2, "Average"),
            (3, "Good"),
            (4, "Very Good"),
            (5, "Excellent"),
        ]
    )
    category = models.CharField(max_length=50, blank=True, default="general")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.rating}"
