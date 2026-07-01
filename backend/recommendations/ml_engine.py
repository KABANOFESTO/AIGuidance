from __future__ import annotations

import json
import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from django.conf import settings
from django.db.models import Avg, Count
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import RandomForestRegressor
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity

from academics.models import AcademicRecord, Course
from students.models import StudentProfile


MODEL_VERSION = "reco-v1"
BUNDLE_FILENAME = "recommendation_bundle.joblib"
MANIFEST_FILENAME = "recommendation_manifest.json"
HISTORY_FILENAME = "recommendation_training_history.json"
MAX_HISTORY_ITEMS = 30

logger = logging.getLogger(__name__)

CAREER_CATALOG = [
    {
        "career_name": "Software Engineer",
        "keywords": ["programming", "software", "coding", "python", "java", "systems", "algorithms"],
        "description": "Build software products, systems, and applications.",
    },
    {
        "career_name": "Data Analyst",
        "keywords": ["data", "statistics", "analytics", "excel", "python", "visualization", "sql"],
        "description": "Interpret data, build dashboards, and support decisions.",
    },
    {
        "career_name": "Cybersecurity Analyst",
        "keywords": ["security", "network", "risk", "ethics", "systems", "linux", "forensics"],
        "description": "Protect systems, data, and organizations from cyber threats.",
    },
    {
        "career_name": "UX/UI Designer",
        "keywords": ["design", "creativity", "visual", "prototype", "ui", "ux", "research"],
        "description": "Design usable, accessible, and engaging digital experiences.",
    },
    {
        "career_name": "Business Analyst",
        "keywords": ["business", "process", "communication", "analysis", "planning", "finance"],
        "description": "Bridge business goals and technical delivery with structured analysis.",
    },
]


@dataclass
class RecommendationBundle:
    version: str
    trained_at: str
    course_vectorizer: TfidfVectorizer | None
    course_text_matrix: Any
    course_svd: TruncatedSVD | None
    course_item_vectors: dict[int, np.ndarray]
    student_vectors: dict[int, np.ndarray]
    career_vectorizer: TfidfVectorizer | None
    career_text_matrix: Any
    performance_model: RandomForestRegressor | None
    performance_feature_names: list[str]
    metrics: dict[str, Any]


def _artifact_dir() -> Path:
    path = Path(settings.BASE_DIR) / "ml_artifacts"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _bundle_path() -> Path:
    return _artifact_dir() / BUNDLE_FILENAME


def _manifest_path() -> Path:
    return _artifact_dir() / MANIFEST_FILENAME


def _history_path() -> Path:
    return _artifact_dir() / HISTORY_FILENAME


def _course_text(course: Course) -> str:
    parts = [
        course.code,
        course.name,
        course.description,
        course.department,
        course.level,
        " ".join(course.keywords or []),
    ]
    return " ".join(str(part) for part in parts if part)


def _career_text(career: dict[str, Any]) -> str:
    parts = [career["career_name"], career["description"], " ".join(career["keywords"])]
    return " ".join(parts)


def _student_text(student: StudentProfile) -> str:
    parts = [
        student.user.username,
        student.interests,
        student.career_goal,
        json.dumps(student.learning_preferences or {}, sort_keys=True),
        json.dumps(student.academic_strengths or [], sort_keys=True),
        json.dumps(student.behaviour_data or {}, sort_keys=True),
        student.notes,
        f"attendance {student.attendance_percentage}",
        f"gpa {student.overall_gpa}",
    ]
    return " ".join(str(part) for part in parts if part)


def _grade_to_points(grade: str) -> float:
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


def _student_feature_row(student: StudentProfile) -> dict[str, float]:
    records = list(student.academic_records.select_related("course"))
    attendance_records = list(student.attendance_records.select_related("course"))
    behaviour_logs = list(student.behaviour_logs.all())

    record_count = len(records)
    course_count = len({record.course_id for record in records})
    grade_points = [_grade_to_points(record.grade) for record in records]
    assignment_avg = float(np.mean([record.assignment_score for record in records])) if records else 0.0
    exam_avg = float(np.mean([record.exam_score for record in records])) if records else 0.0
    attendance_score_avg = float(np.mean([record.attendance_score for record in records])) if records else 0.0
    average_score = float(np.mean([record.total_score for record in records])) if records else 0.0
    attendance_rate = float(student.attendance_percentage or 0)
    high_behaviour = len([log for log in behaviour_logs if log.severity == "high"])
    medium_behaviour = len([log for log in behaviour_logs if log.severity == "medium"])
    low_behaviour = len([log for log in behaviour_logs if log.severity == "low"])

    return {
        "overall_gpa": float(student.overall_gpa or 0),
        "attendance_percentage": attendance_rate,
        "risk_score": float(student.risk_score or 0),
        "record_count": float(record_count),
        "course_count": float(course_count),
        "average_score": average_score,
        "assignment_avg": assignment_avg,
        "exam_avg": exam_avg,
        "attendance_score_avg": attendance_score_avg,
        "grade_point_avg": float(np.mean(grade_points)) if grade_points else 0.0,
        "high_behaviour_count": float(high_behaviour),
        "medium_behaviour_count": float(medium_behaviour),
        "low_behaviour_count": float(low_behaviour),
        "attendance_record_count": float(len(attendance_records)),
    }


def _serialize_metrics(metrics: dict[str, Any]) -> dict[str, Any]:
    serializable = {}
    for key, value in metrics.items():
        if isinstance(value, (np.floating, np.integer)):
            serializable[key] = value.item()
        else:
            serializable[key] = value
    return serializable


def _read_json_file(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError) as exc:
        logger.warning("Unable to read ML artifact file %s: %s", path, exc)
        return default


def _write_json_file(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _retry_operation(operation: str, callback, attempts: int = 2, delay_seconds: float = 0.15):
    last_exc: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return callback()
        except Exception as exc:  # pragma: no cover - defensive retry
            last_exc = exc
            logger.warning("%s failed on attempt %s/%s: %s", operation, attempt, attempts, exc)
            if attempt < attempts:
                time.sleep(delay_seconds * attempt)
    assert last_exc is not None
    raise last_exc


def _append_training_history(entry: dict[str, Any]) -> None:
    history = list(_read_json_file(_history_path(), []))
    history.insert(0, entry)
    _write_json_file(_history_path(), history[:MAX_HISTORY_ITEMS])


def list_training_history(limit: int = 20) -> list[dict[str, Any]]:
    history = list(_read_json_file(_history_path(), []))
    return history[: max(1, limit)]


def load_bundle() -> RecommendationBundle | None:
    path = _bundle_path()
    if not path.exists():
        return None
    return _retry_operation("load recommendation bundle", lambda: joblib.load(path))


def train_models(force: bool = False) -> dict[str, Any]:
    bundle_path = _bundle_path()
    if bundle_path.exists() and not force:
        return _read_json_file(_manifest_path(), {})

    def _train_once() -> dict[str, Any]:
        courses = list(Course.objects.filter(is_active=True))
        students = list(StudentProfile.objects.select_related("user").prefetch_related("academic_records", "attendance_records", "behaviour_logs"))
        academic_records = list(AcademicRecord.objects.select_related("student", "course"))

        if not courses:
            raise ValueError("At least one active course is required before training the recommendation engine.")
        if not students:
            raise ValueError("At least one student profile is required before training the recommendation engine.")

        course_texts = [_course_text(course) for course in courses]
        course_vectorizer = TfidfVectorizer(stop_words="english")
        course_text_matrix = course_vectorizer.fit_transform(course_texts) if course_texts else None

        student_vectors: dict[int, np.ndarray] = {}
        course_item_vectors: dict[int, np.ndarray] = {}
        course_svd = None
        svd_score = None

        if academic_records and len(students) >= 2 and len(courses) >= 2:
            student_index = {student.id: idx for idx, student in enumerate(students)}
            course_index = {course.id: idx for idx, course in enumerate(courses)}
            matrix = np.zeros((len(students), len(courses)), dtype=float)
            counts = np.zeros_like(matrix)

            for record in academic_records:
                s_idx = student_index.get(record.student_id)
                c_idx = course_index.get(record.course_id)
                if s_idx is None or c_idx is None:
                    continue
                matrix[s_idx, c_idx] += float(record.total_score)
                counts[s_idx, c_idx] += 1

            with np.errstate(divide="ignore", invalid="ignore"):
                matrix = np.divide(matrix, counts, out=np.zeros_like(matrix), where=counts > 0)

            n_components = max(2, min(8, min(matrix.shape) - 1))
            if n_components >= 2 and matrix.shape[0] > n_components and matrix.shape[1] > n_components:
                course_svd = TruncatedSVD(n_components=n_components, random_state=42)
                user_item_factors = course_svd.fit_transform(matrix)
                item_factors = course_svd.components_.T
                for student in students:
                    student_vectors[student.id] = user_item_factors[student_index[student.id]]
                for course in courses:
                    course_item_vectors[course.id] = item_factors[course_index[course.id]]
                svd_score = float(course_svd.explained_variance_ratio_.sum())

        career_texts = [_career_text(career) for career in CAREER_CATALOG]
        career_vectorizer = TfidfVectorizer(stop_words="english")
        career_text_matrix = career_vectorizer.fit_transform(career_texts) if career_texts else None

        perf_features: list[dict[str, float]] = []
        perf_targets: list[float] = []
        perf_feature_names: list[str] = []
        for student in students:
            row = _student_feature_row(student)
            if not perf_feature_names:
                perf_feature_names = list(row.keys())
            perf_features.append(row)
            perf_targets.append(float(student.risk_score or 0))

        performance_model = None
        perf_mae = None
        perf_r2 = None
        if len(perf_features) >= 5:
            X = np.array([[row[name] for name in perf_feature_names] for row in perf_features], dtype=float)
            y = np.array(perf_targets, dtype=float)
            if len(set(y.tolist())) > 1:
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=min(0.3, max(0.2, 1 / len(y))), random_state=42)
                performance_model = RandomForestRegressor(n_estimators=150, random_state=42, min_samples_leaf=1)
                performance_model.fit(X_train, y_train)
                preds = performance_model.predict(X_test)
                perf_mae = float(mean_absolute_error(y_test, preds))
                perf_r2 = float(r2_score(y_test, preds))

        metrics = _serialize_metrics(
            {
                "student_count": len(students),
                "course_count": len(courses),
                "academic_record_count": len(academic_records),
                "course_svd_explained_variance": svd_score,
                "performance_mae": perf_mae,
                "performance_r2": perf_r2,
                "trained_at": datetime.now(timezone.utc).isoformat(),
                "version": MODEL_VERSION,
            }
        )

        bundle = RecommendationBundle(
            version=MODEL_VERSION,
            trained_at=metrics["trained_at"],
            course_vectorizer=course_vectorizer,
            course_text_matrix=course_text_matrix,
            course_svd=course_svd,
            course_item_vectors=course_item_vectors,
            student_vectors=student_vectors,
            career_vectorizer=career_vectorizer,
            career_text_matrix=career_text_matrix,
            performance_model=performance_model,
            performance_feature_names=perf_feature_names,
            metrics=metrics,
        )

        joblib.dump(bundle, bundle_path)
        _write_json_file(_manifest_path(), metrics)
        _append_training_history(
            {
                "trained_at": metrics["trained_at"],
                "version": MODEL_VERSION,
                "student_count": metrics["student_count"],
                "course_count": metrics["course_count"],
                "academic_record_count": metrics["academic_record_count"],
                "course_svd_explained_variance": metrics["course_svd_explained_variance"],
                "performance_mae": metrics["performance_mae"],
                "performance_r2": metrics["performance_r2"],
            }
        )
        return metrics

    return _retry_operation("train recommendation models", _train_once)


def ensure_bundle() -> RecommendationBundle:
    bundle = load_bundle()
    if bundle is None:
        _retry_operation("bootstrap recommendation bundle", lambda: train_models(force=True))
        bundle = load_bundle()
    assert bundle is not None
    return bundle


def course_recommendations(student: StudentProfile, limit: int = 5) -> list[dict[str, Any]]:
    bundle = ensure_bundle()
    student_text = _student_text(student)
    student_vector = bundle.course_vectorizer.transform([student_text]) if bundle.course_vectorizer else None
    profile_tokens = set(student_text.lower().split())
    taken_course_ids = set(student.academic_records.values_list("course_id", flat=True))

    recs = []
    for course in Course.objects.filter(is_active=True).exclude(id__in=taken_course_ids):
        content_score = 0.0
        collaborative_score = 0.0
        reason_bits = []

        if bundle.course_vectorizer is not None and student_vector is not None:
            course_vector = bundle.course_vectorizer.transform([_course_text(course)])
            content_score = float(cosine_similarity(student_vector, course_vector)[0][0])
            if content_score > 0.08:
                reason_bits.append("matches your academic profile and interests")

        if bundle.course_item_vectors.get(course.id) is not None and student.id in bundle.student_vectors:
            student_latent = bundle.student_vectors[student.id].reshape(1, -1)
            course_latent = bundle.course_item_vectors[course.id].reshape(1, -1)
            collaborative_score = float(cosine_similarity(student_latent, course_latent)[0][0])
            if collaborative_score > 0.05:
                reason_bits.append("similar to courses where students with your profile perform well")

        avg_grade = float(np.mean([_grade_to_points(record.grade) for record in student.academic_records.all()])) if student.academic_records.exists() else 2.5
        grade_boost = max(0.0, (avg_grade - 2.0) / 2.0)
        if grade_boost > 0.4 and course.credits >= 3:
            reason_bits.append("builds on your stronger academic areas")
        if avg_grade < 2.4 and "support" in course.name.lower():
            reason_bits.append("could strengthen your foundation")

        hybrid_score = (content_score * 0.45) + (collaborative_score * 0.45) + (grade_boost * 0.10)
        confidence = max(0.15, min(0.98, round(hybrid_score + 0.25, 2)))

        if not reason_bits:
            reason_bits.append("fits your profile based on the current data")

        recs.append(
            {
                "course": course,
                "score": hybrid_score,
                "reason": "; ".join(dict.fromkeys(reason_bits)),
                "confidence": confidence,
                "metadata": {
                    "content_score": round(content_score, 3),
                    "collaborative_score": round(collaborative_score, 3),
                    "grade_boost": round(grade_boost, 3),
                },
            }
        )

    recs.sort(key=lambda item: (-item["score"], -item["confidence"], item["course"].name))
    return recs[:limit]


def career_recommendations(student: StudentProfile, limit: int = 5) -> list[dict[str, Any]]:
    bundle = ensure_bundle()
    student_text = _student_text(student)
    student_vector = bundle.career_vectorizer.transform([student_text]) if bundle.career_vectorizer else None
    records = list(student.academic_records.select_related("course"))
    grade_boost = float(np.mean([_grade_to_points(record.grade) for record in records])) / 4.0 if records else 0.55

    recs = []
    for career in CAREER_CATALOG:
        career_score = 0.0
        if bundle.career_vectorizer is not None and student_vector is not None:
            career_vector = bundle.career_vectorizer.transform([_career_text(career)])
            career_score = float(cosine_similarity(student_vector, career_vector)[0][0])

        keyword_overlap = len(set(student_text.lower().split()) & set(career["keywords"]))
        match_score = (career_score * 0.6) + (keyword_overlap * 0.08) + (grade_boost * 0.35)
        explanation = (
            f"Your profile aligns with {career['career_name']} through a mix of interests, coursework, and performance trends."
        )
        if keyword_overlap:
            explanation = (
                f"Your interests and study history overlap with {career['career_name']} through keywords like "
                f"{', '.join(career['keywords'][:3])}."
            )

        recs.append(
            {
                "career_name": career["career_name"],
                "explanation": explanation,
                "match_percentage": min(99, round(match_score * 100)),
                "framework": "hybrid_content_collaborative",
                "metadata": {
                    "career_score": round(career_score, 3),
                    "keyword_overlap": keyword_overlap,
                    "grade_boost": round(grade_boost, 3),
                },
            }
        )

    recs.sort(key=lambda item: (-item["match_percentage"], item["career_name"]))
    return recs[:limit]


def performance_analysis(student: StudentProfile) -> dict[str, Any]:
    bundle = ensure_bundle()
    row = _student_feature_row(student)
    feature_vector = np.array([[row[name] for name in bundle.performance_feature_names]], dtype=float) if bundle.performance_feature_names else None

    if bundle.performance_model is not None and feature_vector is not None:
        predicted_risk = float(bundle.performance_model.predict(feature_vector)[0])
    else:
        records = list(student.academic_records.select_related("course"))
        average_score = float(np.mean([record.total_score for record in records])) if records else 0.0
        attendance = float(student.attendance_percentage or 0)
        behaviour_penalty = len([item for item in student.behaviour_logs.all() if item.severity == "high"]) * 0.08
        predicted_risk = max(0.0, min(1.0, 1 - ((average_score / 100) * 0.55 + (attendance / 100) * 0.35 - behaviour_penalty)))

    performance_score = max(0.0, min(100.0, round((1 - predicted_risk) * 100, 2)))
    if performance_score >= 75:
        risk_level = "low"
        recommendation = "Maintain your current habits and continue engaging with challenging course material."
    elif performance_score >= 55:
        risk_level = "medium"
        recommendation = "You are making progress, but regular study sessions and attendance improvements will help."
    else:
        risk_level = "high"
        recommendation = "This student is at risk. Arrange academic support, monitor attendance closely, and review course load."

    indicators = {
        "predicted_risk": round(predicted_risk, 3),
        "overall_gpa": round(row["overall_gpa"], 2),
        "attendance_percentage": round(row["attendance_percentage"], 2),
        "risk_score": round(row["risk_score"], 2),
        "academic_gap": round(max(0, 70 - row["average_score"]), 2),
        "behaviour_penalty": int(row["high_behaviour_count"]) * 8,
    }

    analysis = student.performance_analyses.create(
        performance_score=performance_score,
        risk_level=risk_level,
        recommendation=recommendation,
        indicators=indicators,
    )
    return {
        "analysis": analysis,
        "metrics": indicators,
    }


def regenerate_student_recommendations(student: StudentProfile) -> dict[str, Any]:
    course = course_recommendations(student)
    career = career_recommendations(student)
    analysis_payload = performance_analysis(student)
    return {
        "course_recommendations": course,
        "career_recommendations": career,
        "performance_analysis": analysis_payload["analysis"],
        "metrics": analysis_payload["metrics"],
    }
