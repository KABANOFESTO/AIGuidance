from django.db import models
from django.conf import settings

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


class CourseEnrollment(models.Model):
    STATUS_CHOICES = [
        ("enrolled", "Enrolled"),
        ("completed", "Completed"),
        ("dropped", "Dropped"),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="course_enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="enrolled")
    notes = models.TextField(blank=True, default="")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "course")
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.student.student_id} -> {self.course.code} ({self.status})"


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


class CourseMaterial(models.Model):
    FILE_TYPE_CHOICES = [
        ("PDF", "PDF"),
        ("PPTX", "PowerPoint"),
        ("DOCX", "Word Document"),
        ("MP4", "Video"),
        ("ZIP", "Archive"),
        ("OTHER", "Other"),
    ]

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="materials")
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True, default="")
    file = models.FileField(upload_to="course_materials/%Y/%m/")
    file_type = models.CharField(max_length=10, choices=FILE_TYPE_CHOICES, default="OTHER")
    file_size = models.BigIntegerField(default=0)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_course_materials",
    )
    is_published = models.BooleanField(default=True)
    downloads = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.course.code} - {self.title}"

    @property
    def filename(self):
        if not self.file:
            return ""
        return self.file.name.split("/")[-1]

    def _detect_file_type(self):
        if not self.file:
            return "OTHER"
        extension = self.file.name.rsplit(".", 1)[-1].upper()
        valid_types = {choice[0] for choice in self.FILE_TYPE_CHOICES}
        return extension if extension in valid_types else "OTHER"

    def save(self, *args, **kwargs):
        if self.file:
            if hasattr(self.file, "size") and self.file.size is not None:
                self.file_size = self.file.size
            self.file_type = self._detect_file_type()
        super().save(*args, **kwargs)
