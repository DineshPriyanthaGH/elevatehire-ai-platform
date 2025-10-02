from django.db import models
from django.contrib.auth import get_user_model
from interviews.models import Interview
from .validators import validate_video_file, validate_file_name, validate_transcript_file
import uuid
import os

User = get_user_model()

def video_upload_path(instance, filename):
    """Generate upload path for video files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('interviews', 'videos', filename)

def transcript_upload_path(instance, filename):
    """Generate upload path for transcript files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('interviews', 'transcripts', filename)

class VideoInterview(models.Model):
    """Model to store uploaded interview videos"""
    
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('analyzed', 'Analyzed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='video_interviews')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Video file and metadata
    video_file = models.FileField(
        upload_to=video_upload_path, 
        max_length=500,
        validators=[validate_video_file, validate_file_name]
    )
    file_size = models.BigIntegerField(null=True, blank=True)  # in bytes
    duration = models.DurationField(null=True, blank=True)
    video_format = models.CharField(max_length=20, blank=True)
    
    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    
    # Metadata
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Video Interview: {self.title}"

class VideoTranscript(models.Model):
    """Model to store video transcriptions"""
    
    video_interview = models.OneToOneField(VideoInterview, on_delete=models.CASCADE, related_name='transcript')
    transcript_text = models.TextField()
    transcript_file = models.FileField(
        upload_to=transcript_upload_path, 
        blank=True,
        validators=[validate_transcript_file, validate_file_name]
    )
    
    # Timing information for transcript segments
    segments = models.JSONField(default=list, blank=True)  # [{start: 0.0, end: 5.0, text: "Hello..."}]
    
    # Confidence scores
    confidence_score = models.FloatField(null=True, blank=True)  # Overall transcription confidence
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Transcript for {self.video_interview.title}"

class AIAnalysis(models.Model):
    """Model to store AI analysis results"""
    
    ANALYSIS_TYPES = [
        ('sentiment', 'Sentiment Analysis'),
        ('keywords', 'Keyword Extraction'),
        ('communication', 'Communication Skills'),
        ('technical', 'Technical Assessment'),
        ('behavioral', 'Behavioral Analysis'),
        ('overall', 'Overall Assessment'),
    ]
    
    video_interview = models.ForeignKey(VideoInterview, on_delete=models.CASCADE, related_name='ai_analyses')
    analysis_type = models.CharField(max_length=20, choices=ANALYSIS_TYPES)
    
    # Analysis results
    results = models.JSONField(default=dict)  # Store structured analysis data
    score = models.FloatField(null=True, blank=True)  # 0-100 score
    summary = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    # Technical details
    ai_model_used = models.CharField(max_length=100, blank=True)
    confidence_level = models.FloatField(null=True, blank=True)
    processing_time = models.DurationField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['video_interview', 'analysis_type']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_analysis_type_display()} - {self.video_interview.title}"

class VideoAnalyticsSummary(models.Model):
    """Model to store comprehensive analysis summary"""
    
    video_interview = models.OneToOneField(VideoInterview, on_delete=models.CASCADE, related_name='analytics_summary')
    
    # Overall scores
    overall_score = models.FloatField(null=True, blank=True)
    communication_score = models.FloatField(null=True, blank=True)
    technical_score = models.FloatField(null=True, blank=True)
    behavioral_score = models.FloatField(null=True, blank=True)
    
    # Key insights
    strengths = models.JSONField(default=list)  # List of identified strengths
    weaknesses = models.JSONField(default=list)  # List of areas for improvement
    key_topics = models.JSONField(default=list)  # Main topics discussed
    
    # Sentiment analysis
    sentiment_distribution = models.JSONField(default=dict)  # {positive: 0.6, neutral: 0.3, negative: 0.1}
    emotional_peaks = models.JSONField(default=list)  # Timestamps of emotional highs/lows
    
    # Speaking patterns
    speaking_pace = models.FloatField(null=True, blank=True)  # Words per minute
    filler_words_count = models.IntegerField(default=0)
    silence_periods = models.JSONField(default=list)  # Long pauses
    
    # Final recommendation
    recommendation = models.TextField(blank=True)
    next_steps = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Analytics Summary - {self.video_interview.title}"
