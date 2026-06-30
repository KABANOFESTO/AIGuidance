# Generated manually to match the current feedback app models.

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Feedback",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(blank=True, default="", max_length=150)),
                ("message", models.TextField()),
                (
                    "rating",
                    models.IntegerField(
                        choices=[
                            (1, "Poor"),
                            (2, "Average"),
                            (3, "Good"),
                            (4, "Very Good"),
                            (5, "Excellent"),
                        ]
                    ),
                ),
                ("category", models.CharField(blank=True, default="general", max_length=50)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "user",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="feedback_entries", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
