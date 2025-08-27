"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { BarChart3, TrendingUp, Users, Download, Filter, Brain, Clock, Star, Target } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const monthlyTrends = [
  { month: "Jul", interviews: 45, hires: 12, avgScore: 82 },
  { month: "Aug", interviews: 52, hires: 15, avgScore: 84 },
  { month: "Sep", interviews: 48, hires: 11, avgScore: 81 },
  { month: "Oct", interviews: 61, hires: 18, avgScore: 86 },
  { month: "Nov", interviews: 55, hires: 16, avgScore: 85 },
  { month: "Dec", interviews: 67, hires: 22, avgScore: 88 },
]

const departmentData = [
  { department: "Engineering", interviews: 45, hires: 15, successRate: 33 },
  { department: "Product", interviews: 28, hires: 12, successRate: 43 },
  { department: "Design", interviews: 22, hires: 8, successRate: 36 },
  { department: "Marketing", interviews: 18, hires: 6, successRate: 33 },
  { department: "Sales", interviews: 15, hires: 7, successRate: 47 },
]

const skillsAnalysis = [
  { skill: "Technical", score: 85 },
  { skill: "Communication", score: 78 },
  { skill: "Problem Solving", score: 82 },
  { skill: "Leadership", score: 75 },
  { skill: "Creativity", score: 80 },
  { skill: "Teamwork", score: 88 },
]

const performanceMetrics = [
  { name: "Excellent (90-100)", value: 25, color: "#10b981" },
  { name: "Good (80-89)", value: 35, color: "#3b82f6" },
  { name: "Average (70-79)", value: 28, color: "#f59e0b" },
  { name: "Below Average (<70)", value: 12, color: "#ef4444" },
]

const topPerformers = [
  {
    name: "Emily Rodriguez",
    position: "UX Designer",
    score: 95,
    department: "Design",
    hireDate: "2024-01-12",
  },
  {
    name: "Sarah Johnson",
    position: "Senior Frontend Developer",
    score: 92,
    department: "Engineering",
    hireDate: "2024-01-15",
  },
  {
    name: "Michael Chen",
    position: "Product Manager",
    score: 88,
    department: "Product",
    hireDate: "2024-01-14",
  },
]

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
            <p className="text-slate-600">Comprehensive insights into your recruitment performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Interviews</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">328</div>
            <div className="flex items-center text-xs text-blue-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">68%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+5% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Avg AI Score</CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">84.2</div>
            <div className="flex items-center text-xs text-purple-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+3.2 points</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Time to Hire</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">12 days</div>
            <div className="flex items-center text-xs text-orange-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>-2 days faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Monthly Trends</span>
            </CardTitle>
            <CardDescription>Interview volume and success metrics over time</CardDescription>
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
                <Line type="monotone" dataKey="avgScore" stroke="#8b5cf6" strokeWidth={2} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <span>Performance Distribution</span>
            </CardTitle>
            <CardDescription>AI assessment score distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={performanceMetrics}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {performanceMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Analysis & Skills Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Success rates by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="interviews" fill="#3b82f6" name="Interviews" />
                <Bar dataKey="hires" fill="#10b981" name="Hires" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Skills Analysis */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Skills Analysis</CardTitle>
            <CardDescription>Average scores across different skill areas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsAnalysis}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Highest scoring candidates this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{performer.name}</h4>
                      <p className="text-sm text-slate-600">{performer.position}</p>
                      <p className="text-xs text-slate-500">{performer.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg">{performer.score}</span>
                    </div>
                    <p className="text-xs text-slate-500">{performer.hireDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Success Rates */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Department Success Rates</CardTitle>
            <CardDescription>Hiring success by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentData.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">{dept.department}</span>
                    <span className="text-sm text-slate-600">{dept.successRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${dept.successRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{dept.hires} hires</span>
                    <span>{dept.interviews} interviews</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
