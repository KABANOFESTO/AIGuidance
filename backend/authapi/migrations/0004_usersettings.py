from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0003_user_is_email_verified"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserSettings",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("notification_email", models.BooleanField(default=True)),
                ("push_notifications", models.BooleanField(default=True)),
                ("weekly_digest", models.BooleanField(default=False)),
                ("security_alerts", models.BooleanField(default=True)),
                ("language", models.CharField(default="English (US)", max_length=32)),
                (
                    "timezone",
                    models.CharField(
                        default="UTC+02:00 (Central Africa Time)",
                        max_length=64,
                    ),
                ),
                (
                    "theme",
                    models.CharField(
                        choices=[("Light", "Light"), ("Dark", "Dark"), ("System", "System")],
                        default="Light",
                        max_length=16,
                    ),
                ),
                ("two_factor_enabled", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="settings",
                        to="authapi.user",
                    ),
                ),
            ],
        ),
    ]
