from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="UserNotification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=200)),
                ("message", models.TextField()),
                ("notification_type", models.CharField(choices=[("system", "System"), ("academic", "Academic"), ("recommendation", "Recommendation"), ("chat", "Chat"), ("audit", "Audit")], default="system", max_length=30)),
                ("link", models.CharField(blank=True, default="", max_length=255)),
                ("is_read", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("read_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="notifications", to="authapi.user")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
