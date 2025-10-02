from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

User = get_user_model()

class InterviewType(models.Model):
    """Different types of interviews"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(default=60, validators=[MinValueValidator(15), MaxValueValidator(480)])
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color for calendar
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class Interview(models.Model):
    """Interview scheduling model"""
    
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled'),
        ('no_show', 'No Show'),
    ]
    
    MEETING_TYPE_CHOICES = [
        ('in_person', 'In Person'),
        ('video_call', 'Video Call'),
        ('phone_call', 'Phone Call'),
        ('hybrid', 'Hybrid'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Relationships
    candidate = models.ForeignKey('candidates.Candidate', on_delete=models.CASCADE, related_name='interviews')
    interview_type = models.ForeignKey(InterviewType, on_delete=models.PROTECT)
    interviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conducted_interviews')
    additional_interviewers = models.ManyToManyField(User, blank=True, related_name='additional_interviews')
    
    # Scheduling
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60, validators=[MinValueValidator(15), MaxValueValidator(480)])
    end_time = models.DateTimeField()  # Calculated field
    
    # Meeting Details
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPE_CHOICES, default='video_call')
    meeting_link = models.URLField(blank=True, help_text="Video call link (Zoom, Teams, etc.)")
    meeting_location = models.CharField(max_length=200, blank=True, help_text="Physical location or room")
    meeting_id = models.CharField(max_length=100, blank=True, help_text="Meeting ID or conference number")
    meeting_password = models.CharField(max_length=50, blank=True)
    
    # Status and Priority
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Feedback and Results
    feedback = models.TextField(blank=True)
    rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    outcome = models.CharField(max_length=100, blank=True)
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(blank=True)
    
    # Attachments and Documents
    preparation_materials = models.TextField(blank=True, help_text="Materials for candidate preparation")
    interview_questions = models.TextField(blank=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_interviews')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # AI Analysis Integration
    video_file = models.FileField(upload_to='interview_videos/', blank=True, null=True, help_text="Interview recording for AI analysis")
    transcript = models.TextField(blank=True, help_text="Interview transcript")
    ai_analysis_status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ], default='pending', help_text="AI analysis processing status")
    
    # AI Analysis Results
    confidence_score = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Confidence percentage")
    communication_score = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Communication skills score")
    technical_score = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Technical skills score")
    engagement_score = models.FloatField(null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)], help_text="Engagement level score")
    
    ai_keywords = models.JSONField(default=list, blank=True, help_text="Key topics and keywords identified")
    ai_sentiment = models.CharField(max_length=20, choices=[
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
    ], blank=True)
    ai_recommendations = models.JSONField(default=list, blank=True, help_text="AI-generated recommendations")
    ai_summary = models.TextField(blank=True, help_text="AI-generated interview summary")
    ai_processed_at = models.DateTimeField(null=True, blank=True)
    
    # Reminders
    reminder_sent_candidate = models.BooleanField(default=False)
    reminder_sent_interviewer = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['scheduled_date']
        indexes = [
            models.Index(fields=['scheduled_date']),
            models.Index(fields=['status']),
            models.Index(fields=['interviewer']),
            models.Index(fields=['candidate']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.candidate.full_name} on {self.scheduled_date.strftime('%Y-%m-%d %H:%M')}"
    
    def save(self, *args, **kwargs):
        # Calculate end time
        if self.scheduled_date and self.duration_minutes:
            from datetime import timedelta
            self.end_time = self.scheduled_date + timedelta(minutes=self.duration_minutes)
        super().save(*args, **kwargs)
    
    @property
    def is_upcoming(self):
        """Check if interview is upcoming"""
        return self.scheduled_date > timezone.now() and self.status in ['scheduled', 'confirmed']
    
    @property
    def is_today(self):
        """Check if interview is today"""
        return self.scheduled_date.date() == timezone.now().date()
    
    @property
    def is_overdue(self):
        """Check if interview is overdue"""
        return self.scheduled_date < timezone.now() and self.status in ['scheduled', 'confirmed']
    
    @property
    def time_until_interview(self):
        """Get time remaining until interview"""
        if self.scheduled_date > timezone.now():
            return self.scheduled_date - timezone.now()
        return None

class InterviewAvailability(models.Model):
    """Interviewer availability slots"""
    
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]
    
    interviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='availability_slots')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    
    # Specific date overrides
    specific_date = models.DateField(null=True, blank=True, help_text="Override for specific date")
    is_unavailable = models.BooleanField(default=False, help_text="Mark as unavailable for specific date")
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['interviewer', 'day_of_week', 'start_time', 'specific_date']
        ordering = ['day_of_week', 'start_time']
    
    def __str__(self):
        day_name = dict(self.DAY_CHOICES)[self.day_of_week]
        if self.specific_date:
            return f"{self.interviewer.get_full_name()} - {self.specific_date} {self.start_time}-{self.end_time}"
        return f"{self.interviewer.get_full_name()} - {day_name} {self.start_time}-{self.end_time}"

class InterviewTemplate(models.Model):
    """Templates for common interview types"""
    name = models.CharField(max_length=100)
    interview_type = models.ForeignKey(InterviewType, on_delete=models.CASCADE, related_name='templates')
    description = models.TextField(blank=True)
    duration_minutes = models.IntegerField(default=60)
    questions = models.TextField(blank=True, help_text="Standard questions for this interview type")
    preparation_materials = models.TextField(blank=True)
    meeting_type = models.CharField(max_length=20, choices=Interview.MEETING_TYPE_CHOICES, default='video_call')
    is_default = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.interview_type.name})"

class InterviewFeedback(models.Model):
    """Detailed feedback for interviews"""
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='detailed_feedback')
    
    # Technical Assessment
    technical_skills_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    technical_skills_notes = models.TextField(blank=True)
    
    # Communication Skills
    communication_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    communication_notes = models.TextField(blank=True)
    
    # Problem Solving
    problem_solving_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    problem_solving_notes = models.TextField(blank=True)
    
    # Cultural Fit
    cultural_fit_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    cultural_fit_notes = models.TextField(blank=True)
    
    # Overall Assessment
    overall_rating = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    overall_notes = models.TextField(blank=True)
    
    # Recommendation
    RECOMMENDATION_CHOICES = [
        ('strong_hire', 'Strong Hire'),
        ('hire', 'Hire'),
        ('no_hire', 'No Hire'),
        ('strong_no_hire', 'Strong No Hire'),
    ]
    recommendation = models.CharField(max_length=20, choices=RECOMMENDATION_CHOICES, blank=True)
    
    # Strengths and Weaknesses
    strengths = models.TextField(blank=True)
    weaknesses = models.TextField(blank=True)
    additional_comments = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Feedback for {self.interview.title}"

class InterviewReminder(models.Model):
    """Reminders for interviews"""
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='reminders')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    reminder_type = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('notification', 'In-App Notification'),
    ])
    scheduled_time = models.DateTimeField()
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_time']
    
    def __str__(self):
        return f"Reminder for {self.interview.title} to {self.recipient.get_full_name()}"
