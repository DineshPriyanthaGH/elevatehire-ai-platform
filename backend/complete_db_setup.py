#!/usr/bin/env python3
"""
Complete Database Setup and Verification Script for ElevateHire AI
This script creates all remaining migrations and verifies the setup.
"""

import os
import sys
import django
import subprocess
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model

User = get_user_model()

def run_docker_command(command):
    """Run docker command and return output"""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        return "", str(e), 1

def create_remaining_migrations():
    """Create migrations for all apps that don't have them yet"""
    print("🔧 Creating migrations for remaining apps...")
    
    apps_to_migrate = [
        'interviews',
        'analytics', 
        'ai_analysis',
        'scoring',
        'reports'
    ]
    
    for app in apps_to_migrate:
        try:
            print(f"   Creating migrations for {app}...")
            call_command('makemigrations', app, verbosity=1)
        except Exception as e:
            print(f"   ⚠️  Warning creating migrations for {app}: {e}")

def apply_all_migrations():
    """Apply all migrations to the database"""
    print("🚀 Applying all migrations...")
    try:
        call_command('migrate', verbosity=1)
        print("✅ All migrations applied successfully")
    except Exception as e:
        print(f"❌ Error applying migrations: {e}")

def show_database_status():
    """Show current database status"""
    print("📊 Database Status:")
    
    with connection.cursor() as cursor:
        # Get all tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        
        print(f"   Total Tables: {len(tables)}")
        
        # Count records in each table
        for table in tables:
            table_name = table[0]
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
                count = cursor.fetchone()[0]
                print(f"   📋 {table_name:<35} {count:>6} records")
            except Exception as e:
                print(f"   ❌ {table_name:<35} Error: {str(e)}")

def create_sample_data():
    """Create some sample data for testing"""
    print("🎯 Creating sample data...")
    
    # Check if superuser already exists
    if User.objects.filter(is_superuser=True).exists():
        print("   ✅ Superuser already exists")
    else:
        # Create superuser
        try:
            User.objects.create_superuser(
                email='admin@elevatehire.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            print("   ✅ Superuser created: admin@elevatehire.com / admin123")
        except Exception as e:
            print(f"   ⚠️  Could not create superuser: {e}")

def show_access_info():
    """Show how to access the database and admin"""
    print("\n" + "="*60)
    print("🎉 DATABASE SETUP COMPLETE!")
    print("="*60)
    print("\n📋 ACCESS INFORMATION:")
    print("   🌐 Django Admin: http://localhost:8000/admin/")
    print("      Email: admin@elevatehire.com")
    print("      Password: admin123")
    print("\n   🗄️  pgAdmin: http://localhost:5050")
    print("      Email: admin@elevatehire.com") 
    print("      Password: admin123")
    print("\n   🔗 Database Connection:")
    print("      Host: localhost")
    print("      Port: 5434")
    print("      Database: elevatehire_db")
    print("      Username: postgres")
    print("      Password: priyantha2002")
    print("\n   🚀 API Base URL: http://localhost:8000/api/")
    print("   📊 API Documentation: http://localhost:8000/api/docs/")
    
def main():
    print("🔍 ElevateHire AI Database Setup")
    print("="*50)
    
    # Create remaining migrations
    create_remaining_migrations()
    
    # Apply all migrations
    apply_all_migrations()
    
    # Show database status
    show_database_status()
    
    # Create sample data
    create_sample_data()
    
    # Show access information
    show_access_info()

if __name__ == "__main__":
    main()
