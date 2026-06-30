from rest_framework import serializers

from academics.models import AcademicRecord, AttendanceRecord, Course, CourseMaterial


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class CourseMaterialSerializer(serializers.ModelSerializer):
    course_detail = CourseSerializer(source="course", read_only=True)
    uploaded_by = serializers.StringRelatedField(read_only=True)
    file_url = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = CourseMaterial
        fields = "__all__"
        read_only_fields = (
            "id",
            "created_at",
            "updated_at",
            "downloads",
            "uploaded_by",
            "course_detail",
            "file_url",
            "download_url",
            "file_name",
            "file_size",
            "file_type",
        )

    def get_file_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return None
        url = obj.file.url
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def get_download_url(self, obj):
        request = self.context.get("request")
        url = f"/api/academics/materials/{obj.pk}/download/"
        if request is not None:
            return request.build_absolute_uri(url)
        return url

    def get_file_name(self, obj):
        return obj.filename


class AcademicRecordSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    course_detail = CourseSerializer(source="course", read_only=True)
    total_score = serializers.FloatField(read_only=True)

    class Meta:
        model = AcademicRecord
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "student", "course_detail", "total_score")


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    course_detail = CourseSerializer(source="course", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = "__all__"
        read_only_fields = ("id", "created_at", "student", "course_detail")


class AcademicSummarySerializer(serializers.Serializer):
    student = serializers.CharField()
    overall_score = serializers.FloatField()
    attendance_rate = serializers.FloatField()
    at_risk = serializers.BooleanField()
    total_courses = serializers.IntegerField()
    recent_grades = serializers.ListField(child=serializers.DictField(), allow_empty=True)
