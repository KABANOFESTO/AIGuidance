from django.contrib import admin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "rating", "category", "created_at")
    list_filter = ("rating", "category", "created_at")
    search_fields = ("user__username", "user__email", "title", "message")
