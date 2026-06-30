from django.urls import path

from students.views import (
    BehaviourLogListCreateView,
    MyStudentProfileView,
    StudentProfileAdminUpsertView,
    StudentProfileDetailView,
    StudentProfileListView,
)

urlpatterns = [
    path("profiles/", StudentProfileListView.as_view(), name="student-profile-list"),
    path("profiles/me/", MyStudentProfileView.as_view(), name="student-profile-me"),
    path("profiles/<int:pk>/", StudentProfileDetailView.as_view(), name="student-profile-detail"),
    path("profiles/<int:pk>/admin-update/", StudentProfileAdminUpsertView.as_view(), name="student-profile-admin-update"),
    path("behaviour-logs/", BehaviourLogListCreateView.as_view(), name="behaviour-log-list-create"),
]
