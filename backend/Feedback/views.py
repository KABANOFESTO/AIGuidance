from rest_framework import generics, permissions

from Feedback.models import Feedback
from Feedback.serializers import FeedbackSerializer
from authapi.permissions import IsAdminOrLecturer, IsAdminOrStudentOrLecturer


class FeedbackListCreateView(generics.ListCreateAPIView):
    queryset = Feedback.objects.select_related("user")
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role == "Student":
            return queryset.filter(user=self.request.user)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FeedbackAdminOverviewView(generics.ListAPIView):
    queryset = Feedback.objects.select_related("user")
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]
