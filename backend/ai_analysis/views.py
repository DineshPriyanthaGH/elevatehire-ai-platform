from django.shortcuts import render
from django.db import models
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings
import os
import mimetypes
from datetime import timedelta
import json
import threading
from .models import VideoInterview, VideoTranscript, AIAnalysis, VideoAnalyticsSummary
from .serializers import (
    VideoInterviewSerializer, VideoInterviewDetailSerializer, 
    VideoUploadSerializer, VideoTranscriptSerializer,
    AIAnalysisSerializer, VideoAnalyticsSummarySerializer
)
from .services import VideoAnalysisService


class VideoInterviewViewSet(viewsets.ModelViewSet):
    """ViewSet for managing video interviews"""
    
    queryset = VideoInterview.objects.all()
    serializer_class = VideoInterviewSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VideoInterviewDetailSerializer
        elif self.action in ['create', 'upload']:
            return VideoUploadSerializer
        return VideoInterviewSerializer
    
    def get_queryset(self):
        queryset = VideoInterview.objects.all()
        
        # Filter by interview ID if provided
        interview_id = self.request.query_params.get('interview_id')
        if interview_id:
            queryset = queryset.filter(interview_id=interview_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by user (only show user's uploads unless admin)
        if not self.request.user.is_staff:
            queryset = queryset.filter(uploaded_by=self.request.user)
        
        return queryset.select_related('interview', 'uploaded_by').prefetch_related('ai_analyses', 'transcript', 'analytics_summary')
    
    def perform_create(self, serializer):
        video_interview = serializer.save(uploaded_by=self.request.user)
        
        # Process video file metadata
        self._process_video_metadata(video_interview)
        
        # Start AI analysis in background
        self._start_ai_analysis(video_interview)
    
    def _process_video_metadata(self, video_interview):
        """Extract video metadata"""
        try:
            video_file = video_interview.video_file
            if video_file:
                # Get file size
                video_interview.file_size = video_file.size
                
                # Get video format from MIME type
                mime_type, _ = mimetypes.guess_type(video_file.name)
                if mime_type:
                    video_interview.video_format = mime_type.split('/')[-1]
                
                video_interview.save()
                
        except Exception as e:
            print(f"Error processing video metadata: {e}")
    
    def _start_ai_analysis(self, video_interview):
        """Start AI analysis in background thread"""
        def run_analysis():
            try:
                video_interview.status = 'processing'
                video_interview.save()
                
                analysis_service = VideoAnalysisService()
                analysis_service.analyze_video(video_interview)
                
            except Exception as e:
                video_interview.status = 'failed'
                video_interview.error_message = str(e)
                video_interview.save()
        
        # Start analysis in background thread
        thread = threading.Thread(target=run_analysis)
        thread.daemon = True
        thread.start()
    
    @action(detail=True, methods=['post'])
    def restart_analysis(self, request, pk=None):
        """Restart AI analysis for a video"""
        video_interview = self.get_object()
        
        if video_interview.status in ['failed', 'uploaded']:
            self._start_ai_analysis(video_interview)
            return Response({'message': 'Analysis restarted'}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Cannot restart analysis for this video'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def download_transcript(self, request, pk=None):
        """Download transcript file"""
        video_interview = self.get_object()
        
        try:
            transcript = video_interview.transcript
            if transcript.transcript_file:
                # Return file download response
                response = Response()
                response['Content-Disposition'] = f'attachment; filename="transcript_{video_interview.id}.txt"'
                response['Content-Type'] = 'text/plain'
                return response
            else:
                return Response(
                    {'error': 'Transcript file not available'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        except VideoTranscript.DoesNotExist:
            return Response(
                {'error': 'Transcript not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def analysis_stats(self, request):
        """Get analysis statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_videos': queryset.count(),
            'status_breakdown': {},
            'average_scores': {},
            'recent_uploads': queryset.order_by('-created_at')[:5].values(
                'id', 'title', 'status', 'created_at'
            )
        }
        
        # Status breakdown
        for status_choice in VideoInterview.STATUS_CHOICES:
            status_key = status_choice[0]
            stats['status_breakdown'][status_key] = queryset.filter(status=status_key).count()
        
        # Average scores from analytics summaries
        analyzed_videos = queryset.filter(status='analyzed', analytics_summary__isnull=False)
        if analyzed_videos.exists():
            summaries = VideoAnalyticsSummary.objects.filter(video_interview__in=analyzed_videos)
            
            stats['average_scores'] = {
                'overall': summaries.aggregate(models.Avg('overall_score'))['overall_score__avg'],
                'communication': summaries.aggregate(models.Avg('communication_score'))['communication_score__avg'],
                'technical': summaries.aggregate(models.Avg('technical_score'))['technical_score__avg'],
                'behavioral': summaries.aggregate(models.Avg('behavioral_score'))['behavioral_score__avg'],
            }
        
        return Response(stats)


class AIAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing AI analysis results"""
    
    queryset = AIAnalysis.objects.all()
    serializer_class = AIAnalysisSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = AIAnalysis.objects.all()
        
        # Filter by video interview
        video_id = self.request.query_params.get('video_id')
        if video_id:
            queryset = queryset.filter(video_interview_id=video_id)
        
        # Filter by analysis type
        analysis_type = self.request.query_params.get('type')
        if analysis_type:
            queryset = queryset.filter(analysis_type=analysis_type)
        
        return queryset.select_related('video_interview')


class VideoAnalyticsSummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing video analytics summaries"""
    
    queryset = VideoAnalyticsSummary.objects.all()
    serializer_class = VideoAnalyticsSummarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = VideoAnalyticsSummary.objects.all()
        
        # Filter by video interview
        video_id = self.request.query_params.get('video_id')
        if video_id:
            queryset = queryset.filter(video_interview_id=video_id)
        
        return queryset.select_related('video_interview')
