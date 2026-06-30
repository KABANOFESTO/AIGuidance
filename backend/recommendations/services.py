import re

from academics.models import Course, AcademicRecord
from recommendations.models import CareerRecommendation, CourseRecommendation, PerformanceAnalysis


CAREER_MAP = [
    {
        "career_name": "Software Engineer",
        "keywords": {"programming", "software", "coding", "python", "java", "systems", "algorithms"},
    },
    {
        "career_name": "Data Analyst",
        "keywords": {"data", "statistics", "analytics", "excel", "python", "visualization", "sql"},
    },
    {
        "career_name": "Cybersecurity Analyst",
        "keywords": {"security", "network", "risk", "ethics", "systems", "linux", "forensics"},
    },
    {
        "career_name": "UX/UI Designer",
        "keywords": {"design", "creativity", "visual", "prototype", "ui", "ux", "research"},
    },
    {
        "career_name": "Business Analyst",
        "keywords": {"business", "process", "communication", "analysis", "planning", "finance"},
    },
]


def _tokenize(value):
    if not value:
        return set()
    if isinstance(value, list):
        tokens = " ".join(str(item) for item in value)
    elif isinstance(value, dict):
        tokens = " ".join(f"{k} {v}" for k, v in value.items())
    else:
        tokens = str(value)
    return set(re.findall(r"[a-z0-9]+", tokens.lower()))


def _grade_to_points(grade):
    mapping = {
        "a+": 4.0,
        "a": 4.0,
        "a-": 3.7,
        "b+": 3.3,
        "b": 3.0,
        "b-": 2.7,
        "c+": 2.3,
        "c": 2.0,
        "c-": 1.7,
        "d+": 1.3,
        "d": 1.0,
        "f": 0.0,
    }
    return mapping.get(str(grade).lower(), 2.5)


def _average_grade_point(records):
    if not records:
        return 2.5
    return sum(_grade_to_points(record.grade) for record in records) / len(records)


def generate_course_recommendations(student_profile, limit=5):
    interests = _tokenize(student_profile.interests)
    learning_preferences = _tokenize(student_profile.learning_preferences)
    strengths = _tokenize(student_profile.academic_strengths)
    profile_tokens = interests | learning_preferences | strengths | _tokenize(student_profile.career_goal)
    records = list(student_profile.academic_records.select_related("course"))
    avg_grade = _average_grade_point(records)

    scored_courses = []
    for course in Course.objects.filter(is_active=True).exclude(academic_records__student=student_profile).distinct():
        course_tokens = _tokenize(course.name) | _tokenize(course.description) | _tokenize(course.department) | _tokenize(course.keywords)
        overlap = len(profile_tokens & course_tokens)
        course_score = overlap * 2
        if any(token in interests for token in course_tokens):
            course_score += 2
        if any(token in strengths for token in course_tokens):
            course_score += 1

        reason_bits = []
        if overlap:
            reason_bits.append("matches your interests and learning profile")
        if avg_grade >= 3.0 and course.credits >= 3:
            reason_bits.append("builds on your current academic strength")
        if avg_grade < 2.5 and "support" not in course.name.lower():
            reason_bits.append("can help strengthen foundational skills")
        if not reason_bits:
            reason_bits.append("broadly fits your academic profile")

        confidence = min(0.95, 0.45 + (course_score * 0.08) + (max(avg_grade - 2.0, 0) * 0.08))
        scored_courses.append(
            {
                "course": course,
                "score": course_score,
                "reason": "; ".join(dict.fromkeys(reason_bits)),
                "confidence": round(confidence, 2),
            }
        )

    scored_courses.sort(key=lambda item: (-item["score"], -item["confidence"], item["course"].name))
    recommendations = []
    for item in scored_courses[:limit]:
        recommendation, _ = CourseRecommendation.objects.update_or_create(
            student=student_profile,
            course=item["course"],
            defaults={
                "reason": item["reason"],
                "confidence_score": item["confidence"],
                "generated_from": "hybrid_rule_engine",
                "metadata": {
                    "average_grade_point": round(avg_grade, 2),
                    "profile_tokens": sorted(profile_tokens),
                },
            },
        )
        recommendations.append(recommendation)
    return recommendations


def generate_career_recommendations(student_profile, limit=5):
    profile_tokens = _tokenize(student_profile.interests) | _tokenize(student_profile.learning_preferences) | _tokenize(student_profile.career_goal)
    records = list(student_profile.academic_records.select_related("course"))
    score_boost = _average_grade_point(records) / 4.0

    results = []
    for career in CAREER_MAP:
        overlap = len(profile_tokens & career["keywords"])
        if overlap == 0 and score_boost < 0.55:
            continue
        match_percentage = min(99, round((overlap * 18) + (score_boost * 35) + 25))
        explanation = (
            f"Your interests align with {career['career_name']} through keywords like "
            f"{', '.join(sorted(profile_tokens & career['keywords'])[:3]) or 'your selected goals'}."
        )
        recommendation, _ = CareerRecommendation.objects.update_or_create(
            student=student_profile,
            career_name=career["career_name"],
            defaults={
                "explanation": explanation,
                "match_percentage": match_percentage,
                "framework": "interest_framework_v1",
                "metadata": {
                    "matched_keywords": sorted(profile_tokens & career["keywords"]),
                    "score_boost": round(score_boost, 2),
                },
            },
        )
        results.append(recommendation)

    results.sort(key=lambda item: (-item.match_percentage, item.career_name))
    return results[:limit]


def analyze_performance(student_profile):
    records = list(student_profile.academic_records.select_related("course"))
    average_score = 0.0
    if records:
        average_score = sum(record.total_score for record in records) / len(records)

    attendance = float(student_profile.attendance_percentage or 0)
    behaviour_penalty = len([item for item in student_profile.behaviour_logs.all() if item.severity == "high"]) * 8
    risk_components = {
        "attendance": round(max(0, 100 - attendance), 2),
        "behaviour_penalty": behaviour_penalty,
        "academic_gap": round(max(0, 70 - average_score), 2),
    }
    performance_score = max(0, min(100, round((average_score * 0.55) + (attendance * 0.35) - behaviour_penalty, 2)))

    if performance_score >= 75:
        risk_level = "low"
        recommendation = "Maintain your current habits and continue engaging with challenging course material."
    elif performance_score >= 55:
        risk_level = "medium"
        recommendation = "You are making progress, but regular study sessions and attendance improvements will help."
    else:
        risk_level = "high"
        recommendation = "This student is at risk. Arrange academic support, monitor attendance closely, and review course load."

    analysis = PerformanceAnalysis.objects.create(
        student=student_profile,
        performance_score=performance_score,
        risk_level=risk_level,
        recommendation=recommendation,
        indicators=risk_components,
    )
    return analysis
