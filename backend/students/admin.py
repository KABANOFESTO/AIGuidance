from django.contrib import admin

from .models import BehaviourLog, StudentProfile


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("student_id", "user", "attendance_percentage", "overall_gpa", "risk_score", "updated_at")
    list_filter = ("attendance_percentage", "risk_score", "updated_at")
    search_fields = ("student_id", "user__username", "user__email")


@admin.register(BehaviourLog)
class BehaviourLogAdmin(admin.ModelAdmin):
    list_display = ("id", "student", "title", "severity", "created_at")
    list_filter = ("severity", "created_at")
    search_fields = ("student__student_id", "title", "details")
