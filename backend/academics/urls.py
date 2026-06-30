from django.urls import path

from academics.views import (
    AcademicRecordListCreateView,
    AcademicSummaryView,
    AttendanceRecordListCreateView,
    CourseDetailView,
    CourseListCreateView,
)

urlpatterns = [
    path("courses/", CourseListCreateView.as_view(), name="course-list-create"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("records/", AcademicRecordListCreateView.as_view(), name="academic-record-list-create"),
    path("attendance/", AttendanceRecordListCreateView.as_view(), name="attendance-list-create"),
    path("summary/", AcademicSummaryView.as_view(), name="academic-summary"),
]
