from django.db import models
from django.contrib.auth import get_user_model
import uuid
import os

User = get_user_model()

def candidate_cv_upload_path(instance, filename):
    """Generate upload path for candidate CVs"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return f"candidates/cvs/{filename}"

class Candidate(models.Model):
    """Model to store candidate information"""
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    
    # CV Upload
    cv_file = models.FileField(upload_to=candidate_cv_upload_path, null=True, blank=True)
    cv_filename = models.CharField(max_length=255, blank=True)
    
    # Extracted Information
    full_name = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    current_position = models.CharField(max_length=200, blank=True)
    current_company = models.CharField(max_length=200, blank=True)
    location = models.CharField(max_length=100, blank=True)
    
    # Skills and Education
    skills = models.JSONField(default=list, blank=True)
    education = models.JSONField(default=list, blank=True)
    work_experience = models.JSONField(default=list, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    languages = models.JSONField(default=list, blank=True)
    
    # Social Links
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    # Extracted Raw Data
    extracted_text = models.TextField(blank=True)
    extraction_confidence = models.FloatField(default=0.0)
    
    # Status and Tracking
    STATUS_CHOICES = [
        ('new', 'New'),
        ('screening', 'Screening'),
        ('interview', 'Interview'),
        ('offered', 'Offered'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Ratings and Notes
    rating = models.IntegerField(null=True, blank=True, help_text="Rating from 1-10")
    notes = models.TextField(blank=True)
    
    # Metadata
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        if self.full_name:
            return self.full_name
        elif self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.email:
            return self.email
        else:
            return f"Candidate {str(self.id)[:8]}"
    
    @property
    def display_name(self):
        """Return the best available name for display"""
        if self.full_name:
            return self.full_name
        elif self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        elif self.email:
            return self.email.split('@')[0].title()
        else:
            return "Unknown Candidate"
    
    @property
    def cv_file_size(self):
        """Return CV file size in MB"""
        if self.cv_file:
            return round(self.cv_file.size / (1024 * 1024), 2)
        return 0

class CandidateTag(models.Model):
    """Tags for categorizing candidates"""
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class CandidateTagAssignment(models.Model):
    """Many-to-many relationship between candidates and tags"""
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='tag_assignments')
    tag = models.ForeignKey(CandidateTag, on_delete=models.CASCADE)
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['candidate', 'tag']

class CandidateActivity(models.Model):
    """Track activities related to candidates"""
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    ACTIVITY_TYPES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('cv_uploaded', 'CV Uploaded'),
        ('status_changed', 'Status Changed'),
        ('note_added', 'Note Added'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('email_sent', 'Email Sent'),
        ('called', 'Called'),
    ]
    
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.candidate.display_name} - {self.get_activity_type_display()}"
