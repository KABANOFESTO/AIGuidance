from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from authapi.permissions import IsAdmin, IsAdminOrLecturer, IsAdminOrStudentOrLecturer
from students.models import BehaviourLog, StudentProfile
from students.serializers import (
    BehaviourLogSerializer,
    StudentProfileSerializer,
    StudentProfileUpsertSerializer,
    StudentSummarySerializer,
)


class StudentProfileListView(generics.ListAPIView):
    queryset = StudentProfile.objects.select_related("user").prefetch_related("academic_records", "behaviour_logs")
    serializer_class = StudentSummarySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]


class StudentProfileDetailView(generics.RetrieveAPIView):
    queryset = StudentProfile.objects.select_related("user").prefetch_related("academic_records", "behaviour_logs")
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get_object(self):
        obj = super().get_object()
        if self.request.user.role == "Student" and obj.user_id != self.request.user.id:
            raise PermissionDenied("You can only view your own profile.")
        return obj


class MyStudentProfileView(generics.GenericAPIView):
    serializer_class = StudentProfileUpsertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={"student_id": f"STU-{self.request.user.id:05d}"},
        )
        return profile

    def get(self, request):
        profile = self.get_object()
        return Response(StudentProfileSerializer(profile).data)

    def put(self, request):
        return self._update(request, partial=False)

    def patch(self, request):
        return self._update(request, partial=True)

    def _update(self, request, partial=False):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = StudentProfileSerializer(profile).data
        return Response(response, status=status.HTTP_200_OK)


class StudentProfileAdminUpsertView(generics.UpdateAPIView):
    queryset = StudentProfile.objects.select_related("user")
    serializer_class = StudentProfileUpsertSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]


class BehaviourLogListCreateView(generics.ListCreateAPIView):
    queryset = BehaviourLog.objects.select_related("student", "student__user")
    serializer_class = BehaviourLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def get_queryset(self):
        queryset = super().get_queryset()
        student_id = self.request.query_params.get("student_id")
        if student_id:
            queryset = queryset.filter(student__student_id=student_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save()
