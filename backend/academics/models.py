from django.db import models

from students.models import StudentProfile


class Course(models.Model):
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField()
    department = models.CharField(max_length=100, blank=True, default="")
    level = models.CharField(max_length=30, blank=True, default="")
    credits = models.IntegerField(default=0)
    keywords = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class AcademicRecord(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="academic_records")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="academic_records")
    assignment_score = models.FloatField(default=0)
    exam_score = models.FloatField(default=0)
    attendance_score = models.FloatField(default=0)
    grade = models.CharField(max_length=5)
    semester = models.CharField(max_length=20)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "course", "semester")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.student.student_id} - {self.course.code}"

    @property
    def total_score(self):
        return round((self.assignment_score * 0.4) + (self.exam_score * 0.5) + (self.attendance_score * 0.1), 2)


class AttendanceRecord(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="attendance_records")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=[("present", "Present"), ("absent", "Absent"), ("late", "Late"), ("excused", "Excused")],
    )
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "course", "date")
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.student.student_id} - {self.course.code} - {self.date}"
