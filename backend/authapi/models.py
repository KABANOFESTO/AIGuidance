from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets
import string


class User(AbstractUser):

    username = models.CharField(max_length=150, unique=False)

    email = models.EmailField(unique=True)

    ROLE_CHOICES = (
        ("Admin", "Admin"),
        ("Student", "Student"),
        ("Lecturer", "Lecturer"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    STATUS_CHOICES = (
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Active")
    is_email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]
    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
        help_text="Upload a profile picture",
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

    def get_profile_picture_url(self):
        """Return the URL of the profile picture or None if not set"""
        if self.profile_picture:
            return self.profile_picture.url
        return None

    @classmethod
    def generate_random_password(cls):
        """Generate a secure random password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return "".join(secrets.choice(alphabet) for _ in range(12))

    def save(self, *args, **kwargs):
        """Override save to keep is_active and status fields synchronized"""
        if self.status == "Active":
            self.is_active = True
        else:
            self.is_active = False

        super().save(*args, **kwargs)

    def activate(self):
        """Activate the user"""
        self.status = "Active"
        self.is_active = True
        self.save(update_fields=["status", "is_active"])

    def deactivate(self):
        """Deactivate the user"""
        self.status = "Inactive"
        self.is_active = False
        self.save(update_fields=["status", "is_active"])

    @property
    def is_user_active(self):
        """Check if user is active (using status field as source of truth)"""
        return self.status == "Active"


class UserSettings(models.Model):
    THEME_CHOICES = (
        ("Light", "Light"),
        ("Dark", "Dark"),
        ("System", "System"),
    )

    user = models.OneToOneField(
        "authapi.User",
        on_delete=models.CASCADE,
        related_name="settings",
    )
    notification_email = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    weekly_digest = models.BooleanField(default=False)
    security_alerts = models.BooleanField(default=True)
    language = models.CharField(max_length=32, default="English (US)")
    timezone = models.CharField(max_length=64, default="UTC+02:00 (Central Africa Time)")
    theme = models.CharField(max_length=16, choices=THEME_CHOICES, default="Light")
    two_factor_enabled = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} settings"


class UserNotification(models.Model):
    NOTIFICATION_TYPES = (
        ("system", "System"),
        ("academic", "Academic"),
        ("recommendation", "Recommendation"),
        ("chat", "Chat"),
        ("audit", "Audit"),
    )

    user = models.ForeignKey(
        "authapi.User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default="system")
    link = models.CharField(max_length=255, blank=True, default="")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.title}"
