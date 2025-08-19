"""
Tests for candidates app
"""
import json
import tempfile
from datetime import timedelta
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Candidate, CandidateTag, CandidateActivity

User = get_user_model()

class CandidateModelTest(TestCase):
    """Test Candidate model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
    
    def test_candidate_creation(self):
        """Test creating a candidate"""
        candidate = Candidate.objects.create(
            full_name='John Doe',
            email='john@example.com',
            phone='+1234567890',
            created_by=self.user
        )
        
        self.assertEqual(candidate.full_name, 'John Doe')
        self.assertEqual(candidate.email, 'john@example.com')
        self.assertEqual(candidate.status, 'new')  # Default status
        self.assertEqual(candidate.created_by, self.user)
        self.assertTrue(candidate.id)  # UUID should be generated
    
    def test_candidate_str_method(self):
        """Test string representation of candidate"""
        candidate = Candidate.objects.create(
            full_name='Jane Smith',
            email='jane@example.com',
            created_by=self.user
        )
        
        self.assertEqual(str(candidate), 'Jane Smith')

class CandidateAPITest(APITestCase):
    """Test Candidate API endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        
        # Create some test candidates
        self.candidate1 = Candidate.objects.create(
            full_name='John Doe',
            email='john@example.com',
            skills=['Python', 'Django'],
            created_by=self.user
        )
    
    def test_create_candidate(self):
        """Test creating a new candidate"""
        url = '/api/candidates/candidates/'
        
        # Create a simple text file for CV
        cv_content = b'This is a test CV content'
        cv_file = SimpleUploadedFile(
            'test_cv.txt',
            cv_content,
            content_type='text/plain'
        )
        
        data = {
            'full_name': 'New Candidate',
            'email': 'new@example.com',
            'phone': '+1234567890',
            'cv_file': cv_file
        }
        
        response = self.client.post(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify candidate was created in database
        candidate = Candidate.objects.get(email='new@example.com')
        self.assertEqual(candidate.full_name, 'New Candidate')

class CVParsingTest(TestCase):
    """Test CV parsing functionality"""
    
    def test_cv_parsing_status_endpoint(self):
        """Test CV parsing status endpoint"""
        url = '/api/candidates/cv-parsing-status/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertIn('cv_parsing_available', data)
        self.assertIn('message', data)
