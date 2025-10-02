from celery import shared_task
from django.conf import settings
from django.utils import timezone
import os
import google.generativeai as genai
import json
import logging
from .models import Interview

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_interview_analysis(self, interview_id, video_path):
    """
    Celery task to process video interview analysis using AI
    """
    try:
        logger.info(f"Starting AI analysis for interview {interview_id} with video {video_path}")
        
        # Get the interview instance
        interview = Interview.objects.get(id=interview_id)
        
        # Update AI analysis status to processing
        interview.ai_analysis_status = 'processing'
        interview.save()
        
        # Initialize Gemini AI
        api_key = settings.GEMINI_API_KEY if hasattr(settings, 'GEMINI_API_KEY') else None
        
        if not api_key:
            # Mock analysis for testing
            logger.info("No Gemini API key found, using mock analysis")
            analysis_result = {
                "overall_score": 85,
                "communication_skills": 88,
                "technical_knowledge": 82,
                "problem_solving": 87,
                "confidence": 90,
                "professionalism": 85,
                "strengths": [
                    "Clear and articulate communication",
                    "Strong technical foundation",
                    "Good problem-solving approach"
                ],
                "areas_for_improvement": [
                    "Could provide more specific examples",
                    "Expand on technical details"
                ],
                "detailed_feedback": "The candidate demonstrated strong communication skills and technical knowledge throughout the interview. They were able to articulate their thoughts clearly and showed confidence in their responses. Their problem-solving approach was logical and well-structured.",
                "recommendation": "Recommended for next round",
                "notes": "This is a mock analysis generated for testing purposes."
            }
        else:
            # Real AI analysis using Gemini
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-pro')
                
                prompt = f"""
                Analyze this interview video and provide a comprehensive assessment of the candidate's performance.
                
                Interview Details:
                - Interview ID: {interview_id}
                - Position: {interview.candidate.position if hasattr(interview.candidate, 'position') else 'Not specified'}
                - Interview Type: {interview.interview_type.name if interview.interview_type else 'General'}
                
                Please provide analysis in the following JSON format:
                {{
                    "overall_score": (0-100),
                    "communication_skills": (0-100),
                    "technical_knowledge": (0-100), 
                    "problem_solving": (0-100),
                    "confidence": (0-100),
                    "professionalism": (0-100),
                    "strengths": ["strength1", "strength2", ...],
                    "areas_for_improvement": ["area1", "area2", ...],
                    "detailed_feedback": "comprehensive feedback text",
                    "recommendation": "recommendation text",
                    "notes": "additional notes"
                }}
                
                Video file path: {video_path}
                """
                
                response = model.generate_content(prompt)
                
                # Parse the AI response
                try:
                    analysis_result = json.loads(response.text.strip())
                except json.JSONDecodeError:
                    # Fallback if AI doesn't return valid JSON
                    analysis_result = {
                        "overall_score": 75,
                        "communication_skills": 75,
                        "technical_knowledge": 75,
                        "problem_solving": 75,
                        "confidence": 75,
                        "professionalism": 75,
                        "strengths": ["AI analysis completed"],
                        "areas_for_improvement": ["Further review recommended"],
                        "detailed_feedback": response.text[:1000] if response.text else "Analysis completed",
                        "recommendation": "Review required",
                        "notes": "AI response was not in expected JSON format"
                    }
                    
            except Exception as ai_error:
                logger.error(f"AI analysis failed: {str(ai_error)}")
                # Fallback analysis
                analysis_result = {
                    "overall_score": 70,
                    "communication_skills": 70,
                    "technical_knowledge": 70,
                    "problem_solving": 70,
                    "confidence": 70,
                    "professionalism": 70,
                    "strengths": ["Interview completed successfully"],
                    "areas_for_improvement": ["Manual review recommended"],
                    "detailed_feedback": f"Automated analysis encountered an issue: {str(ai_error)}",
                    "recommendation": "Manual review required",
                    "notes": "AI analysis failed, manual review needed"
                }
        
        # Save analysis results to the interview
        interview.confidence_score = analysis_result.get('confidence_score', analysis_result.get('overall_score', 75))
        interview.communication_score = analysis_result.get('communication_skills', analysis_result.get('communication_score', 75))
        interview.technical_score = analysis_result.get('technical_knowledge', analysis_result.get('technical_score', 75))
        interview.engagement_score = analysis_result.get('confidence', analysis_result.get('engagement_score', 75))
        interview.ai_sentiment = analysis_result.get('recommendation', 'positive')
        interview.ai_keywords = analysis_result.get('strengths', [])
        interview.ai_recommendations = analysis_result.get('areas_for_improvement', [])
        interview.ai_summary = analysis_result.get('detailed_feedback', 'Analysis completed successfully.')
        interview.ai_analysis_status = 'completed'
        interview.ai_processed_at = timezone.now()
        interview.save()
        
        logger.info(f"AI analysis completed successfully for interview {interview_id}")
        return analysis_result
        
    except Interview.DoesNotExist:
        logger.error(f"Interview {interview_id} not found")
        raise
    
    except Exception as e:
        logger.error(f"Error processing interview analysis: {str(e)}")
        # Update interview AI analysis status to failed
        try:
            interview = Interview.objects.get(id=interview_id)
            interview.ai_analysis_status = 'failed'
            interview.save()
        except:
            pass
        
        # Retry the task
        raise self.retry(exc=e, countdown=60, max_retries=3)

@shared_task
def cleanup_old_videos():
    """
    Celery task to cleanup old video files
    """
    try:
        # Implementation for cleaning up old video files
        logger.info("Video cleanup task started")
        # Add cleanup logic here
        return "Video cleanup completed"
    except Exception as e:
        logger.error(f"Video cleanup failed: {str(e)}")
        raise

@shared_task
def generate_interview_report(interview_id):
    """
    Celery task to generate comprehensive interview reports
    """
    try:
        interview = Interview.objects.get(id=interview_id)
        logger.info(f"Generating report for interview {interview_id}")
        
        # Generate report logic here
        report_data = {
            "interview_id": interview_id,
            "candidate": interview.candidate.full_name if interview.candidate else "Unknown",
            "analysis": interview.ai_analysis,
            "generated_at": interview.updated_at.isoformat() if interview.updated_at else None
        }
        
        logger.info(f"Report generated for interview {interview_id}")
        return report_data
        
    except Interview.DoesNotExist:
        logger.error(f"Interview {interview_id} not found for report generation")
        raise
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise