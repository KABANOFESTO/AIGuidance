from __future__ import annotations

import re
from uuid import uuid4

from chatbot.models import ChatConversation, KnowledgeBase
from recommendations.services import (
    analyze_performance,
    generate_career_recommendations,
    generate_course_recommendations,
)
from students.models import StudentProfile


INTENT_KEYWORDS = {
    "greeting": {"hello", "hi", "hey", "thanks", "thank"},
    "course_recommendation": {"course", "courses", "module", "subject", "recommend", "register"},
    "career_guidance": {"career", "job", "work", "industry", "role", "future"},
    "performance_analysis": {"performance", "grades", "grade", "attendance", "risk", "progress"},
    "login_help": {"login", "signin", "sign", "password", "register", "logout", "verify"},
    "admin_help": {"admin", "dashboard", "manage", "knowledge", "user"},
}

RESPONSE_MODES = {"short", "medium", "detailed"}

COMMON_FALLBACKS = [
    {
        "keywords": {"course", "courses", "module", "subject"},
        "answer": "Use the Course Recommendations page to see live suggestions based on your academic profile, then open a course to compare requirements and fit.",
        "follow_ups": [
            "Which courses match my strengths?",
            "Why is this course recommended?",
            "What should I study before taking advanced courses?",
        ],
        "next_action": "Open the Course Recommendations page and review the top three matches.",
    },
    {
        "keywords": {"career", "job", "future", "work"},
        "answer": "The Career Guide compares your interests, grades, and academic direction against the built-in career framework to suggest realistic career paths.",
        "follow_ups": [
            "Which career fits me best?",
            "What skills should I build for this career?",
            "Which courses support this career path?",
        ],
        "next_action": "Open the Career Guide and compare your top career matches.",
    },
    {
        "keywords": {"grade", "grades", "marks", "performance", "attendance", "risk"},
        "answer": "Your performance summary is calculated from marks, attendance, and behaviour data. If the system detects risk, it will show the reason and a practical next step.",
        "follow_ups": [
            "What is my current risk level?",
            "How can I improve my attendance?",
            "Which course needs attention now?",
        ],
        "next_action": "Open My Results to review your current risk and recent grades.",
    },
    {
        "keywords": {"login", "password", "verify", "register", "signin", "sign"},
        "answer": "If you cannot sign in, make sure your email is verified and your role matches the dashboard you are trying to open.",
        "follow_ups": [
            "How do I verify my email?",
            "How do I reset my password?",
            "How do I reach my correct dashboard?",
        ],
        "next_action": "Check your email verification status and then sign in again.",
    },
]

FOLLOW_UPS = {
    "greeting": [
        "What courses should I take next?",
        "What career suits me best?",
        "How is my performance this semester?",
    ],
    "course_recommendation": [
        "Why were these courses recommended?",
        "Which of these courses fit my current strengths best?",
        "What should I improve before taking advanced courses?",
    ],
    "career_guidance": [
        "Which career matches my interests most closely?",
        "What skills should I build for this career?",
        "What courses will help me prepare for it?",
    ],
    "performance_analysis": [
        "What is my weakest area right now?",
        "How can I improve my attendance and grades?",
        "Which course needs the most attention?",
    ],
    "login_help": [
        "How do I verify my email?",
        "I forgot my password. What should I do?",
        "How do I access my dashboard after login?",
    ],
    "admin_help": [
        "How do I manage users?",
        "How do I update the knowledge base?",
        "Where can I see model analytics?",
    ],
    "general_support": [
        "Show me my course recommendations.",
        "Explain my current performance risk.",
        "Help me choose a career path.",
    ],
}

MODE_LABELS = {
    "short": "Short",
    "medium": "Medium",
    "detailed": "Detailed",
}


def normalize_text(value):
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def tokenize(value):
    return set(re.findall(r"[a-z0-9]+", normalize_text(value)))


def detect_intent(message):
    tokens = tokenize(message)
    ranked = []
    for intent, keywords in INTENT_KEYWORDS.items():
        score = len(tokens & keywords)
        if score:
            ranked.append((score, intent))
    if ranked:
        ranked.sort(reverse=True)
        return ranked[0][1], min(0.99, 0.55 + (ranked[0][0] * 0.12))
    return "general_support", 0.35


def knowledge_base_matches(message, limit=3):
    tokens = tokenize(message)
    if not tokens:
        return []

    matches = []
    for item in KnowledgeBase.objects.filter(is_active=True):
        kb_tokens = (
            tokenize(item.question)
            | tokenize(item.answer)
            | tokenize(item.category)
            | {str(keyword).lower() for keyword in (item.keywords or [])}
        )
        overlap = len(tokens & kb_tokens)
        if overlap:
            score = (overlap * 2) + item.priority + (10 if item.is_pinned else 0)
            matches.append((score, item))
    matches.sort(key=lambda pair: (-pair[0], -int(pair[1].is_pinned), pair[1].question))
    return [item for _, item in matches[:limit]]


def _student_context_summary(student_profile):
    recent_records = list(student_profile.academic_records.select_related("course")[:3])
    parts = []

    if student_profile.career_goal:
        parts.append(f"Your current career goal is {student_profile.career_goal}.")
    if student_profile.interests:
        parts.append(f"Your stated interests include {student_profile.interests}.")
    if recent_records:
        course_bits = []
        for record in recent_records:
            course_bits.append(f"{record.course.code} {record.grade} ({record.total_score}%)")
        parts.append("Recent academic records: " + "; ".join(course_bits) + ".")
    if student_profile.attendance_percentage is not None:
        parts.append(f"Attendance is currently {student_profile.attendance_percentage}%.")

    return parts


def _format_course_recommendations(recs):
    if not recs:
        return None
    items = "; ".join(
        f"{rec.course.code} - {rec.course.name} ({rec.confidence_score:.0%} match)" for rec in recs
    )
    return f"Recommended courses: {items}."


def _format_career_recommendations(recs):
    if not recs:
        return None
    items = "; ".join(f"{rec.career_name} ({rec.match_percentage}% match)" for rec in recs)
    return f"Career matches: {items}."


def _format_performance_analysis(analysis):
    if not analysis:
        return None
    return (
        f"Performance score: {analysis.performance_score}/100. "
        f"Risk level: {analysis.risk_level}. {analysis.recommendation}"
    )


def _fallback_answer(message):
    tokens = tokenize(message)
    for item in COMMON_FALLBACKS:
        if tokens & item["keywords"]:
            return item["answer"], item["follow_ups"], item["next_action"]
    return None, None, None


def _follow_ups_for_intent(intent, knowledge_hits, fallback_follow_ups=None):
    if fallback_follow_ups:
        return fallback_follow_ups[:3]
    follow_ups = list(FOLLOW_UPS.get(intent, FOLLOW_UPS["general_support"]))
    if knowledge_hits:
        follow_ups.insert(0, f"Tell me more about: {knowledge_hits[0].question}")
    return follow_ups[:3]


def _summarize_response(core_lines, mode):
    core_lines = [line.strip() for line in core_lines if line and line.strip()]
    if not core_lines:
        return []
    if mode == "short":
        return core_lines[:1]
    if mode == "medium":
        return core_lines[:2]
    return core_lines


def _recommended_next_action(intent, fallback_next_action=None):
    if fallback_next_action:
        return fallback_next_action
    mapping = {
        "course_recommendation": "Open the Course Recommendations page and compare the top three matches.",
        "career_guidance": "Open the Career Guide and review the strongest career matches.",
        "performance_analysis": "Open My Results to review risk, grades, and attendance together.",
        "login_help": "Verify your email and confirm you are signing in with the correct role.",
        "admin_help": "Open the admin knowledge base or analytics page to manage advisor content.",
        "greeting": "Ask for courses, careers, or performance help to continue.",
    }
    return mapping.get(intent, "Open My Results to continue with a focused academic review.")


def _mode_brief(mode):
    return MODE_LABELS.get(mode, MODE_LABELS["medium"])


def build_chat_response(user, message, session_id=None, response_mode="medium"):
    mode = response_mode if response_mode in RESPONSE_MODES else "medium"
    intent, confidence = detect_intent(message)
    session_id = session_id or uuid4().hex
    message_normalized = normalize_text(message)
    knowledge_hits = knowledge_base_matches(message_normalized)

    response_parts = []
    suggestions = []
    metadata = {
        "intent": intent,
        "response_mode": mode,
        "knowledge_hits": [entry.question for entry in knowledge_hits],
    }

    if knowledge_hits:
        response_parts.append(knowledge_hits[0].answer.strip())
        suggestions.extend(
            [
                {
                    "question": entry.question,
                    "answer": entry.answer,
                    "category": entry.category,
                }
                for entry in knowledge_hits[1:]
            ]
        )

    student_profile = StudentProfile.objects.filter(user=user).first()
    if student_profile:
        if intent == "course_recommendation":
            formatted = _format_course_recommendations(generate_course_recommendations(student_profile, limit=3))
            if formatted:
                response_parts.append(formatted)
        elif intent == "career_guidance":
            formatted = _format_career_recommendations(generate_career_recommendations(student_profile, limit=3))
            if formatted:
                response_parts.append(formatted)
        elif intent == "performance_analysis":
            formatted = _format_performance_analysis(analyze_performance(student_profile))
            if formatted:
                response_parts.append(formatted)
        elif intent == "general_support" and not knowledge_hits:
            response_parts.extend(_student_context_summary(student_profile))

    fallback_answer, fallback_follow_ups, fallback_next_action = _fallback_answer(message)
    if fallback_answer and not response_parts:
        response_parts.append(fallback_answer)

    if intent == "greeting" and not response_parts:
        response_parts.append(
            "Hello. I can help you with course recommendations, career guidance, performance tracking, attendance risk, and account questions."
        )

    if not response_parts:
        response_parts.append(
            "I can help with course recommendations, career guidance, performance tracking, attendance support, and account questions. Tell me what you want to explore."
        )

    next_action = _recommended_next_action(intent, fallback_next_action)
    if mode == "short":
        response_parts = _summarize_response(response_parts, mode)
        response_parts.append(f"Recommended next action: {next_action}")
    elif mode == "medium":
        response_parts = _summarize_response(response_parts, mode)
        response_parts.append(f"Recommended next action: {next_action}")
    else:
        if intent == "performance_analysis":
            response_parts.append("Why this matters: performance trends help you act before the issue becomes serious.")
        elif intent == "career_guidance":
            response_parts.append("Why this matters: career alignment improves course planning and long-term direction.")
        elif intent == "course_recommendation":
            response_parts.append("Why this matters: course fit is based on your current academic profile and learning direction.")
        response_parts.append(f"Recommended next action: {next_action}")

    follow_ups = _follow_ups_for_intent(intent, knowledge_hits, fallback_follow_ups)
    response_text = " ".join(response_parts)

    conversation = ChatConversation.objects.create(
        user=user,
        session_id=session_id,
        user_message=message,
        bot_response=response_text,
        intent=intent,
        confidence=confidence,
        metadata={**metadata, "follow_ups": follow_ups, "next_action": next_action},
    )

    return {
        "conversation": conversation,
        "session_id": session_id,
        "intent": intent,
        "confidence": round(confidence, 2),
        "response": response_text,
        "suggestions": suggestions,
        "follow_ups": follow_ups,
        "next_action": next_action,
        "response_mode": mode,
        "mode_label": _mode_brief(mode),
    }

