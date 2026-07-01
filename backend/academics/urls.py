from django.urls import path

from academics.views import (
    AcademicRecordListCreateView,
    AcademicSummaryView,
    AttendanceRecordListCreateView,
    CourseDetailView,
    CourseEnrollmentDetailView,
    CourseEnrollmentListCreateView,
    CourseListCreateView,
    CourseMaterialDetailView,
    CourseMaterialDownloadView,
    CourseMaterialListCreateView,
)

urlpatterns = [
    path("courses/", CourseListCreateView.as_view(), name="course-list-create"),
    path("courses/<int:pk>/", CourseDetailView.as_view(), name="course-detail"),
    path("enrollments/", CourseEnrollmentListCreateView.as_view(), name="course-enrollment-list-create"),
    path("enrollments/<int:pk>/", CourseEnrollmentDetailView.as_view(), name="course-enrollment-detail"),
    path("materials/", CourseMaterialListCreateView.as_view(), name="course-material-list-create"),
    path("materials/<int:pk>/", CourseMaterialDetailView.as_view(), name="course-material-detail"),
    path("materials/<int:pk>/download/", CourseMaterialDownloadView.as_view(), name="course-material-download"),
    path("records/", AcademicRecordListCreateView.as_view(), name="academic-record-list-create"),
    path("attendance/", AttendanceRecordListCreateView.as_view(), name="attendance-list-create"),
    path("summary/", AcademicSummaryView.as_view(), name="academic-summary"),
]
