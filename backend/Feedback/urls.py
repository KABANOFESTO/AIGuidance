from django.urls import path

from Feedback.views import FeedbackAdminOverviewView, FeedbackListCreateView

urlpatterns = [
    path("", FeedbackListCreateView.as_view(), name="feedback-list-create"),
    path("admin-overview/", FeedbackAdminOverviewView.as_view(), name="feedback-admin-overview"),
]
