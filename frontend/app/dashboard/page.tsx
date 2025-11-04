"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  Upload,
  BarChart3,
  ArrowUpRight,
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Eye,
  FileText,
  Activity
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { dashboardApi, DashboardStats, MonthlyTrend, ScoreDistribution, RecentActivity } from "@/lib/api"

// User type definition
interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  username?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Dashboard data state
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null)
  
  const router = useRouter()

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setDataLoading(true)
      setError(null)
      
      const [statsResult, trendsResult, distributionResult, activityResult] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getMonthlyTrends(),
        dashboardApi.getScoreDistribution(),
        dashboardApi.getRecentActivity()
      ])
      
      if (statsResult.success && statsResult.data) setStats(statsResult.data)
      if (trendsResult.success && trendsResult.data) setMonthlyTrends(trendsResult.data)
      if (distributionResult.success && distributionResult.data) setScoreDistribution(distributionResult.data)
      if (activityResult.success && activityResult.data) setRecentActivity(activityResult.data)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setDataLoading(false)
    }
  }

  // Refresh data handler
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token) {
      router.push('/auth')
      return
    }
    
    if (userData) {
      setUser(JSON.parse(userData))
      setLoading(false)
      // Load dashboard data after user is set
      loadDashboardData()
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
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
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back, {user?.first_name || 'Recruiter'}! Here's your recruitment overview.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Interview
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
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

      {/* Loading State */}
      {dataLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-lg bg-slate-100">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-slate-300 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-slate-300 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-300 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      {!dataLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Interviews</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.total_interviews}</div>
              <div className="flex items-center text-xs text-slate-600">
                <Activity className="w-3 h-3 mr-1 text-blue-600" />
                <span className="text-blue-600">{stats.upcoming_interviews} upcoming</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Average Score</CardTitle>
              <Star className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.average_score.toFixed(1)}</div>
              <div className="flex items-center text-xs text-slate-600">
                <Star className="w-3 h-3 mr-1 text-yellow-600" />
                <span className="text-yellow-600">{stats.success_rate.toFixed(1)}% success rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Total Candidates</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.total_candidates}</div>
              <div className="flex items-center text-xs text-slate-600">
                <Users className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-600">{stats.recent_candidates} recent candidates</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-slate-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.time_saved}h</div>
              <div className="flex items-center text-xs text-slate-600">
                <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                <span className="text-green-600">This month</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {!dataLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Interview Trends</span>
            </CardTitle>
            <CardDescription>Monthly interview and hiring statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="interviews" stroke="#3b82f6" strokeWidth={2} name="Interviews" />
                <Line type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={2} name="Hires" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Score Distribution</span>
            </CardTitle>
            <CardDescription>AI assessment score ranges</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </div>
      )}

      {/* Recent Activity */}
      {!dataLoading && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Latest candidate assessments and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.interviews.slice(0, 3).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Interview with {interview.candidate.full_name}</p>
                      <p className="text-sm text-slate-600">{interview.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{new Date(interview.scheduled_date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={interview.status === "completed" ? "default" : "secondary"}>
                      {interview.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentActivity?.candidates.slice(0, 2).map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{candidate.first_name} {candidate.last_name}</p>
                      <p className="text-sm text-slate-600">{candidate.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{new Date(candidate.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline">
                      candidate
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload New Interview
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
            <Button className="w-full justify-start bg-transparent" variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-slate-900 mb-3">AI Insights</h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-800">
                    <Brain className="w-4 h-4 inline mr-1" />
                    Top performing candidates show 23% higher engagement scores
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-800">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Interview success rate improved by 15% this month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  )
}
