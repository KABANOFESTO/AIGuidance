from rest_framework import serializers

from authapi.models import UserNotification


class UserNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = "__all__"
        read_only_fields = ("id", "created_at", "read_at", "user")
