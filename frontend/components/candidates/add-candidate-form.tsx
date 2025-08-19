"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface CandidateFormData {
  full_name: string
  email: string
  phone: string
  status: string
  summary: string
  experience_years: number | null
  current_position: string
  current_company: string
  linkedin_url: string
  github_url: string
  portfolio_url: string
  cv_file: File | null
}

interface AddCandidateFormProps {
  onSubmit: (data: FormData) => Promise<void>
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

export default function AddCandidateForm({ onSubmit, loading = false }: AddCandidateFormProps) {
  const [formData, setFormData] = useState<CandidateFormData>({
    full_name: '',
    email: '',
    phone: '',
    status: 'new',
    summary: '',
    experience_years: null,
    current_position: '',
    current_company: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    cv_file: null
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadProgress, setUploadProgress] = useState<number>(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && typeof file === 'object' && 'name' in file && 'size' in file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, cv_file: 'File size must be less than 10MB' }))
        return
      }
      
      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.txt']
      const fileName = file.name || ''
      const fileExtension = '.' + fileName.split('.').pop()?.toLowerCase()
      if (!allowedTypes.includes(fileExtension)) {
        setErrors(prev => ({ 
          ...prev, 
          cv_file: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
        }))
        return
      }
      
      setFormData(prev => ({ ...prev, cv_file: file }))
      setErrors(prev => ({ ...prev, cv_file: '' }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    multiple: false
  })

  const handleInputChange = (field: keyof CandidateFormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const removeFile = () => {
    setFormData(prev => ({ ...prev, cv_file: null }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.cv_file) {
      newErrors.cv_file = 'CV file is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const submitData = new FormData()
    
    // Add all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        if (key === 'cv_file' && value && typeof value === 'object' && 'name' in value) {
          submitData.append(key, value as File)
        } else if (key !== 'cv_file') {
          submitData.append(key, String(value))
        }
      }
    })
    
    try {
      await onSubmit(submitData)
      // Reset form on success
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        status: 'new',
        summary: '',
        experience_years: null,
        current_position: '',
        current_company: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        cv_file: null
      })
      setErrors({})
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Candidate</CardTitle>
        <CardDescription>
          Upload a CV and the system will automatically extract candidate details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CV Upload */}
          <div className="space-y-2">
            <Label htmlFor="cv_file">CV Upload *</Label>
            {!formData.cv_file ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                  isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
                  errors.cv_file ? "border-red-500" : ""
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  {isDragActive
                    ? "Drop the CV file here..."
                    : "Drag & drop a CV file here, or click to select"}
                </p>
                <p className="text-xs text-gray-500">
                  Supports PDF, DOC, DOCX, TXT (max 10MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <File className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">{formData.cv_file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(formData.cv_file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.cv_file && (
              <p className="text-sm text-red-500">{errors.cv_file}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="John Doe"
                className={errors.full_name ? "border-red-500" : ""}
              />
              {errors.full_name && (
                <p className="text-sm text-red-500">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="john@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
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

          {/* Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_position">Current Position</Label>
              <Input
                id="current_position"
                value={formData.current_position}
                onChange={(e) => handleInputChange('current_position', e.target.value)}
                placeholder="Software Engineer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_company">Current Company</Label>
              <Input
                id="current_company"
                value={formData.current_company}
                onChange={(e) => handleInputChange('current_company', e.target.value)}
                placeholder="Tech Corp"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience_years">Years of Experience</Label>
            <Input
              id="experience_years"
              type="number"
              min="0"
              max="50"
              value={formData.experience_years || ''}
              onChange={(e) => handleInputChange('experience_years', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Brief professional summary..."
              rows={3}
            />
          </div>

          {/* Links */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                value={formData.linkedin_url}
                onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                value={formData.github_url}
                onChange={(e) => handleInputChange('github_url', e.target.value)}
                placeholder="https://github.com/johndoe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                value={formData.portfolio_url}
                onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                placeholder="https://johndoe.com"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Adding Candidate...' : 'Add Candidate'}
            </Button>
          </div>
        </form>

        {/* Info Alert */}
        <Alert className="mt-6">
          <AlertDescription>
            <strong>Auto-extraction:</strong> Once you upload a CV, our system will automatically extract 
            candidate information like skills, education, and work experience. You can review and edit 
            the details after submission.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
