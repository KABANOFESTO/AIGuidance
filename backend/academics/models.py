from django.db import models
from students.models import StudentProfile


class Course(models.Model):

    code = models.CharField(max_length=20, unique=True)

    name = models.CharField(max_length=100)

    description = models.TextField()

    credits = models.IntegerField()

    def __str__(self):
        return self.name


class AcademicRecord(models.Model):

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)

    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    assignment_score = models.FloatField()

    exam_score = models.FloatField()

    grade = models.CharField(max_length=5)

    semester = models.CharField(max_length=20)

    def __str__(self):
        return self.student.user.username
