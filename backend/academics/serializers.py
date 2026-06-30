from rest_framework import serializers

from academics.models import AcademicRecord, AttendanceRecord, Course


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


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
