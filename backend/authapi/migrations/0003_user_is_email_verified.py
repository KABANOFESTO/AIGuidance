# Generated manually for email verification support.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authapi", "0002_usernotification"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_email_verified",
            field=models.BooleanField(default=False),
        ),
    ]
