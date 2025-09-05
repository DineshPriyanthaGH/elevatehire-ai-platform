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

app_name = 'interviews'

urlpatterns = [
    path('api/', include(router.urls)),
]
