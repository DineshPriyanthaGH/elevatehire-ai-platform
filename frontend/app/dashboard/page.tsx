"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
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
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

const monthlyData = [
  { month: "Jan", interviews: 45, hires: 12 },
  { month: "Feb", interviews: 52, hires: 15 },
  { month: "Mar", interviews: 48, hires: 11 },
  { month: "Apr", interviews: 61, hires: 18 },
  { month: "May", interviews: 55, hires: 16 },
  { month: "Jun", interviews: 67, hires: 22 },
]

const scoreDistribution = [
  { range: "90-100", count: 15, color: "#10b981" },
  { range: "80-89", count: 28, color: "#3b82f6" },
  { range: "70-79", count: 35, color: "#f59e0b" },
  { range: "60-69", count: 18, color: "#ef4444" },
  { range: "<60", count: 8, color: "#6b7280" },
]

const recentInterviews = [
  {
    id: 1,
    candidate: "Sarah Johnson",
    position: "Senior Developer",
    score: 92,
    status: "completed",
    date: "2024-01-15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    candidate: "Michael Chen",
    position: "Product Manager",
    score: 88,
    status: "completed",
    date: "2024-01-14",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    candidate: "Emily Rodriguez",
    position: "UX Designer",
    score: 95,
    status: "completed",
    date: "2024-01-14",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    candidate: "David Kim",
    position: "Data Scientist",
    score: 85,
    status: "scheduled",
    date: "2024-01-16",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600">Welcome back! Here's your recruitment overview.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Interview
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total Interviews</CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">328</div>
            <div className="flex items-center text-xs text-slate-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Average Score</CardTitle>
            <Star className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">84.2</div>
            <div className="flex items-center text-xs text-slate-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+3.2 points</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">68%</div>
            <div className="flex items-center text-xs text-slate-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>+5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-slate-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">156h</div>
            <div className="flex items-center text-xs text-slate-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>This month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
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
              <LineChart data={monthlyData}>
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
            <CardDescription>Latest candidate assessments and scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={interview.avatar || "/placeholder.svg"}
                      alt={interview.candidate}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{interview.candidate}</p>
                      <p className="text-sm text-slate-600">{interview.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-slate-900">{interview.score}</span>
                        <Badge
                          variant={interview.score >= 90 ? "default" : interview.score >= 80 ? "secondary" : "outline"}
                          className={
                            interview.score >= 90
                              ? "bg-green-100 text-green-700"
                              : interview.score >= 80
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                          }
                        >
                          {interview.score >= 90 ? "Excellent" : interview.score >= 80 ? "Good" : "Average"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{interview.date}</p>
                    </div>
                    <div className="flex items-center">
                      {interview.status === "completed" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
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
    </div>
  )
}
