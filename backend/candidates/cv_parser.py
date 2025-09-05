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
        
        # Calculate confidence score and breakdown
        confidence = self.calculate_confidence(text, contact_info, name, skills)
        confidence_breakdown = self.get_confidence_breakdown(text, contact_info, name, skills)
        
        # Prepare result
        result = {
            'extracted_text': text,
            'extraction_confidence': confidence,
            'confidence_breakdown': confidence_breakdown,
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
        """Calculate comprehensive confidence score for extraction quality"""
        confidence_metrics = {
            'text_quality': 0.0,
            'contact_completeness': 0.0,
            'personal_info': 0.0,
            'professional_content': 0.0,
            'structure_recognition': 0.0,
            'data_validation': 0.0
        }
        
        # 1. Text Quality Assessment (25% weight)
        text_quality_score = self._assess_text_quality(text)
        confidence_metrics['text_quality'] = text_quality_score * 0.25
        
        # 2. Contact Information Completeness (20% weight)
        contact_score = self._assess_contact_completeness(contact_info)
        confidence_metrics['contact_completeness'] = contact_score * 0.20
        
        # 3. Personal Information Extraction (15% weight)
        personal_score = self._assess_personal_info(name, text)
        confidence_metrics['personal_info'] = personal_score * 0.15
        
        # 4. Professional Content Detection (20% weight)
        professional_score = self._assess_professional_content(skills, text)
        confidence_metrics['professional_content'] = professional_score * 0.20
        
        # 5. Document Structure Recognition (10% weight)
        structure_score = self._assess_document_structure(text)
        confidence_metrics['structure_recognition'] = structure_score * 0.10
        
        # 6. Data Validation (10% weight)
        validation_score = self._assess_data_validation(contact_info, text)
        confidence_metrics['data_validation'] = validation_score * 0.10
        
        # Calculate total confidence
        total_confidence = sum(confidence_metrics.values())
        
        # Apply penalties for common extraction issues
        total_confidence = self._apply_extraction_penalties(total_confidence, text, contact_info)
        
        return min(1.0, max(0.0, total_confidence))
    
    def _assess_text_quality(self, text: str) -> float:
        """Assess the quality of extracted text"""
        if not text:
            return 0.0
        
        score = 0.0
        
        # Length assessment
        if len(text) > 500:
            score += 0.3
        elif len(text) > 200:
            score += 0.2
        elif len(text) > 50:
            score += 0.1
        
        # Character quality (proper text vs garbage)
        total_chars = len(text)
        if total_chars > 0:
            letter_chars = sum(1 for c in text if c.isalpha())
            letter_ratio = letter_chars / total_chars
            
            if letter_ratio > 0.6:
                score += 0.3
            elif letter_ratio > 0.4:
                score += 0.2
            elif letter_ratio > 0.2:
                score += 0.1
        
        # Word formation quality
        words = text.split()
        if words:
            valid_words = sum(1 for word in words if len(word) > 1 and word.isalpha())
            word_quality = valid_words / len(words)
            
            if word_quality > 0.7:
                score += 0.2
            elif word_quality > 0.5:
                score += 0.15
            elif word_quality > 0.3:
                score += 0.1
        
        # Sentence structure
        sentences = re.split(r'[.!?]+', text)
        if len(sentences) > 3:
            score += 0.2
        elif len(sentences) > 1:
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_contact_completeness(self, contact_info: Dict) -> float:
        """Assess completeness of contact information"""
        score = 0.0
        
        # Email (most important)
        if contact_info.get('email'):
            email = contact_info['email']
            if self._is_valid_email(email):
                score += 0.5
            else:
                score += 0.2  # Partial credit for attempting extraction
        
        # Phone number
        if contact_info.get('phone'):
            phone = contact_info['phone']
            if self._is_valid_phone(phone):
                score += 0.3
            else:
                score += 0.1
        
        # Professional URLs
        if contact_info.get('linkedin_url'):
            score += 0.1
        
        if contact_info.get('github_url'):
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_personal_info(self, name: Optional[str], text: str) -> float:
        """Assess personal information extraction"""
        score = 0.0
        
        # Name extraction
        if name:
            name_words = name.split()
            if len(name_words) >= 2:  # First and last name
                score += 0.6
            elif len(name_words) == 1:
                score += 0.3
            
            # Check if name appears reasonable
            if all(word.isalpha() and word[0].isupper() for word in name_words):
                score += 0.2
        
        # Location indicators
        location_patterns = [
            r'\b(city|state|country|address|location)\b',
            r'\b\d{5}\b',  # ZIP codes
            r'\b[A-Z]{2}\b',  # State abbreviations
        ]
        
        for pattern in location_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                score += 0.1
                break
        
        # Age or graduation year indicators
        year_pattern = r'\b(19|20)\d{2}\b'
        if re.search(year_pattern, text):
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_professional_content(self, skills: List[str], text: str) -> float:
        """Assess professional content extraction"""
        score = 0.0
        
        # Skills assessment
        if skills:
            # Quantity bonus
            if len(skills) >= 10:
                score += 0.3
            elif len(skills) >= 5:
                score += 0.2
            elif len(skills) >= 2:
                score += 0.1
            
            # Quality assessment - check for diverse skill categories
            skill_categories = {
                'programming': ['python', 'javascript', 'java', 'c++', 'c#'],
                'frameworks': ['react', 'angular', 'django', 'spring'],
                'databases': ['mysql', 'postgresql', 'mongodb'],
                'cloud': ['aws', 'azure', 'gcp', 'docker'],
                'tools': ['git', 'jenkins', 'jira']
            }
            
            categories_found = 0
            for category, category_skills in skill_categories.items():
                if any(skill.lower() in [s.lower() for s in skills] for skill in category_skills):
                    categories_found += 1
            
            if categories_found >= 3:
                score += 0.2
            elif categories_found >= 2:
                score += 0.1
        
        # Professional keywords
        professional_keywords = [
            'experience', 'project', 'develop', 'manage', 'lead', 'implement',
            'design', 'analyze', 'collaborate', 'responsible', 'achieve',
            'improve', 'optimize', 'create', 'maintain', 'support'
        ]
        
        keyword_count = sum(1 for keyword in professional_keywords 
                          if keyword in text.lower())
        
        if keyword_count >= 8:
            score += 0.3
        elif keyword_count >= 5:
            score += 0.2
        elif keyword_count >= 3:
            score += 0.1
        
        # Company or position indicators
        position_patterns = [
            r'\b(engineer|developer|manager|analyst|specialist|consultant|director)\b',
            r'\b(senior|junior|lead|principal|chief)\b',
            r'\b(software|web|data|system|network|security)\b'
        ]
        
        position_matches = 0
        for pattern in position_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                position_matches += 1
        
        if position_matches >= 3:
            score += 0.2
        elif position_matches >= 1:
            score += 0.1
        
        return min(1.0, score)
    
    def _assess_document_structure(self, text: str) -> float:
        """Assess how well document structure was recognized"""
        score = 0.0
        
        # Section headers detected
        sections_found = 0
        for section_name, pattern in self.section_patterns.items():
            if pattern.search(text):
                sections_found += 1
        
        if sections_found >= 4:
            score += 0.4
        elif sections_found >= 3:
            score += 0.3
        elif sections_found >= 2:
            score += 0.2
        elif sections_found >= 1:
            score += 0.1
        
        # Bullet points or lists
        if re.search(r'[•\-\*]\s', text):
            score += 0.2
        
        # Date patterns (education/experience dates)
        date_patterns = [
            r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b',
            r'\b\d{1,2}/\d{4}\b',
            r'\b\d{4}\s*-\s*\d{4}\b',
            r'\b\d{4}\s*-\s*present\b'
        ]
        
        date_matches = 0
        for pattern in date_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                date_matches += 1
        
        if date_matches >= 2:
            score += 0.3
        elif date_matches >= 1:
            score += 0.2
        
        # Academic degrees
        degree_patterns = [
            r'\b(bachelor|master|phd|doctorate|diploma|certificate)\b',
            r'\b(b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|ph\.?d\.?)\b'
        ]
        
        for pattern in degree_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                score += 0.1
                break
        
        return min(1.0, score)
    
    def _assess_data_validation(self, contact_info: Dict, text: str) -> float:
        """Assess data validation and consistency"""
        score = 0.0
        
        # Email validation
        if contact_info.get('email'):
            if self._is_valid_email(contact_info['email']):
                score += 0.3
        
        # Phone validation
        if contact_info.get('phone'):
            if self._is_valid_phone(contact_info['phone']):
                score += 0.3
        
        # URL validation
        if contact_info.get('linkedin_url'):
            if 'linkedin.com' in contact_info['linkedin_url'].lower():
                score += 0.2
        
        if contact_info.get('github_url'):
            if 'github.com' in contact_info['github_url'].lower():
                score += 0.2
        
        return min(1.0, score)
    
    def _apply_extraction_penalties(self, confidence: float, text: str, contact_info: Dict) -> float:
        """Apply penalties for common extraction issues"""
        penalties = 0.0
        
        # Penalty for very short text (likely extraction failure)
        if len(text) < 100:
            penalties += 0.3
        
        # Penalty for no contact information
        if not contact_info.get('email') and not contact_info.get('phone'):
            penalties += 0.2
        
        # Penalty for garbage text (too many special characters)
        if text:
            special_char_ratio = sum(1 for c in text if not c.isalnum() and not c.isspace()) / len(text)
            if special_char_ratio > 0.3:
                penalties += 0.2
        
        # Penalty for repetitive content
        words = text.split()
        if len(words) > 10:
            unique_words = set(words)
            uniqueness_ratio = len(unique_words) / len(words)
            if uniqueness_ratio < 0.3:
                penalties += 0.15
        
        return confidence - penalties
    
    def _is_valid_email(self, email: str) -> bool:
        """Validate email format"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def _is_valid_phone(self, phone: str) -> bool:
        """Validate phone number format"""
        # Remove all non-digit characters except +
        clean_phone = re.sub(r'[^\d+]', '', phone)
        
        # Check if it's a reasonable phone number
        if clean_phone.startswith('+'):
            return len(clean_phone) >= 8 and len(clean_phone) <= 16
        else:
            return len(clean_phone) >= 7 and len(clean_phone) <= 15
    
    def get_confidence_breakdown(self, text: str, contact_info: Dict, name: Optional[str], skills: List[str]) -> Dict[str, Any]:
        """Get detailed confidence breakdown for analysis"""
        breakdown = {
            'overall_confidence': self.calculate_confidence(text, contact_info, name, skills),
            'metrics': {
                'text_quality': {
                    'score': self._assess_text_quality(text),
                    'weight': 0.25,
                    'weighted_score': self._assess_text_quality(text) * 0.25,
                    'details': {
                        'text_length': len(text),
                        'character_quality': self._get_character_quality(text),
                        'word_count': len(text.split()) if text else 0
                    }
                },
                'contact_completeness': {
                    'score': self._assess_contact_completeness(contact_info),
                    'weight': 0.20,
                    'weighted_score': self._assess_contact_completeness(contact_info) * 0.20,
                    'details': {
                        'email_found': bool(contact_info.get('email')),
                        'phone_found': bool(contact_info.get('phone')),
                        'linkedin_found': bool(contact_info.get('linkedin_url')),
                        'github_found': bool(contact_info.get('github_url'))
                    }
                },
                'personal_info': {
                    'score': self._assess_personal_info(name, text),
                    'weight': 0.15,
                    'weighted_score': self._assess_personal_info(name, text) * 0.15,
                    'details': {
                        'name_extracted': bool(name),
                        'name_quality': self._assess_name_quality(name) if name else 0
                    }
                },
                'professional_content': {
                    'score': self._assess_professional_content(skills, text),
                    'weight': 0.20,
                    'weighted_score': self._assess_professional_content(skills, text) * 0.20,
                    'details': {
                        'skills_count': len(skills),
                        'professional_keywords': self._count_professional_keywords(text)
                    }
                },
                'structure_recognition': {
                    'score': self._assess_document_structure(text),
                    'weight': 0.10,
                    'weighted_score': self._assess_document_structure(text) * 0.10,
                    'details': {
                        'sections_found': self._count_sections_found(text),
                        'dates_found': self._count_dates_found(text)
                    }
                },
                'data_validation': {
                    'score': self._assess_data_validation(contact_info, text),
                    'weight': 0.10,
                    'weighted_score': self._assess_data_validation(contact_info, text) * 0.10,
                    'details': {
                        'email_valid': self._is_valid_email(contact_info.get('email', '')),
                        'phone_valid': self._is_valid_phone(contact_info.get('phone', ''))
                    }
                }
            },
            'penalties_applied': self._get_penalties_breakdown(text, contact_info),
            'recommendations': self._get_improvement_recommendations(text, contact_info, name, skills)
        }
        
        return breakdown
    
    def _get_character_quality(self, text: str) -> float:
        """Get character quality ratio"""
        if not text:
            return 0.0
        return sum(1 for c in text if c.isalpha()) / len(text)
    
    def _assess_name_quality(self, name: str) -> float:
        """Assess quality of extracted name"""
        if not name:
            return 0.0
        
        words = name.split()
        if len(words) >= 2 and all(word.isalpha() and word[0].isupper() for word in words):
            return 1.0
        elif len(words) == 1 and name.isalpha() and name[0].isupper():
            return 0.6
        else:
            return 0.3
    
    def _count_professional_keywords(self, text: str) -> int:
        """Count professional keywords in text"""
        keywords = ['experience', 'project', 'develop', 'manage', 'lead', 'implement']
        return sum(1 for keyword in keywords if keyword in text.lower())
    
    def _count_sections_found(self, text: str) -> int:
        """Count sections found in text"""
        return sum(1 for pattern in self.section_patterns.values() if pattern.search(text))
    
    def _count_dates_found(self, text: str) -> int:
        """Count date patterns found in text"""
        patterns = [r'\b\d{4}\b', r'\b\d{1,2}/\d{4}\b', r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b']
        return sum(1 for pattern in patterns if re.search(pattern, text, re.IGNORECASE))
    
    def _get_penalties_breakdown(self, text: str, contact_info: Dict) -> Dict[str, float]:
        """Get breakdown of penalties applied"""
        penalties = {}
        
        if len(text) < 100:
            penalties['short_text'] = 0.3
        
        if not contact_info.get('email') and not contact_info.get('phone'):
            penalties['no_contact_info'] = 0.2
        
        if text:
            special_char_ratio = sum(1 for c in text if not c.isalnum() and not c.isspace()) / len(text)
            if special_char_ratio > 0.3:
                penalties['high_special_chars'] = 0.2
        
        return penalties
    
    def _get_improvement_recommendations(self, text: str, contact_info: Dict, name: Optional[str], skills: List[str]) -> List[str]:
        """Get recommendations for improving extraction"""
        recommendations = []
        
        if len(text) < 200:
            recommendations.append("CV text appears too short - consider checking file format or OCR quality")
        
        if not contact_info.get('email'):
            recommendations.append("No email address found - verify email is present in CV")
        
        if not name:
            recommendations.append("Name not detected - ensure name is clearly visible at top of CV")
        
        if len(skills) < 3:
            recommendations.append("Few skills detected - verify skills section is properly formatted")
        
        if self._count_sections_found(text) < 2:
            recommendations.append("Few document sections recognized - check CV structure and formatting")
        
        return recommendations
    
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
