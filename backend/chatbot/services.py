import re
from uuid import uuid4

from chatbot.models import ChatConversation, KnowledgeBase
from students.models import StudentProfile
from recommendations.services import (
    analyze_performance,
    generate_career_recommendations,
    generate_course_recommendations,
)


INTENT_KEYWORDS = {
    "course_recommendation": {"course", "courses", "module", "subject", "recommend", "register"},
    "career_guidance": {"career", "job", "work", "industry", "role", "future"},
    "performance_analysis": {"performance", "grades", "grade", "attendance", "risk", "progress"},
    "login_help": {"login", "sign in", "sign in", "password", "register", "logout"},
    "admin_help": {"admin", "dashboard", "manage", "knowledge base", "user"},
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
            score = (overlap * 2) + item.priority
            matches.append((score, item))
    matches.sort(key=lambda pair: (-pair[0], pair[1].question))
    return [item for _, item in matches[:limit]]


def build_chat_response(user, message, session_id=None):
    intent, confidence = detect_intent(message)
    session_id = session_id or uuid4().hex
    message_normalized = normalize_text(message)
    knowledge_hits = knowledge_base_matches(message_normalized)

    response_parts = []
    suggestions = []
    metadata = {
        "intent": intent,
        "knowledge_hits": [entry.question for entry in knowledge_hits],
    }

    if knowledge_hits:
        response_parts.append(knowledge_hits[0].answer)
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
            recs = generate_course_recommendations(student_profile, limit=3)
            if recs:
                response_parts.append(
                    "Recommended courses: "
                    + "; ".join(
                        f"{rec.course.code} - {rec.course.name} ({rec.confidence_score:.0%} match)"
                        for rec in recs
                    )
                )
        elif intent == "career_guidance":
            recs = generate_career_recommendations(student_profile, limit=3)
            if recs:
                response_parts.append(
                    "Career matches: "
                    + "; ".join(
                        f"{rec.career_name} ({rec.match_percentage}% match)"
                        for rec in recs
                    )
                )
        elif intent == "performance_analysis":
            analysis = analyze_performance(student_profile)
            response_parts.append(
                f"Performance score: {analysis.performance_score}/100. Risk level: {analysis.risk_level}."
            )
            response_parts.append(analysis.recommendation)
        else:
            records = student_profile.academic_records.select_related("course")[:3]
            if records:
                response_parts.append(
                    "I can also see your latest academic progress in "
                    + ", ".join(record.course.code for record in records)
                    + "."
                )

    if not response_parts:
        response_parts.append(
            "I can help with course recommendations, career guidance, performance tracking, and account questions. Tell me what you want to explore."
        )

    response_text = " ".join(response_parts)

    conversation = ChatConversation.objects.create(
        user=user,
        session_id=session_id,
        user_message=message,
        bot_response=response_text,
        intent=intent,
        confidence=confidence,
        metadata=metadata,
    )

    return {
        "conversation": conversation,
        "session_id": session_id,
        "intent": intent,
        "confidence": round(confidence, 2),
        "response": response_text,
        "suggestions": suggestions,
    }
