"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Clock, Plus, Video, MapPin, Mail, Phone, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

const upcomingInterviews = [
  {
    id: 1,
    candidate: "Sarah Johnson",
    position: "Senior Frontend Developer",
    date: "2024-01-16",
    time: "10:00 AM",
    duration: "45 min",
    type: "video",
    interviewer: "John Smith",
    status: "confirmed",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
  },
  {
    id: 2,
    candidate: "Michael Chen",
    position: "Product Manager",
    date: "2024-01-16",
    time: "2:00 PM",
    duration: "60 min",
    type: "in-person",
    interviewer: "Jane Doe",
    status: "pending",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "michael.chen@email.com",
    phone: "+1 (555) 234-5678",
  },
  {
    id: 3,
    candidate: "Emily Rodriguez",
    position: "UX Designer",
    date: "2024-01-17",
    time: "11:30 AM",
    duration: "45 min",
    type: "video",
    interviewer: "Bob Wilson",
    status: "confirmed",
    avatar: "/placeholder.svg?height=40&width=40",
    email: "emily.rodriguez@email.com",
    phone: "+1 (555) 345-6789",
  },
]

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
]

const candidates = [
  { id: 1, name: "Sarah Johnson", position: "Senior Frontend Developer" },
  { id: 2, name: "Michael Chen", position: "Product Manager" },
  { id: 3, name: "Emily Rodriguez", position: "UX Designer" },
  { id: 4, name: "David Kim", position: "Data Scientist" },
  { id: 5, name: "Lisa Wang", position: "Backend Developer" },
]

const interviewers = [
  { id: 1, name: "John Smith", role: "Engineering Manager" },
  { id: 2, name: "Jane Doe", role: "Product Director" },
  { id: 3, name: "Bob Wilson", role: "Design Lead" },
  { id: 4, name: "Alice Brown", role: "HR Manager" },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-700"
    case "pending":
      return "bg-yellow-100 text-yellow-700"
    case "cancelled":
      return "bg-red-100 text-red-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Video className="w-4 h-4" />
    case "in-person":
      return <MapPin className="w-4 h-4" />
    case "phone":
      return <Phone className="w-4 h-4" />
    default:
      return <CalendarIcon className="w-4 h-4" />
  }
}

export default function SchedulingPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [formData, setFormData] = useState({
    candidate: "",
    interviewer: "",
    date: "",
    time: "",
    duration: "45",
    type: "video",
    notes: "",
  })

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle scheduling logic here
    console.log("Scheduling interview:", formData)
    setShowScheduleForm(false)
    setFormData({
      candidate: "",
      interviewer: "",
      date: "",
      time: "",
      duration: "45",
      type: "video",
      notes: "",
    })
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
        <Button
          onClick={() => setShowScheduleForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
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
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
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
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
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
                    <div>
                      <h4 className="font-semibold text-slate-900">{interview.candidate}</h4>
                      <p className="text-sm text-slate-600">{interview.position}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="w-3 h-3" />
                          <span>{interview.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{interview.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(interview.type)}
                          <span className="capitalize">{interview.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(interview.status)}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Schedule New Interview</CardTitle>
              <CardDescription>Fill in the details to schedule an interview</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSchedule} className="space-y-6">
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
                        {candidates.map((candidate) => (
                          <SelectItem key={candidate.id} value={candidate.name}>
                            <div>
                              <div className="font-medium">{candidate.name}</div>
                              <div className="text-sm text-slate-500">{candidate.position}</div>
                            </div>
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
                        {interviewers.map((interviewer) => (
                          <SelectItem key={interviewer.id} value={interviewer.name}>
                            <div>
                              <div className="font-medium">{interviewer.name}</div>
                              <div className="text-sm text-slate-500">{interviewer.role}</div>
                            </div>
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
                    <Label htmlFor="duration">Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Interview Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interview type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4" />
                          <span>Video Call</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in-person">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>In Person</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="phone">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>Phone Call</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or instructions..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowScheduleForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Schedule Interview
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
