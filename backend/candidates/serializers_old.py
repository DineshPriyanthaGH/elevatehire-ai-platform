from rest_framework import serializers
from .models import Candidate, CandidateTag, CandidateTagAssignment, CandidateActivity
from django.contrib.auth import get_user_model

User = get_user_model()

class CandidateTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateTag
        fields = ['id', 'name', 'color', 'created_at']

class CandidateActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CandidateActivity
        fields = ['id', 'activity_type', 'description', 'metadata', 'created_at', 'user_name']
    
    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
        return "System"

class CandidateListSerializer(serializers.ModelSerializer):
    """Serializer for candidate list view (minimal data)"""
    display_name = serializers.ReadOnlyField()
    cv_file_size = serializers.ReadOnlyField()
    tags = CandidateTagSerializer(many=True, read_only=True, source='tag_assignments.tag')
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'display_name', 'email', 'phone', 'current_position', 
            'current_company', 'experience_years', 'location', 'status', 
            'rating', 'created_at', 'updated_at', 'cv_file', 'cv_file_size', 'tags'
        ]

class CandidateDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed candidate view"""
    display_name = serializers.ReadOnlyField()
    cv_file_size = serializers.ReadOnlyField()
    added_by_name = serializers.SerializerMethodField()
    activities = CandidateActivitySerializer(many=True, read_only=True)
    tags = CandidateTagSerializer(many=True, read_only=True, source='tag_assignments.tag')
    
    class Meta:
        model = Candidate
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'display_name',
            'email', 'phone', 'cv_file', 'cv_filename', 'cv_file_size',
            'summary', 'experience_years', 'current_position', 'current_company',
            'location', 'skills', 'education', 'work_experience', 'certifications',
            'languages', 'linkedin_url', 'github_url', 'portfolio_url',
            'extracted_text', 'extraction_confidence', 'status', 'rating',
            'notes', 'added_by_name', 'created_at', 'updated_at',
            'activities', 'tags'
        ]
    
    def get_added_by_name(self, obj):
        if obj.added_by:
            return f"{obj.added_by.first_name} {obj.added_by.last_name}".strip() or obj.added_by.username
        return "Unknown"

class CandidateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating candidates with CV upload"""
    
    class Meta:
        model = Candidate
        fields = [
            'cv_file', 'first_name', 'last_name', 'email', 'phone', 'notes'
        ]
        extra_kwargs = {
            'cv_file': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
            'phone': {'required': False},
        }
    
    def validate_cv_file(self, value):
        """Validate CV file upload"""
        if not value:
            raise serializers.ValidationError("CV file is required.")
        
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("CV file size must be less than 10MB.")
        
        # Check file extension
        allowed_extensions = ['.pdf', '.doc', '.docx', '.txt']
        file_extension = '.' + value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        return value
    
    def create(self, validated_data):
        # Store original filename
        if 'cv_file' in validated_data:
            validated_data['cv_filename'] = validated_data['cv_file'].name
        
        # Set added_by to current user
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['added_by'] = request.user
        
        candidate = super().create(validated_data)
        
        # Create activity log
        CandidateActivity.objects.create(
            candidate=candidate,
            user=validated_data.get('added_by'),
            activity_type='created',
            description=f"Candidate created with CV upload: {candidate.cv_filename}"
        )
        
        return candidate

class CandidateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating candidate information"""
    
    class Meta:
        model = Candidate
        fields = [
            'first_name', 'last_name', 'email', 'phone', 'summary',
            'experience_years', 'current_position', 'current_company',
            'location', 'skills', 'education', 'work_experience',
            'certifications', 'languages', 'linkedin_url', 'github_url',
            'portfolio_url', 'status', 'rating', 'notes'
        ]
    
    def update(self, instance, validated_data):
        # Track what changed
        changes = []
        for field, new_value in validated_data.items():
            old_value = getattr(instance, field)
            if old_value != new_value:
                changes.append(f"{field}: {old_value} → {new_value}")
        
        candidate = super().update(instance, validated_data)
        
        # Create activity log if there were changes
        if changes:
            request = self.context.get('request')
            user = request.user if request and request.user.is_authenticated else None
            
            CandidateActivity.objects.create(
                candidate=candidate,
                user=user,
                activity_type='updated',
                description=f"Candidate information updated: {', '.join(changes[:3])}{'...' if len(changes) > 3 else ''}",
                metadata={'changes': changes}
            )
        
        return candidate

class CandidateStatsSerializer(serializers.Serializer):
    """Serializer for candidate statistics"""
    total_candidates = serializers.IntegerField()
    new_candidates = serializers.IntegerField()
    in_process = serializers.IntegerField()
    hired = serializers.IntegerField()
    rejected = serializers.IntegerField()
    status_breakdown = serializers.DictField()
    recent_additions = serializers.IntegerField()
    avg_rating = serializers.FloatField(allow_null=True)
    top_skills = serializers.ListField(child=serializers.DictField())
