# Generated manually for course enrollment support.

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("academics", "0002_coursematerial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseEnrollment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("enrolled", "Enrolled"), ("completed", "Completed"), ("dropped", "Dropped")], default="enrolled", max_length=20)),
                ("notes", models.TextField(blank=True, default="")),
                ("enrolled_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="course_enrollments", to="students.studentprofile")),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="enrollments", to="academics.course")),
            ],
            options={
                "ordering": ["-enrolled_at"],
                "unique_together": {("student", "course")},
            },
        ),
    ]
