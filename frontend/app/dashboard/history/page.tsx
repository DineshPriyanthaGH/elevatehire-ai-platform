"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  RefreshCw,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { historyApi, Interview, HistoryFilters, HistoryStats, HistoryResponse } from "@/lib/api"

const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-500" />
    case "cancelled":
      return <XCircle className="w-4 h-4 text-red-500" />
    case "scheduled":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />
    default:
      return <Clock className="w-4 h-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    case "scheduled":
      return "bg-yellow-100 text-yellow-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function HistoryPage() {
  const router = useRouter()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Data state
  const [historyData, setHistoryData] = useState<HistoryResponse | null>(null)
  const [historyStats, setHistoryStats] = useState<HistoryStats | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/auth')
      return
    }
    setLoading(false)
    loadHistoryData()
  }, [router])

  // Load history data
  const loadHistoryData = async () => {
    try {
      setDataLoading(true)
      setError(null)
      
      const filters: HistoryFilters = {
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        dateRange: dateFilter === 'all' ? undefined : dateFilter,
        page: currentPage,
        pageSize: pageSize
      }
      
      const [historyResult, statsResult] = await Promise.all([
        historyApi.getInterviewHistory(filters),
        historyApi.getHistoryStats()
      ])
      
      if (historyResult.success && historyResult.data) {
        setHistoryData(historyResult.data)
        setInterviews(historyResult.data.results)
      }
      
      if (statsResult.success && statsResult.data) {
        setHistoryStats(statsResult.data)
      }
      
      if (!historyResult.success) {
        setError(historyResult.error || 'Failed to load history data')
      }
      
    } catch (error) {
      console.error('Error loading history data:', error)
      setError('Failed to load history data. Please try again.')
    } finally {
      setDataLoading(false)
    }
  }

  // Refresh handler
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadHistoryData()
    setRefreshing(false)
  }

  // Filter change handlers
  useEffect(() => {
    if (!loading) {
      setCurrentPage(1) // Reset to first page when filters change
      loadHistoryData()
    }
  }, [searchTerm, statusFilter, dateFilter])

  // Page change handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    loadHistoryData()
  }

  // Export handler
  const handleExport = async () => {
    try {
      const filters: HistoryFilters = {
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        dateRange: dateFilter === 'all' ? undefined : dateFilter
      }
      
      const result = await historyApi.exportHistory(filters)
      
      if (result.success && result.data) {
        // Create download link
        const url = window.URL.createObjectURL(result.data)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `interview_history_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
      setError('Failed to export history data')
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
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
            <h1 className="text-3xl font-bold text-slate-900">Interview History</h1>
            <p className="text-slate-600">Complete record of all past interviews and their outcomes</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-slate-300 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-8 bg-slate-300 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : historyStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Interviews</p>
                  <p className="text-2xl font-bold text-slate-900">{historyStats.total_interviews}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Activity className="w-3 h-3 mr-1" />
                    <span>{historyStats.this_month_interviews} this month</span>
                  </div>
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
                  <p className="text-2xl font-bold text-green-600">{historyStats.hired_count}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    <span>{historyStats.pending_count} pending</span>
                  </div>
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
                  <p className="text-2xl font-bold text-blue-600">{historyStats.success_rate.toFixed(1)}%</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>From {historyStats.total_candidates} candidates</span>
                  </div>
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
                  <p className="text-2xl font-bold text-purple-600">{historyStats.average_score.toFixed(1)}</p>
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <Brain className="w-3 h-3 mr-1" />
                    <span>AI Assessment</span>
                  </div>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
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
          {dataLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-slate-300 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-slate-300 rounded w-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-8 bg-slate-300 rounded"></div>
                    <div className="w-8 h-8 bg-slate-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>
                        {interview.candidate.full_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-slate-900">{interview.candidate.full_name}</h4>
                        <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">
                        {interview.title} • {interview.interview_type.name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(interview.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(interview.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{interview.interviewer_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {getStatusIcon(interview.status)}
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span className="font-medium text-slate-900">{interview.duration_minutes}min</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">{interview.meeting_type}</p>
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
                          <FileText className="w-4 h-4 mr-2" />
                          View Analysis
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {historyData && historyData.count > pageSize && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, historyData.count)} of {historyData.count} interviews
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page {currentPage} of {Math.ceil(historyData.count / pageSize)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === Math.ceil(historyData.count / pageSize)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!dataLoading && interviews.length === 0 && (
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
                setDateFilter("all")
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
