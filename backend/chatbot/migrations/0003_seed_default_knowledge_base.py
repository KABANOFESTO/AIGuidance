# Generated manually to seed starter chatbot knowledge-base entries.

from django.db import migrations


def seed_knowledge_base(apps, schema_editor):
    KnowledgeBase = apps.get_model("chatbot", "KnowledgeBase")
    if KnowledgeBase.objects.exists():
        return

    entries = [
        {
            "question": "How do students use the chatbot?",
            "answer": "Students can ask about courses, careers, performance, attendance risk, and account help. The chatbot uses live academic data plus approved staff knowledge-base content.",
            "category": "general",
            "keywords": ["chatbot", "student", "help", "advisor"],
            "priority": 10,
            "is_pinned": True,
            "is_active": True,
        },
        {
            "question": "How do I reset my password?",
            "answer": "Use the Forgot Password option on the login page and follow the email instructions to set a new password.",
            "category": "auth",
            "keywords": ["password", "reset", "login"],
            "priority": 10,
            "is_pinned": True,
            "is_active": True,
        },
        {
            "question": "How does course recommendation work?",
            "answer": "Course recommendations are generated from your marks, attendance, interests, learning preferences, and course history to show the best-fit options.",
            "category": "courses",
            "keywords": ["courses", "recommendation", "grades"],
            "priority": 9,
            "is_pinned": True,
            "is_active": True,
        },
        {
            "question": "How does career guidance work?",
            "answer": "Career guidance compares your interests, academic strengths, and goals against the built-in career framework to suggest realistic career paths.",
            "category": "career",
            "keywords": ["career", "guidance", "interest"],
            "priority": 9,
            "is_pinned": True,
            "is_active": True,
        },
        {
            "question": "How is student performance monitored?",
            "answer": "Performance is analysed from grades, attendance, behaviour data, and assignment scores. If risk is detected, the system shows the reason and a recommended action.",
            "category": "performance",
            "keywords": ["performance", "attendance", "risk"],
            "priority": 9,
            "is_pinned": True,
            "is_active": True,
        },
    ]

    for entry in entries:
        KnowledgeBase.objects.create(**entry)


def unseed_knowledge_base(apps, schema_editor):
    KnowledgeBase = apps.get_model("chatbot", "KnowledgeBase")
    questions = [
        "How do students use the chatbot?",
        "How do I reset my password?",
        "How does course recommendation work?",
        "How does career guidance work?",
        "How is student performance monitored?",
    ]
    KnowledgeBase.objects.filter(question__in=questions).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("chatbot", "0002_knowledgebase_is_pinned"),
    ]

    operations = [
        migrations.RunPython(seed_knowledge_base, unseed_knowledge_base),
    ]
