from rest_framework import generics, permissions, status
from rest_framework.response import Response

from authapi.models import UserNotification
from authapi.notification_serializers import UserNotificationSerializer
from authapi.notification_services import mark_notification_read


class NotificationListView(generics.ListAPIView):
    serializer_class = UserNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserNotification.objects.filter(user=self.request.user)


class NotificationUnreadCountView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = UserNotification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


class NotificationMarkReadView(generics.UpdateAPIView):
    queryset = UserNotification.objects.all()
    serializer_class = UserNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        notification = self.get_object()
        if notification.user_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        mark_notification_read(notification)
        return Response(self.get_serializer(notification).data)


class NotificationMarkAllReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        UserNotification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."})
