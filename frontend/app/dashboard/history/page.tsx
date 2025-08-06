"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Star,
  Eye,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
  User,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const interviewHistory = [
  {
    id: 1,
    candidate: "Sarah Johnson",
    position: "Senior Frontend Developer",
    department: "Engineering",
    date: "2024-01-15",
    time: "10:00 AM",
    duration: "45 min",
    interviewer: "John Smith",
    status: "hired",
    score: 92,
    outcome: "Hired",
    notes: "Excellent technical skills and great cultural fit",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    candidate: "Michael Chen",
    position: "Product Manager",
    department: "Product",
    date: "2024-01-14",
    time: "2:00 PM",
    duration: "60 min",
    interviewer: "Jane Doe",
    status: "rejected",
    score: 75,
    outcome: "Not Selected",
    notes: "Good experience but lacks strategic thinking",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    candidate: "Emily Rodriguez",
    position: "UX Designer",
    department: "Design",
    date: "2024-01-12",
    time: "11:30 AM",
    duration: "45 min",
    interviewer: "Bob Wilson",
    status: "hired",
    score: 95,
    outcome: "Hired",
    notes: "Outstanding portfolio and design thinking",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    candidate: "David Kim",
    position: "Data Scientist",
    department: "Engineering",
    date: "2024-01-11",
    time: "3:00 PM",
    duration: "50 min",
    interviewer: "Alice Brown",
    status: "pending",
    score: 85,
    outcome: "Under Review",
    notes: "Strong technical background, awaiting final decision",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    candidate: "Lisa Wang",
    position: "Backend Developer",
    department: "Engineering",
    date: "2024-01-10",
    time: "9:00 AM",
    duration: "45 min",
    interviewer: "John Smith",
    status: "hired",
    score: 90,
    outcome: "Hired",
    notes: "Solid coding skills and team player attitude",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    candidate: "James Wilson",
    position: "DevOps Engineer",
    department: "Engineering",
    date: "2024-01-09",
    time: "4:00 PM",
    duration: "55 min",
    interviewer: "Tom Davis",
    status: "rejected",
    score: 72,
    outcome: "Not Selected",
    notes: "Limited experience with cloud platforms",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "hired":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "pending":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "hired":
      return "bg-green-100 text-green-700"
    case "rejected":
      return "bg-red-100 text-red-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const filteredHistory = interviewHistory.filter((interview) => {
    const matchesSearch =
      interview.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.interviewer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || interview.department === departmentFilter

    return matchesSearch && matchesStatus && matchesDepartment
  })

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interview History</h1>
            <p className="text-slate-600">Complete record of all past interviews and their outcomes</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Interviews</p>
                <p className="text-2xl font-bold text-slate-900">{interviewHistory.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Hired</p>
                <p className="text-2xl font-bold text-green-600">
                  {interviewHistory.filter((i) => i.status === "hired").length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (interviewHistory.filter((i) => i.status === "hired").length / interviewHistory.length) * 100,
                  )}
                  %
                </p>
              </div>
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(interviewHistory.reduce((acc, i) => acc + i.score, 0) / interviewHistory.length)}
                </p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by candidate, position, or interviewer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="Product">Product</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interview History List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Interview Records</CardTitle>
          <CardDescription>Detailed history of all conducted interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHistory.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={interview.avatar || "/placeholder.svg"} alt={interview.candidate} />
                    <AvatarFallback>
                      {interview.candidate
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h4 className="font-semibold text-slate-900">{interview.candidate}</h4>
                      <Badge className={getStatusColor(interview.status)}>{interview.outcome}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">
                      {interview.position} • {interview.department}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{interview.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{interview.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{interview.interviewer}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {getStatusIcon(interview.status)}
                      <div className="flex items-center space-x-1">
                        <Brain className={`w-4 h-4 ${getScoreColor(interview.score)}`} />
                        <span className={`font-bold text-lg ${getScoreColor(interview.score)}`}>{interview.score}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{interview.duration}</p>
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
                        Download Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No interviews found</h3>
            <p className="text-slate-600 text-center mb-4">
              Try adjusting your search criteria to find the interviews you're looking for.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setDepartmentFilter("all")
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
