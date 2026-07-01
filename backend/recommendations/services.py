from __future__ import annotations

from typing import Any

from academics.models import Course
from recommendations.ml_engine import (
    course_recommendations as ml_course_recommendations,
    career_recommendations as ml_career_recommendations,
    ensure_bundle,
    list_training_history,
    performance_analysis as ml_performance_analysis,
    regenerate_student_recommendations as ml_regenerate_student_recommendations,
    train_models,
)
from recommendations.models import CareerRecommendation, CourseRecommendation, PerformanceAnalysis


def train_recommendation_models(force: bool = False) -> dict[str, Any]:
    return train_models(force=force)


def get_recommendation_model_status() -> dict[str, Any]:
    bundle = ensure_bundle()
    return {
        "version": bundle.version,
        "trained_at": bundle.trained_at,
        "metrics": bundle.metrics,
        "training_history_count": len(list_training_history(limit=100)),
        "course_vectorizer_ready": bundle.course_vectorizer is not None,
        "career_vectorizer_ready": bundle.career_vectorizer is not None,
        "performance_model_ready": bundle.performance_model is not None,
    }


def get_recommendation_training_history(limit: int = 20) -> list[dict[str, Any]]:
    return list_training_history(limit=limit)


def generate_course_recommendations(student_profile, limit=5):
    scored_courses = ml_course_recommendations(student_profile, limit=limit)
    recommendations = []
    for item in scored_courses:
        recommendation, _ = CourseRecommendation.objects.update_or_create(
            student=student_profile,
            course=item["course"],
            defaults={
                "reason": item["reason"],
                "confidence_score": item["confidence"],
                "generated_from": "hybrid_ml_engine",
                "metadata": item["metadata"],
            },
        )
        recommendations.append(recommendation)
    return recommendations


def generate_career_recommendations(student_profile, limit=5):
    scored_careers = ml_career_recommendations(student_profile, limit=limit)
    recommendations = []
    for item in scored_careers:
        recommendation, _ = CareerRecommendation.objects.update_or_create(
            student=student_profile,
            career_name=item["career_name"],
            defaults={
                "explanation": item["explanation"],
                "match_percentage": item["match_percentage"],
                "framework": item["framework"],
                "metadata": item["metadata"],
            },
        )
        recommendations.append(recommendation)
    return recommendations


def analyze_performance(student_profile):
    analysis_payload = ml_performance_analysis(student_profile)
    return analysis_payload["analysis"]


def regenerate_student_recommendations(student_profile):
    course_recommendations = generate_course_recommendations(student_profile)
    career_recommendations = generate_career_recommendations(student_profile)
    performance_analysis = analyze_performance(student_profile)

    return {
        "course_recommendations": course_recommendations,
        "career_recommendations": career_recommendations,
        "performance_analysis": performance_analysis,
    }
