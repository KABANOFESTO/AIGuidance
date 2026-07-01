from rest_framework import serializers

from academics.models import AcademicRecord, AttendanceRecord, Course, CourseMaterial
from students.models import StudentProfile


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
        read_only_fields = ("id", "created_at", "updated_at", "course_detail", "total_score")


class AcademicRecordCreateSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AcademicRecord
        fields = (
            "student_id",
            "course_id",
            "assignment_score",
            "exam_score",
            "attendance_score",
            "grade",
            "semester",
            "notes",
        )

    def validate(self, attrs):
        student_id = attrs.get("student_id")
        course_id = attrs.get("course_id")

        try:
            student = StudentProfile.objects.select_related("user").get(student_id=student_id)
        except StudentProfile.DoesNotExist as exc:
            raise serializers.ValidationError({"student_id": "Student profile not found."}) from exc

        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist as exc:
            raise serializers.ValidationError({"course_id": "Course not found."}) from exc

        attrs["student"] = student
        attrs["course"] = course
        return attrs

    def create(self, validated_data):
        validated_data.pop("student_id", None)
        validated_data.pop("course_id", None)
        student = validated_data.pop("student")
        course = validated_data.pop("course")
        return AcademicRecord.objects.create(student=student, course=course, **validated_data)


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    course_detail = CourseSerializer(source="course", read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = "__all__"
        read_only_fields = ("id", "created_at", "student", "course_detail")


class AttendanceRecordCreateSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = AttendanceRecord
        fields = ("student_id", "course_id", "date", "status", "notes")

    def validate(self, attrs):
        student_id = attrs.get("student_id")
        course_id = attrs.get("course_id")

        try:
            student = StudentProfile.objects.select_related("user").get(student_id=student_id)
        except StudentProfile.DoesNotExist as exc:
            raise serializers.ValidationError({"student_id": "Student profile not found."}) from exc

        try:
            course = Course.objects.get(pk=course_id)
        except Course.DoesNotExist as exc:
            raise serializers.ValidationError({"course_id": "Course not found."}) from exc

        attrs["student"] = student
        attrs["course"] = course
        return attrs

    def create(self, validated_data):
        validated_data.pop("student_id", None)
        validated_data.pop("course_id", None)
        student = validated_data.pop("student")
        course = validated_data.pop("course")
        return AttendanceRecord.objects.create(student=student, course=course, **validated_data)


class AcademicSummarySerializer(serializers.Serializer):
    student = serializers.CharField()
    overall_score = serializers.FloatField()
    attendance_rate = serializers.FloatField()
    at_risk = serializers.BooleanField()
    total_courses = serializers.IntegerField()
    recent_grades = serializers.ListField(child=serializers.DictField(), allow_empty=True)
