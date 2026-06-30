from django.db import models

from academics.models import Course
from students.models import StudentProfile


class CourseRecommendation(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="course_recommendations")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="recommendations")
    reason = models.TextField()
    confidence_score = models.FloatField()
    generated_from = models.CharField(max_length=100, blank=True, default="rule_engine")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.student_id} -> {self.course.code}"


class CareerRecommendation(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="career_recommendations")
    career_name = models.CharField(max_length=100)
    explanation = models.TextField()
    match_percentage = models.FloatField()
    framework = models.CharField(max_length=100, blank=True, default="interest_framework")
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.student_id} -> {self.career_name}"


class PerformanceAnalysis(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="performance_analyses")
    performance_score = models.FloatField()
    risk_level = models.CharField(
        max_length=20,
        choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")],
    )
    recommendation = models.TextField()
    indicators = models.JSONField(default=dict, blank=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-analyzed_at"]

    def __str__(self):
        return f"{self.student.student_id} - {self.risk_level}"
