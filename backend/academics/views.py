from django.db.models import Avg
from rest_framework import generics, permissions
from rest_framework.response import Response

from academics.models import AcademicRecord, AttendanceRecord, Course
from academics.serializers import (
    AcademicRecordSerializer,
    AcademicSummarySerializer,
    AttendanceRecordSerializer,
    CourseSerializer,
)
from authapi.permissions import IsAdmin, IsAdminOrLecturer, IsAdminOrStudentOrLecturer
from students.models import StudentProfile


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]


class AcademicRecordListCreateView(generics.ListCreateAPIView):
    queryset = AcademicRecord.objects.select_related("student", "student__user", "course")
    serializer_class = AcademicRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        elif self.request.user.role == "Student":
            queryset = queryset.filter(student__user=self.request.user)
        return queryset


class AttendanceRecordListCreateView(generics.ListCreateAPIView):
    queryset = AttendanceRecord.objects.select_related("student", "student__user", "course")
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        elif self.request.user.role == "Student":
            queryset = queryset.filter(student__user=self.request.user)
        return queryset


class AcademicSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get(self, request):
        student_id = request.query_params.get("student_id")
        if request.user.role == "Student":
            profile = StudentProfile.objects.filter(user=request.user).first()
        else:
            profile = StudentProfile.objects.filter(student_id=student_id).first() if student_id else None

        if not profile:
            return Response({"detail": "Student profile not found."}, status=404)

        records = profile.academic_records.select_related("course")
        attendance_rate = float(profile.attendance_percentage or 0)
        overall_score = records.aggregate(avg_score=Avg("assignment_score"))["avg_score"] or 0
        recent_grades = [
            {
                "course": record.course.name,
                "grade": record.grade,
                "semester": record.semester,
                "total_score": record.total_score,
            }
            for record in records.order_by("-updated_at")[:5]
        ]
        payload = {
            "student": profile.student_id,
            "overall_score": round(overall_score, 2),
            "attendance_rate": round(attendance_rate, 2),
            "at_risk": profile.is_at_risk,
            "total_courses": records.count(),
            "recent_grades": recent_grades,
        }
        return Response(AcademicSummarySerializer(payload).data)
