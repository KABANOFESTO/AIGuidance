from django.urls import path

from recommendations.views import (
    CareerRecommendationGenerateView,
    CareerRecommendationListView,
    CourseRecommendationGenerateView,
    CourseRecommendationListView,
    PerformanceAnalysisGenerateView,
    PerformanceAnalysisListView,
    AdminStudentAIRecomputeView,
    AdminRecommendationModelTrainView,
    AdminRecommendationModelStatusView,
    AdminRecommendationModelHistoryView,
    RecommendationRegenerateView,
)

urlpatterns = [
    path("courses/", CourseRecommendationListView.as_view(), name="course-recommendation-list"),
    path("courses/generate/", CourseRecommendationGenerateView.as_view(), name="course-recommendation-generate"),
    path("careers/", CareerRecommendationListView.as_view(), name="career-recommendation-list"),
    path("careers/generate/", CareerRecommendationGenerateView.as_view(), name="career-recommendation-generate"),
    path("performance/", PerformanceAnalysisListView.as_view(), name="performance-analysis-list"),
    path("performance/generate/", PerformanceAnalysisGenerateView.as_view(), name="performance-analysis-generate"),
    path("regenerate/", RecommendationRegenerateView.as_view(), name="recommendation-regenerate"),
    path("admin/recompute/", AdminStudentAIRecomputeView.as_view(), name="admin-student-ai-recompute"),
    path("admin/train/", AdminRecommendationModelTrainView.as_view(), name="recommendation-model-train"),
    path("admin/status/", AdminRecommendationModelStatusView.as_view(), name="recommendation-model-status"),
    path("admin/history/", AdminRecommendationModelHistoryView.as_view(), name="recommendation-model-history"),
]
