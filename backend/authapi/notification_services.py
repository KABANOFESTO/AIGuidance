from django.utils import timezone

from authapi.models import UserNotification


def create_notification(user, title, message, notification_type="system", link="", metadata=None):
    return UserNotification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type,
        link=link,
        metadata=metadata or {},
    )


def notify_many(users, title, message, notification_type="system", link="", metadata=None):
    return [
        create_notification(user, title, message, notification_type=notification_type, link=link, metadata=metadata)
        for user in users
    ]


def mark_notification_read(notification):
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at"])
    return notification
