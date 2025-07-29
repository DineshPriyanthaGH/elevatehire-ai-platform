#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User

# Create superuser if it doesn't exist
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@elevatehire.com', 'admin123')
    print("✅ Superuser 'admin' created successfully!")
    print("Username: admin")
    print("Password: admin123")
    print("Email: admin@elevatehire.com")
else:
    print("❌ Superuser 'admin' already exists!")
    # Reset password for existing user
    user = User.objects.get(username='admin')
    user.set_password('admin123')
    user.save()
    print("✅ Password reset to 'admin123'")
    print("Username: admin")
    print("Password: admin123")
