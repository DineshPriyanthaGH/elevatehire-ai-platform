"""
Views for candidate management
"""
import logging
from datetime import timedelta
from django.utils import timezone
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count
from django.core.files.storage import default_storage
from django.conf import settings
import os
import json

from .models import Candidate, CandidateTag, CandidateActivity
from .serializers import (
    CandidateCreateSerializer,
    CandidateDetailSerializer,
    CandidateListSerializer,
    CandidateUpdateSerializer,
    CandidateTagSerializer,
    CandidateActivitySerializer,
    CandidateStatsSerializer
)

try:
    from .cv_parser import cv_parser
    CV_PARSING_AVAILABLE = True
except ImportError:
    CV_PARSING_AVAILABLE = False
    cv_parser = None

logger = logging.getLogger(__name__)

class CandidateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing candidates
    """
    queryset = Candidate.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['status', 'added_by']
    search_fields = ['full_name', 'email', 'phone', 'skills', 'extracted_text']
    ordering_fields = ['created_at', 'updated_at', 'full_name', 'experience_years']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter candidates to show only those created by the current user"""
        from django.conf import settings
        
        # Always filter by user - even in development mode
        if self.request.user.is_authenticated:
            return Candidate.objects.filter(added_by=self.request.user)
        else:
            # For unauthenticated requests, create/use a test user
            from django.contrib.auth import get_user_model
            User = get_user_model()
            test_user, created = User.objects.get_or_create(
                email='test@example.com',
                defaults={
                    'is_active': True,
                    'is_staff': False,
                }
            )
            if created:
                test_user.set_password('testpass123')
                test_user.save()
            
            return Candidate.objects.filter(added_by=test_user)
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        from django.conf import settings
        
        if getattr(settings, 'PRODUCTION_MODE', False):
            # Production mode - require authentication for all actions
            permission_classes = [IsAuthenticated]
        else:
            # Development mode - allow all actions without authentication
            permission_classes = [AllowAny]
            
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Create candidate with CV parsing and proper user handling"""
        # Handle user assignment - create test user for development
        user = self.request.user
        if not user.is_authenticated:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user, created = User.objects.get_or_create(
                email='test@example.com',
                defaults={
                    'is_active': True,
                    'is_staff': False,
                }
            )
            if created:
                user.set_password('testpass123')
                user.save()
        
        candidate = serializer.save(added_by=user)
        
        # Parse CV if uploaded
        if candidate.cv_file and CV_PARSING_AVAILABLE:
            try:
                self.parse_and_update_candidate(candidate)
            except Exception as e:
                logger.error(f"Error parsing CV for candidate {candidate.id}: {e}")
                # Create activity log for parsing error
                CandidateActivity.objects.create(
                    candidate=candidate,
                    activity_type='note',
                    description=f"CV parsing failed: {str(e)}",
                    user=user
                )
        
        # Log creation activity
        CandidateActivity.objects.create(
            candidate=candidate,
            activity_type='status_changed',
            description=f"Candidate created with status: {candidate.status}",
            user=user
        )
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return CandidateCreateSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return CandidateDetailSerializer
        else:
            return CandidateListSerializer
    
    def perform_update(self, serializer):
        """Update candidate and log changes"""
        old_status = serializer.instance.status
        candidate = serializer.save()
        
        # Log status change
        if old_status != candidate.status:
            CandidateActivity.objects.create(
                candidate=candidate,
                activity_type='status_changed',
                description=f"Status changed from {old_status} to {candidate.status}",
                user=self.request.user
            )
    
    def parse_and_update_candidate(self, candidate):
        """Parse CV and update candidate information"""
        if not candidate.cv_file or not CV_PARSING_AVAILABLE:
            return
        
        try:
            # Read CV file
            cv_file_path = candidate.cv_file.path
            with open(cv_file_path, 'rb') as f:
                file_content = f.read()
            
            # Parse CV
            parsed_data = cv_parser.parse_cv(candidate.cv_file.name, file_content)
            
            # Update candidate with parsed data
            update_fields = []
            
            if parsed_data.get('full_name') and not candidate.full_name:
                candidate.full_name = parsed_data['full_name']
                update_fields.append('full_name')
            
            if parsed_data.get('email') and not candidate.email:
                candidate.email = parsed_data['email']
                update_fields.append('email')
            
            if parsed_data.get('phone') and not candidate.phone:
                candidate.phone = parsed_data['phone']
                update_fields.append('phone')
            
            if parsed_data.get('linkedin_url'):
                candidate.linkedin_url = parsed_data['linkedin_url']
                update_fields.append('linkedin_url')
            
            if parsed_data.get('github_url'):
                candidate.github_url = parsed_data['github_url']
                update_fields.append('github_url')
            
            if parsed_data.get('summary'):
                candidate.summary = parsed_data['summary']
                update_fields.append('summary')
            
            if parsed_data.get('skills'):
                candidate.skills = parsed_data['skills']
                update_fields.append('skills')
            
            if parsed_data.get('experience_years') is not None:
                candidate.experience_years = parsed_data['experience_years']
                update_fields.append('experience_years')
            
            if parsed_data.get('education'):
                candidate.education = parsed_data['education']
                update_fields.append('education')
            
            if parsed_data.get('work_experience'):
                candidate.work_experience = parsed_data['work_experience']
                update_fields.append('work_experience')
            
            if parsed_data.get('certifications'):
                candidate.certifications = parsed_data['certifications']
                update_fields.append('certifications')
            
            if parsed_data.get('languages'):
                candidate.languages = parsed_data['languages']
                update_fields.append('languages')
            
            candidate.extracted_text = parsed_data.get('extracted_text', '')
            candidate.extraction_confidence = parsed_data.get('extraction_confidence', 0.0)
            update_fields.extend(['extracted_text', 'extraction_confidence'])
            
            if update_fields:
                candidate.save(update_fields=update_fields + ['updated_at'])
                
                # Log parsing success
                CandidateActivity.objects.create(
                    candidate=candidate,
                    activity_type='note',
                    description=f"CV parsed successfully. Confidence: {candidate.extraction_confidence:.2f}. Updated fields: {', '.join(update_fields)}",
                    user=candidate.added_by
                )
            
        except Exception as e:
            logger.error(f"Error parsing CV for candidate {candidate.id}: {e}")
            raise
    
    @action(detail=True, methods=['get'])
    def download_cv(self, request, pk=None):
        """Download candidate's CV file"""
        candidate = self.get_object()
        
        if not candidate.cv_file:
            return Response(
                {'error': 'No CV file found for this candidate'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            from django.http import FileResponse
            import mimetypes
            
            # Get the file path
            file_path = candidate.cv_file.path
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Create filename for download
            filename = candidate.cv_filename or f"{candidate.full_name}_CV.pdf"
            filename = filename.replace(' ', '_')
            
            # Log download activity
            CandidateActivity.objects.create(
                candidate=candidate,
                activity_type='note',
                description=f"CV downloaded by {request.user.email if request.user.is_authenticated else 'anonymous user'}",
                user=request.user if request.user.is_authenticated else candidate.added_by
            )
            
            # Return file response
            response = FileResponse(
                open(file_path, 'rb'),
                content_type=content_type,
                as_attachment=True,
                filename=filename
            )
            return response
            
        except FileNotFoundError:
            return Response(
                {'error': 'CV file not found on server'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error downloading CV for candidate {candidate.id}: {e}")
            return Response(
                {'error': 'Failed to download CV file'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get activities for a specific candidate"""
        candidate = self.get_object()
        activities = CandidateActivity.objects.filter(candidate=candidate).order_by('-created_at')[:20]
        serializer = CandidateActivitySerializer(activities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note for the candidate"""
        candidate = self.get_object()
        note = request.data.get('note')
        
        if not note:
            return Response(
                {'error': 'Note content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        activity = CandidateActivity.objects.create(
            candidate=candidate,
            activity_type='note',
            description=note,
            user=request.user if request.user.is_authenticated else None
        )
        
        serializer = CandidateActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def reparse_cv(self, request, pk=None):
        """Manually trigger CV re-parsing"""
        candidate = self.get_object()
        
        if not candidate.cv_file:
            return Response(
                {'error': 'No CV file found for this candidate'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not CV_PARSING_AVAILABLE:
            return Response(
                {'error': 'CV parsing is not available. Please install required packages.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        try:
            self.parse_and_update_candidate(candidate)
            serializer = self.get_serializer(candidate)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Error parsing CV: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to candidate"""
        candidate = self.get_object()
        note = request.data.get('note', '').strip()
        
        if not note:
            return Response(
                {'error': 'Note content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        activity = CandidateActivity.objects.create(
            candidate=candidate,
            activity_type='note',
            description=note,
            user=request.user
        )
        
        serializer = CandidateActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update candidate status"""
        candidate = self.get_object()
        new_status = request.data.get('status')
        note = request.data.get('note', '').strip()
        
        if new_status not in dict(Candidate.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = candidate.status
        candidate.status = new_status
        candidate.save(update_fields=['status', 'updated_at'])
        
        # Log status change
        description = f"Status changed from {old_status} to {new_status}"
        if note:
            description += f". Note: {note}"
        
        CandidateActivity.objects.create(
            candidate=candidate,
            activity_type='status_changed',
            description=description,
            user=request.user
        )
        
        serializer = self.get_serializer(candidate)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def activities(self, request, pk=None):
        """Get candidate activities"""
        candidate = self.get_object()
        activities = candidate.activities.all().order_by('-created_at')
        serializer = CandidateActivitySerializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get candidate statistics"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Status distribution
        status_stats = queryset.values('status').annotate(count=Count('id'))
        
        # Total counts
        total_candidates = queryset.count()
        
        # Recent activity
        recent_candidates = queryset.filter(
            created_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        stats = {
            'total_candidates': total_candidates,
            'recent_candidates': recent_candidates,
            'status_distribution': {item['status']: item['count'] for item in status_stats},
            'parsing_stats': {
                'with_cv': queryset.exclude(cv_file='').count(),
                'parsed': queryset.filter(extraction_confidence__gt=0).count(),
                'high_confidence': queryset.filter(extraction_confidence__gte=0.7).count(),
            }
        }
        
        serializer = CandidateStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_update_status(self, request):
        """Bulk update candidate status"""
        candidate_ids = request.data.get('candidate_ids', [])
        new_status = request.data.get('status')
        note = request.data.get('note', '').strip()
        
        if not candidate_ids:
            return Response(
                {'error': 'No candidates selected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in dict(Candidate.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update candidates
        candidates = Candidate.objects.filter(id__in=candidate_ids)
        updated_count = 0
        
        for candidate in candidates:
            old_status = candidate.status
            candidate.status = new_status
            candidate.save(update_fields=['status', 'updated_at'])
            
            # Log activity
            description = f"Bulk status change from {old_status} to {new_status}"
            if note:
                description += f". Note: {note}"
            
            CandidateActivity.objects.create(
                candidate=candidate,
                activity_type='status_changed',
                description=description,
                user=request.user
            )
            updated_count += 1
        
        return Response({
            'message': f'Updated status for {updated_count} candidates',
            'updated_count': updated_count
        })
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export candidates data"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Simple CSV export data
        candidates_data = []
        for candidate in queryset:
            candidates_data.append({
                'id': candidate.id,
                'full_name': candidate.full_name,
                'email': candidate.email,
                'phone': candidate.phone,
                'status': candidate.status,
                'experience_years': candidate.experience_years,
                'skills': ', '.join(candidate.skills) if candidate.skills else '',
                'created_at': candidate.created_at.isoformat(),
                'extraction_confidence': candidate.extraction_confidence
            })
        
        return Response({
            'candidates': candidates_data,
            'total_count': len(candidates_data)
        })
    
    @action(detail=True, methods=['get'])
    def confidence_breakdown(self, request, pk=None):
        """Get detailed confidence breakdown for a candidate's CV extraction"""
        candidate = self.get_object()
        
        if not CV_PARSING_AVAILABLE:
            return Response(
                {'error': 'CV parsing not available'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        if not candidate.extracted_text:
            return Response(
                {'error': 'No extracted text available for this candidate'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            # Re-analyze the extracted data for confidence breakdown
            contact_info = {
                'email': candidate.email,
                'phone': candidate.phone,
                'linkedin_url': candidate.linkedin_url,
                'github_url': candidate.github_url
            }
            
            confidence_breakdown = cv_parser.get_confidence_breakdown(
                text=candidate.extracted_text,
                contact_info=contact_info,
                name=candidate.full_name,
                skills=candidate.skills or []
            )
            
            # Add candidate-specific information
            response_data = {
                'candidate_id': candidate.id,
                'candidate_name': candidate.full_name,
                'extraction_date': candidate.updated_at,
                'cv_filename': candidate.cv_filename,
                'confidence_breakdown': confidence_breakdown,
                'extraction_summary': {
                    'overall_confidence': confidence_breakdown['overall_confidence'],
                    'confidence_level': self._get_confidence_level(confidence_breakdown['overall_confidence']),
                    'key_strengths': self._get_extraction_strengths(confidence_breakdown),
                    'improvement_areas': confidence_breakdown.get('recommendations', [])
                }
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Error generating confidence breakdown for candidate {pk}: {str(e)}")
            return Response(
                {'error': 'Failed to generate confidence breakdown'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_confidence_level(self, confidence: float) -> str:
        """Get human-readable confidence level"""
        if confidence >= 0.8:
            return 'Excellent'
        elif confidence >= 0.6:
            return 'Good'
        elif confidence >= 0.4:
            return 'Fair'
        elif confidence >= 0.2:
            return 'Poor'
        else:
            return 'Very Poor'
    
    def _get_extraction_strengths(self, breakdown: dict) -> list:
        """Identify strongest extraction areas"""
        strengths = []
        metrics = breakdown.get('metrics', {})
        
        for metric_name, metric_data in metrics.items():
            if metric_data.get('score', 0) >= 0.7:
                strength_name = metric_name.replace('_', ' ').title()
                strengths.append(f"{strength_name} ({metric_data['score']:.1%})")
        
        return strengths[:5]  # Return top 5 strengths

class CandidateTagViewSet(viewsets.ModelViewSet):
    """ViewSet for managing candidate tags"""
    queryset = CandidateTag.objects.all()
    serializer_class = CandidateTagSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return all tags"""
        return CandidateTag.objects.all()
    
    def perform_create(self, serializer):
        """Create the tag"""
        serializer.save()

class CandidateActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing candidate activities"""
    queryset = CandidateActivity.objects.all()
    serializer_class = CandidateActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['candidate', 'activity_type', 'user']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter activities for candidates created by current user"""
        return CandidateActivity.objects.filter(
            candidate__added_by=self.request.user
        )

# Utility views for CV parsing status
def cv_parsing_status(request):
    """Check if CV parsing is available"""
    return JsonResponse({
        'cv_parsing_available': CV_PARSING_AVAILABLE,
        'required_packages': ['PyPDF2', 'pdfplumber', 'python-docx'] if not CV_PARSING_AVAILABLE else [],
        'message': 'CV parsing is ready' if CV_PARSING_AVAILABLE else 'Install required packages for CV parsing'
    })
