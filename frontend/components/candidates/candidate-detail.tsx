"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Award, 
  Globe, 
  Github, 
  Linkedin, 
  FileText, 
  Edit, 
  Download,
  Star,
  Clock,
  ChevronLeft
} from "lucide-react"
import { formatDistanceToNow, format } from 'date-fns'

interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string
  status: string
  summary: string
  experience_years: number | null
  skills: string[]
  current_position: string
  current_company: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
  work_experience: Array<{
    position: string
    company: string
    duration: string
    description: string
  }>
  certifications: Array<{
    name: string
    issuer: string
    year: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  cv_file_url: string | null
  extraction_confidence: number
  extracted_text: string
  created_at: string
  updated_at: string
  created_by_name: string
  recent_activities: Array<{
    id: number
    activity_type: string
    description: string
    performed_by_name: string
    created_at: string
  }>
  tags: Array<{
    id: number
    name: string
    color: string
  }>
}

interface CandidateDetailProps {
  candidateId: string
  onBack: () => void
  onEdit: (id: string) => void
}

const CANDIDATE_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { value: 'offered', label: 'Offered', color: 'bg-green-100 text-green-800' },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
]

export default function CandidateDetail({ candidateId, onBack, onEdit }: CandidateDetailProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mock data for development
  const mockCandidate: Candidate = {
    id: candidateId,
    full_name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234 567 8900',
    status: 'interview',
    summary: 'Experienced full-stack developer with 5+ years of experience in modern web technologies. Passionate about creating scalable applications and leading development teams.',
    experience_years: 5,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Django', 'PostgreSQL', 'Docker', 'AWS', 'Git', 'Agile'],
    current_position: 'Senior Full Stack Developer',
    current_company: 'Tech Corp Inc.',
    linkedin_url: 'https://linkedin.com/in/johnsmith',
    github_url: 'https://github.com/johnsmith',
    portfolio_url: 'https://johnsmith.dev',
    education: [
      {
        institution: 'University of Technology',
        degree: 'Bachelor of Computer Science',
        year: '2019'
      },
      {
        institution: 'Tech Institute',
        degree: 'Master of Software Engineering',
        year: '2021'
      }
    ],
    work_experience: [
      {
        position: 'Senior Full Stack Developer',
        company: 'Tech Corp Inc.',
        duration: '2022 - Present',
        description: 'Lead development of scalable web applications using React and Node.js. Mentor junior developers and collaborate with product teams to deliver high-quality solutions.'
      },
      {
        position: 'Software Developer',
        company: 'StartupXYZ',
        duration: '2020 - 2022',
        description: 'Developed and maintained web applications using Python/Django and React. Implemented CI/CD pipelines and improved application performance by 40%.'
      },
      {
        position: 'Junior Developer',
        company: 'WebDev Solutions',
        duration: '2019 - 2020',
        description: 'Built responsive web applications and learned modern development practices. Contributed to multiple client projects and gained experience in agile development.'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        year: '2023'
      },
      {
        name: 'React Developer Certification',
        issuer: 'Meta',
        year: '2022'
      }
    ],
    languages: [
      {
        language: 'English',
        proficiency: 'Native'
      },
      {
        language: 'Spanish',
        proficiency: 'Conversational'
      }
    ],
    cv_file_url: '/api/candidates/1/cv/',
    extraction_confidence: 0.95,
    extracted_text: 'Full CV text content would be here...',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z',
    created_by_name: 'Admin User',
    recent_activities: [
      {
        id: 1,
        activity_type: 'status_change',
        description: 'Status changed from screening to interview',
        performed_by_name: 'Jane Doe',
        created_at: '2024-01-16T14:30:00Z'
      },
      {
        id: 2,
        activity_type: 'note',
        description: 'Candidate shows strong technical skills and good communication',
        performed_by_name: 'John Manager',
        created_at: '2024-01-15T16:45:00Z'
      }
    ],
    tags: [
      { id: 1, name: 'Frontend', color: '#3B82F6' },
      { id: 2, name: 'Senior', color: '#10B981' },
      { id: 3, name: 'Full Stack', color: '#8B5CF6' }
    ]
  }

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/candidates/${candidateId}/`)
        // const data = await response.json()
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        setCandidate(mockCandidate)
      } catch (err) {
        setError('Failed to load candidate details')
        console.error('Error fetching candidate:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidate()
  }, [candidateId])

  const getStatusBadgeClass = (status: string) => {
    const statusConfig = CANDIDATE_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading candidate details...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !candidate) {
    return (
      <Alert>
        <AlertDescription>{error || 'Candidate not found'}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Details</h1>
        </div>
        <div className="flex space-x-2">
          {candidate.cv_file_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={candidate.cv_file_url} target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </a>
            </Button>
          )}
          <Button size="sm" onClick={() => onEdit(candidate.id)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Candidate Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-lg">{getInitials(candidate.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{candidate.full_name}</h2>
                <Badge variant="secondary" className={getStatusBadgeClass(candidate.status)}>
                  {CANDIDATE_STATUSES.find(s => s.value === candidate.status)?.label || candidate.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                    {candidate.email}
                  </a>
                </div>
                {candidate.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.current_position && candidate.current_company && (
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {candidate.current_position} at {candidate.current_company}
                  </div>
                )}
                {candidate.experience_years && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {candidate.experience_years} years experience
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-3 mb-4">
                {candidate.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                )}
                {candidate.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {candidate.portfolio_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>

              {/* Tags */}
              {candidate.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.tags.map(tag => (
                    <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Summary */}
              {candidate.summary && (
                <p className="text-gray-700 mb-4">{candidate.summary}</p>
              )}

              {/* Extraction Confidence */}
              <div className="flex items-center text-sm">
                <FileText className="h-4 w-4 mr-2" />
                <span className="text-gray-600 mr-2">CV Extraction Confidence:</span>
                <span className={`font-medium ${getConfidenceColor(candidate.extraction_confidence)}`}>
                  {Math.round(candidate.extraction_confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-gray-900">{candidate.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{candidate.email}</p>
                </div>
                {candidate.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{candidate.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge variant="secondary" className={getStatusBadgeClass(candidate.status)}>
                    {CANDIDATE_STATUSES.find(s => s.value === candidate.status)?.label || candidate.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {candidate.current_position && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Position</p>
                    <p className="text-gray-900">{candidate.current_position}</p>
                  </div>
                )}
                {candidate.current_company && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Company</p>
                    <p className="text-gray-900">{candidate.current_company}</p>
                  </div>
                )}
                {candidate.experience_years && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Years of Experience</p>
                    <p className="text-gray-900">{candidate.experience_years} years</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Languages & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidate.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {candidate.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{lang.language}</span>
                        <Badge variant="outline">{lang.proficiency}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {candidate.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Certifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {candidate.certifications.map((cert, index) => (
                      <div key={index}>
                        <p className="font-medium text-gray-900">{cert.name}</p>
                        <p className="text-sm text-gray-600">{cert.issuer} • {cert.year}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.work_experience.length > 0 ? (
                <div className="space-y-6">
                  {candidate.work_experience.map((exp, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-gray-600">{exp.company}</p>
                        </div>
                        <Badge variant="outline">{exp.duration}</Badge>
                      </div>
                      <p className="text-gray-700 text-sm">{exp.description}</p>
                      {index < candidate.work_experience.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No work experience information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.education.length > 0 ? (
                <div className="space-y-4">
                  {candidate.education.map((edu, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-600">{edu.institution}</p>
                        </div>
                        <Badge variant="outline">{edu.year}</Badge>
                      </div>
                      {index < candidate.education.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Skills & Technologies</CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills information available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.recent_activities.length > 0 ? (
                <div className="space-y-4">
                  {candidate.recent_activities.map((activity) => (
                    <div key={activity.id} className="flex space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500">
                          By {activity.performed_by_name} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-500">Added By</p>
              <p className="text-gray-900">{candidate.created_by_name}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Created</p>
              <p className="text-gray-900">{format(new Date(candidate.created_at), 'PPP')}</p>
            </div>
            <div>
              <p className="font-medium text-gray-500">Last Updated</p>
              <p className="text-gray-900">{format(new Date(candidate.updated_at), 'PPP')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
