from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("academics", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseMaterial",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=150)),
                ("description", models.TextField(blank=True, default="")),
                ("file", models.FileField(upload_to="course_materials/%Y/%m/")),
                (
                    "file_type",
                    models.CharField(
                        choices=[
                            ("PDF", "PDF"),
                            ("PPTX", "PowerPoint"),
                            ("DOCX", "Word Document"),
                            ("MP4", "Video"),
                            ("ZIP", "Archive"),
                            ("OTHER", "Other"),
                        ],
                        default="OTHER",
                        max_length=10,
                    ),
                ),
                ("file_size", models.BigIntegerField(default=0)),
                ("is_published", models.BooleanField(default=True)),
                ("downloads", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "course",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="materials", to="academics.course"),
                ),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="uploaded_course_materials",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
