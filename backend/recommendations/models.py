from django.db import models
from students.models import StudentProfile
from academics.models import Course


class CourseRecommendation(models.Model):

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    reason = models.TextField()

    confidence_score = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.course.name


class CareerRecommendation(models.Model):

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

    career_name = models.CharField(max_length=100)

    explanation = models.TextField()

    match_percentage = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)


class PerformanceAnalysis(models.Model):

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

    performance_score = models.FloatField()

    risk_level = models.CharField(
        max_length=20, choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")]
    )

    recommendation = models.TextField()

    analyzed_at = models.DateTimeField(auto_now_add=True)
