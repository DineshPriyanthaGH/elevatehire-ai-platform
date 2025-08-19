"""
URL configuration for candidates app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'', views.CandidateViewSet, basename='candidate')
router.register(r'tags', views.CandidateTagViewSet, basename='candidatetag')
router.register(r'activities', views.CandidateActivityViewSet, basename='candidateactivity')

app_name = 'candidates'

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Utility endpoints
    path('cv-parsing-status/', views.cv_parsing_status, name='cv_parsing_status'),
]
