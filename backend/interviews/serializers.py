"""
Serializers for interview management
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
import json

from .models import (
    Interview, InterviewType, InterviewAvailability, 
    InterviewTemplate, InterviewFeedback, InterviewReminder
)
from candidates.models import Candidate

User = get_user_model()

class CandidateNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for candidate info in interviews"""
    class Meta:
        model = Candidate
        fields = ['id', 'full_name', 'email', 'phone', 'display_name', 'current_position', 'current_company']

class InterviewTypeNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for interview type info in interviews"""
    class Meta:
        model = InterviewType
        fields = ['id', 'name', 'description', 'duration_minutes', 'color']

class UserNestedSerializer(serializers.ModelSerializer):
    """Nested serializer for user info"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email']

class InterviewTypeSerializer(serializers.ModelSerializer):
    """Serializer for InterviewType model"""
    interview_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewType
        fields = ['id', 'name', 'description', 'duration_minutes', 'color', 'is_active', 'created_at', 'interview_count']
        read_only_fields = ['id', 'created_at', 'interview_count']
    
    def get_interview_count(self, obj):
        """Get number of interviews using this type"""
        return obj.interview_set.count()

class InterviewAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for InterviewAvailability model"""
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    day_name = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewAvailability
        fields = [
            'id', 'interviewer', 'interviewer_name', 'day_of_week', 'day_name',
            'start_time', 'end_time', 'is_active', 'specific_date', 'is_unavailable'
        ]
        read_only_fields = ['id']
    
    def get_day_name(self, obj):
        """Get day name from day_of_week"""
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return day_names[obj.day_of_week]

class InterviewTemplateSerializer(serializers.ModelSerializer):
    """Serializer for InterviewTemplate model"""
    interview_type_name = serializers.CharField(source='interview_type.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = InterviewTemplate
        fields = [
            'id', 'name', 'interview_type', 'interview_type_name', 'description',
            'duration_minutes', 'questions', 'preparation_materials', 'meeting_type',
            'is_default', 'created_by', 'created_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class InterviewFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for InterviewFeedback model"""
    
    class Meta:
        model = InterviewFeedback
        fields = [
            'id', 'interview', 'technical_skills_rating', 'technical_skills_notes',
            'communication_rating', 'communication_notes', 'problem_solving_rating',
            'problem_solving_notes', 'cultural_fit_rating', 'cultural_fit_notes',
            'overall_rating', 'overall_notes', 'recommendation', 'strengths',
            'weaknesses', 'additional_comments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class InterviewListSerializer(serializers.ModelSerializer):
    """Serializer for listing interviews"""
    candidate = CandidateNestedSerializer(read_only=True)
    interview_type = InterviewTypeNestedSerializer(read_only=True)
    interviewer = UserNestedSerializer(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    
    # Keep legacy fields for backward compatibility
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    interview_type_name = serializers.CharField(source='interview_type.name', read_only=True)
    interview_type_color = serializers.CharField(source='interview_type.color', read_only=True)
    
    class Meta:
        model = Interview
        fields = [
            'id', 'title', 'candidate', 'candidate_name', 'candidate_email',
            'interviewer', 'interviewer_name', 'interview_type', 'interview_type_name',
            'interview_type_color', 'scheduled_date', 'end_time', 'duration_minutes',
            'status', 'priority', 'meeting_type', 'is_upcoming', 'is_today', 'is_overdue',
            # AI Analysis fields
            'video_file', 'ai_analysis_status', 'confidence_score', 'communication_score',
            'technical_score', 'engagement_score', 'ai_sentiment', 'ai_keywords',
            'ai_recommendations', 'ai_summary', 'transcript', 'ai_processed_at'
        ]

class InterviewDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed interview view"""
    candidate = CandidateNestedSerializer(read_only=True)
    interview_type = InterviewTypeNestedSerializer(read_only=True)
    interviewer = UserNestedSerializer(read_only=True)
    created_by = UserNestedSerializer(read_only=True)
    additional_interviewers = UserNestedSerializer(many=True, read_only=True)
    detailed_feedback = InterviewFeedbackSerializer(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    is_today = serializers.BooleanField(read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    time_until_interview = serializers.SerializerMethodField()
    
    # Keep legacy fields for backward compatibility
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    candidate_phone = serializers.CharField(source='candidate.phone', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    interviewer_email = serializers.CharField(source='interviewer.email', read_only=True)
    interview_type_name = serializers.CharField(source='interview_type.name', read_only=True)
    interview_type_color = serializers.CharField(source='interview_type.color', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    additional_interviewer_names = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id', 'title', 'description', 'candidate', 'candidate_name', 'candidate_email',
            'candidate_phone', 'interview_type', 'interview_type_name', 'interview_type_color',
            'interviewer', 'interviewer_name', 'interviewer_email', 'additional_interviewers',
            'additional_interviewer_names', 'scheduled_date', 'end_time', 'duration_minutes',
            'meeting_type', 'meeting_link', 'meeting_location', 'meeting_id', 'meeting_password',
            'status', 'priority', 'feedback', 'rating', 'outcome', 'follow_up_required',
            'follow_up_notes', 'preparation_materials', 'interview_questions',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'reminder_sent_candidate', 'reminder_sent_interviewer', 'detailed_feedback',
            'is_upcoming', 'is_today', 'is_overdue', 'time_until_interview',
            # AI Analysis fields
            'video_file', 'ai_analysis_status', 'confidence_score', 'communication_score',
            'technical_score', 'engagement_score', 'ai_sentiment', 'ai_keywords',
            'ai_recommendations', 'ai_summary', 'transcript', 'ai_processed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'end_time']
    
    def get_additional_interviewer_names(self, obj):
        """Get names of additional interviewers"""
        return [user.get_full_name() for user in obj.additional_interviewers.all()]
    
    def get_time_until_interview(self, obj):
        """Get formatted time until interview"""
        time_delta = obj.time_until_interview
        if time_delta:
            days = time_delta.days
            hours, remainder = divmod(time_delta.seconds, 3600)
            minutes = remainder // 60
            
            if days > 0:
                return f"{days} days, {hours} hours"
            elif hours > 0:
                return f"{hours} hours, {minutes} minutes"
            else:
                return f"{minutes} minutes"
        return None

class InterviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating interviews"""
    template_id = serializers.UUIDField(write_only=True, required=False, help_text="Use template to pre-fill fields")
    send_reminders = serializers.BooleanField(write_only=True, default=True, help_text="Send reminder notifications")
    
    class Meta:
        model = Interview
        fields = [
            'id', 'title', 'description', 'candidate', 'interview_type', 'interviewer',
            'additional_interviewers', 'scheduled_date', 'duration_minutes', 'meeting_type',
            'meeting_link', 'meeting_location', 'meeting_id', 'meeting_password',
            'priority', 'preparation_materials', 'interview_questions',
            'template_id', 'send_reminders'
        ]
        read_only_fields = ['id']
    
    def validate_scheduled_date(self, value):
        """Validate that interview is scheduled in the future"""
        if value <= timezone.now():
            raise serializers.ValidationError("Interview must be scheduled in the future")
        return value
    
    def validate(self, attrs):
        """Cross-field validation"""
        # Check interviewer availability
        scheduled_date = attrs.get('scheduled_date')
        interviewer = attrs.get('interviewer')
        duration = attrs.get('duration_minutes', 60)
        
        if scheduled_date and interviewer:
            # Check for conflicting interviews
            end_time = scheduled_date + timedelta(minutes=duration)
            conflicting_interviews = Interview.objects.filter(
                interviewer=interviewer,
                scheduled_date__lt=end_time,
                end_time__gt=scheduled_date,
                status__in=['scheduled', 'confirmed']
            )
            
            if hasattr(self, 'instance') and self.instance:
                conflicting_interviews = conflicting_interviews.exclude(id=self.instance.id)
            
            if conflicting_interviews.exists():
                raise serializers.ValidationError("Interviewer has a conflicting interview at this time")
        
        return attrs
    
    def create(self, validated_data):
        """Create interview with template and reminders"""
        template_id = validated_data.pop('template_id', None)
        send_reminders = validated_data.pop('send_reminders', True)
        
        # Apply template if provided
        if template_id:
            try:
                template = InterviewTemplate.objects.get(id=template_id)
                # Pre-fill fields from template
                if not validated_data.get('description'):
                    validated_data['description'] = template.description
                if not validated_data.get('duration_minutes'):
                    validated_data['duration_minutes'] = template.duration_minutes
                if not validated_data.get('preparation_materials'):
                    validated_data['preparation_materials'] = template.preparation_materials
                if not validated_data.get('interview_questions'):
                    validated_data['interview_questions'] = template.questions
                if not validated_data.get('meeting_type'):
                    validated_data['meeting_type'] = template.meeting_type
            except InterviewTemplate.DoesNotExist:
                pass
        
        # Set default title if not provided
        if not validated_data.get('title'):
            candidate = validated_data['candidate']
            interview_type = validated_data['interview_type']
            validated_data['title'] = f"{interview_type.name} - {candidate.full_name}"
        
        interview = Interview.objects.create(**validated_data)
        
        # Schedule reminders if requested
        if send_reminders:
            self._schedule_reminders(interview)
        
        return interview
    
    def _schedule_reminders(self, interview):
        """Schedule reminder notifications"""
        from datetime import timedelta
        
        # Reminder times (before interview)
        reminder_times = [
            timedelta(days=1),  # 1 day before
            timedelta(hours=2),  # 2 hours before
            timedelta(minutes=15),  # 15 minutes before
        ]
        
        for reminder_time in reminder_times:
            reminder_datetime = interview.scheduled_date - reminder_time
            
            # Only schedule future reminders
            if reminder_datetime > timezone.now():
                # Reminder for candidate (if they have an account)
                if hasattr(interview.candidate, 'user') and interview.candidate.user:
                    InterviewReminder.objects.create(
                        interview=interview,
                        recipient=interview.candidate.user,
                        reminder_type='email',
                        scheduled_time=reminder_datetime
                    )
                
                # Reminder for interviewer
                InterviewReminder.objects.create(
                    interview=interview,
                    recipient=interview.interviewer,
                    reminder_type='email',
                    scheduled_time=reminder_datetime
                )

class InterviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating interviews"""
    reschedule_reason = serializers.CharField(write_only=True, required=False, help_text="Reason for rescheduling")
    send_notifications = serializers.BooleanField(write_only=True, default=True)
    
    class Meta:
        model = Interview
        fields = [
            'title', 'description', 'scheduled_date', 'duration_minutes', 'meeting_type',
            'meeting_link', 'meeting_location', 'meeting_id', 'meeting_password',
            'status', 'priority', 'feedback', 'rating', 'outcome', 'follow_up_required',
            'follow_up_notes', 'preparation_materials', 'interview_questions',
            'reschedule_reason', 'send_notifications'
        ]
    
    def update(self, instance, validated_data):
        """Update interview with notifications"""
        reschedule_reason = validated_data.pop('reschedule_reason', '')
        send_notifications = validated_data.pop('send_notifications', True)
        
        # Check if interview was rescheduled
        old_date = instance.scheduled_date
        new_date = validated_data.get('scheduled_date', old_date)
        was_rescheduled = old_date != new_date
        
        # Update the interview
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle rescheduling
        if was_rescheduled and send_notifications:
            # Mark as rescheduled
            if instance.status not in ['cancelled', 'completed']:
                instance.status = 'rescheduled'
                instance.save()
            
            # Cancel old reminders and create new ones
            instance.reminders.filter(sent=False).delete()
            # Re-schedule reminders would go here
        
        return instance

class CalendarEventSerializer(serializers.Serializer):
    """Serializer for calendar events"""
    id = serializers.UUIDField()
    title = serializers.CharField()
    start = serializers.DateTimeField()
    end = serializers.DateTimeField()
    backgroundColor = serializers.CharField()
    borderColor = serializers.CharField()
    textColor = serializers.CharField(default='white')
    candidate_name = serializers.CharField()
    interviewer_name = serializers.CharField()
    status = serializers.CharField()
    meeting_type = serializers.CharField()
    priority = serializers.CharField()

class InterviewStatsSerializer(serializers.Serializer):
    """Serializer for interview statistics"""
    total_interviews = serializers.IntegerField()
    upcoming_interviews = serializers.IntegerField()
    today_interviews = serializers.IntegerField()
    overdue_interviews = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    cancelled_interviews = serializers.IntegerField()
    status_distribution = serializers.DictField()
    interviewer_workload = serializers.DictField()
    monthly_trends = serializers.DictField()

class AvailableSlotSerializer(serializers.Serializer):
    """Serializer for available interview slots"""
    interviewer_id = serializers.IntegerField()
    interviewer_name = serializers.CharField()
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    available_duration = serializers.IntegerField()  # in minutes
