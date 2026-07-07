# Generated manually to add pinned knowledge-base answers.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chatbot", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="knowledgebase",
            name="is_pinned",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterModelOptions(
            name="knowledgebase",
            options={"ordering": ["-is_pinned", "-priority", "-created_at"]},
        ),
    ]
