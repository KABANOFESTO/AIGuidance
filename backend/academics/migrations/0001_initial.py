# Generated manually to match the current academics app models.

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("students", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=20, unique=True)),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("department", models.CharField(blank=True, default="", max_length=100)),
                ("level", models.CharField(blank=True, default="", max_length=30)),
                ("credits", models.IntegerField(default=0)),
                ("keywords", models.JSONField(blank=True, default=list)),
                ("is_active", models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name="AcademicRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("assignment_score", models.FloatField(default=0)),
                ("exam_score", models.FloatField(default=0)),
                ("attendance_score", models.FloatField(default=0)),
                ("grade", models.CharField(max_length=5)),
                ("semester", models.CharField(max_length=20)),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "course",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academic_records", to="academics.course"),
                ),
                (
                    "student",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="academic_records", to="students.studentprofile"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "unique_together": {("student", "course", "semester")},
            },
        ),
        migrations.CreateModel(
            name="AttendanceRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("date", models.DateField()),
                (
                    "status",
                    models.CharField(
                        choices=[("present", "Present"), ("absent", "Absent"), ("late", "Late"), ("excused", "Excused")],
                        max_length=20,
                    ),
                ),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "course",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attendance_records", to="academics.course"),
                ),
                (
                    "student",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="attendance_records", to="students.studentprofile"),
                ),
            ],
            options={
                "ordering": ["-date", "-created_at"],
                "unique_together": {("student", "course", "date")},
            },
        ),
    ]
