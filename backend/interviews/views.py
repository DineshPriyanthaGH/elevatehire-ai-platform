"""
Views for interview management
"""
import logging
from datetime import datetime, timedelta, date, time
from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from collections import defaultdict

from .models import (
    Interview, InterviewType, InterviewAvailability,
    InterviewTemplate, InterviewFeedback, InterviewReminder
)
from .serializers import (
    InterviewListSerializer, InterviewDetailSerializer, InterviewCreateSerializer,
    InterviewUpdateSerializer, InterviewTypeSerializer, InterviewAvailabilitySerializer,
    InterviewTemplateSerializer, InterviewFeedbackSerializer, CalendarEventSerializer,
    InterviewStatsSerializer, AvailableSlotSerializer
)
from candidates.models import Candidate

logger = logging.getLogger(__name__)

class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing interviews
    """
    queryset = Interview.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['status', 'interviewer', 'candidate', 'interview_type', 'priority', 'meeting_type']
    search_fields = ['title', 'description', 'candidate__full_name', 'interviewer__first_name', 'interviewer__last_name']
    ordering_fields = ['scheduled_date', 'created_at', 'priority']
    ordering = ['scheduled_date']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return InterviewListSerializer
        elif self.action in ['create']:
            return InterviewCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return InterviewUpdateSerializer
        else:
            return InterviewDetailSerializer
    
    def get_queryset(self):
        """Filter interviews based on user permissions"""
        user = self.request.user
        queryset = Interview.objects.select_related(
            'candidate', 'interviewer', 'interview_type', 'created_by'
        ).prefetch_related('additional_interviewers', 'detailed_feedback')
        
        # Users can see interviews they're involved in or created
        if not user.is_staff:
            queryset = queryset.filter(
                Q(interviewer=user) | 
                Q(additional_interviewers=user) | 
                Q(created_by=user) |
                Q(candidate__added_by=user)  # If user added the candidate
            )
        
        return queryset
    
    def perform_create(self, serializer):
        """Set created_by when creating interview"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def calendar_events(self, request):
        """Get interviews formatted for calendar view"""
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        
        queryset = self.get_queryset()
        
        # Filter by date range if provided
        if start_date and end_date:
            try:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                queryset = queryset.filter(
                    scheduled_date__gte=start_dt,
                    scheduled_date__lte=end_dt
                )
            except ValueError:
                pass
        
        # Transform interviews to calendar events
        events = []
        for interview in queryset:
            # Color coding based on status and priority
            if interview.status == 'cancelled':
                bg_color = '#6B7280'  # Gray
            elif interview.status == 'completed':
                bg_color = '#10B981'  # Green
            elif interview.priority == 'urgent':
                bg_color = '#EF4444'  # Red
            elif interview.priority == 'high':
                bg_color = '#F59E0B'  # Orange
            elif interview.interview_type.color:
                bg_color = interview.interview_type.color
            else:
                bg_color = '#3B82F6'  # Blue
            
            event = {
                'id': str(interview.id),
                'title': interview.title,
                'start': interview.scheduled_date.isoformat(),
                'end': interview.end_time.isoformat(),
                'backgroundColor': bg_color,
                'borderColor': bg_color,
                'textColor': 'white',
                'candidate_name': interview.candidate.full_name,
                'interviewer_name': interview.interviewer.get_full_name(),
                'status': interview.status,
                'meeting_type': interview.meeting_type,
                'priority': interview.priority,
                'url': f'/interviews/{interview.id}/'  # Frontend URL
            }
            events.append(event)
        
        return Response(events)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming interviews"""
        days_ahead = int(request.query_params.get('days', 7))
        end_date = timezone.now() + timedelta(days=days_ahead)
        
        queryset = self.get_queryset().filter(
            scheduled_date__gte=timezone.now(),
            scheduled_date__lte=end_date,
            status__in=['scheduled', 'confirmed']
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's interviews"""
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        queryset = self.get_queryset().filter(
            scheduled_date__date=today
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue interviews"""
        queryset = self.get_queryset().filter(
            scheduled_date__lt=timezone.now(),
            status__in=['scheduled', 'confirmed']
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get interview statistics"""
        queryset = self.get_queryset()
        
        # Basic counts
        total_interviews = queryset.count()
        upcoming_interviews = queryset.filter(
            scheduled_date__gte=timezone.now(),
            status__in=['scheduled', 'confirmed']
        ).count()
        
        today = timezone.now().date()
        today_interviews = queryset.filter(scheduled_date__date=today).count()
        
        overdue_interviews = queryset.filter(
            scheduled_date__lt=timezone.now(),
            status__in=['scheduled', 'confirmed']
        ).count()
        
        completed_interviews = queryset.filter(status='completed').count()
        cancelled_interviews = queryset.filter(status='cancelled').count()
        
        # Status distribution
        status_stats = queryset.values('status').annotate(count=Count('id'))
        status_distribution = {item['status']: item['count'] for item in status_stats}
        
        # Interviewer workload
        interviewer_stats = queryset.filter(
            scheduled_date__gte=timezone.now()
        ).values(
            'interviewer__first_name', 'interviewer__last_name'
        ).annotate(count=Count('id'))
        
        interviewer_workload = {}
        for item in interviewer_stats:
            name = f"{item['interviewer__first_name']} {item['interviewer__last_name']}"
            interviewer_workload[name] = item['count']
        
        # Monthly trends (last 6 months)
        monthly_trends = {}
        for i in range(6):
            month_start = (timezone.now().replace(day=1) - timedelta(days=i*30)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            month_count = queryset.filter(
                scheduled_date__gte=month_start,
                scheduled_date__lte=month_end
            ).count()
            
            month_name = month_start.strftime('%B %Y')
            monthly_trends[month_name] = month_count
        
        stats = {
            'total_interviews': total_interviews,
            'upcoming_interviews': upcoming_interviews,
            'today_interviews': today_interviews,
            'overdue_interviews': overdue_interviews,
            'completed_interviews': completed_interviews,
            'cancelled_interviews': cancelled_interviews,
            'status_distribution': status_distribution,
            'interviewer_workload': interviewer_workload,
            'monthly_trends': monthly_trends
        }
        
        serializer = InterviewStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark interview as completed"""
        interview = self.get_object()
        
        if interview.status != 'in_progress':
            return Response(
                {'error': 'Interview must be in progress to mark as completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        interview.status = 'completed'
        interview.save()
        
        # Create activity log in candidate
        from candidates.models import CandidateActivity
        CandidateActivity.objects.create(
            candidate=interview.candidate,
            activity_type='interview_completed',
            description=f"Completed {interview.interview_type.name} interview",
            user=request.user
        )
        
        serializer = self.get_serializer(interview)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel interview"""
        interview = self.get_object()
        reason = request.data.get('reason', '')
        
        if interview.status in ['completed', 'cancelled']:
            return Response(
                {'error': 'Cannot cancel completed or already cancelled interview'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        interview.status = 'cancelled'
        if reason:
            interview.feedback = f"Cancelled: {reason}"
        interview.save()
        
        # Cancel pending reminders
        interview.reminders.filter(sent=False).delete()
        
        serializer = self.get_serializer(interview)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Reschedule interview"""
        interview = self.get_object()
        new_date = request.data.get('scheduled_date')
        reason = request.data.get('reason', '')
        
        if not new_date:
            return Response(
                {'error': 'New scheduled date is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            new_datetime = datetime.fromisoformat(new_date.replace('Z', '+00:00'))
            if new_datetime <= timezone.now():
                return Response(
                    {'error': 'New date must be in the future'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return Response(
                {'error': 'Invalid date format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_date = interview.scheduled_date
        interview.scheduled_date = new_datetime
        interview.status = 'rescheduled'
        if reason:
            interview.feedback = f"Rescheduled from {old_date.strftime('%Y-%m-%d %H:%M')}: {reason}"
        interview.save()
        
        # Cancel old reminders and create new ones
        interview.reminders.filter(sent=False).delete()
        
        serializer = self.get_serializer(interview)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def interviewers(self, request):
        """Get list of available interviewers"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        search = request.query_params.get('search', '')
        
        # Get active users who can be interviewers
        users_queryset = User.objects.filter(is_active=True)
        
        if search:
            users_queryset = users_queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(username__icontains=search)
            )
        
        users_queryset = users_queryset.order_by('first_name', 'last_name')
        
        users_data = []
        for user in users_queryset:
            users_data.append({
                'id': str(user.id),
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.get_full_name() or user.username,
                'email': user.email
            })
        
        return Response(users_data)

    @action(detail=False, methods=['get'])
    def interview_types(self, request):
        """Get list of interview types for scheduling"""
        interview_types = InterviewType.objects.filter(is_active=True).order_by('name')
        serializer = InterviewTypeSerializer(interview_types, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def feedback(self, request, pk=None):
        """Get or create detailed feedback for interview"""
        interview = self.get_object()
        
        if request.method == 'GET':
            try:
                feedback = interview.detailed_feedback
                serializer = InterviewFeedbackSerializer(feedback)
                return Response(serializer.data)
            except InterviewFeedback.DoesNotExist:
                return Response({'error': 'No feedback available'}, status=status.HTTP_404_NOT_FOUND)
        
        elif request.method == 'POST':
            # Create or update feedback
            feedback, created = InterviewFeedback.objects.get_or_create(interview=interview)
            serializer = InterviewFeedbackSerializer(feedback, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                
                # Update interview overall rating
                if serializer.validated_data.get('overall_rating'):
                    interview.rating = serializer.validated_data['overall_rating']
                    interview.save()
                
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InterviewTypeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interview types"""
    queryset = InterviewType.objects.all()
    serializer_class = InterviewTypeSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['name']

class InterviewAvailabilityViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interviewer availability"""
    queryset = InterviewAvailability.objects.all()
    serializer_class = InterviewAvailabilitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['interviewer', 'day_of_week', 'is_active']
    
    def get_queryset(self):
        """Filter availability based on user"""
        if self.request.user.is_staff:
            return InterviewAvailability.objects.all()
        else:
            # Users can only see their own availability
            return InterviewAvailability.objects.filter(interviewer=self.request.user)
    
    @action(detail=False, methods=['get'])
    def available_slots(self, request):
        """Get available interview slots"""
        interviewer_id = request.query_params.get('interviewer_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        duration_minutes = int(request.query_params.get('duration', 60))
        
        if not all([interviewer_id, start_date, end_date]):
            return Response(
                {'error': 'interviewer_id, start_date, and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        available_slots = self._get_available_slots(
            interviewer_id, start_dt, end_dt, duration_minutes
        )
        
        serializer = AvailableSlotSerializer(available_slots, many=True)
        return Response(serializer.data)
    
    def _get_available_slots(self, interviewer_id, start_date, end_date, duration_minutes):
        """Calculate available time slots for interviewer"""
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        try:
            interviewer = User.objects.get(id=interviewer_id)
        except User.DoesNotExist:
            return []
        
        available_slots = []
        current_date = start_date
        
        while current_date <= end_date:
            day_of_week = current_date.weekday()  # 0 = Monday
            
            # Get availability for this day
            availability_slots = InterviewAvailability.objects.filter(
                interviewer=interviewer,
                day_of_week=day_of_week,
                is_active=True
            )
            
            # Check for specific date overrides
            specific_availability = InterviewAvailability.objects.filter(
                interviewer=interviewer,
                specific_date=current_date
            )
            
            if specific_availability.exists():
                availability_slots = specific_availability
            
            # Get existing interviews for this day
            existing_interviews = Interview.objects.filter(
                interviewer=interviewer,
                scheduled_date__date=current_date,
                status__in=['scheduled', 'confirmed', 'in_progress']
            )
            
            for slot in availability_slots:
                if slot.is_unavailable:
                    continue
                
                # Generate time slots within this availability window
                current_time = datetime.combine(current_date, slot.start_time)
                end_time = datetime.combine(current_date, slot.end_time)
                slot_duration = timedelta(minutes=duration_minutes)
                
                while current_time + slot_duration <= end_time:
                    slot_end = current_time + slot_duration
                    
                    # Check if this slot conflicts with existing interviews
                    conflict = False
                    for interview in existing_interviews:
                        if (current_time < interview.end_time and 
                            slot_end > interview.scheduled_date):
                            conflict = True
                            break
                    
                    if not conflict and current_time > timezone.now():
                        available_slots.append({
                            'interviewer_id': interviewer.id,
                            'interviewer_name': interviewer.get_full_name(),
                            'date': current_date,
                            'start_time': current_time.time(),
                            'end_time': slot_end.time(),
                            'available_duration': duration_minutes
                        })
                    
                    # Move to next slot (15-minute increments)
                    current_time += timedelta(minutes=15)
            
            current_date += timedelta(days=1)
        
        return available_slots

class InterviewTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interview templates"""
    queryset = InterviewTemplate.objects.all()
    serializer_class = InterviewTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['interview_type', 'is_default']
    
    def perform_create(self, serializer):
        """Set created_by when creating template"""
        serializer.save(created_by=self.request.user)

class InterviewAIAnalysisViewSet(viewsets.ViewSet):
    """ViewSet for AI analysis of interviews"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def upload_video(self, request, pk=None):
        """Upload video for AI analysis"""
        try:
            interview = Interview.objects.get(pk=pk)
        except Interview.DoesNotExist:
            return Response(
                {'error': 'Interview not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (interview.interviewer == request.user or 
                request.user in interview.additional_interviewers.all() or 
                request.user.is_staff):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        video_file = request.FILES.get('video_file')
        if not video_file:
            return Response(
                {'error': 'Video file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file type and size
        allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
        if video_file.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Supported formats: MP4, AVI, MOV, WMV'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 500MB)
        max_size = 500 * 1024 * 1024  # 500MB in bytes
        if video_file.size > max_size:
            return Response(
                {'error': 'File too large. Maximum size is 500MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save video file
        interview.video_file = video_file
        interview.ai_analysis_status = 'processing'
        interview.save()
        
        # Start AI analysis (async)
        from .services import InterviewAnalysisService
        try:
            InterviewAnalysisService.analyze_interview_async(interview)
        except Exception as e:
            logger.error(f"Failed to start AI analysis for interview {interview.id}: {str(e)}")
            interview.ai_analysis_status = 'failed'
            interview.save()
            return Response(
                {'error': 'Failed to start AI analysis'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'message': 'Video uploaded successfully. AI analysis started.',
            'interview_id': str(interview.id),
            'status': 'processing'
        })
    
    @action(detail=True, methods=['get'])
    def analysis_status(self, request, pk=None):
        """Get AI analysis status"""
        try:
            interview = Interview.objects.get(pk=pk)
        except Interview.DoesNotExist:
            return Response(
                {'error': 'Interview not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (interview.interviewer == request.user or 
                request.user in interview.additional_interviewers.all() or 
                request.user.is_staff):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        analysis_data = {
            'interview_id': str(interview.id),
            'status': interview.ai_analysis_status,
            'has_video': bool(interview.video_file),
            'processed_at': interview.ai_processed_at,
            'analysis_results': None
        }
        
        # Include analysis results if completed
        if interview.ai_analysis_status == 'completed':
            analysis_data['analysis_results'] = {
                'confidence_score': interview.confidence_score,
                'communication_score': interview.communication_score,
                'technical_score': interview.technical_score,
                'engagement_score': interview.engagement_score,
                'sentiment': interview.ai_sentiment,
                'keywords': interview.ai_keywords,
                'recommendations': interview.ai_recommendations,
                'summary': interview.ai_summary,
                'transcript': interview.transcript
            }
        
        return Response(analysis_data)
    
    @action(detail=True, methods=['post'])
    def reanalyze(self, request, pk=None):
        """Restart AI analysis for interview"""
        try:
            interview = Interview.objects.get(pk=pk)
        except Interview.DoesNotExist:
            return Response(
                {'error': 'Interview not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (interview.interviewer == request.user or 
                request.user in interview.additional_interviewers.all() or 
                request.user.is_staff):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not interview.video_file:
            return Response(
                {'error': 'No video file available for analysis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Reset analysis data
        interview.ai_analysis_status = 'processing'
        interview.confidence_score = None
        interview.communication_score = None
        interview.technical_score = None
        interview.engagement_score = None
        interview.ai_sentiment = ''
        interview.ai_keywords = []
        interview.ai_recommendations = []
        interview.ai_summary = ''
        interview.transcript = ''
        interview.ai_processed_at = None
        interview.save()
        
        # Start AI analysis
        from .services import InterviewAnalysisService
        try:
            InterviewAnalysisService.analyze_interview_async(interview)
        except Exception as e:
            logger.error(f"Failed to restart AI analysis for interview {interview.id}: {str(e)}")
            interview.ai_analysis_status = 'failed'
            interview.save()
            return Response(
                {'error': 'Failed to restart AI analysis'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'message': 'AI analysis restarted',
            'interview_id': str(interview.id),
            'status': 'processing'
        })
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get AI analysis statistics"""
        user = request.user
        
        # Filter interviews based on user permissions
        if user.is_staff:
            queryset = Interview.objects.all()
        else:
            queryset = Interview.objects.filter(
                Q(interviewer=user) | 
                Q(additional_interviewers=user) | 
                Q(created_by=user)
            )
        
        # Calculate statistics
        total_interviews = queryset.count()
        analyzed_interviews = queryset.filter(ai_analysis_status='completed').count()
        processing_interviews = queryset.filter(ai_analysis_status='processing').count()
        failed_analyses = queryset.filter(ai_analysis_status='failed').count()
        
        # Average scores for completed analyses
        completed_analyses = queryset.filter(ai_analysis_status='completed')
        avg_confidence = completed_analyses.aggregate(Avg('confidence_score'))['confidence_score__avg'] or 0
        avg_communication = completed_analyses.aggregate(Avg('communication_score'))['communication_score__avg'] or 0
        avg_technical = completed_analyses.aggregate(Avg('technical_score'))['technical_score__avg'] or 0
        avg_engagement = completed_analyses.aggregate(Avg('engagement_score'))['engagement_score__avg'] or 0
        
        # Sentiment distribution
        sentiment_stats = completed_analyses.values('ai_sentiment').annotate(count=Count('id'))
        sentiment_distribution = {item['ai_sentiment'] or 'neutral': item['count'] for item in sentiment_stats}
        
        return Response({
            'total_interviews': total_interviews,
            'analyzed_interviews': analyzed_interviews,
            'processing_interviews': processing_interviews,
            'failed_analyses': failed_analyses,
            'analysis_completion_rate': round((analyzed_interviews / total_interviews * 100) if total_interviews > 0 else 0, 2),
            'average_scores': {
                'confidence': round(avg_confidence, 2) if avg_confidence else 0,
                'communication': round(avg_communication, 2) if avg_communication else 0,
                'technical': round(avg_technical, 2) if avg_technical else 0,
                'engagement': round(avg_engagement, 2) if avg_engagement else 0
            },
            'sentiment_distribution': sentiment_distribution
        })
    
    @action(detail=True, methods=['get'])
    def download_transcript(self, request, pk=None):
        """Download interview transcript"""
        try:
            interview = Interview.objects.get(pk=pk)
        except Interview.DoesNotExist:
            return Response(
                {'error': 'Interview not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check permissions
        if not (interview.interviewer == request.user or 
                request.user in interview.additional_interviewers.all() or 
                request.user.is_staff):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not interview.transcript:
            return Response(
                {'error': 'No transcript available'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        from django.http import HttpResponse
        
        # Create transcript content
        transcript_content = f"""
Interview Transcript
==================

Interview: {interview.title}
Candidate: {interview.candidate.full_name}
Interviewer: {interview.interviewer.get_full_name()}
Date: {interview.scheduled_date.strftime('%Y-%m-%d %H:%M')}
Duration: {interview.duration_minutes} minutes

Transcript:
-----------

{interview.transcript}

AI Analysis Summary:
-------------------

{interview.ai_summary or 'No summary available'}

Generated on: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}
        """.strip()
        
        response = HttpResponse(transcript_content, content_type='text/plain')
        filename = f"interview_transcript_{interview.candidate.full_name.replace(' ', '_')}_{interview.scheduled_date.strftime('%Y%m%d')}.txt"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
