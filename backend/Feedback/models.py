from django.db import models
from accounts.models import User


class Feedback(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

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

    created_at = models.DateTimeField(auto_now_add=True)
