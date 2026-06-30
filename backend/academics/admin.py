from django.contrib import admin

from .models import AcademicRecord, AttendanceRecord, Course, CourseMaterial


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "department", "level", "credits", "is_active")
    list_filter = ("department", "level", "is_active")
    search_fields = ("code", "name", "description")


@admin.register(AcademicRecord)
class AcademicRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "grade", "semester", "total_score", "updated_at")
    list_filter = ("semester", "grade")
    search_fields = ("student__student_id", "course__code", "course__name")


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "date", "status", "created_at")
    list_filter = ("status", "date")
    search_fields = ("student__student_id", "course__code", "course__name")


@admin.register(CourseMaterial)
class CourseMaterialAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "file_type", "is_published", "downloads", "uploaded_by", "created_at")
    list_filter = ("course", "file_type", "is_published", "created_at")
    search_fields = ("title", "description", "course__code", "course__name", "uploaded_by__username")
