"use client"

import { useState } from "react"
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
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const interviews = [
  {
    id: 1,
    candidate: "Sarah Johnson",
    position: "Senior Frontend Developer",
    date: "2024-01-15",
    duration: "45 min",
    status: "completed",
    score: 92,
    aiAnalysis: "Excellent technical knowledge and communication skills",
    videoUrl: "/placeholder.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
    avatar: "/placeholder.svg?height=40&width=40",
    insights: {
      confidence: 95,
      communication: 88,
      technical: 94,
      engagement: 90,
    },
  },
  {
    id: 2,
    candidate: "Michael Chen",
    position: "Product Manager",
    date: "2024-01-14",
    duration: "50 min",
    status: "processing",
    score: null,
    aiAnalysis: "AI analysis in progress...",
    videoUrl: "/placeholder.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
    avatar: "/placeholder.svg?height=40&width=40",
    insights: null,
  },
  {
    id: 3,
    candidate: "Emily Rodriguez",
    position: "UX Designer",
    date: "2024-01-12",
    duration: "40 min",
    status: "completed",
    score: 95,
    aiAnalysis: "Outstanding design thinking and user empathy",
    videoUrl: "/placeholder.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
    avatar: "/placeholder.svg?height=40&width=40",
    insights: {
      confidence: 92,
      communication: 96,
      technical: 93,
      engagement: 98,
    },
  },
  {
    id: 4,
    candidate: "David Kim",
    position: "Data Scientist",
    date: "2024-01-11",
    duration: "55 min",
    status: "failed",
    score: 65,
    aiAnalysis: "Technical skills present but communication needs improvement",
    videoUrl: "/placeholder.mp4",
    thumbnail: "/placeholder.svg?height=120&width=200",
    avatar: "/placeholder.svg?height=40&width=40",
    insights: {
      confidence: 70,
      communication: 60,
      technical: 85,
      engagement: 65,
    },
  },
]

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

const getScoreColor = (score: number | null) => {
  if (!score) return "text-gray-500"
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

export default function InterviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedInterview, setSelectedInterview] = useState<number | null>(null)

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-white/50">
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
        {filteredInterviews.map((interview) => (
          <Card key={interview.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={interview.avatar || "/placeholder.svg"} alt={interview.candidate} />
                    <AvatarFallback>
                      {interview.candidate
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{interview.candidate}</CardTitle>
                    <CardDescription className="text-sm">{interview.position}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reprocess
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Thumbnail */}
              <div className="relative rounded-lg overflow-hidden bg-slate-100">
                <img
                  src={interview.thumbnail || "/placeholder.svg"}
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
                  {getStatusIcon(interview.status)}
                  <Badge className={getStatusColor(interview.status)}>
                    {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                  </Badge>
                </div>
                {interview.score && (
                  <div className="flex items-center space-x-1">
                    <Brain className={`w-4 h-4 ${getScoreColor(interview.score)}`} />
                    <span className={`font-bold text-lg ${getScoreColor(interview.score)}`}>{interview.score}</span>
                  </div>
                )}
              </div>

              {/* Interview Details */}
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{interview.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{interview.duration}</span>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Brain className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">AI Analysis</p>
                    <p className="text-sm text-slate-600">{interview.aiAnalysis}</p>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {interview.insights && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Performance Insights</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Confidence</span>
                        <span>{interview.insights.confidence}%</span>
                      </div>
                      <Progress value={interview.insights.confidence} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Communication</span>
                        <span>{interview.insights.communication}%</span>
                      </div>
                      <Progress value={interview.insights.communication} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Technical</span>
                        <span>{interview.insights.technical}%</span>
                      </div>
                      <Progress value={interview.insights.technical} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Engagement</span>
                        <span>{interview.insights.engagement}%</span>
                      </div>
                      <Progress value={interview.insights.engagement} className="h-2" />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  View Analysis
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInterviews.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <FileVideo className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No interviews found</h3>
            <p className="text-slate-600 text-center mb-4">
              Upload your first interview video to get started with AI-powered analysis.
            </p>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload First Interview
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
