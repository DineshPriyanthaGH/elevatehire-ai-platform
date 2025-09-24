"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "sonner"
import {
  CalendarIcon,
  Plus,
  Video,
  MapPin,
  Phone,
  Clock,
  Users,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye
} from "lucide-react"
import { format } from "date-fns"
import { interviewApi, candidateApi, type Candidate, type Interview, type InterviewType, type CreateInterviewData } from "@/lib/api"

interface Interviewer {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface UpcomingInterview {
  id: string
  title: string
  candidate: {
    id: string
    full_name: string
    email: string
    phone?: string
    avatar?: string
  }
  interviewer: {
    id: string
    first_name: string
    last_name: string
  }
  scheduled_date: string
  duration_minutes: number
  status: string
  meeting_type: string
  priority: string
  interview_type: {
    name: string
    color: string
  }
}

// Helper function to transform Interview API response to UpcomingInterview
const transformInterviewToUpcoming = (interview: Interview): UpcomingInterview => {
  return {
    id: interview.id,
    title: interview.title,
    candidate: {
      id: interview.candidate,
      full_name: interview.candidate_name,
      email: interview.candidate_email,
      phone: interview.candidate_phone,
      avatar: undefined
    },
    interviewer: {
      id: interview.interviewer,
      first_name: interview.interviewer_name.split(' ')[0] || '',
      last_name: interview.interviewer_name.split(' ').slice(1).join(' ') || ''
    },
    scheduled_date: interview.scheduled_date,
    duration_minutes: interview.duration_minutes,
    status: interview.status,
    meeting_type: interview.meeting_type,
    priority: interview.priority,
    interview_type: {
      name: interview.interview_type_name,
      color: interview.interview_type_color
    }
  }
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00"
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700"
    case "scheduled":
      return "bg-blue-100 text-blue-700"
    case "in_progress":
      return "bg-yellow-100 text-yellow-700"
    case "completed":
      return "bg-green-100 text-green-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    case "rescheduled":
      return "bg-purple-100 text-purple-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
    case "completed":
      return <CheckCircle className="w-4 h-4" />
    case "cancelled":
      return <XCircle className="w-4 h-4" />
    case "in_progress":
      return <AlertCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video_call":
      return <Video className="w-4 h-4" />
    case "in_person":
      return <MapPin className="w-4 h-4" />
    case "phone_call":
      return <Phone className="w-4 h-4" />
    default:
      return <CalendarIcon className="w-4 h-4" />
  }
}

export default function SchedulingPage() {
  // Helper function to ensure arrays
  const ensureArray = (data: any): any[] => {
    return Array.isArray(data) ? data : []
  }

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [upcomingInterviews, setUpcomingInterviews] = useState<UpcomingInterview[]>([])
  const [allInterviews, setAllInterviews] = useState<UpcomingInterview[]>([]) // Store all interviews for calendar
  const [filteredInterviews, setFilteredInterviews] = useState<UpcomingInterview[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([
    { id: '1', name: 'Technical Interview', duration_minutes: 60, color: '#3b82f6', is_active: true, created_at: new Date().toISOString() },
    { id: '2', name: 'HR Interview', duration_minutes: 45, color: '#10b981', is_active: true, created_at: new Date().toISOString() },
    { id: '3', name: 'Behavioral Interview', duration_minutes: 45, color: '#f59e0b', is_active: true, created_at: new Date().toISOString() }
  ])
  

  
  const [formData, setFormData] = useState({
    title: "",
    candidate: "",
    interviewer: "",
    interview_type: "",
    date: "",
    time: "",
    duration_minutes: "60",
    meeting_type: "video_call",
    priority: "normal",
    description: "",
    meeting_link: "",
    meeting_location: ""
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      filterInterviewsByDate(selectedDate)
    } else {
      setFilteredInterviews(upcomingInterviews)
    }
  }, [selectedDate, allInterviews])

  // Filter interviews by selected date
  const filterInterviewsByDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const filtered = allInterviews.filter(interview => {
      const interviewDate = format(new Date(interview.scheduled_date), 'yyyy-MM-dd')
      return interviewDate === dateString
    })
    setFilteredInterviews(filtered)
  }

  // Get interview count for a specific date
  const getInterviewCountForDate = (date: Date): number => {
    const dateString = format(date, 'yyyy-MM-dd')
    return allInterviews.filter(interview => {
      const interviewDate = format(new Date(interview.scheduled_date), 'yyyy-MM-dd')
      return interviewDate === dateString
    }).length
  }

  // Check if a date has interviews
  const hasInterviewsOnDate = (date: Date): boolean => {
    return getInterviewCountForDate(date) > 0
  }

  const loadData = async () => {
    try {
      const [candidatesRes, interviewersRes, interviewTypesRes] = await Promise.all([
        candidateApi.getAll(),
        interviewApi.getInterviewers(),
        interviewApi.getInterviewTypes()
      ])
      
      console.log('API Responses:', {
        candidates: candidatesRes,
        interviewers: interviewersRes,
        interviewTypes: interviewTypesRes
      })
      
      setCandidates(ensureArray(candidatesRes.data?.results))
      setInterviewers(ensureArray(interviewersRes.data))
      
      // Ensure interviewTypes is always an array
      const interviewTypesData = interviewTypesRes.data
      if (Array.isArray(interviewTypesData) && interviewTypesData.length > 0) {
        setInterviewTypes(interviewTypesData)
      } else {
        // Keep existing fallback data if API response is not valid
        console.log('Using fallback interview types - API response invalid:', interviewTypesData)
      }
      
      // Load upcoming interviews
      loadUpcomingInterviews()
    } catch (error) {
      console.error('Error loading data:', error)
      toast("Failed to load data")
      
      // Set fallback data if API fails
      setCandidates([])
      setInterviewers([])
      // Keep existing fallback interview types - they're already initialized
    }
  }

  const loadUpcomingInterviews = async () => {
    try {
      // Load upcoming interviews (next 30 days for calendar)
      const response = await interviewApi.getAll({
        upcoming: true,
        page_size: 100 // Get more interviews for calendar display
      })
      
      if (response.data?.results && Array.isArray(response.data.results)) {
        const transformedInterviews = response.data.results.map(transformInterviewToUpcoming)
        setAllInterviews(transformedInterviews) // Store all interviews for calendar
        
        // Set initial upcoming interviews (limit to 10 for display)
        setUpcomingInterviews(transformedInterviews.slice(0, 10))
        
        // Filter by selected date if one is selected
        if (selectedDate) {
          filterInterviewsByDate(selectedDate)
        } else {
          setFilteredInterviews(transformedInterviews.slice(0, 10))
        }
      } else {
        setAllInterviews([])
        setUpcomingInterviews([])
        setFilteredInterviews([])
      }
    } catch (error) {
      console.error('Error loading upcoming interviews:', error)
      setAllInterviews([])
      setUpcomingInterviews([])
      setFilteredInterviews([])
    }
  }



  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const interviewData: CreateInterviewData = {
        title: formData.title,
        description: formData.description,
        candidate: formData.candidate,
        interview_type: formData.interview_type,
        interviewer: formData.interviewer,
        scheduled_date: `${formData.date}T${formData.time}:00`,
        duration_minutes: parseInt(formData.duration_minutes),
        meeting_type: formData.meeting_type,
        priority: formData.priority,
        meeting_link: formData.meeting_link,
        meeting_location: formData.meeting_location
      }
      
      const result = await interviewApi.create(interviewData)
      
      if (result.success) {
        toast("Interview scheduled successfully!")
        setShowScheduleForm(false)
        resetForm()
        loadUpcomingInterviews()
      } else {
        throw new Error(result.error || 'Failed to schedule interview')
      }
    } catch (error) {
      console.error('Error scheduling interview:', error)
      toast("Failed to schedule interview")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      candidate: "",
      interviewer: "",
      interview_type: "",
      date: "",
      time: "",
      duration_minutes: "60",
      meeting_type: "video_call",
      priority: "normal",
      description: "",
      meeting_link: "",
      meeting_location: ""
    })
  }

  const handleUpdateStatus = async (interviewId: string, action: string) => {
    try {
      if (action === 'cancel') {
        await interviewApi.cancel(interviewId)
      } else if (action === 'complete') {
        await interviewApi.complete(interviewId)
      }
      
      toast(`Interview ${action}d successfully`)
      loadUpcomingInterviews()
    } catch (error) {
      console.error(`Error ${action}ing interview:`, error)
      toast(`Failed to ${action} interview`)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Interview Scheduling</h1>
            <p className="text-slate-600">Schedule and manage interview appointments</p>
          </div>
        </div>
        <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>Fill in the details to schedule an interview</DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSchedule} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Interview Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter interview title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interview_type">Interview Type</Label>
                  <Select
                    value={formData.interview_type}
                    onValueChange={(value) => setFormData({ ...formData, interview_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ensureArray(interviewTypes).map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.duration_minutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidate">Candidate</Label>
                  <Select
                    value={formData.candidate}
                    onValueChange={(value) => setFormData({ ...formData, candidate: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      {ensureArray(candidates).map((candidate) => (
                        <SelectItem key={candidate.id} value={candidate.id}>
                          {candidate.full_name} - {candidate.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interviewer">Interviewer</Label>
                  <Select
                    value={formData.interviewer}
                    onValueChange={(value) => setFormData({ ...formData, interviewer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {ensureArray(interviewers).map((interviewer) => (
                        <SelectItem key={interviewer.id} value={interviewer.id}>
                          {interviewer.first_name} {interviewer.last_name} - {interviewer.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Select
                    value={formData.duration_minutes}
                    onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meeting_type">Meeting Type</Label>
                  <Select
                    value={formData.meeting_type}
                    onValueChange={(value) => setFormData({ ...formData, meeting_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_call">
                        <div className="flex items-center">
                          <Video className="w-4 h-4 mr-2" />
                          Video Call
                        </div>
                      </SelectItem>
                      <SelectItem value="in_person">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          In Person
                        </div>
                      </SelectItem>
                      <SelectItem value="phone_call">
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Call
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.meeting_type === 'video_call' && (
                <div className="space-y-2">
                  <Label htmlFor="meeting_link">Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    placeholder="https://zoom.us/j/123456789 or Teams link"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  />
                </div>
              )}

              {formData.meeting_type === 'in_person' && (
                <div className="space-y-2">
                  <Label htmlFor="meeting_location">Location</Label>
                  <Input
                    id="meeting_location"
                    placeholder="Conference Room A, Building 1"
                    value={formData.meeting_location}
                    onChange={(e) => setFormData({ ...formData, meeting_location: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional notes or instructions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? "Scheduling..." : "Schedule Interview"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Calendar</span>
            </CardTitle>
            <CardDescription>Select a date to view or schedule interviews</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={setSelectedDate} 
              className="rounded-md border" 
              modifiers={{
                hasInterview: (date) => hasInterviewsOnDate(date)
              }}
              modifiersStyles={{
                hasInterview: { 
                  backgroundColor: '#dbeafe', 
                  color: '#1d4ed8',
                  fontWeight: 'bold',
                  position: 'relative'
                }
              }}
            />
            
            {/* Calendar Legend */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                  <span className="text-gray-600">Dates with interviews</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Selected date</span>
                </div>
              </div>
              
              {/* Quick stats */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-semibold text-gray-900">{allInterviews.length}</div>
                    <div className="text-gray-500">Total</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="font-semibold text-gray-900">
                      {selectedDate ? getInterviewCountForDate(selectedDate) : upcomingInterviews.length}
                    </div>
                    <div className="text-gray-500">{selectedDate ? 'Selected' : 'Upcoming'}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>
              {selectedDate ? `Interviews for ${format(selectedDate, "MMMM d, yyyy")}` : "All upcoming interviews"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Show filter info */}
              {selectedDate && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Showing interviews for {format(selectedDate, "MMMM d, yyyy")}
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDate(undefined)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                  >
                    Show All
                  </Button>
                </div>
              )}

              {/* Display interviews */}
              {(selectedDate ? filteredInterviews : upcomingInterviews).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {selectedDate ? `No interviews scheduled for ${format(selectedDate, "MMMM d, yyyy")}` : "No interviews scheduled"}
                  </p>
                  <p className="text-sm text-gray-400">Click "Schedule Interview" to add one</p>
                </div>
              ) : (
                ensureArray(selectedDate ? filteredInterviews : upcomingInterviews).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={interview.candidate.avatar} alt={interview.candidate.full_name} />
                        <AvatarFallback>
                          {interview.candidate.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-slate-900">{interview.candidate.full_name}</h4>
                        <p className="text-sm text-slate-600">{interview.title}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-slate-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {format(new Date(interview.scheduled_date), "MMM d, h:mm a")}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            {getTypeIcon(interview.meeting_type)}
                            <span className="ml-1">{interview.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Users className="w-3 h-3 mr-1" />
                            {interview.interviewer.first_name} {interview.interviewer.last_name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(interview.status)}>
                        {getStatusIcon(interview.status)}
                        <span className="ml-1 capitalize">{interview.status}</span>
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {interview.status === 'scheduled' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(interview.id, 'cancel')}>
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          {interview.status === 'in_progress' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(interview.id, 'complete')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
