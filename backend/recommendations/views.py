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
    get_recommendation_model_status,
    get_recommendation_training_history,
    regenerate_student_recommendations,
    train_recommendation_models,
)
from students.models import StudentProfile
from academics.services import refresh_student_profile
from authapi.permissions import IsAdmin
from auditLog.audit_log_utils import log_action


def _resolve_student(request):
    if request.user.role == "Student":
        return StudentProfile.objects.filter(user=request.user).first()
    student_id = request.query_params.get("student_id") or request.data.get("student_id")
    if student_id:
        return StudentProfile.objects.filter(student_id=student_id).first()
    return None


def _student_id_from_request(request) -> str | None:
    student_id = request.data.get("student_id") or request.query_params.get("student_id")
    if not student_id:
        return None
    student_id = str(student_id).strip()
    return student_id or None


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
        log_action(
            request,
            "RECOMMENDATION_GENERATE",
            target_user=student.user,
            additional_data={"type": "course", "student_id": student.student_id, "count": len(recommendations)},
        )
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
        log_action(
            request,
            "RECOMMENDATION_GENERATE",
            target_user=student.user,
            additional_data={"type": "career", "student_id": student.student_id, "count": len(recommendations)},
        )
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
        log_action(
            request,
            "RECOMMENDATION_GENERATE",
            target_user=student.user,
            additional_data={"type": "performance", "student_id": student.student_id},
        )
        serializer = self.get_serializer(analysis)
        return Response(serializer.data)


class RecommendationRegenerateView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def post(self, request):
        student = _resolve_student(request)
        if not student:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        payload = regenerate_student_recommendations(student)
        log_action(
            request,
            "RECOMMENDATION_GENERATE",
            target_user=student.user,
            additional_data={"type": "full_refresh", "student_id": student.student_id},
        )
        return Response(
            {
                "message": "Recommendations regenerated successfully.",
                "course_recommendations": CourseRecommendationSerializer(payload["course_recommendations"], many=True).data,
                "career_recommendations": CareerRecommendationSerializer(payload["career_recommendations"], many=True).data,
                "performance_analysis": PerformanceAnalysisSerializer(payload["performance_analysis"]).data,
            }
        )


class AdminStudentAIRecomputeView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        student_id = _student_id_from_request(request)
        if not student_id:
            return Response({"detail": "student_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        student = StudentProfile.objects.select_related("user").filter(student_id=student_id).first()
        if not student:
            return Response({"detail": "Student profile not found."}, status=status.HTTP_404_NOT_FOUND)

        refresh_student_profile(student)
        payload = regenerate_student_recommendations(student)
        log_action(
            request,
            "RECOMMENDATION_RECOMPUTE",
            target_user=student.user,
            additional_data={"student_id": student.student_id, "trigger": "admin_recompute"},
        )

        return Response(
            {
                "message": "Student AI recomputed successfully.",
                "student_id": student.student_id,
                "course_recommendations": CourseRecommendationSerializer(payload["course_recommendations"], many=True).data,
                "career_recommendations": CareerRecommendationSerializer(payload["career_recommendations"], many=True).data,
                "performance_analysis": PerformanceAnalysisSerializer(payload["performance_analysis"]).data,
            }
        )


class AdminRecommendationModelTrainView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request):
        force = str(request.data.get("force", "")).lower() in {"1", "true", "yes", "on"}
        metrics = train_recommendation_models(force=force)
        log_action(
            request,
            "RECOMMENDATION_TRAIN",
            additional_data={"force": force, "metrics": metrics},
        )
        return Response(
            {
                "message": "Recommendation models trained successfully.",
                "metrics": metrics,
            }
        )


class AdminRecommendationModelStatusView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response(get_recommendation_model_status())


class AdminRecommendationModelHistoryView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        limit = request.query_params.get("limit", 20)
        try:
            limit_value = max(1, min(50, int(limit)))
        except (TypeError, ValueError):
            limit_value = 20
        return Response(
            {
                "history": get_recommendation_training_history(limit=limit_value),
                "limit": limit_value,
            }
        )
