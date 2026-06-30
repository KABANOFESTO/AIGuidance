from django.db import models
from accounts.models import User


class StudentProfile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)

    student_id = models.CharField(max_length=50, unique=True)

    interests = models.TextField()

    career_goal = models.TextField()

    learning_preferences = models.TextField()

    attendance_percentage = models.FloatField(default=0)

    def __str__(self):
        return self.user.username
