#!/usr/bin/env python3
"""
Django management script to create sample data for testing
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from candidates.models import Candidate
from interviews.models import Interview, InterviewType
from django.utils import timezone

User = get_user_model()

def create_sample_data():
    """Create sample candidates and interviews for testing"""
    print("Creating sample data for ElevateHire AI...")
    
    # Get or create superuser
    try:
        user = User.objects.get(username='admin')
        print(f"Using existing admin user: {user.username}")
    except User.DoesNotExist:
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User'
        )
        print(f"Created admin user: {user.username}")
    
    # Create interview types
    interview_types_data = [
        {
            'name': 'Technical Interview',
            'description': 'Technical skills assessment',
            'duration_minutes': 60,
            'color': '#3B82F6',
            'is_active': True
        },
        {
            'name': 'Behavioral Interview', 
            'description': 'Cultural fit and soft skills evaluation',
            'duration_minutes': 45,
            'color': '#10B981',
            'is_active': True
        },
        {
            'name': 'System Design',
            'description': 'System design and architecture discussion', 
            'duration_minutes': 90,
            'color': '#F59E0B',
            'is_active': True
        }
    ]
    
    interview_types = []
    for type_data in interview_types_data:
        interview_type, created = InterviewType.objects.get_or_create(
            name=type_data['name'],
            defaults=type_data
        )
        interview_types.append(interview_type)
        if created:
            print(f"Created interview type: {interview_type.name}")
    
    # Create sample candidates
    candidates_data = [
        {
            'first_name': 'Sarah',
            'last_name': 'Johnson', 
            'email': 'sarah.johnson@example.com',
            'phone': '+1-555-0123',
            'full_name': 'Sarah Johnson',
            'current_position': 'Senior Software Engineer',
            'current_company': 'Tech Solutions Inc',
            'location': 'San Francisco, CA',
            'experience_years': 5,
            'summary': 'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies.',
            'skills': ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
            'status': 'interview',
            'added_by': user
        },
        {
            'first_name': 'Michael',
            'last_name': 'Chen',
            'email': 'michael.chen@example.com', 
            'phone': '+1-555-0124',
            'full_name': 'Michael Chen',
            'current_position': 'Data Scientist',
            'current_company': 'DataCorp',
            'location': 'New York, NY',
            'experience_years': 3,
            'summary': 'Data scientist with strong background in machine learning and analytics.',
            'skills': ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Pandas'],
            'status': 'screening',
            'added_by': user
        },
        {
            'first_name': 'Emily',
            'last_name': 'Rodriguez',
            'email': 'emily.rodriguez@example.com',
            'phone': '+1-555-0125', 
            'full_name': 'Emily Rodriguez',
            'current_position': 'UX Designer',
            'current_company': 'Design Studio Pro',
            'location': 'Austin, TX',
            'experience_years': 4,
            'summary': 'Creative UX designer focused on user-centered design and accessibility.',
            'skills': ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'HTML/CSS'],
            'status': 'new',
            'added_by': user
        }
    ]
    
    candidates = []
    for candidate_data in candidates_data:
        candidate, created = Candidate.objects.get_or_create(
            email=candidate_data['email'],
            defaults=candidate_data
        )
        candidates.append(candidate)
        if created:
            print(f"Created candidate: {candidate.full_name}")
    
    # Create sample interviews
    base_date = timezone.now() + timedelta(hours=2)
    
    interview_data = [
        {
            'title': f'{interview_types[0].name} - {candidates[0].full_name}',
            'description': f'Technical assessment for {candidates[0].full_name}',
            'candidate': candidates[0],
            'interview_type': interview_types[0],
            'interviewer': user,
            'scheduled_date': base_date + timedelta(days=1),
            'duration_minutes': 60,
            'meeting_type': 'video_call',
            'meeting_link': 'https://meet.example.com/interview-12345',
            'status': 'scheduled',
            'priority': 'normal',
            'created_by': user,
            'ai_analysis_status': 'completed',
            'confidence_score': 85.5,
            'communication_score': 78.2,
            'technical_score': 91.3,
            'engagement_score': 88.7,
            'ai_sentiment': 'positive',
            'ai_keywords': ['python', 'react', 'problem-solving', 'teamwork'],
            'ai_recommendations': [
                'Strong technical skills demonstrated',
                'Good communication and clarity',
                'Recommend for next round'
            ],
            'ai_summary': 'Candidate showed strong technical competence and excellent communication skills.'
        },
        {
            'title': f'{interview_types[1].name} - {candidates[1].full_name}',
            'description': f'Behavioral interview for {candidates[1].full_name}',
            'candidate': candidates[1],
            'interview_type': interview_types[1], 
            'interviewer': user,
            'scheduled_date': base_date + timedelta(days=2),
            'duration_minutes': 45,
            'meeting_type': 'video_call',
            'meeting_link': 'https://meet.example.com/interview-67890',
            'status': 'confirmed',
            'priority': 'high',
            'created_by': user,
            'ai_analysis_status': 'pending'
        }
    ]
    
    for interview_info in interview_data:
        interview, created = Interview.objects.get_or_create(
            candidate=interview_info['candidate'],
            interview_type=interview_info['interview_type'],
            scheduled_date=interview_info['scheduled_date'],
            defaults=interview_info
        )
        if created:
            print(f"Created interview: {interview.title}")
    
    print(f"\n✅ Sample data created successfully!")
    print(f"📊 Summary:")
    print(f"   - Users: {User.objects.count()}")
    print(f"   - Candidates: {Candidate.objects.count()}")  
    print(f"   - Interview Types: {InterviewType.objects.count()}")
    print(f"   - Interviews: {Interview.objects.count()}")

if __name__ == "__main__":
    create_sample_data()