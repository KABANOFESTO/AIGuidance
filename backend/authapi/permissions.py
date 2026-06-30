from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Admin"


class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Student"


class IsLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "Lecturer"


class IsAdminOrLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_lecturer = IsLecturer().has_permission(request, view)
        return is_admin or is_lecturer


class IsAdminOrStudentOrLecturer(permissions.BasePermission):
    def has_permission(self, request, view):
        is_admin = IsAdmin().has_permission(request, view)
        is_student = IsStudent().has_permission(request, view)
        is_lecturer = IsLecturer().has_permission(request, view)
        return is_admin or is_student or is_lecturer
