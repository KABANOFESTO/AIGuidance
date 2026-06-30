from django.contrib import admin

from .models import CareerRecommendation, CourseRecommendation, PerformanceAnalysis


@admin.register(CourseRecommendation)
class CourseRecommendationAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "confidence_score", "generated_from", "created_at")
    list_filter = ("generated_from", "created_at")
    search_fields = ("student__student_id", "course__code", "course__name")


@admin.register(CareerRecommendation)
class CareerRecommendationAdmin(admin.ModelAdmin):
    list_display = ("student", "career_name", "match_percentage", "framework", "created_at")
    list_filter = ("framework", "created_at")
    search_fields = ("student__student_id", "career_name")


@admin.register(PerformanceAnalysis)
class PerformanceAnalysisAdmin(admin.ModelAdmin):
    list_display = ("student", "performance_score", "risk_level", "analyzed_at")
    list_filter = ("risk_level", "analyzed_at")
    search_fields = ("student__student_id",)
