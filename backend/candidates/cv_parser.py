"""
CV Parsing utilities for extracting candidate information from uploaded CVs
"""
import re
import io
import logging
from typing import Dict, List, Any, Optional
from pathlib import Path

# PDF parsing
try:
    import PyPDF2
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# Word document parsing
try:
    import docx
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

logger = logging.getLogger(__name__)

class CVParser:
    """Parse and extract information from CV files"""
    
    def __init__(self):
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(r'(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}')
        self.linkedin_pattern = re.compile(r'linkedin\.com/in/[\w-]+', re.IGNORECASE)
        self.github_pattern = re.compile(r'github\.com/[\w-]+', re.IGNORECASE)
        
        # Common section headers
        self.section_patterns = {
            'experience': re.compile(r'(work\s+)?experience|employment|professional\s+background', re.IGNORECASE),
            'education': re.compile(r'education|academic|qualifications|degrees?', re.IGNORECASE),
            'skills': re.compile(r'skills|competencies|technical|technologies', re.IGNORECASE),
            'summary': re.compile(r'summary|profile|objective|about', re.IGNORECASE),
            'certifications': re.compile(r'certifications?|certificates?|licenses?', re.IGNORECASE),
            'languages': re.compile(r'languages?|linguistic', re.IGNORECASE),
        }
        
        # Common skills keywords
        self.skill_keywords = [
            # Programming languages
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
            'typescript', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
            
            # Frameworks and libraries
            'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'fastapi',
            'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle',
            'cassandra', 'dynamodb', 'firebase',
            
            # Cloud and DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
            'gitlab', 'circleci', 'terraform', 'ansible', 'nginx', 'apache',
            
            # Data Science and AI
            'machine learning', 'deep learning', 'data science', 'pandas', 'numpy',
            'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'opencv', 'nltk',
            
            # Other tools
            'excel', 'powerbi', 'tableau', 'figma', 'adobe', 'photoshop', 'illustrator',
            'jira', 'confluence', 'slack', 'notion', 'trello'
        ]
    
    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        if not PDF_AVAILABLE:
            logger.warning("PDF parsing not available. Install PyPDF2 and pdfplumber.")
            return ""
        
        text = ""
        
        try:
            # Try with pdfplumber first (better for complex layouts)
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}. Trying PyPDF2...")
            
            try:
                # Fallback to PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            except Exception as e:
                logger.error(f"PyPDF2 also failed: {e}")
        
        return text.strip()
    
    def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        if not DOCX_AVAILABLE:
            logger.warning("DOCX parsing not available. Install python-docx.")
            return ""
        
        try:
            doc = Document(io.BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {e}")
            return ""
    
    def extract_text_from_file(self, file_path: str, file_content: bytes) -> str:
        """Extract text from uploaded file based on extension"""
        file_extension = Path(file_path).suffix.lower()
        
        if file_extension == '.pdf':
            return self.extract_text_from_pdf(file_content)
        elif file_extension in ['.docx', '.doc']:
            return self.extract_text_from_docx(file_content)
        elif file_extension == '.txt':
            try:
                return file_content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    return file_content.decode('latin-1')
                except UnicodeDecodeError:
                    logger.error("Could not decode text file")
                    return ""
        else:
            logger.warning(f"Unsupported file type: {file_extension}")
            return ""
    
    def extract_contact_info(self, text: str) -> Dict[str, str]:
        """Extract contact information from text"""
        contact_info = {}
        
        # Extract email
        emails = self.email_pattern.findall(text)
        if emails:
            contact_info['email'] = emails[0]
        
        # Extract phone
        phones = self.phone_pattern.findall(text)
        if phones:
            # Clean up phone number
            phone = re.sub(r'[^\d+]', '', phones[0])
            if len(phone) >= 7:  # Minimum reasonable phone number length
                contact_info['phone'] = phones[0]
        
        # Extract LinkedIn
        linkedin_matches = self.linkedin_pattern.findall(text)
        if linkedin_matches:
            contact_info['linkedin_url'] = f"https://{linkedin_matches[0]}"
        
        # Extract GitHub
        github_matches = self.github_pattern.findall(text)
        if github_matches:
            contact_info['github_url'] = f"https://{github_matches[0]}"
        
        return contact_info
    
    def extract_name(self, text: str) -> Optional[str]:
        """Extract candidate name from CV text"""
        lines = text.split('\n')
        
        # Look for name in first few lines
        for i, line in enumerate(lines[:5]):
            line = line.strip()
            if not line:
                continue
            
            # Skip common headers
            if any(word in line.lower() for word in ['curriculum', 'vitae', 'resume', 'cv']):
                continue
            
            # Look for name patterns (2-3 words, proper case)
            words = line.split()
            if 2 <= len(words) <= 3:
                if all(word.isalpha() and word[0].isupper() for word in words):
                    return line
        
        return None
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from CV text"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skill_keywords:
            if skill.lower() in text_lower:
                # Check if it's a whole word match
                pattern = r'\b' + re.escape(skill.lower()) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.append(skill.title())
        
        return list(set(found_skills))  # Remove duplicates
    
    def extract_experience_years(self, text: str) -> Optional[int]:
        """Extract years of experience from text"""
        patterns = [
            r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
            r'experience[:\s]*(\d+)\+?\s*years?',
            r'(\d+)\+?\s*years?\s*in\s*(?:the\s*)?(?:field|industry)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                try:
                    years = int(matches[0])
                    if 0 <= years <= 50:  # Reasonable range
                        return years
                except ValueError:
                    continue
        
        return None
    
    def extract_sections(self, text: str) -> Dict[str, str]:
        """Extract different sections from CV"""
        sections = {}
        lines = text.split('\n')
        current_section = None
        section_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                if current_section and section_content:
                    section_content.append('')
                continue
            
            # Check if this line is a section header
            section_found = None
            for section_name, pattern in self.section_patterns.items():
                if pattern.search(line):
                    section_found = section_name
                    break
            
            if section_found:
                # Save previous section
                if current_section and section_content:
                    sections[current_section] = '\n'.join(section_content).strip()
                
                # Start new section
                current_section = section_found
                section_content = []
            elif current_section:
                section_content.append(line)
        
        # Save last section
        if current_section and section_content:
            sections[current_section] = '\n'.join(section_content).strip()
        
        return sections
    
    def parse_cv(self, file_path: str, file_content: bytes) -> Dict[str, Any]:
        """Main method to parse CV and extract all information"""
        # Extract text
        text = self.extract_text_from_file(file_path, file_content)
        
        if not text:
            return {
                'extracted_text': '',
                'extraction_confidence': 0.0,
                'error': 'Could not extract text from file'
            }
        
        # Extract information
        contact_info = self.extract_contact_info(text)
        name = self.extract_name(text)
        skills = self.extract_skills(text)
        experience_years = self.extract_experience_years(text)
        sections = self.extract_sections(text)
        
        # Calculate confidence score
        confidence = self.calculate_confidence(text, contact_info, name, skills)
        
        # Prepare result
        result = {
            'extracted_text': text,
            'extraction_confidence': confidence,
            'full_name': name or '',
            'email': contact_info.get('email', ''),
            'phone': contact_info.get('phone', ''),
            'linkedin_url': contact_info.get('linkedin_url', ''),
            'github_url': contact_info.get('github_url', ''),
            'skills': skills,
            'experience_years': experience_years,
            'summary': sections.get('summary', '')[:500],  # Limit summary length
            'education': self.parse_education(sections.get('education', '')),
            'work_experience': self.parse_work_experience(sections.get('experience', '')),
            'certifications': self.parse_certifications(sections.get('certifications', '')),
            'languages': self.parse_languages(sections.get('languages', '')),
        }
        
        return result
    
    def calculate_confidence(self, text: str, contact_info: Dict, name: Optional[str], skills: List[str]) -> float:
        """Calculate confidence score for extraction"""
        confidence = 0.0
        
        # Base confidence for having text
        if text:
            confidence += 0.2
        
        # Confidence for contact info
        if contact_info.get('email'):
            confidence += 0.3
        if contact_info.get('phone'):
            confidence += 0.2
        
        # Confidence for name
        if name:
            confidence += 0.2
        
        # Confidence for skills
        if skills:
            confidence += min(0.3, len(skills) * 0.05)
        
        return min(1.0, confidence)
    
    def parse_education(self, education_text: str) -> List[Dict[str, str]]:
        """Parse education section"""
        if not education_text:
            return []
        
        # Simple parsing - can be enhanced
        lines = [line.strip() for line in education_text.split('\n') if line.strip()]
        education = []
        
        for line in lines:
            if any(word in line.lower() for word in ['university', 'college', 'institute', 'school']):
                education.append({
                    'institution': line,
                    'degree': '',
                    'year': ''
                })
        
        return education
    
    def parse_work_experience(self, experience_text: str) -> List[Dict[str, str]]:
        """Parse work experience section"""
        if not experience_text:
            return []
        
        # Simple parsing - can be enhanced
        lines = [line.strip() for line in experience_text.split('\n') if line.strip()]
        experience = []
        
        current_job = {}
        for line in lines:
            # Look for job titles or companies
            if any(word in line.lower() for word in ['engineer', 'manager', 'developer', 'analyst', 'specialist']):
                if current_job:
                    experience.append(current_job)
                current_job = {'position': line, 'company': '', 'duration': '', 'description': ''}
            elif current_job:
                if not current_job.get('company') and len(line.split()) <= 5:
                    current_job['company'] = line
                else:
                    current_job['description'] += line + ' '
        
        if current_job:
            experience.append(current_job)
        
        return experience
    
    def parse_certifications(self, cert_text: str) -> List[Dict[str, str]]:
        """Parse certifications section"""
        if not cert_text:
            return []
        
        lines = [line.strip() for line in cert_text.split('\n') if line.strip()]
        certifications = []
        
        for line in lines:
            certifications.append({
                'name': line,
                'issuer': '',
                'year': ''
            })
        
        return certifications
    
    def parse_languages(self, lang_text: str) -> List[Dict[str, str]]:
        """Parse languages section"""
        if not lang_text:
            return []
        
        lines = [line.strip() for line in lang_text.split('\n') if line.strip()]
        languages = []
        
        for line in lines:
            languages.append({
                'language': line,
                'proficiency': ''
            })
        
        return languages

# Global parser instance
cv_parser = CVParser()
