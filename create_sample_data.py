#!/usr/bin/env python3
"""
Script to create sample interview data for testing
"""
import os
import sys
import django
import uuid
from datetime import datetime, timedelta

# Add the backend directory to sys.path
sys.path.insert(0, '/app')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from candidates.models import Candidate
from interviews.models import Interview, InterviewType
from django.utils import timezone

User = get_user_model()

def create_sample_data():
    """Create sample candidates and interviews for testing"""
    print("Creating sample data...")
    
    try:
        # Get or create a user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User',
                'is_staff': True
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            print(f"Created user: {user.username}")
        else:
            print(f"Using existing user: {user.username}")
        
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
                'added_by': user
            }
        ]
        
        created_candidates = []
        for candidate_data in candidates_data:
            candidate, created = Candidate.objects.get_or_create(
                email=candidate_data['email'],
                defaults=candidate_data
            )
            created_candidates.append(candidate)
            if created:
                print(f"Created candidate: {candidate.full_name}")
            else:
                print(f"Using existing candidate: {candidate.full_name}")
        
        # Create interview types
        interview_types_data = [
            {'name': 'Technical Interview', 'description': 'Technical skills assessment', 'duration_minutes': 60, 'color': '#3B82F6'},
            {'name': 'Behavioral Interview', 'description': 'Cultural fit and soft skills evaluation', 'duration_minutes': 45, 'color': '#10B981'},
            {'name': 'System Design', 'description': 'System design and architecture discussion', 'duration_minutes': 90, 'color': '#F59E0B'},
            {'name': 'Final Round', 'description': 'Final interview with leadership', 'duration_minutes': 30, 'color': '#EF4444'}
        ]
        
        created_interview_types = []
        for interview_type_data in interview_types_data:
            interview_type, created = InterviewType.objects.get_or_create(
                name=interview_type_data['name'],
                defaults=interview_type_data
            )
            created_interview_types.append(interview_type)
            if created:
                print(f"Created interview type: {interview_type.name}")
            else:
                print(f"Using existing interview type: {interview_type.name}")
        
        # Create sample interviews
        interviews_data = []
        base_date = timezone.now() + timedelta(hours=2)
        
        for i, candidate in enumerate(created_candidates):
            for j, interview_type in enumerate(created_interview_types[:2]):  # Create 2 interviews per candidate
                scheduled_date = base_date + timedelta(days=i*2 + j, hours=j*2)
                
                interview_data = {
                    'title': f'{interview_type.name} - {candidate.full_name}',
                    'description': f'{interview_type.description} for {candidate.full_name}',
                    'candidate': candidate,
                    'interview_type': interview_type,
                    'interviewer': user,
                    'scheduled_date': scheduled_date,
                    'duration_minutes': interview_type.duration_minutes,
                    'meeting_type': 'video_call',
                    'meeting_link': f'https://meet.example.com/interview-{uuid.uuid4().hex[:8]}',
                    'status': 'scheduled',
                    'priority': 'normal',
                    'created_by': user,
                    'preparation_materials': f'Please review {candidate.full_name}\'s resume and prepare technical questions.',
                    'interview_questions': [
                        'Tell me about your experience with the technologies listed on your resume.',
                        'How do you approach problem-solving in challenging situations?',
                        'What interests you about this position and our company?'
                    ],
                    # Sample AI analysis data
                    'ai_analysis_status': 'completed' if i == 0 and j == 0 else 'pending',
                    'confidence_score': 85.5 if i == 0 and j == 0 else None,
                    'communication_score': 78.2 if i == 0 and j == 0 else None,
                    'technical_score': 91.3 if i == 0 and j == 0 else None,
                    'engagement_score': 88.7 if i == 0 and j == 0 else None,
                    'ai_sentiment': 'positive' if i == 0 and j == 0 else '',
                    'ai_keywords': ['python', 'react', 'problem-solving', 'teamwork'] if i == 0 and j == 0 else [],
                    'ai_recommendations': [
                        'Strong technical skills demonstrated',
                        'Good communication and clarity',
                        'Recommend for next round'
                    ] if i == 0 and j == 0 else [],
                    'ai_summary': 'Candidate showed strong technical competence and excellent communication skills. Demonstrated good problem-solving approach and enthusiasm for the role.' if i == 0 and j == 0 else ''
                }
                
                interviews_data.append(interview_data)
        
        # Create interviews
        for interview_data in interviews_data:
            interview, created = Interview.objects.get_or_create(
                candidate=interview_data['candidate'],
                interview_type=interview_data['interview_type'],
                scheduled_date=interview_data['scheduled_date'],
                defaults=interview_data
            )
            if created:
                print(f"Created interview: {interview.title}")
            else:
                print(f"Using existing interview: {interview.title}")
        
        print(f"\nSample data created successfully!")
        print(f"Created {len(created_candidates)} candidates")
        print(f"Created {len(created_interview_types)} interview types")
        print(f"Created {len(interviews_data)} interviews")
        
        # Display summary
        print(f"\nData Summary:")
        print(f"Total candidates: {Candidate.objects.count()}")
        print(f"Total interview types: {InterviewType.objects.count()}")
        print(f"Total interviews: {Interview.objects.count()}")
        
        return True
        
    except Exception as e:
        print(f"Error creating sample data: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = create_sample_data()
    sys.exit(0 if success else 1)