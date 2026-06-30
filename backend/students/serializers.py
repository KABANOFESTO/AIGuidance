from rest_framework import serializers

from students.models import BehaviourLog, StudentProfile


class BehaviourLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehaviourLog
        fields = "__all__"
        read_only_fields = ("id", "created_at")


class StudentProfileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    behaviour_logs = BehaviourLogSerializer(many=True, read_only=True)
    is_at_risk = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "user", "is_at_risk", "behaviour_logs")

    def get_is_at_risk(self, obj):
        return obj.is_at_risk


class StudentProfileUpsertSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            "student_id",
            "interests",
            "career_goal",
            "learning_preferences",
            "behaviour_data",
            "academic_strengths",
            "attendance_percentage",
            "overall_gpa",
            "risk_score",
            "notes",
        ]


class StudentSummarySerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    at_risk = serializers.SerializerMethodField()
    total_courses = serializers.SerializerMethodField()
    latest_record = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = (
            "id",
            "user",
            "student_id",
            "interests",
            "career_goal",
            "attendance_percentage",
            "overall_gpa",
            "risk_score",
            "at_risk",
            "total_courses",
            "latest_record",
        )

    def get_at_risk(self, obj):
        return obj.is_at_risk

    def get_total_courses(self, obj):
        return obj.academic_records.count()

    def get_latest_record(self, obj):
        record = obj.academic_records.select_related("course").first()
        if not record:
            return None
        return {
            "course": record.course.name,
            "grade": record.grade,
            "semester": record.semester,
            "score": record.total_score,
        }
