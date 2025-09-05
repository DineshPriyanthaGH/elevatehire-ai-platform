"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, X, Plus, Save, AlertCircle, FileText, Download } from "lucide-react"
import { toast } from 'sonner'
import { Candidate } from '@/lib/api'

interface EditCandidateFormProps {
  candidateId: string
  onSubmit: (formData: FormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const CANDIDATE_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' }
]

export default function EditCandidateForm({
  candidateId,
  onSubmit,
  onCancel,
  loading = false
}: EditCandidateFormProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    status: 'new',
    summary: '',
    experience_years: '',
    current_position: '',
    current_company: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  })
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [newLanguage, setNewLanguage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [cvFile, setCvFile] = useState<File | null>(null)

  // Load candidate data
  useEffect(() => {
    const loadCandidate = async () => {
      try {
        const { candidateApi } = await import('@/lib/api')
        const result = await candidateApi.getById(candidateId)
        
        if (result.success && result.data) {
          const candidate = result.data
          setCandidate(candidate)
          setFormData({
            full_name: candidate.full_name || '',
            email: candidate.email || '',
            phone: candidate.phone || '',
            status: candidate.status || 'new',
            summary: candidate.summary || '',
            experience_years: candidate.experience_years?.toString() || '',
            current_position: candidate.current_position || '',
            current_company: candidate.current_company || '',
            location: candidate.location || '',
            linkedin_url: candidate.linkedin_url || '',
            github_url: candidate.github_url || '',
            portfolio_url: candidate.portfolio_url || ''
          })
          setSkills(candidate.skills || [])
          setLanguages(candidate.languages || [])
        } else {
          toast.error('Failed to load candidate data')
        }
      } catch (error) {
        console.error('Error loading candidate:', error)
        toast.error('Failed to load candidate data')
      } finally {
        setIsLoading(false)
      }
    }

    loadCandidate()
  }, [candidateId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(skill => skill !== skillToRemove))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages(prev => [...prev, newLanguage.trim()])
      setNewLanguage('')
    }
  }

  const removeLanguage = (languageToRemove: string) => {
    setLanguages(prev => prev.filter(language => language !== languageToRemove))
  }

  const handleCvDownload = async () => {
    if (!candidate?.cv_file) {
      toast.error('No CV file available')
      return
    }

    try {
      const { candidateApi } = await import('@/lib/api')
      const result = await candidateApi.downloadCv(candidateId)
      
      if (result.success && result.data) {
        // Create download link
        const url = window.URL.createObjectURL(result.data)
        const link = document.createElement('a')
        link.href = url
        link.download = `${candidate.full_name}_CV.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success('CV downloaded successfully')
      } else {
        throw new Error(result.error || 'Failed to download CV')
      }
    } catch (error) {
      console.error('Error downloading CV:', error)
      toast.error('Failed to download CV')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.experience_years && (isNaN(Number(formData.experience_years)) || Number(formData.experience_years) < 0)) {
      newErrors.experience_years = 'Experience years must be a valid positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitFormData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          if (key === 'experience_years' && value) {
            submitFormData.append(key, value.toString())
          } else {
            submitFormData.append(key, value)
          }
        }
      })

      // Add skills and languages as JSON
      submitFormData.append('skills', JSON.stringify(skills))
      submitFormData.append('languages', JSON.stringify(languages))

      // Add CV file if uploaded
      if (cvFile) {
        submitFormData.append('cv_file', cvFile)
      }

      await onSubmit(submitFormData)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading candidate data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!candidate) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load candidate data</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Candidate</h1>
          <p className="text-gray-600">Update candidate information</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                />
                {errors.full_name && (
                  <p className="text-sm text-red-600 mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Brief summary or bio"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_position">Current Position</Label>
                <Input
                  id="current_position"
                  value={formData.current_position}
                  onChange={(e) => handleInputChange('current_position', e.target.value)}
                  placeholder="e.g., Senior Developer"
                />
              </div>

              <div>
                <Label htmlFor="current_company">Current Company</Label>
                <Input
                  id="current_company"
                  value={formData.current_company}
                  onChange={(e) => handleInputChange('current_company', e.target.value)}
                  placeholder="e.g., Tech Corp"
                />
              </div>

              <div>
                <Label htmlFor="experience_years">Years of Experience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={formData.experience_years}
                  onChange={(e) => handleInputChange('experience_years', e.target.value)}
                  placeholder="e.g., 5"
                />
                {errors.experience_years && (
                  <p className="text-sm text-red-600 mt-1">{errors.experience_years}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., New York, NY"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeSkill(skill)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" variant="outline" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Languages */}
        <Card>
          <CardHeader>
            <CardTitle>Languages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {languages.map((language, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {language}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeLanguage(language)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                placeholder="Add a language"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              />
              <Button type="button" variant="outline" onClick={addLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => handleInputChange('github_url', e.target.value)}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Management */}
        <Card>
          <CardHeader>
            <CardTitle>CV Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.cv_file && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Current CV</p>
                    <p className="text-sm text-gray-600">
                      Uploaded on {new Date(candidate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={handleCvDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="cv_file">Upload New CV (Optional)</Label>
              <Input
                id="cv_file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-gray-600 mt-1">
                Upload a new CV to replace the current one. Supported formats: PDF, DOC, DOCX
              </p>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
