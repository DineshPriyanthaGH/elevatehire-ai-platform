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
    performed_by_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = CandidateActivity
        fields = ['id', 'activity_type', 'description', 'user', 'performed_by_name', 'created_at']
        read_only_fields = ['id', 'created_at']

class CandidateListSerializer(serializers.ModelSerializer):
    """Serializer for listing candidates"""
    tags = CandidateTagSerializer(many=True, read_only=True)
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'full_name', 'email', 'phone', 'status', 'experience_years',
            'skills', 'current_position', 'current_company', 'extraction_confidence',
            'created_at', 'updated_at', 'tags', 'added_by_name'
        ]

class CandidateDetailSerializer(serializers.ModelSerializer):
    """Serializer for candidate details with all CV extracted information"""
    tags = CandidateTagSerializer(many=True, read_only=True)
    added_by_name = serializers.CharField(source='added_by.get_full_name', read_only=True)
    cv_file_url = serializers.SerializerMethodField()
    recent_activities = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    education = serializers.SerializerMethodField()
    work_experience = serializers.SerializerMethodField()
    certifications = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone', 'status', 
            'summary', 'experience_years', 'skills', 'current_position', 'current_company',
            'location', 'linkedin_url', 'github_url', 'portfolio_url', 'education',
            'work_experience', 'certifications', 'languages', 'cv_file', 'cv_filename',
            'cv_file_url', 'extraction_confidence', 'extracted_text', 'created_at', 
            'updated_at', 'tags', 'added_by_name', 'recent_activities', 'rating', 'notes'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'extraction_confidence', 'extracted_text']
    
    def get_skills(self, obj):
        """Parse skills from JSON field"""
        skills = obj.skills
        if isinstance(skills, str):
            try:
                return json.loads(skills)
            except (json.JSONDecodeError, TypeError):
                return skills.split(',') if skills else []
        return skills if skills else []
    
    def get_education(self, obj):
        """Parse education from JSON field"""
        education = obj.education
        if isinstance(education, str):
            try:
                return json.loads(education)
            except (json.JSONDecodeError, TypeError):
                return []
        return education if education else []
    
    def get_work_experience(self, obj):
        """Parse work experience from JSON field"""
        experience = obj.work_experience
        if isinstance(experience, str):
            try:
                return json.loads(experience)
            except (json.JSONDecodeError, TypeError):
                return []
        return experience if experience else []
    
    def get_certifications(self, obj):
        """Parse certifications from JSON field"""
        certifications = obj.certifications
        if isinstance(certifications, str):
            try:
                return json.loads(certifications)
            except (json.JSONDecodeError, TypeError):
                return certifications.split(',') if certifications else []
        return certifications if certifications else []
    
    def get_languages(self, obj):
        """Parse languages from JSON field"""
        languages = obj.languages
        if isinstance(languages, str):
            try:
                return json.loads(languages)
            except (json.JSONDecodeError, TypeError):
                return []
        return languages if languages else []
    
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
            'id', 'full_name', 'email', 'phone', 'status', 'summary',
            'experience_years', 'skills', 'current_position', 'current_company',
            'location', 'linkedin_url', 'github_url', 'portfolio_url', 
            'education', 'work_experience', 'certifications', 'languages',
            'notes', 'rating', 'extracted_text', 'extraction_confidence',
            'cv_file', 'tag_ids'
        ]
        read_only_fields = ['id']
    
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
        """Create candidate with tags and proper JSON field handling"""
        tag_ids = validated_data.pop('tag_ids', [])
        
        # Handle JSON string fields
        for field in ['skills', 'education', 'work_experience', 'certifications', 'languages']:
            if field in validated_data and isinstance(validated_data[field], str):
                try:
                    validated_data[field] = json.loads(validated_data[field])
                except (json.JSONDecodeError, TypeError):
                    if field in ['skills', 'certifications']:
                        # For skills and certifications, treat as comma-separated string
                        validated_data[field] = [s.strip() for s in validated_data[field].split(',') if s.strip()]
                    else:
                        validated_data[field] = []
        
        candidate = Candidate.objects.create(**validated_data)
        
        # Add tags
        if tag_ids:
            tags = CandidateTag.objects.filter(id__in=tag_ids, created_by=validated_data.get('added_by'))
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
