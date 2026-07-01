from django.db.models import Avg, Count, Q

from students.models import StudentProfile


GRADE_POINTS = {
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


def grade_to_points(grade):
    return GRADE_POINTS.get(str(grade).lower(), 2.5)


def refresh_student_profile(student_profile: StudentProfile) -> StudentProfile:
    records = student_profile.academic_records.select_related("course")
    attendance_records = student_profile.attendance_records.select_related("course")
    behaviour_logs = student_profile.behaviour_logs.all()

    record_count = records.count()
    grade_points = [grade_to_points(record.grade) for record in records]
    overall_gpa = round(sum(grade_points) / record_count, 2) if record_count else 0.0

    attended = attendance_records.filter(status__in=["present", "late", "excused"]).count()
    attendance_total = attendance_records.count()
    attendance_percentage = round((attended / attendance_total) * 100, 2) if attendance_total else 0.0

    high_behaviour = behaviour_logs.filter(severity="high").count()
    low_attendance_penalty = max(0, 70 - attendance_percentage) / 10
    gpa_penalty = max(0, 2.5 - overall_gpa) * 20
    behaviour_penalty = high_behaviour * 8
    risk_score = round(min(1.0, max(0.0, (low_attendance_penalty + gpa_penalty + behaviour_penalty) / 100)), 2)

    student_profile.overall_gpa = overall_gpa
    student_profile.attendance_percentage = attendance_percentage
    student_profile.risk_score = risk_score
    student_profile.save(update_fields=["overall_gpa", "attendance_percentage", "risk_score", "updated_at"])
    return student_profile
