"""
Django admin configuration for interviews app
"""
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from .models import (
    Interview, InterviewType, InterviewAvailability,
    InterviewTemplate, InterviewFeedback, InterviewReminder
)

@admin.register(InterviewType)
class InterviewTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'duration_minutes', 'is_active', 'color_display']
    list_filter = ['is_active', 'duration_minutes']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def color_display(self, obj):
        if obj.color:
            return format_html(
                '<span style="background-color: {}; padding: 2px 6px; border-radius: 3px; color: white;">{}</span>',
                obj.color, obj.color
            )
        return '-'
    color_display.short_description = 'Color'

class InterviewFeedbackInline(admin.StackedInline):
    model = InterviewFeedback
    extra = 0
    fields = [
        'overall_rating', 'technical_skills_rating', 'communication_rating',
        'problem_solving_rating', 'cultural_fit_rating', 'strengths', 'weaknesses',
        'recommendation', 'additional_comments'
    ]

class InterviewReminderInline(admin.TabularInline):
    model = InterviewReminder
    extra = 0
    fields = ['reminder_type', 'scheduled_time', 'sent']
    readonly_fields = ['sent']

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'candidate_link', 'interviewer', 'scheduled_date',
        'status_badge', 'priority_badge', 'interview_type', 'meeting_type'
    ]
    list_filter = [
        'status', 'priority', 'meeting_type', 'interview_type',
        'scheduled_date', 'created_at'
    ]
    search_fields = [
        'title', 'candidate__full_name', 'interviewer__first_name',
        'interviewer__last_name', 'description'
    ]
    date_hierarchy = 'scheduled_date'
    ordering = ['-scheduled_date']
    
    filter_horizontal = ['additional_interviewers']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'interview_type')
        }),
        ('Participants', {
            'fields': ('candidate', 'interviewer', 'additional_interviewers')
        }),
        ('Scheduling', {
            'fields': ('scheduled_date', 'duration_minutes', 'meeting_type', 'meeting_link')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'rating')
        }),
        ('Additional Information', {
            'fields': ('feedback', 'follow_up_notes'),
            'classes': ('collapse',)
        }),
        ('System Information', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',),
            'description': 'Automatically managed fields'
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    inlines = [InterviewFeedbackInline, InterviewReminderInline]
    
    def candidate_link(self, obj):
        if obj.candidate:
            url = reverse('admin:candidates_candidate_change', args=[obj.candidate.id])
            return format_html('<a href="{}">{}</a>', url, obj.candidate.full_name)
        return '-'
    candidate_link.short_description = 'Candidate'
    candidate_link.admin_order_field = 'candidate__full_name'
    
    def status_badge(self, obj):
        colors = {
            'scheduled': '#3B82F6',  # Blue
            'confirmed': '#10B981',  # Green
            'in_progress': '#F59E0B',  # Orange
            'completed': '#10B981',   # Green
            'cancelled': '#EF4444',   # Red
            'rescheduled': '#8B5CF6'  # Purple
        }
        color = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def priority_badge(self, obj):
        colors = {
            'low': '#6B7280',      # Gray
            'medium': '#3B82F6',   # Blue
            'high': '#F59E0B',     # Orange
            'urgent': '#EF4444'    # Red
        }
        color = colors.get(obj.priority, '#6B7280')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_priority_display()
        )
    priority_badge.short_description = 'Priority'
    priority_badge.admin_order_field = 'priority'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'candidate', 'interviewer', 'interview_type', 'created_by'
        ).prefetch_related('additional_interviewers')

@admin.register(InterviewAvailability)
class InterviewAvailabilityAdmin(admin.ModelAdmin):
    list_display = [
        'interviewer', 'day_display', 'time_range', 'specific_date',
        'is_active', 'is_unavailable'
    ]
    list_filter = ['day_of_week', 'is_active', 'is_unavailable', 'interviewer']
    search_fields = ['interviewer__first_name', 'interviewer__last_name']
    ordering = ['interviewer', 'day_of_week', 'start_time']
    
    fieldsets = (
        ('Interviewer & Date', {
            'fields': ('interviewer', 'day_of_week', 'specific_date')
        }),
        ('Time Range', {
            'fields': ('start_time', 'end_time')
        }),
        ('Settings', {
            'fields': ('is_active', 'is_unavailable')
        })
    )
    
    def day_display(self, obj):
        if obj.specific_date:
            return f"Specific: {obj.specific_date}"
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days[obj.day_of_week] if obj.day_of_week is not None else '-'
    day_display.short_description = 'Day'
    
    def time_range(self, obj):
        return f"{obj.start_time} - {obj.end_time}"
    time_range.short_description = 'Time Range'

@admin.register(InterviewTemplate)
class InterviewTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'interview_type', 'is_default', 'created_by', 'created_at']
    list_filter = ['interview_type', 'is_default', 'created_at']
    search_fields = ['name', 'description', 'questions']
    ordering = ['name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'interview_type', 'is_default')
        }),
        ('Content', {
            'fields': ('questions', 'preparation_materials')
        }),
        ('System Information', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',),
            'description': 'Automatically managed fields'
        })
    )
    
    readonly_fields = ['created_at']

@admin.register(InterviewFeedback)
class InterviewFeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'interview', 'overall_rating', 'recommendation',
        'technical_skills_rating', 'communication_rating', 'created_at'
    ]
    list_filter = [
        'overall_rating', 'recommendation', 'technical_skills_rating',
        'communication_rating', 'problem_solving_rating', 'cultural_fit_rating'
    ]
    search_fields = [
        'interview__title', 'interview__candidate__full_name',
        'strengths', 'weaknesses', 'additional_comments'
    ]
    ordering = ['-created_at']
    
    fieldsets = (
        ('Interview Information', {
            'fields': ('interview',)
        }),
        ('Ratings', {
            'fields': (
                'overall_rating', 'technical_skills_rating', 'communication_rating',
                'problem_solving_rating', 'cultural_fit_rating'
            )
        }),
        ('Feedback', {
            'fields': ('strengths', 'weaknesses', 'additional_comments')
        }),
        ('Recommendation', {
            'fields': ('recommendation',)
        }),
        ('System Information', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['created_at', 'updated_at']

@admin.register(InterviewReminder)
class InterviewReminderAdmin(admin.ModelAdmin):
    list_display = [
        'interview', 'reminder_type', 'scheduled_time', 'sent_status', 'created_at'
    ]
    list_filter = ['reminder_type', 'sent', 'scheduled_time']
    search_fields = [
        'interview__title', 'interview__candidate__full_name'
    ]
    ordering = ['-scheduled_time']
    
    fieldsets = (
        ('Reminder Information', {
            'fields': ('interview', 'recipient', 'reminder_type', 'scheduled_time')
        }),
        ('Status', {
            'fields': ('sent', 'sent_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ['sent_at']
    
    def sent_status(self, obj):
        if obj.sent:
            return format_html(
                '<span style="color: green;">✓ Sent at {}</span>',
                obj.sent_at.strftime('%Y-%m-%d %H:%M') if obj.sent_at else 'Unknown'
            )
        elif obj.scheduled_time and obj.scheduled_time < timezone.now():
            return format_html('<span style="color: red;">✗ Failed</span>')
        else:
            return format_html('<span style="color: orange;">⏳ Pending</span>')
    sent_status.short_description = 'Status'

# Customize admin site
admin.site.site_header = "ElevateHire AI - Interview Management"
admin.site.site_title = "ElevateHire AI Admin"
admin.site.index_title = "Interview Management System"
