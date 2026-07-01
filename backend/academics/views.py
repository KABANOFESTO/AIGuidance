from django.db.models import Avg
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from academics.models import AcademicRecord, AttendanceRecord, Course, CourseEnrollment, CourseMaterial
from academics.serializers import (
    AcademicRecordCreateSerializer,
    AcademicRecordSerializer,
    AcademicSummarySerializer,
    AttendanceRecordCreateSerializer,
    AttendanceRecordSerializer,
    CourseEnrollmentCreateSerializer,
    CourseEnrollmentSerializer,
    CourseMaterialSerializer,
    CourseSerializer,
)
from academics.services import refresh_student_profile
from authapi.permissions import IsAdmin, IsAdminOrLecturer, IsAdminOrStudentOrLecturer
from recommendations.services import regenerate_student_recommendations
from students.models import StudentProfile


def _student_profile_for_request(request):
    if request.user.role == "Student":
        return StudentProfile.objects.filter(user=request.user).first()
    student_id = request.query_params.get("student_id") or request.data.get("student_id")
    if student_id:
        return StudentProfile.objects.filter(student_id=student_id).first()
    return None


def _has_student_course_access(user, course: Course) -> bool:
    if user.role in {"Admin", "Lecturer"}:
        return True
    if user.role != "Student":
        return False
    student = StudentProfile.objects.filter(user=user).first()
    if not student:
        return False
    return CourseEnrollment.objects.filter(student=student, course=course).exists() or AcademicRecord.objects.filter(student=student, course=course).exists()


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminOrLecturer()]

    def get_queryset(self):
        queryset = super().get_queryset().order_by("code")
        if self.request.user.role == "Student":
            return queryset.filter(is_active=True)
        return queryset


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminOrLecturer()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == "Student":
            return queryset.filter(is_active=True)
        return queryset


class CourseEnrollmentListCreateView(generics.ListCreateAPIView):
    queryset = CourseEnrollment.objects.select_related("student", "student__user", "course")

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CourseEnrollmentCreateSerializer
        return CourseEnrollmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        course_id = self.request.query_params.get("course_id")

        if self.request.user.role == "Student":
            profile = StudentProfile.objects.filter(user=self.request.user).first()
            if profile:
                queryset = queryset.filter(student=profile)
            else:
                queryset = queryset.none()
        elif student_id:
            queryset = queryset.filter(student__student_id=student_id)

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save()


class CourseEnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseEnrollment.objects.select_related("student", "student__user", "course")
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == "Student":
            profile = StudentProfile.objects.filter(user=self.request.user).first()
            return queryset.filter(student=profile) if profile else queryset.none()
        return queryset


class CourseMaterialListCreateView(generics.ListCreateAPIView):
    queryset = CourseMaterial.objects.select_related("course", "uploaded_by")
    serializer_class = CourseMaterialSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAuthenticated(), IsAdminOrLecturer()]
        return [permissions.IsAuthenticated(), IsAdminOrStudentOrLecturer()]

    def get_queryset(self):
        queryset = super().get_queryset()
        course_id = self.request.query_params.get("course_id")

        if self.request.user.role == "Student":
            profile = StudentProfile.objects.filter(user=self.request.user).first()
            if profile:
                queryset = queryset.filter(
                    is_published=True,
                    course__enrollments__student=profile,
                ).distinct()
            else:
                queryset = queryset.none()
        elif self.request.user.role == "Lecturer":
            queryset = queryset.filter(uploaded_by=self.request.user)

        if course_id:
            queryset = queryset.filter(course_id=course_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class CourseMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseMaterial.objects.select_related("course", "uploaded_by")
    serializer_class = CourseMaterialSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [permissions.IsAuthenticated(), IsAdminOrLecturer()]
        return [permissions.IsAuthenticated(), IsAdminOrStudentOrLecturer()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == "Lecturer":
            queryset = queryset.filter(uploaded_by=self.request.user)
        elif self.request.user.role == "Student":
            profile = StudentProfile.objects.filter(user=self.request.user).first()
            if profile:
                queryset = queryset.filter(is_published=True, course__enrollments__student=profile).distinct()
            else:
                queryset = queryset.none()
        return queryset


class CourseMaterialDownloadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get(self, request, pk):
        material = get_object_or_404(
            CourseMaterial.objects.select_related("course", "uploaded_by"),
            pk=pk,
        )

        if request.user.role == "Student" and not _has_student_course_access(request.user, material.course):
            return Response({"detail": "You do not have access to this material."}, status=status.HTTP_403_FORBIDDEN)
        if request.user.role == "Lecturer" and material.uploaded_by_id != request.user.id:
            return Response({"detail": "You do not have access to this material."}, status=status.HTTP_403_FORBIDDEN)

        material.downloads += 1
        material.save(update_fields=["downloads", "updated_at"])

        file_handle = material.file.open("rb")
        response = FileResponse(file_handle, as_attachment=True, filename=material.filename)
        response["X-Download-Count"] = str(material.downloads)
        return response


class AcademicRecordListCreateView(generics.ListCreateAPIView):
    queryset = AcademicRecord.objects.select_related("student", "student__user", "course")
    serializer_class = AcademicRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AcademicRecordCreateSerializer
        return AcademicRecordSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        elif self.request.user.role == "Student":
            queryset = queryset.filter(student__user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        record = serializer.save()
        refresh_student_profile(record.student)
        regenerate_student_recommendations(record.student)


class AttendanceRecordListCreateView(generics.ListCreateAPIView):
    queryset = AttendanceRecord.objects.select_related("student", "student__user", "course")
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AttendanceRecordCreateSerializer
        return AttendanceRecordSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        elif self.request.user.role == "Student":
            queryset = queryset.filter(student__user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        record = serializer.save()
        refresh_student_profile(record.student)
        regenerate_student_recommendations(record.student)


class AcademicSummaryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get(self, request):
        student_id = request.query_params.get("student_id")
        if request.user.role == "Student":
            profile = StudentProfile.objects.filter(user=request.user).first()
        else:
            profile = StudentProfile.objects.filter(student_id=student_id).first() if student_id else None

        if not profile:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

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


