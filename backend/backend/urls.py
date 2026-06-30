from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("authapi.urls")),
    path("api/chatbot/", include("chatbot.urls")),
    path("api/students/", include("students.urls")),
    path("api/academics/", include("academics.urls")),
    path("api/recommendations/", include("recommendations.urls")),
    path("api/feedback/", include("Feedback.urls")),
    path("api/", include("auditLog.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
