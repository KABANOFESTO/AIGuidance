from django.shortcuts import render
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.db.models import Avg, Count, Q
from django.utils import timezone
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    ProfileUpdateSerializer,
    AdminUserCreateSerializer,
)
from .permissions import (
    IsAdmin,
    IsAdminOrLecturer,
    IsAdminOrStudentOrLecturer,
    IsStudent,
    IsLecturer,
)
from auditLog.audit_log_utils import log_action
from auditLog.models import AuditLog
from chatbot.models import ChatConversation
from Feedback.models import Feedback
from academics.models import CourseMaterial
from recommendations.models import CareerRecommendation, CourseRecommendation, PerformanceAnalysis
from students.models import StudentProfile
import logging

logger = logging.getLogger(__name__)


def _build_frontend_url(path: str) -> str:
    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
    return f"{frontend_url.rstrip('/')}/{path.lstrip('/')}"


def _send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_link = _build_frontend_url(f"auth/verify-email/{uid}/{token}")

    send_mail(
        subject="Verify your AI Guidance account",
        message=f"Hello {user.username},\n\n"
        f"Thanks for signing up. Please verify your email to activate your account:\n\n"
        f"{verify_link}\n\n"
        f"If you did not create this account, you can ignore this email.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return verify_link


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        if user.role == "Student":
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={"student_id": f"STU-{user.id:05d}"},
            )
        try:
            verify_link = _send_verification_email(user)
            email_sent = True
        except Exception as exc:
            email_sent = False
            verify_link = None
            logger.error(f"Failed to send verification email to {user.email}: {str(exc)}")
        log_action(
            self.request,
            "USER_CREATE",
            target_user=user,
            additional_data={
                "registration_method": "self_registration",
                "verification_email_sent": email_sent,
            },
        )
        logger.info(f"New user self-registered: {user.email}")
        self.verification_link = verify_link

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                "message": "Account created. Please verify your email before logging in.",
                "email": serializer.validated_data.get("email"),
                "verification_required": True,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class AdminUserCreateView(generics.CreateAPIView):
    serializer_class = AdminUserCreateSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        requested_role = request.data.get("role")
        admin_exists = User.objects.filter(role="Admin").exists()
        is_admin_user = request.user.is_authenticated and getattr(request.user, "role", None) == "Admin"
        created_by = request.user.email if request.user.is_authenticated else "system-bootstrap"

        if requested_role == "Admin" and admin_exists and not is_admin_user:
            return Response(
                {"detail": "Admin creation requires an existing admin account."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if requested_role != "Admin" and not is_admin_user:
            return Response(
                {"detail": "Only an admin account can create lecturer or student users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        if user.role == "Student":
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={"student_id": f"STU-{user.id:05d}"},
            )

        # Log user creation by admin
        log_action(
            request,
            "USER_CREATE",
            target_user=user,
            additional_data={
                "registration_method": "admin_created",
                "created_by": created_by,
                "role": user.role,
                "temporary_password_sent": True,
            },
        )

        try:
            frontend_login_url = getattr(
                settings, "FRONTEND_LOGIN_URL", "http://localhost:3000/login"
            )

            send_mail(
                subject="Your Account Has Been Created",
                message=f"Hello {user.username},\n\n"
                f"An administrator has created an account for you with the following details:\n\n"
                f"Username: {user.username}\n"
                f"Email: {user.email}\n"
                f"Temporary Password: {user.temporary_password}\n"
                f"Role: {user.get_role_display()}\n\n"
                f"Please log in at {frontend_login_url} and change your password immediately.\n\n"
                f"If you didn't expect this email, please contact your system administrator.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"User creation email sent to {user.email}")

        except Exception as e:
            logger.error(
                f"Failed to send user creation email to {user.email}: {str(e)}"
            )

            # Log email failure
            log_action(
                request,
                "EMAIL_SEND_FAILURE",
                target_user=user,
                additional_data={"email_type": "user_creation", "error": str(e)},
            )

            headers = self.get_success_headers(serializer.data)
            return Response(
                {
                    "message": "User created successfully but failed to send email.",
                    "user_id": user.id,
                    "email": user.email,
                },
                status=status.HTTP_201_CREATED,
                headers=headers,
            )

        headers = self.get_success_headers(serializer.data)
        return Response(
            {"message": "User created successfully. Email with credentials sent."},
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class MyTokenObtainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()

        if user and user.check_password(password):
            if not user.is_email_verified:
                try:
                    _send_verification_email(user)
                except Exception as exc:
                    logger.error(f"Failed to resend verification email to {user.email}: {str(exc)}")
                return Response(
                    {
                        "error": "Please verify your email address before logging in.",
                        "verification_required": True,
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
            if user.is_active:
                refresh = RefreshToken.for_user(user)

                # Log successful login
                log_action(
                    request,
                    "LOGIN",
                    target_user=user,
                    additional_data={"login_method": "email_password"},
                )

                return Response(
                    {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "user": UserSerializer(user).data,
                        "redirect_path": (
                            "/admin/dashboard"
                            if user.role == "Admin"
                            else "/lecturer/dashboard"
                            if user.role == "Lecturer"
                            else "/student/dashboard"
                        ),
                    },
                    status=status.HTTP_200_OK,
                )

            # Log failed login due to inactive account
            log_action(
                request,
                "LOGIN",
                target_user=user,
                additional_data={
                    "status": "failed",
                    "reason": "account_deactivated",
                },
            )
            return Response(
                {"error": "Account is deactivated"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Log failed login with invalid credentials
        log_action(
            request,
            "LOGIN",
            additional_data={
                "status": "failed",
                "reason": "invalid_credentials",
                "attempted_email": email,
            },
        )
        return Response(
            {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        log_action(request, "LOGOUT", target_user=request.user)
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uidb64, token):
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid verification link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired verification link."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_email_verified = True
        user.status = "Active"
        user.is_active = True
        user.save(update_fields=["is_email_verified", "status", "is_active"])

        if user.role == "Student":
            StudentProfile.objects.get_or_create(
                user=user,
                defaults={"student_id": f"STU-{user.id:05d}"},
            )

        log_action(request, "EMAIL_VERIFIED", target_user=user)
        return Response(
            {
                "message": "Email verified successfully.",
                "redirect_path": (
                    "/admin/dashboard"
                    if user.role == "Admin"
                    else "/lecturer/dashboard"
                    if user.role == "Lecturer"
                    else "/student/dashboard"
                ),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {"message": "If that account exists, a verification email has been sent."},
                status=status.HTTP_200_OK,
            )

        if user.is_email_verified:
            return Response(
                {"message": "Account is already verified."},
                status=status.HTTP_200_OK,
            )

        try:
            _send_verification_email(user)
            log_action(request, "EMAIL_VERIFICATION_RESEND", target_user=user)
        except Exception as exc:
            logger.error(f"Failed to resend verification email to {user.email}: {str(exc)}")

        return Response(
            {"message": "If that account exists, a verification email has been sent."},
            status=status.HTTP_200_OK,
        )


class AdminOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({"message": "Hello Admin"})


class StudentOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsStudent]

    def get(self, request):
        return Response({"message": "Hello Student"})


class LecturerOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsLecturer]

    def get(self, request):
        return Response({"message": "Hello Lecturer"})


class AdminOrStudentOrLecturerOnlyView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStudentOrLecturer]

    def get(self, request):
        return Response({"message": "Hello Investigator"})


class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_object(self):
        return self.request.user

    def _get_changed_fields(self, old_data, new_data):
        """Helper to identify changed fields"""
        changed = {}
        for key in old_data:
            if old_data[key] != new_data.get(key):
                changed[key] = {"old": old_data[key], "new": new_data.get(key)}
        return changed

    def put(self, request, *args, **kwargs):
        """Handle PUT requests for profile updates including profile picture"""
        old_data = ProfileUpdateSerializer(self.get_object()).data
        response = super().put(request, *args, **kwargs)

        log_action(
            request,
            "PROFILE_UPDATE",
            target_user=request.user,
            additional_data={
                "action_type": "full_update",
                "changes": self._get_changed_fields(old_data, response.data),
            },
        )

        return response

    def patch(self, request, *args, **kwargs):
        """Handle PATCH requests for partial profile updates including profile picture"""
        old_data = ProfileUpdateSerializer(self.get_object()).data
        response = super().patch(request, *args, **kwargs)

        log_action(
            request,
            "PROFILE_UPDATE",
            target_user=request.user,
            additional_data={
                "action_type": "partial_update",
                "changes": self._get_changed_fields(old_data, response.data),
            },
        )

        return response


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)

            # Log password reset request
            log_action(request, "PASSWORD_RESET_REQUEST", target_user=user)

            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
            reset_link = f"{frontend_url}/reset-password/{uid}/{token}"

            try:
                send_mail(
                    subject="Password Reset Request",
                    message=f"Hello {user.first_name or user.username},\n\n"
                    f"You requested a password reset. Click the link below to reset your password:\n"
                    f"{reset_link}\n\n"
                    f"This link will expire in 24 hours.\n\n"
                    f"If you didn't request this, please ignore this email.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                logger.info(f"Password reset email sent to {email}")

            except Exception as e:
                logger.error(
                    f"Failed to send password reset email to {email}: {str(e)}"
                )

                # Log email failure
                log_action(
                    request,
                    "EMAIL_SEND_FAILURE",
                    target_user=user,
                    additional_data={"email_type": "password_reset", "error": str(e)},
                )

                return Response(
                    {"error": "Failed to send email. Please try again later."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": "If an account with this email exists, a password reset link has been sent."
                },
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            # Log failed password reset attempt
            logger.warning(f"Password reset attempted for non-existent email: {email}")
            log_action(
                request,
                "PASSWORD_RESET_REQUEST",
                additional_data={
                    "status": "failed",
                    "reason": "user_not_found",
                    "attempted_email": email,
                },
            )
            return Response(
                {
                    "message": "If an account with this email exists, a password reset link has been sent."
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"Unexpected error in password reset for {email}: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not all([uid, token, new_password]):
            return Response(
                {"error": "UID, token, and new password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if confirm_password and new_password != confirm_password:
            return Response(
                {"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {"error": "Password must be at least 8 characters long."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Decode the user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)

            # Verify the token
            if default_token_generator.check_token(user, token):
                # Set new password
                user.set_password(new_password)
                user.save()

                # Log successful password reset
                log_action(request, "PASSWORD_RESET_COMPLETE", target_user=user)

                logger.info(f"Password successfully reset for user {user.email}")
                return Response(
                    {"message": "Password has been reset successfully."},
                    status=status.HTTP_200_OK,
                )
            else:
                # Log failed password reset due to invalid token
                log_action(
                    request,
                    "PASSWORD_RESET_COMPLETE",
                    target_user=user,
                    additional_data={"status": "failed", "reason": "invalid_token"},
                )
                return Response(
                    {"error": "Invalid or expired reset link."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            # Log failed password reset due to invalid link
            log_action(
                request,
                "PASSWORD_RESET_COMPLETE",
                additional_data={"status": "failed", "reason": "invalid_reset_link"},
            )
            return Response(
                {"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error in password reset: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserListView(generics.ListAPIView):
    """Admin view to list all users"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrLecturer]

    def get(self, request, *args, **kwargs):
        # Log user list access
        log_action(
            request,
            "USER_LIST_ACCESS",
            additional_data={"accessed_by_role": request.user.role},
        )
        return super().get(request, *args, **kwargs)


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to get, update, or delete a specific user"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrLecturer]

    def _get_changed_fields(self, old_data, new_data):
        """Helper to identify changed fields"""
        changed = {}
        for key in old_data:
            if old_data[key] != new_data.get(key):
                changed[key] = {"old": old_data[key], "new": new_data.get(key)}
        return changed

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()

        # Log user detail access
        log_action(
            request,
            "USER_DETAIL_ACCESS",
            target_user=instance,
            additional_data={"accessed_by": request.user.email},
        )

        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Handle user updates with proper logging"""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        # Log the update attempt
        logger.info(
            f"Admin {request.user.email} attempting to update user {instance.email}"
        )

        # Prevent admin from updating their own account through this endpoint
        if instance == request.user:
            return Response(
                {
                    "error": "Cannot update your own account through this endpoint. Use profile update instead."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Store original data for logging
        original_data = UserSerializer(instance).data

        self.perform_update(serializer)

        # Log what was changed
        updated_user = serializer.instance
        changes = self._get_changed_fields(original_data, serializer.data)

        log_action(
            request,
            "USER_UPDATE",
            target_user=updated_user,
            additional_data={
                "old_data": original_data,
                "new_data": serializer.data,
                "changed_fields": changes,
                "update_type": "partial" if partial else "full",
            },
        )

        if changes:
            change_summary = ", ".join(
                [f"{k}: {v['old']} -> {v['new']}" for k, v in changes.items()]
            )
            logger.info(
                f"User {updated_user.email} updated by admin {request.user.email}. Changes: {change_summary}"
            )

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Handle user deletion with proper logging and safeguards"""
        instance = self.get_object()

        # Prevent admin from deleting their own account
        if instance == request.user:
            return Response(
                {"error": "Cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Log the deletion attempt
        logger.warning(
            f"Admin {request.user.email} is deleting user {instance.email} (ID: {instance.id})"
        )

        # Store user info before deletion for logging
        user_data = UserSerializer(instance).data

        # Log the deletion
        log_action(
            request,
            "USER_DELETE",
            target_user=instance,
            additional_data={"user_data": user_data},
        )

        self.perform_destroy(instance)

        logger.warning(
            f"User {user_data['email']} (ID: {user_data['id']}) successfully deleted by admin {request.user.email}"
        )

        return Response(
            {"message": f"User {user_data['email']} has been successfully deleted."},
            status=status.HTTP_204_NO_CONTENT,
        )


class AdminUserUpdateView(generics.UpdateAPIView):
    """Dedicated view for admin user updates"""

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def _get_changed_fields(self, old_data, new_data):
        """Helper to identify changed fields"""
        changed = {}
        for key in old_data:
            if old_data[key] != new_data.get(key):
                changed[key] = {"old": old_data[key], "new": new_data.get(key)}
        return changed

    def update(self, request, *args, **kwargs):
        """Handle user updates with validation and logging"""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        if instance == request.user:
            return Response(
                {
                    "error": "Cannot update your own account through admin endpoints. Use profile update instead."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        logger.info(f"Admin {request.user.email} updating user {instance.email}")

        # Capture old data for logging
        old_data = UserSerializer(instance).data

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)

        # Log the update
        changes = self._get_changed_fields(old_data, serializer.data)
        log_action(
            request,
            "USER_UPDATE",
            target_user=instance,
            additional_data={
                "old_data": old_data,
                "new_data": serializer.data,
                "changed_fields": changes,
                "update_type": "partial" if partial else "full",
            },
        )

        logger.info(
            f"User {instance.email} successfully updated by admin {request.user.email}"
        )

        return Response(
            {"message": "User updated successfully.", "user": serializer.data}
        )


class AdminUserDeleteView(generics.DestroyAPIView):
    """Dedicated view for admin user deletion"""

    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def destroy(self, request, *args, **kwargs):
        """Handle user deletion with proper safeguards"""
        instance = self.get_object()

        if instance == request.user:
            return Response(
                {"error": "Cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if instance.role == "Admin":
            admin_count = User.objects.filter(role="Admin", is_active=True).count()
            if admin_count <= 1:
                return Response(
                    {"error": "Cannot delete the last active admin account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        logger.warning(
            f"Admin {request.user.email} is deleting user {instance.email} (ID: {instance.id})"
        )

        # Store user data for logging
        user_data = UserSerializer(instance).data

        # Log the deletion
        log_action(
            request,
            "USER_DELETE",
            target_user=instance,
            additional_data={"user_data": user_data},
        )

        deleted_user_email = instance.email
        self.perform_destroy(instance)

        logger.warning(
            f"User {deleted_user_email} successfully deleted by admin {request.user.email}"
        )

        return Response(
            {"message": f"User {deleted_user_email} has been successfully deleted."},
            status=status.HTTP_200_OK,
        )


class UserActivateDeactivateView(APIView):
    """Admin view to activate/deactivate users"""

    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        """Toggle user active status"""
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )

        logger.info(
            f"Before toggle - User {user.email} status: {user.status}, is_active: {user.is_active}"
        )

        if user == request.user:
            return Response(
                {"error": "Cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.role == "Admin" and user.status == "Active":
            active_admin_count = User.objects.filter(
                role="Admin", status="Active"
            ).count()
            if active_admin_count <= 1:
                return Response(
                    {"error": "Cannot deactivate the last active admin account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Store original status for logging
        original_status = user.status
        original_is_active = user.is_active

        if user.status == "Active":
            user.deactivate()
            action = "deactivated"
            audit_action = "USER_DEACTIVATE"
        else:
            user.activate()
            action = "activated"
            audit_action = "USER_ACTIVATE"

        user.refresh_from_db()

        # Log the activation/deactivation
        log_action(
            request,
            audit_action,
            target_user=user,
            additional_data={
                "previous_status": original_status,
                "new_status": user.status,
                "previous_is_active": original_is_active,
                "new_is_active": user.is_active,
            },
        )

        logger.info(f"User {user.email} {action} by admin {request.user.email}")
        logger.info(
            f"After toggle - User {user.email} status: {user.status}, is_active: {user.is_active}"
        )

        return Response(
            {
                "message": f"User {user.email} has been {action}.",
                "user": UserSerializer(user).data,
                "previous_status": original_status,
                "new_status": user.status,
            }
        )


class CurrentUserView(APIView):
    """Get current authenticated user details"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AdminAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        students = StudentProfile.objects.select_related("user")
        at_risk_students = students.filter(risk_score__gte=0.6).count()
        average_performance = PerformanceAnalysis.objects.aggregate(avg=Avg("performance_score"))["avg"] or 0
        recent_chats = ChatConversation.objects.select_related("user").order_by("-created_at")[:5]
        recent_logs = AuditLog.objects.select_related("user", "target_user").order_by("-timestamp")[:10]

        return Response(
            {
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "inactive": total_users - active_users,
                },
                "students": {
                    "total": students.count(),
                    "at_risk": at_risk_students,
                    "average_performance": round(average_performance, 2),
                },
                "chatbot": {
                    "total_conversations": ChatConversation.objects.count(),
                    "recent_sessions": [
                        {
                            "id": conversation.id,
                            "user": conversation.user.username,
                            "intent": conversation.intent,
                            "created_at": conversation.created_at,
                        }
                        for conversation in recent_chats
                    ],
                },
                "audit": {
                    "recent_logs": [
                        {
                            "id": entry.id,
                            "action": entry.action,
                            "user": str(entry.user) if entry.user else None,
                            "target_user": str(entry.target_user) if entry.target_user else None,
                            "timestamp": entry.timestamp,
                        }
                        for entry in recent_logs
                    ]
                },
            }
        )


class AdminReportSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        total_students = StudentProfile.objects.count()
        at_risk_students = StudentProfile.objects.filter(risk_score__gte=0.6).count()
        average_performance = PerformanceAnalysis.objects.aggregate(avg=Avg("performance_score"))["avg"] or 0
        average_feedback = Feedback.objects.aggregate(avg=Avg("rating"))["avg"] or 0
        material_stats = CourseMaterial.objects.aggregate(total=Count("id"), published=Count("id", filter=Q(is_published=True)))
        recent_feedback = Feedback.objects.select_related("user").order_by("-created_at")[:5]
        recent_materials = CourseMaterial.objects.select_related("course", "uploaded_by").order_by("-created_at")[:5]
        recent_logs = AuditLog.objects.select_related("user", "target_user").order_by("-timestamp")[:8]

        return Response(
            {
                "generated_at": timezone.now(),
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "inactive": total_users - active_users,
                },
                "students": {
                    "total": total_students,
                    "at_risk": at_risk_students,
                    "average_performance": round(average_performance, 2),
                },
                "recommendations": {
                    "course": CourseRecommendation.objects.count(),
                    "career": CareerRecommendation.objects.count(),
                    "performance": PerformanceAnalysis.objects.count(),
                },
                "feedback": {
                    "total": Feedback.objects.count(),
                    "average_rating": round(average_feedback, 2),
                    "recent": [
                        {
                            "id": item.id,
                            "title": item.title,
                            "rating": item.rating,
                            "category": item.category,
                            "user": item.user.username,
                            "created_at": item.created_at,
                        }
                        for item in recent_feedback
                    ],
                },
                "materials": {
                    "total": material_stats.get("total", 0),
                    "published": material_stats.get("published", 0),
                    "recent": [
                        {
                            "id": item.id,
                            "title": item.title,
                            "course": item.course.code,
                            "is_published": item.is_published,
                            "downloads": item.downloads,
                            "uploaded_by": item.uploaded_by.username if item.uploaded_by else None,
                            "created_at": item.created_at,
                        }
                        for item in recent_materials
                    ],
                },
                "audit": {
                    "recent_logs": [
                        {
                            "id": entry.id,
                            "action": entry.action,
                            "user": str(entry.user) if entry.user else None,
                            "target_user": str(entry.target_user) if entry.target_user else None,
                            "timestamp": entry.timestamp,
                        }
                        for entry in recent_logs
                    ],
                },
            }
        )
