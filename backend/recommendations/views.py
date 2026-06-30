from rest_framework import generics, permissions, status
from rest_framework.response import Response

from authapi.permissions import IsAdminOrLecturer, IsAdminOrStudentOrLecturer
from recommendations.models import CareerRecommendation, CourseRecommendation, PerformanceAnalysis
from recommendations.serializers import (
    CareerRecommendationSerializer,
    CourseRecommendationSerializer,
    PerformanceAnalysisSerializer,
)
from recommendations.services import (
    analyze_performance,
    generate_career_recommendations,
    generate_course_recommendations,
)
from students.models import StudentProfile


def _resolve_student(request):
    if request.user.role == "Student":
        return StudentProfile.objects.filter(user=request.user).first()
    student_id = request.query_params.get("student_id") or request.data.get("student_id")
    if student_id:
        return StudentProfile.objects.filter(student_id=student_id).first()
    return None


class CourseRecommendationListView(generics.ListAPIView):
    serializer_class = CourseRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get_queryset(self):
        queryset = CourseRecommendation.objects.select_related("student", "course", "student__user")
        student = _resolve_student(self.request)
        if student:
            queryset = queryset.filter(student=student)
        return queryset


class CourseRecommendationGenerateView(generics.GenericAPIView):
    serializer_class = CourseRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def post(self, request):
        student = _resolve_student(request)
        if not student:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        recommendations = generate_course_recommendations(student)
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)


class CareerRecommendationListView(generics.ListAPIView):
    serializer_class = CareerRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get_queryset(self):
        queryset = CareerRecommendation.objects.select_related("student", "student__user")
        student = _resolve_student(self.request)
        if student:
            queryset = queryset.filter(student=student)
        return queryset


class CareerRecommendationGenerateView(generics.GenericAPIView):
    serializer_class = CareerRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def post(self, request):
        student = _resolve_student(request)
        if not student:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        recommendations = generate_career_recommendations(student)
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)


class PerformanceAnalysisListView(generics.ListAPIView):
    serializer_class = PerformanceAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def get_queryset(self):
        queryset = PerformanceAnalysis.objects.select_related("student", "student__user")
        student = _resolve_student(self.request)
        if student:
            queryset = queryset.filter(student=student)
        return queryset


class PerformanceAnalysisGenerateView(generics.GenericAPIView):
    serializer_class = PerformanceAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def post(self, request):
        student = _resolve_student(request)
        if not student:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)
        analysis = analyze_performance(student)
        serializer = self.get_serializer(analysis)
        return Response(serializer.data)
