from django.contrib import admin
from .models import VideoInterview, VideoTranscript, AIAnalysis, VideoAnalyticsSummary


@admin.register(VideoInterview)
class VideoInterviewAdmin(admin.ModelAdmin):
    list_display = ['title', 'interview', 'status', 'uploaded_by', 'created_at', 'file_size_display']
    list_filter = ['status', 'created_at', 'video_format']
    search_fields = ['title', 'interview__title', 'uploaded_by__username']
    readonly_fields = ['id', 'file_size', 'duration', 'video_format', 'processing_started_at', 'processing_completed_at']
    
    def file_size_display(self, obj):
        if obj.file_size:
            return f"{obj.file_size / (1024*1024):.2f} MB"
        return "N/A"
    file_size_display.short_description = "File Size"


@admin.register(VideoTranscript)
class VideoTranscriptAdmin(admin.ModelAdmin):
    list_display = ['video_interview', 'confidence_score', 'created_at']
    list_filter = ['created_at', 'confidence_score']
    search_fields = ['video_interview__title', 'transcript_text']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    list_display = ['video_interview', 'analysis_type', 'score', 'confidence_level', 'created_at']
    list_filter = ['analysis_type', 'created_at', 'ai_model_used']
    search_fields = ['video_interview__title', 'summary']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(VideoAnalyticsSummary)
class VideoAnalyticsSummaryAdmin(admin.ModelAdmin):
    list_display = ['video_interview', 'overall_score', 'communication_score', 'technical_score', 'behavioral_score', 'created_at']
    list_filter = ['created_at']
    search_fields = ['video_interview__title', 'recommendation']
    readonly_fields = ['created_at', 'updated_at']
