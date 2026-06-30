from rest_framework import serializers

from recommendations.models import CareerRecommendation, CourseRecommendation, PerformanceAnalysis


class CourseRecommendationSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)
    course = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = CourseRecommendation
        fields = "__all__"


class CareerRecommendationSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = CareerRecommendation
        fields = "__all__"


class PerformanceAnalysisSerializer(serializers.ModelSerializer):
    student = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = PerformanceAnalysis
        fields = "__all__"
