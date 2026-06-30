# Generated manually to match the current recommendations app models.

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("academics", "0001_initial"),
        ("students", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CareerRecommendation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("career_name", models.CharField(max_length=100)),
                ("explanation", models.TextField()),
                ("match_percentage", models.FloatField()),
                ("framework", models.CharField(blank=True, default="interest_framework", max_length=100)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "student",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="career_recommendations", to="students.studentprofile"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="CourseRecommendation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("reason", models.TextField()),
                ("confidence_score", models.FloatField()),
                ("generated_from", models.CharField(blank=True, default="rule_engine", max_length=100)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "course",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="recommendations", to="academics.course"),
                ),
                (
                    "student",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="course_recommendations", to="students.studentprofile"),
                ),
            ],
            options={
                "ordering": ["-created_at"],
                "unique_together": {("student", "course")},
            },
        ),
        migrations.CreateModel(
            name="PerformanceAnalysis",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("performance_score", models.FloatField()),
                ("risk_level", models.CharField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")], max_length=20)),
                ("recommendation", models.TextField()),
                ("indicators", models.JSONField(blank=True, default=dict)),
                ("analyzed_at", models.DateTimeField(auto_now_add=True)),
                (
                    "student",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="performance_analyses", to="students.studentprofile"),
                ),
            ],
            options={
                "ordering": ["-analyzed_at"],
            },
        ),
    ]
