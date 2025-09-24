"""
Serializers for candidate management
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Candidate, CandidateTag, CandidateActivity
import json

User = get_user_model()

class CandidateTagSerializer(serializers.ModelSerializer):
    """Serializer for CandidateTag model"""
    candidate_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CandidateTag
        fields = ['id', 'name', 'color', 'description', 'created_at', 'candidate_count']
        read_only_fields = ['id', 'created_at', 'candidate_count']
    
    def get_candidate_count(self, obj):
        """Get number of candidates with this tag"""
        return obj.candidates.count()

class CandidateActivitySerializer(serializers.ModelSerializer):
    """Serializer for CandidateActivity model"""
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    
    class Meta:
        model = CandidateActivity
        fields = ['id', 'activity_type', 'description', 'performed_by', 'performed_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class CandidateListSerializer(serializers.ModelSerializer):
    """Serializer for listing candidates"""
    tags = CandidateTagSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'full_name', 'email', 'phone', 'status', 'experience_years',
            'skills', 'current_position', 'current_company', 'extraction_confidence',
            'created_at', 'updated_at', 'tags', 'created_by_name'
        ]

class CandidateDetailSerializer(serializers.ModelSerializer):
    """Serializer for candidate details"""
    tags = CandidateTagSerializer(many=True, read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    cv_file_url = serializers.SerializerMethodField()
    recent_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'full_name', 'email', 'phone', 'status', 'summary',
            'experience_years', 'skills', 'current_position', 'current_company',
            'linkedin_url', 'github_url', 'portfolio_url', 'education',
            'work_experience', 'certifications', 'languages', 'cv_file_url',
            'extraction_confidence', 'extracted_text', 'created_at', 'updated_at',
            'tags', 'created_by_name', 'recent_activities'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'extraction_confidence', 'extracted_text']
    
    def get_cv_file_url(self, obj):
        """Get CV file URL"""
        if obj.cv_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.cv_file.url)
            return obj.cv_file.url
        return None
    
    def get_recent_activities(self, obj):
        """Get recent activities for this candidate"""
        recent_activities = obj.activities.all()[:5]
        return CandidateActivitySerializer(recent_activities, many=True).data

class CandidateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating candidates"""
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of tag IDs to assign to the candidate"
    )
    
    class Meta:
        model = Candidate
        fields = [
            'full_name', 'email', 'phone', 'status', 'summary',
            'experience_years', 'skills', 'current_position', 'current_company',
            'linkedin_url', 'github_url', 'portfolio_url', 'cv_file', 'tag_ids'
        ]
    
    def validate_cv_file(self, value):
        """Validate CV file upload"""
        if value:
            # Check file size (10MB limit)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("File size cannot exceed 10MB.")
            
            # Check file type
            allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
            file_extension = value.name.lower().split('.')[-1]
            if f'.{file_extension}' not in allowed_extensions:
                raise serializers.ValidationError(
                    f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
                )
        
        return value
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value:
            # Check if email already exists for a different candidate
            if hasattr(self, 'instance') and self.instance:
                # Update case - exclude current instance
                if Candidate.objects.filter(email=value).exclude(id=self.instance.id).exists():
                    raise serializers.ValidationError("A candidate with this email already exists.")
            else:
                # Create case
                if Candidate.objects.filter(email=value).exists():
                    raise serializers.ValidationError("A candidate with this email already exists.")
        
        return value
    
    def create(self, validated_data):
        """Create candidate with tags"""
        tag_ids = validated_data.pop('tag_ids', [])
        candidate = Candidate.objects.create(**validated_data)
        
        # Add tags
        if tag_ids:
            tags = CandidateTag.objects.filter(id__in=tag_ids, created_by=validated_data['created_by'])
            candidate.tags.set(tags)
        
        return candidate

class CandidateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating candidates"""
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of tag IDs to assign to the candidate"
    )
    
    class Meta:
        model = Candidate
        fields = [
            'full_name', 'email', 'phone', 'status', 'summary',
            'experience_years', 'skills', 'current_position', 'current_company',
            'linkedin_url', 'github_url', 'portfolio_url', 'education',
            'work_experience', 'certifications', 'languages', 'tag_ids'
        ]
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if value:
            # Check if email already exists for a different candidate
            if Candidate.objects.filter(email=value).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError("A candidate with this email already exists.")
        
        return value
    
    def update(self, instance, validated_data):
        """Update candidate with tags"""
        tag_ids = validated_data.pop('tag_ids', None)
        
        # Update candidate fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update tags if provided
        if tag_ids is not None:
            tags = CandidateTag.objects.filter(id__in=tag_ids, created_by=instance.created_by)
            instance.tags.set(tags)
        
        return instance

class CandidateStatsSerializer(serializers.Serializer):
    """Serializer for candidate statistics"""
    total_candidates = serializers.IntegerField()
    recent_candidates = serializers.IntegerField()
    status_distribution = serializers.DictField()
    parsing_stats = serializers.DictField()
