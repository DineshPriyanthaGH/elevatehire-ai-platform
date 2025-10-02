from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoInterviewViewSet, AIAnalysisViewSet, VideoAnalyticsSummaryViewSet

router = DefaultRouter()
router.register(r'video-interviews', VideoInterviewViewSet)
router.register(r'ai-analyses', AIAnalysisViewSet)
router.register(r'analytics-summaries', VideoAnalyticsSummaryViewSet)

app_name = 'ai_analysis'

urlpatterns = [
    path('api/', include(router.urls)),
]
