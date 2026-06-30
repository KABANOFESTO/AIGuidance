from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "role", "status", "is_active")
    list_filter = ("role", "status", "is_active")
    search_fields = ("username", "email")
