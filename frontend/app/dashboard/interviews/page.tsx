"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Progress } from "@/components/ui/progress"
import {
  Upload,
  Play,
  RotateCcw,
  Download,
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  Clock,
  Brain,
  FileVideo,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AIAnalysisDialog } from "@/components/interviews/ai-analysis-dialog"
import { UploadVideoDialog } from "@/components/interviews/upload-video-dialog"
import { interviewApi, interviewAIAnalysisApi } from "@/lib/api"

interface Interview {
  id: string
  title: string
  candidate: {
    id: string
    full_name: string
    email: string
  }
  interview_type: {
    id: string
    name: string
    color: string
  }
  scheduled_date: string
  end_time: string
  duration_minutes: number
  status: string
  meeting_type: string
  priority: string
  
  // AI Analysis fields
  ai_analysis_status: string
  confidence_score?: number
  communication_score?: number
  technical_score?: number
  engagement_score?: number
  ai_summary?: string
  ai_sentiment?: string
  ai_keywords?: string[]
  ai_recommendations?: string[]
  video_file?: string
  transcript?: string
  ai_processed_at?: string
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "processing":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700"
    case "processing":
      return "bg-yellow-100 text-yellow-700"
    case "failed":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getScoreColor = (score: number | null | undefined) => {
  if (!score) return "text-gray-500"
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

const calculateOverallScore = (interview: Interview): number | null => {
  if (!interview) return null
  const { confidence_score, communication_score, technical_score, engagement_score } = interview
  if (confidence_score != null && communication_score != null && technical_score != null && engagement_score != null) {
    return Math.round((confidence_score + communication_score + technical_score + engagement_score) / 4)
  }
  return null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}

export default function InterviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false)
  const [selectedInterviewForAnalysis, setSelectedInterviewForAnalysis] = useState<Interview | null>(null)

  // Fetch interviews on component mount
  useEffect(() => {
    fetchInterviews()
  }, [])

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await interviewApi.getAll()
      if (response.success && response.data) {
        const interviewsData = Array.isArray(response.data) ? response.data : (response.data.results || [])
        setInterviews(interviewsData.map(interview => ({
          ...interview,
          candidate: interview.candidate || { id: '', full_name: 'Unknown', email: '' },
          interview_type: interview.interview_type || { id: '', name: 'Unknown', color: '#gray' },
          ai_analysis_status: interview.ai_analysis_status || 'pending'
        })))
      } else {
        setError("Failed to fetch interviews")
        setInterviews([])
      }
    } catch (err) {
      setError("An error occurred while fetching interviews")
      setInterviews([])
      console.error("Error fetching interviews:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      (interview.candidate?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (interview.interview_type?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && interview.ai_analysis_status === "completed") ||
      (statusFilter === "processing" && interview.ai_analysis_status === "processing") ||
      (statusFilter === "failed" && interview.ai_analysis_status === "failed") ||
      (statusFilter === "pending" && (interview.ai_analysis_status === "pending" || !interview.ai_analysis_status))

    return matchesSearch && matchesStatus
  })

  const handleUploadComplete = (interviewData: any) => {
    // Refresh interviews list
    fetchInterviews()
  }

  const handleViewAnalysis = (interview: Interview) => {
    setSelectedInterviewForAnalysis(interview)
    setShowAnalysisDialog(true)
  }

  const handleReprocessAnalysis = async (interviewId: string) => {
    try {
      const response = await interviewAIAnalysisApi.reanalyze(interviewId)
      if (response.success) {
        // Refresh interviews to show updated status
        fetchInterviews()
      }
    } catch (err) {
      console.error("Error reprocessing analysis:", err)
    }
  }

  const handleDownloadTranscript = async (interviewId: string) => {
    try {
      const response = await interviewAIAnalysisApi.downloadTranscript(interviewId)
      if (response.success && response.data) {
        // Create download link
        const url = URL.createObjectURL(response.data)
        const a = document.createElement('a')
        a.href = url
        a.download = `interview_transcript_${interviewId}.txt`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error("Error downloading transcript:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Loading interviews...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Interviews</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchInterviews}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interviews</h1>
            <p className="text-slate-600">Upload, analyze, and review video interviews with AI insights</p>
          </div>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => setShowUploadDialog(true)}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Interview
        </Button>
      </div>

      {/* Upload Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <FileVideo className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Video Interview</h3>
              <p className="text-slate-600">
                Drag and drop your interview video or click to browse. Our AI will analyze the content automatically.
              </p>
            </div>
            <div 
              className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-white/50 cursor-pointer hover:bg-white/70 transition-colors"
              onClick={() => setShowUploadDialog(true)}
            >
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-blue-400 mx-auto" />
                <div>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Choose File
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">Supports MP4, MOV, AVI up to 500MB</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search interviews by candidate or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interviews List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInterviews.map((interview) => {
          const overallScore = calculateOverallScore(interview)
          
          return (
            <Card key={interview.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder.svg" alt={interview.candidate?.full_name || 'Candidate'} />
                      <AvatarFallback>
                        {(interview.candidate?.full_name || 'NN')
                          .split(" ")
                          .map((n: string) => n[0] || '')
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{interview.candidate?.full_name || 'Unknown Candidate'}</CardTitle>
                      <CardDescription className="text-sm">{interview.title || 'Interview'}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewAnalysis(interview)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Analysis
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadTranscript(interview.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Transcript
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReprocessAnalysis(interview.id)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reprocess Analysis
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Thumbnail */}
                <div className="relative rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src="/placeholder.svg"
                    alt="Interview thumbnail"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button size="sm" className="bg-white/90 text-slate-900 hover:bg-white">
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                  </div>
                </div>

                {/* Status and Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(interview.ai_analysis_status)}
                    <Badge className={getStatusColor(interview.ai_analysis_status || 'pending')}>
                      {(interview.ai_analysis_status || 'pending').charAt(0).toUpperCase() + (interview.ai_analysis_status || 'pending').slice(1)}
                    </Badge>
                  </div>
                  {overallScore && (
                    <div className="flex items-center space-x-1">
                      <Brain className={`w-4 h-4 ${getScoreColor(overallScore)}`} />
                      <span className={`font-bold text-lg ${getScoreColor(overallScore)}`}>{overallScore}</span>
                    </div>
                  )}
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(interview.scheduled_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(interview.duration_minutes)}</span>
                  </div>
                </div>

                {/* AI Analysis */}
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">AI Analysis</p>
                      <p className="text-sm text-slate-600">
                        {interview.ai_summary || 
                         (interview.ai_analysis_status === "processing" ? "AI analysis in progress..." :
                          interview.ai_analysis_status === "failed" ? "Analysis failed. Please reprocess." :
                          interview.ai_analysis_status === "pending" ? "Analysis pending. Upload video to start." :
                          "No analysis available")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Insights */}
                {interview.confidence_score && interview.communication_score && 
                 interview.technical_score && interview.engagement_score && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-700">Performance Insights</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Confidence</span>
                          <span>{Math.round(interview.confidence_score)}%</span>
                        </div>
                        <Progress value={interview.confidence_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Communication</span>
                          <span>{Math.round(interview.communication_score)}%</span>
                        </div>
                        <Progress value={interview.communication_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Technical</span>
                          <span>{Math.round(interview.technical_score)}%</span>
                        </div>
                        <Progress value={interview.technical_score} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Engagement</span>
                          <span>{Math.round(interview.engagement_score)}%</span>
                        </div>
                        <Progress value={interview.engagement_score} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewAnalysis(interview)}
                    disabled={interview.ai_analysis_status === "pending"}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Analysis
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDownloadTranscript(interview.id)}
                    disabled={!interview.transcript}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredInterviews.length === 0 && !loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileVideo className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {interviews.length === 0 ? "No interviews yet" : "No interviews found"}
            </h3>
            <p className="text-slate-600 text-center mb-4">
              {interviews.length === 0 
                ? "Upload your first interview video to get started with AI-powered analysis."
                : "Try adjusting your search or filter criteria."}
            </p>
            {interviews.length === 0 && (
              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setShowUploadDialog(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Interview
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Video Dialog */}
      <UploadVideoDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadComplete={handleUploadComplete}
      />

      {/* AI Analysis Dialog */}
      {selectedInterviewForAnalysis && (
        <AIAnalysisDialog
          isOpen={showAnalysisDialog}
          onClose={() => {
            setShowAnalysisDialog(false)
            setSelectedInterviewForAnalysis(null)
          }}
          interview={selectedInterviewForAnalysis}
        />
      )}
    </div>
  )
}