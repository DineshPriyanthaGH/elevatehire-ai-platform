import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Upload,
  FileVideo,
  X,
  CheckCircle,
  AlertCircle,
  Brain,
} from "lucide-react"

interface UploadVideoDialogProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: (interviewData: any) => void
}

interface UploadedFile {
  file: File
  preview: string
}

export function UploadVideoDialog({ isOpen, onClose, onUploadComplete }: UploadVideoDialogProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form data
  const [candidateName, setCandidateName] = useState("")
  const [position, setPosition] = useState("")
  const [interviewType, setInterviewType] = useState("")
  const [notes, setNotes] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload MP4, AVI, MOV, or WMV files.')
        return
      }

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024 // 500MB
      if (file.size > maxSize) {
        setError('File is too large. Maximum size is 500MB.')
        return
      }

      setError(null)
      setUploadedFile({
        file,
        preview: URL.createObjectURL(file)
      })
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/avi': ['.avi'],
      'video/mov': ['.mov'],
      'video/wmv': ['.wmv']
    },
    maxFiles: 1
  })

  const removeFile = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.preview)
      setUploadedFile(null)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile || !candidateName || !position) {
      setError('Please fill in all required fields and select a video file.')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Import API functions
      const { interviewApi, interviewAIAnalysisApi, candidateApi } = await import('@/lib/api')

      // Step 1: Create or get candidate
      setUploadProgress(10)
      let candidateId: string

      // Try to find existing candidate by name (simple search)
      const candidatesResult = await candidateApi.getAll()
      if (candidatesResult.success && candidatesResult.data) {
        const existingCandidate = candidatesResult.data.results.find(
          (c: any) => c.full_name.toLowerCase() === candidateName.toLowerCase()
        )
        
        if (existingCandidate) {
          candidateId = existingCandidate.id
        } else {
          // Create new candidate using FormData
          const candidateFormData = new FormData()
          candidateFormData.append('first_name', candidateName.split(' ')[0] || candidateName)
          candidateFormData.append('last_name', candidateName.split(' ').slice(1).join(' ') || '')
          candidateFormData.append('email', `${candidateName.toLowerCase().replace(/\s+/g, '.')}@example.com`)
          candidateFormData.append('phone', '000-000-0000')
          candidateFormData.append('current_position', position)
          candidateFormData.append('skills', JSON.stringify([]))
          
          const newCandidateResult = await candidateApi.create(candidateFormData)
          
          if (!newCandidateResult.success || !newCandidateResult.data) {
            throw new Error('Failed to create candidate: ' + newCandidateResult.error)
          }
          candidateId = newCandidateResult.data.id
        }
      } else {
        throw new Error('Failed to fetch candidates')
      }

      // Step 2: Get available interview types and interviewers
      setUploadProgress(30)
      const [interviewTypesResult, interviewersResult] = await Promise.all([
        interviewApi.getInterviewTypes(),
        interviewApi.getInterviewers()
      ])

      if (!interviewTypesResult.success || !interviewersResult.success || !interviewTypesResult.data || !interviewersResult.data) {
        throw new Error('Failed to fetch interview configuration')
      }

      // Get default interview type and interviewer
      const defaultInterviewType = interviewTypesResult.data.find(
        (type: any) => type.name.toLowerCase().includes(interviewType.toLowerCase() || 'technical')
      ) || interviewTypesResult.data[0]

      const defaultInterviewer = interviewersResult.data[0] // Use first available interviewer

      // Step 3: Create interview
      setUploadProgress(50)
      const interviewData = {
        title: `${defaultInterviewType.name} - ${candidateName}`,
        description: notes || `Video interview for ${position} position`,
        candidate: candidateId,
        interview_type: defaultInterviewType.id,
        interviewer: defaultInterviewer.id,
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration_minutes: defaultInterviewType.duration_minutes || 60,
        meeting_type: 'video_call',
        status: 'completed', // Set as completed since we're uploading a recording
        priority: 'normal'
      }

      const createInterviewResult = await interviewApi.create(interviewData)
      if (!createInterviewResult.success || !createInterviewResult.data) {
        throw new Error('Failed to create interview: ' + createInterviewResult.error)
      }

      const createdInterview = createInterviewResult.data

      // Step 4: Upload video to the created interview
      setUploadProgress(70)
      const uploadResult = await interviewAIAnalysisApi.uploadVideo(createdInterview.id, uploadedFile.file)
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload video: ' + uploadResult.error)
      }

      setUploadProgress(100)
      setSuccess(true)
      
      // Call completion callback with the real interview data
      setTimeout(() => {
        onUploadComplete?.(createdInterview)
        handleClose()
      }, 1500)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.preview)
    }
    setUploadedFile(null)
    setError(null)
    setSuccess(false)
    setUploadProgress(0)
    setIsUploading(false)
    setCandidateName("")
    setPosition("")
    setInterviewType("")
    setNotes("")
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileVideo className="w-5 h-5 text-blue-600" />
            <span>Upload Interview Video</span>
          </DialogTitle>
          <DialogDescription>
            Upload a video interview for AI-powered analysis and candidate evaluation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Success State */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Video uploaded successfully! AI analysis will begin shortly.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading video...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* File Upload Area */}
          {!uploadedFile && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isDragActive ? 'Drop the video here' : 'Drag & drop your video'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    or <span className="text-blue-600 font-medium">browse files</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Supports MP4, AVI, MOV, WMV up to 500MB
                </p>
              </div>
            </div>
          )}

          {/* Uploaded File Preview */}
          {uploadedFile && (
            <div className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileVideo className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(uploadedFile.file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="candidate-name">Candidate Name *</Label>
              <Input
                id="candidate-name"
                placeholder="Enter candidate name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <Input
                id="position"
                placeholder="e.g., Senior Frontend Developer"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interview-type">Interview Type</Label>
              <Select value={interviewType} onValueChange={setInterviewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select interview type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="cultural-fit">Cultural Fit</SelectItem>
                  <SelectItem value="final">Final Round</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>AI Analysis</Label>
              <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg border">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-700">Auto-enabled for all uploads</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional context about the interview..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!uploadedFile || !candidateName || !position || isUploading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}