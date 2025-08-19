"""
Admin configuration for candidates app
"""
from django.contrib import admin
from .models import Candidate, CandidateTag, CandidateActivity

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    """Admin interface for Candidate model"""
    list_display = ['full_name', 'email', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['full_name', 'email', 'phone', 'skills']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('full_name', 'email', 'phone', 'status')
        }),
        ('Professional Details', {
            'fields': ('summary', 'skills', 'current_position', 'current_company')
        }),
        ('Contact & Social', {
            'fields': ('linkedin_url', 'github_url', 'portfolio_url')
        }),
        ('CV & Files', {
            'fields': ('cv_file',),
            'classes': ('collapse',)
        }),
        ('Structured Data', {
            'fields': ('education', 'work_experience', 'certifications', 'languages'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

@admin.register(CandidateTag)
class CandidateTagAdmin(admin.ModelAdmin):
    """Admin interface for CandidateTag model"""
    list_display = ['name', 'color', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at']

@admin.register(CandidateActivity)
class CandidateActivityAdmin(admin.ModelAdmin):
    """Admin interface for CandidateActivity model"""
    list_display = ['candidate', 'activity_type', 'description_preview', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['candidate__full_name', 'description']
    readonly_fields = ['id', 'created_at']
    
    def description_preview(self, obj):
        """Show preview of description"""
        if len(obj.description) > 100:
            return obj.description[:100] + '...'
        return obj.description
    description_preview.short_description = "Description"