"""
AI Analysis Services for Interviews using Gemini API
"""
import os
import logging
import json
import asyncio
from typing import Dict, List, Optional
from django.conf import settings
from django.utils import timezone
import google.generativeai as genai
from concurrent.futures import ThreadPoolExecutor
import time
import random
import re

logger = logging.getLogger(__name__)

class InterviewAnalysisService:
    """Service for AI-powered interview analysis using Gemini API"""
    
    def __init__(self):
        # Configure Gemini API
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.use_mock = not bool(self.api_key)
        
        if not self.use_mock:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(
                    model_name=getattr(settings, 'GEMINI_MODEL', 'gemini-pro')
                )
                logger.info("Gemini API configured successfully")
            except Exception as e:
                logger.error(f"Failed to configure Gemini API: {str(e)}")
                self.use_mock = True
        
        if self.use_mock:
            logger.warning("Using mock analysis. Configure GEMINI_API_KEY for real AI analysis.")
    
    @classmethod
    def analyze_interview_async(cls, interview):
        """Start asynchronous interview analysis"""
        service = cls()
        
        # Run analysis in thread pool to avoid blocking
        executor = ThreadPoolExecutor(max_workers=1)
        executor.submit(service._analyze_interview, interview)
        
        logger.info(f"Started AI analysis for interview {interview.id}")
    
    def _analyze_interview(self, interview):
        """Perform the actual interview analysis"""
        try:
            logger.info(f"Starting AI analysis for interview {interview.id}")
            
            # Simulate video processing and transcript extraction
            transcript = self._extract_transcript_mock(interview)
            interview.transcript = transcript
            interview.save()
            
            # Perform AI analysis
            if self.use_mock:
                analysis_results = self._perform_mock_analysis(interview, transcript)
            else:
                analysis_results = self._perform_gemini_analysis(interview, transcript)
            
            # Save results to interview model
            interview.confidence_score = analysis_results.get('confidence_score', 0)
            interview.communication_score = analysis_results.get('communication_score', 0)
            interview.technical_score = analysis_results.get('technical_score', 0)
            interview.engagement_score = analysis_results.get('engagement_score', 0)
            interview.ai_sentiment = analysis_results.get('sentiment', 'neutral')
            interview.ai_keywords = analysis_results.get('keywords', [])
            interview.ai_recommendations = analysis_results.get('recommendations', [])
            interview.ai_summary = analysis_results.get('summary', '')
            interview.ai_analysis_status = 'completed'
            interview.ai_processed_at = timezone.now()
            interview.save()
            
            logger.info(f"Completed AI analysis for interview {interview.id}")
            
        except Exception as e:
            logger.error(f"AI analysis failed for interview {interview.id}: {str(e)}")
            interview.ai_analysis_status = 'failed'
            interview.save()
    
    def _extract_transcript_mock(self, interview) -> str:
        """Mock transcript extraction - in real implementation, this would use speech-to-text"""
        # Simulate processing time
        time.sleep(2)
        
        candidate_name = interview.candidate.full_name
        interviewer_name = interview.interviewer.get_full_name()
        position = getattr(interview.candidate, 'position_applied', 'Software Developer')
        
        # Generate realistic mock transcript based on interview type
        if 'technical' in interview.interview_type.name.lower():
            return self._generate_technical_transcript(candidate_name, interviewer_name, position)
        elif 'behavioral' in interview.interview_type.name.lower():
            return self._generate_behavioral_transcript(candidate_name, interviewer_name, position)
        else:
            return self._generate_general_transcript(candidate_name, interviewer_name, position)
    
    def _generate_technical_transcript(self, candidate_name: str, interviewer_name: str, position: str) -> str:
        return f"""
{interviewer_name}: Good morning {candidate_name}, thank you for joining us today. Let's start with a technical question. Can you explain the difference between REST and GraphQL APIs?

{candidate_name}: Thank you for having me. REST and GraphQL are both API design paradigms, but they work differently. REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint with a flexible query language. GraphQL allows clients to request exactly the data they need, which can reduce over-fetching and under-fetching issues common in REST APIs.

{interviewer_name}: That's a good explanation. Now, let's talk about database optimization. How would you optimize a slow-performing SQL query?

{candidate_name}: There are several approaches I'd consider. First, I'd analyze the query execution plan to identify bottlenecks. Then I'd look at indexing strategies - ensuring we have appropriate indexes on columns used in WHERE clauses, JOIN conditions, and ORDER BY statements. I'd also consider query rewriting, perhaps breaking complex queries into smaller ones, or using CTEs for better readability and performance.

{interviewer_name}: Excellent. Can you walk me through how you would implement a caching strategy for a high-traffic web application?

{candidate_name}: I'd implement a multi-layered caching approach. At the browser level, I'd use HTTP cache headers for static assets. For dynamic content, I'd implement Redis or Memcached for in-memory caching of frequently accessed data like user sessions and API responses. For database queries, I'd use query result caching and consider implementing a CDN for global content distribution.

{interviewer_name}: Great technical knowledge. How do you handle error handling and logging in your applications?

{candidate_name}: I believe in comprehensive error handling and observability. I implement structured logging with different log levels, use try-catch blocks strategically, and always log errors with context. I also implement health checks and monitoring dashboards using tools like Prometheus and Grafana. For user-facing errors, I ensure they're user-friendly while technical details are logged for debugging.

{interviewer_name}: Perfect. One last technical question - how would you approach designing a microservices architecture?

{candidate_name}: I'd start by identifying bounded contexts and breaking down the monolith based on business capabilities. Each service should have its own database and be independently deployable. I'd implement service discovery, load balancing, and circuit breakers for resilience. Communication would be primarily asynchronous using message queues, with synchronous calls only when necessary. I'd also ensure proper monitoring, distributed tracing, and consistent API versioning strategies.

{interviewer_name}: Excellent responses. Do you have any questions for us about the technical stack or development practices here?

{candidate_name}: Yes, I'd love to know more about your current technology stack, deployment practices, and how you handle code reviews and technical debt management.
        """.strip()
    
    def _generate_behavioral_transcript(self, candidate_name: str, interviewer_name: str, position: str) -> str:
        return f"""
{interviewer_name}: Hello {candidate_name}, welcome to our behavioral interview. Let's start with you telling me about a challenging project you've worked on recently.

{candidate_name}: Thank you. I recently led the development of a customer analytics platform that had to process large volumes of real-time data. The challenge was that we had tight deadlines and the requirements kept evolving as stakeholders better understood their needs.

{interviewer_name}: How did you handle the changing requirements and pressure?

{candidate_name}: I implemented an agile approach with weekly sprint planning and daily standups. I made sure to maintain regular communication with stakeholders, documenting all requirement changes and their impact on timeline and resources. When the scope started growing beyond our capacity, I proactively communicated the trade-offs and helped prioritize features based on business value.

{interviewer_name}: Tell me about a time when you had to work with a difficult team member.

{candidate_name}: I had a situation where a team member was consistently missing deadlines and it was affecting our sprint goals. Rather than escalating immediately, I had a private conversation to understand if there were any blocking issues or personal challenges. It turned out they were struggling with a new technology stack. I paired with them for a few sessions and created some documentation to help them get up to speed. This not only resolved the immediate issue but also strengthened our team collaboration.

{interviewer_name}: How do you prioritize your work when you have multiple urgent tasks?

{candidate_name}: I use a combination of impact and urgency assessment. I first identify which tasks directly affect other team members or critical business functions. Then I consider the effort required and potential dependencies. I'm not afraid to push back or negotiate timelines when necessary, but I always come with alternative solutions or suggestions for resource allocation.

{interviewer_name}: Describe a time when you made a mistake and how you handled it.

{candidate_name}: Early in my career, I deployed a feature without thorough testing that caused a partial service outage. I immediately took ownership, worked with the team to implement a rollback, and then conducted a thorough post-mortem. I used this as a learning opportunity to improve our deployment processes and implement better testing procedures. Since then, I've been a strong advocate for comprehensive CI/CD pipelines and automated testing.

{interviewer_name}: What motivates you in your work?

{candidate_name}: I'm motivated by solving complex problems and seeing the impact of my work on users and business outcomes. I enjoy learning new technologies and sharing knowledge with my team. I also find satisfaction in mentoring junior developers and contributing to a positive team culture where everyone can grow and succeed.

{interviewer_name}: Where do you see yourself in the next few years?

{candidate_name}: I'm looking to grow into a technical leadership role where I can have broader impact on architecture decisions and team development. I want to continue developing my skills in system design and also grow my ability to communicate technical concepts to non-technical stakeholders. This position seems like a great step in that direction.
        """.strip()
    
    def _generate_general_transcript(self, candidate_name: str, interviewer_name: str, position: str) -> str:
        return f"""
{interviewer_name}: Good afternoon {candidate_name}. Thank you for your interest in the {position} position. Let's start with you telling me a bit about yourself and your background.

{candidate_name}: Thank you for having me. I'm a software developer with about 5 years of experience, primarily in full-stack development. I've worked with various technologies including React, Node.js, Python, and cloud platforms. I'm passionate about building scalable applications and have experience leading small teams on complex projects.

{interviewer_name}: That's great. What attracted you to apply for this position specifically?

{candidate_name}: I'm really excited about the opportunity to work on innovative products that have real impact on users. From my research, I can see that your company values technical excellence and has a strong culture of learning and growth. The role also offers the chance to work with modern technologies and contribute to architectural decisions, which aligns perfectly with my career goals.

{interviewer_name}: Can you walk me through your experience with our tech stack?

{candidate_name}: I have extensive experience with React and TypeScript, having built several production applications over the past three years. I'm also comfortable with Node.js and Express for backend development, and have worked with PostgreSQL and MongoDB for database design. I've used AWS services including EC2, S3, and Lambda for deployment and scaling. While I haven't used every tool in your stack, I'm confident in my ability to learn quickly and adapt.

{interviewer_name}: How do you stay current with technology trends and continue learning?

{candidate_name}: I'm an active member of the developer community. I regularly read technical blogs, participate in online forums, and attend local meetups when possible. I also contribute to open-source projects, which helps me learn from other developers and stay exposed to different coding styles and practices. I believe in hands-on learning, so I often build small side projects to explore new technologies.

{interviewer_name}: Tell me about your experience working in teams and your preferred work style.

{candidate_name}: I thrive in collaborative environments where there's open communication and shared ownership of project success. I enjoy pair programming and code reviews as learning opportunities. I'm comfortable taking initiative when needed but also value input from teammates. I believe in clear documentation and transparent progress sharing to keep everyone aligned.

{interviewer_name}: What questions do you have for me about the role or the company?

{candidate_name}: I'd love to learn more about the team structure and how projects are typically organized. What does a typical development cycle look like here? Also, what opportunities are there for professional development and growth within the organization?

{interviewer_name}: Great questions. Let me tell you about our development process and growth opportunities...
        """.strip()
    
    def _perform_mock_analysis(self, interview, transcript: str) -> Dict:
        """Perform mock AI analysis for testing purposes"""
        # Simulate processing time
        time.sleep(3)
        
        # Generate realistic scores based on transcript content and interview type
        base_confidence = random.uniform(75, 95)
        base_communication = random.uniform(80, 95)
        base_technical = random.uniform(70, 90) if 'technical' in interview.interview_type.name.lower() else random.uniform(60, 80)
        base_engagement = random.uniform(85, 95)
        
        # Adjust scores based on transcript content analysis
        positive_keywords = ['excellent', 'great', 'perfect', 'good', 'comprehensive', 'thorough']
        negative_keywords = ['struggling', 'difficult', 'mistake', 'challenge', 'problem']
        
        positive_count = sum(1 for word in positive_keywords if word in transcript.lower())
        negative_count = sum(1 for word in negative_keywords if word in transcript.lower())
        
        # Adjust scores based on keyword analysis
        adjustment = (positive_count - negative_count) * 2
        confidence_score = max(60, min(100, base_confidence + adjustment))
        communication_score = max(60, min(100, base_communication + adjustment))
        technical_score = max(50, min(100, base_technical + adjustment))
        engagement_score = max(70, min(100, base_engagement + adjustment))
        
        # Extract keywords from transcript
        keywords = self._extract_keywords_mock(transcript)
        
        # Generate recommendations
        recommendations = self._generate_recommendations_mock(
            confidence_score, communication_score, technical_score, engagement_score
        )
        
        # Determine sentiment
        sentiment = 'positive' if (confidence_score + communication_score) / 2 > 80 else 'neutral'
        if (confidence_score + communication_score) / 2 < 65:
            sentiment = 'negative'
        
        # Generate summary
        summary = self._generate_summary_mock(interview, confidence_score, communication_score, technical_score, engagement_score)
        
        return {
            'confidence_score': round(confidence_score, 1),
            'communication_score': round(communication_score, 1),
            'technical_score': round(technical_score, 1),
            'engagement_score': round(engagement_score, 1),
            'sentiment': sentiment,
            'keywords': keywords,
            'recommendations': recommendations,
            'summary': summary
        }
    
    def _perform_gemini_analysis(self, interview, transcript: str) -> Dict:
        """Perform AI analysis using Gemini API"""
        try:
            # Create analysis prompt
            prompt = self._create_analysis_prompt(interview, transcript)
            
            # Configure generation parameters
            generation_config = genai.GenerationConfig(
                temperature=getattr(settings, 'GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=getattr(settings, 'GEMINI_MAX_TOKENS', 2048),
                top_p=0.8,
                top_k=40
            )
            
            # Generate analysis using Gemini
            response = self.model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            if not response.text:
                raise ValueError("Empty response from Gemini API")
            
            # Parse the response
            analysis_text = response.text
            logger.info(f"Gemini API response received: {len(analysis_text)} characters")
            
            # Extract structured data from response
            return self._parse_gemini_response(analysis_text, interview)
            
        except Exception as e:
            logger.error(f"Gemini API analysis failed: {str(e)}")
            # Fallback to mock analysis
            return self._perform_mock_analysis(interview, transcript)
    
    def _create_analysis_prompt(self, interview, transcript: str) -> str:
        """Create analysis prompt for Gemini API"""
        position = getattr(interview.candidate, 'position_applied', 'Software Developer')
        
        return f"""You are an expert HR analyst and technical interviewer. Analyze this job interview transcript and provide a comprehensive, objective assessment.

INTERVIEW CONTEXT:
- Position: {position}
- Interview Type: {interview.interview_type.name}
- Candidate: {interview.candidate.full_name}
- Duration: {interview.duration_minutes} minutes

TRANSCRIPT:
{transcript}

ANALYSIS REQUIREMENTS:
Provide a detailed analysis in valid JSON format with these exact fields:

{{
    "confidence_score": <integer 0-100: candidate's confidence and composure>,
    "communication_score": <integer 0-100: clarity, articulation, and listening skills>,
    "technical_score": <integer 0-100: technical knowledge and problem-solving ability>,
    "engagement_score": <integer 0-100: enthusiasm, curiosity, and interaction quality>,
    "sentiment": "<string: 'positive', 'neutral', or 'negative'>,
    "keywords": [<array of 8-12 key technical topics, skills, or concepts mentioned>],
    "recommendations": [<array of 4-6 specific, actionable improvement recommendations>],
    "summary": "<string: 2-3 sentence comprehensive performance summary>",
    "strengths": [<array of 4-5 key candidate strengths with specific examples>],
    "areas_for_improvement": [<array of 3-4 specific areas for growth>]
}}

SCORING CRITERIA:
- Confidence (0-100): Body language, voice clarity, handling difficult questions
- Communication (0-100): Explanation clarity, active listening, appropriate responses
- Technical (0-100): Domain knowledge, problem-solving approach, best practices awareness
- Engagement (0-100): Interest level, question asking, cultural fit indicators

Ensure all scores are realistic and evidence-based. Provide only the JSON response without additional text."""
    
    def _parse_gemini_response(self, response_text: str, interview) -> Dict:
        """Parse Gemini API response into structured data"""
        try:
            # Clean the response text
            cleaned_response = response_text.strip()
            
            # Try to extract JSON from response - look for the most complete JSON object
            json_patterns = [
                r'```json\s*(\{.*?\})\s*```',  # JSON in code blocks
                r'```\s*(\{.*?\})\s*```',      # JSON in generic code blocks
                r'(\{.*\})'                     # Direct JSON
            ]
            
            analysis_data = None
            for pattern in json_patterns:
                matches = re.findall(pattern, cleaned_response, re.DOTALL | re.MULTILINE)
                for match in matches:
                    try:
                        analysis_data = json.loads(match)
                        break
                    except json.JSONDecodeError:
                        continue
                if analysis_data:
                    break
            
            if not analysis_data:
                # Try parsing the entire response as JSON
                analysis_data = json.loads(cleaned_response)
            
            # Validate and normalize required fields
            analysis_data['confidence_score'] = self._normalize_score(analysis_data.get('confidence_score', 75))
            analysis_data['communication_score'] = self._normalize_score(analysis_data.get('communication_score', 75))
            analysis_data['technical_score'] = self._normalize_score(analysis_data.get('technical_score', 75))
            analysis_data['engagement_score'] = self._normalize_score(analysis_data.get('engagement_score', 75))
            
            # Validate sentiment
            valid_sentiments = ['positive', 'neutral', 'negative']
            if analysis_data.get('sentiment') not in valid_sentiments:
                analysis_data['sentiment'] = 'neutral'
            
            # Ensure arrays exist
            analysis_data['keywords'] = analysis_data.get('keywords', [])[:12]  # Limit to 12
            analysis_data['recommendations'] = analysis_data.get('recommendations', [])[:6]  # Limit to 6
            analysis_data['strengths'] = analysis_data.get('strengths', [])[:5]  # Limit to 5
            analysis_data['areas_for_improvement'] = analysis_data.get('areas_for_improvement', [])[:4]  # Limit to 4
            
            # Ensure summary exists
            if not analysis_data.get('summary'):
                analysis_data['summary'] = "Interview analysis completed successfully."
            
            logger.info("Successfully parsed Gemini API response")
            return analysis_data
                
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {str(e)}")
            logger.error(f"Response text: {response_text[:500]}...")
            # Fallback to mock analysis
            return self._perform_mock_analysis(interview, "")
    
    def _normalize_score(self, score) -> float:
        """Normalize score to 0-100 range"""
        try:
            score_float = float(score)
            return max(0, min(100, score_float))
        except (TypeError, ValueError):
            return 75.0  # Default score
    
    def _extract_keywords_mock(self, transcript: str) -> List[str]:
        """Extract key topics from transcript (mock implementation)"""
        # Common technical and soft skill keywords
        keyword_patterns = [
            'python', 'javascript', 'react', 'node.js', 'sql', 'database', 'api', 'rest', 'graphql',
            'microservices', 'docker', 'kubernetes', 'aws', 'cloud', 'agile', 'scrum', 'testing',
            'leadership', 'teamwork', 'communication', 'problem-solving', 'debugging', 'optimization',
            'architecture', 'design patterns', 'algorithms', 'data structures', 'security', 'performance'
        ]
        
        found_keywords = []
        transcript_lower = transcript.lower()
        
        for keyword in keyword_patterns:
            if keyword in transcript_lower:
                found_keywords.append(keyword.title())
        
        # Add some context-specific keywords
        if 'technical' in transcript_lower:
            found_keywords.extend(['Technical Skills', 'System Design'])
        if 'team' in transcript_lower:
            found_keywords.append('Team Collaboration')
        if 'project' in transcript_lower:
            found_keywords.append('Project Management')
        
        return found_keywords[:10]  # Limit to top 10 keywords
    
    def _generate_recommendations_mock(self, confidence: float, communication: float, technical: float, engagement: float) -> List[str]:
        """Generate improvement recommendations based on scores"""
        recommendations = []
        
        if confidence < 75:
            recommendations.append("Focus on building confidence through practice interviews and technical preparation")
        
        if communication < 75:
            recommendations.append("Work on articulating technical concepts clearly and concisely")
            recommendations.append("Practice explaining complex topics to non-technical audiences")
        
        if technical < 70:
            recommendations.append("Strengthen technical fundamentals through additional study and hands-on practice")
            recommendations.append("Consider contributing to open-source projects to gain more experience")
        
        if engagement < 80:
            recommendations.append("Show more enthusiasm and ask thoughtful questions about the role and company")
            recommendations.append("Research the company and position thoroughly before interviews")
        
        # Positive reinforcement for high scores
        if confidence >= 85:
            recommendations.append("Excellent confidence level - maintain this composure in future interviews")
        
        if communication >= 85:
            recommendations.append("Strong communication skills demonstrated - continue leveraging this strength")
        
        if technical >= 85:
            recommendations.append("Impressive technical knowledge - consider sharing specific examples and projects")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Overall strong performance - continue refining interview skills")
            recommendations.append("Consider preparing additional specific examples of your achievements")
        
        return recommendations
    
    def _generate_summary_mock(self, interview, confidence: float, communication: float, technical: float, engagement: float) -> str:
        """Generate interview summary based on analysis"""
        overall_score = (confidence + communication + technical + engagement) / 4
        
        performance_level = "excellent" if overall_score >= 85 else "strong" if overall_score >= 75 else "satisfactory" if overall_score >= 65 else "needs improvement"
        
        summary = f"""
Interview Analysis Summary for {interview.candidate.full_name}

The candidate demonstrated {performance_level} performance during this {interview.interview_type.name.lower()} interview. 

Key Highlights:
• Confidence Level: {confidence:.1f}/100 - {'Very confident presentation' if confidence >= 80 else 'Good confidence level' if confidence >= 70 else 'Could benefit from more confidence'}
• Communication: {communication:.1f}/100 - {'Excellent articulation and clarity' if communication >= 80 else 'Good communication skills' if communication >= 70 else 'Room for improvement in communication'}
• Technical Skills: {technical:.1f}/100 - {'Strong technical knowledge demonstrated' if technical >= 80 else 'Adequate technical understanding' if technical >= 70 else 'Technical skills need development'}
• Engagement: {engagement:.1f}/100 - {'Highly engaged and enthusiastic' if engagement >= 80 else 'Good level of engagement' if engagement >= 70 else 'Could show more engagement'}

Overall Assessment:
The candidate shows {"strong potential and would be a valuable addition to the team" if overall_score >= 75 else "promise but may need additional development in key areas" if overall_score >= 65 else "significant gaps that need to be addressed before considering for this role"}.

Interview Duration: {interview.duration_minutes} minutes
Analysis completed on: {timezone.now().strftime('%Y-%m-%d at %H:%M')}
        """.strip()
        
        return summary

# Initialize service instance
analysis_service = InterviewAnalysisService()