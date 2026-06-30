from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=50, unique=True)
    interests = models.TextField(blank=True, default="")
    career_goal = models.TextField(blank=True, default="")
    learning_preferences = models.JSONField(default=dict, blank=True)
    behaviour_data = models.JSONField(default=dict, blank=True)
    academic_strengths = models.JSONField(default=list, blank=True)
    attendance_percentage = models.FloatField(default=0)
    overall_gpa = models.FloatField(default=0)
    risk_score = models.FloatField(default=0)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.student_id})"

    @property
    def is_at_risk(self):
        return self.risk_score >= 0.6 or self.attendance_percentage < 70


class BehaviourLog(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="behaviour_logs")
    title = models.CharField(max_length=200)
    details = models.TextField(blank=True, default="")
    severity = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
        default="low",
    )
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.student_id} - {self.title}"
