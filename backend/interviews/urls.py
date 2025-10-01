"""
URL configuration for interviews app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'interviews', views.InterviewViewSet)
router.register(r'interview-types', views.InterviewTypeViewSet)
router.register(r'availability', views.InterviewAvailabilityViewSet)
router.register(r'templates', views.InterviewTemplateViewSet)
router.register(r'ai-analysis', views.InterviewAIAnalysisViewSet, basename='ai-analysis')

app_name = 'interviews'

urlpatterns = [
    path('', include(router.urls)),
]
