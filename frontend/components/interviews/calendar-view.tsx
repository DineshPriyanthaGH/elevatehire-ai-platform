"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { 
  interviewApi, 
  candidateApi, 
  type InterviewCalendarEvent, 
  type InterviewType,
  type Candidate,
  type CreateInterviewData 
} from '@/lib/api'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface InterviewEvent {
  id: string
  title: string
  start: Date
  end: Date
  backgroundColor: string
  borderColor: string
  textColor: string
  candidate_name: string
  interviewer_name: string
  status: string
  meeting_type: string
  priority: string
  url: string
}

interface Interviewer {
  id: string
  first_name: string
  last_name: string
  email: string
}

interface AvailableSlot {
  interviewer_id: string
  interviewer_name: string
  date: string
  start_time: string
  end_time: string
  available_duration: number
}

export function CalendarView() {
  const [events, setEvents] = useState<InterviewEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [showNewInterviewDialog, setShowNewInterviewDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Form data for new interview
  const [newInterview, setNewInterview] = useState({
    title: '',
    candidate: '',
    interviewer: '',
    interview_type: '',
    scheduled_date: '',
    meeting_type: 'video_call',
    priority: 'medium',
    description: ''
  })
  
  // Reference data
  const [interviewTypes, setInterviewTypes] = useState<InterviewType[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterInterviewer, setFilterInterviewer] = useState('all')
  const [calendarView, setCalendarView] = useState('month')

  useEffect(() => {
    loadEvents()
    loadReferenceData()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoading(true)
      const response = await interviewApi.getCalendarEvents()
      const events = response.data || []
      
      const formattedEvents = events.map((event: InterviewCalendarEvent) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
      
      setEvents(formattedEvents)
    } catch (error) {
      console.error('Error loading events:', error)
      toast("Failed to load interview events")
    } finally {
      setIsLoading(false)
    }
  }

  const loadReferenceData = async () => {
    try {
      const [candidatesRes, interviewersRes] = await Promise.all([
        candidateApi.getAll(),
        interviewApi.getInterviewers()
      ])
      
      // For interview types, we'll need to create a mock array or add an API method
      setInterviewTypes([
        { id: '1', name: 'Technical Interview', duration_minutes: 60, color: '#3b82f6', is_active: true, created_at: new Date().toISOString() },
        { id: '2', name: 'HR Interview', duration_minutes: 45, color: '#10b981', is_active: true, created_at: new Date().toISOString() },
        { id: '3', name: 'Behavioral Interview', duration_minutes: 45, color: '#f59e0b', is_active: true, created_at: new Date().toISOString() }
      ])
      setCandidates(candidatesRes.data?.results || [])
      setInterviewers(interviewersRes.data || [])
    } catch (error) {
      console.error('Error loading reference data:', error)
    }
  }

  const loadAvailableSlots = async (interviewerId: string, startDate: string, endDate: string) => {
    try {
      const response = await interviewApi.getAvailableSlots({
        interviewer_id: interviewerId,
        start_date: startDate,
        end_date: endDate,
        duration: 60
      })
      setAvailableSlots(response.data || [])
    } catch (error) {
      console.error('Error loading available slots:', error)
    }
  }

  const handleSelectEvent = (event: InterviewEvent) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewInterview({
      ...newInterview,
      scheduled_date: moment(start).format('YYYY-MM-DDTHH:mm')
    })
    setShowNewInterviewDialog(true)
  }

  const handleCreateInterview = async () => {
    try {
      await interviewApi.create(newInterview as CreateInterviewData)
      
      toast("Interview scheduled successfully")
      
      setShowNewInterviewDialog(false)
      setNewInterview({
        title: '',
        candidate: '',
        interviewer: '',
        interview_type: '',
        scheduled_date: '',
        meeting_type: 'video_call',
        priority: 'medium',
        description: ''
      })
      
      loadEvents()  // Refresh events
    } catch (error) {
      console.error('Error creating interview:', error)
      toast("Failed to schedule interview")
    }
  }

  const handleUpdateInterviewStatus = async (interviewId: string, action: string) => {
    try {
      if (action === 'cancel') {
        await interviewApi.cancel(interviewId)
      } else if (action === 'complete') {
        await interviewApi.complete(interviewId)
      }
      
      toast(`Interview ${action}d successfully`)
      
      setShowEventDialog(false)
      loadEvents()  // Refresh events
    } catch (error) {
      console.error(`Error ${action}ing interview:`, error)
      toast(`Failed to ${action} interview`)
    }
  }

  const eventStyleGetter = (event: InterviewEvent) => {
    return {
      style: {
        backgroundColor: event.backgroundColor,
        borderColor: event.borderColor,
        color: event.textColor,
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px'
      }
    }
  }

  const CustomEvent = ({ event }: { event: InterviewEvent }) => (
    <div className="text-xs">
      <div className="font-medium truncate">{event.candidate_name}</div>
      <div className="text-xs opacity-90 truncate">{event.title}</div>
    </div>
  )

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-purple-100 text-purple-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Calendar</h1>
          <p className="text-muted-foreground">
            Schedule and manage interviews with candidates
          </p>
        </div>
        
        <Dialog open={showNewInterviewDialog} onOpenChange={setShowNewInterviewDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Interview Title</Label>
                <Input
                  id="title"
                  value={newInterview.title}
                  onChange={(e) => setNewInterview({...newInterview, title: e.target.value})}
                  placeholder="Technical Interview - Software Engineer"
                />
              </div>
              
              <div>
                <Label htmlFor="candidate">Candidate</Label>
                <Select value={newInterview.candidate} onValueChange={(value) => setNewInterview({...newInterview, candidate: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="interviewer">Interviewer</Label>
                <Select 
                  value={newInterview.interviewer} 
                  onValueChange={(value) => {
                    setNewInterview({...newInterview, interviewer: value})
                    // Load available slots when interviewer is selected
                    if (value) {
                      const nextWeek = moment().add(7, 'days').format('YYYY-MM-DD')
                      const today = moment().format('YYYY-MM-DD')
                      loadAvailableSlots(value, today, nextWeek)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewers.map((interviewer) => (
                      <SelectItem key={interviewer.id} value={interviewer.id}>
                        {interviewer.first_name} {interviewer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="interview_type">Interview Type</Label>
                <Select value={newInterview.interview_type} onValueChange={(value) => setNewInterview({...newInterview, interview_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    {interviewTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} ({type.duration_minutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="scheduled_date">Date & Time</Label>
                <Input
                  id="scheduled_date"
                  type="datetime-local"
                  value={newInterview.scheduled_date}
                  onChange={(e) => setNewInterview({...newInterview, scheduled_date: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="meeting_type">Meeting Type</Label>
                  <Select value={newInterview.meeting_type} onValueChange={(value) => setNewInterview({...newInterview, meeting_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video_call">Video Call</SelectItem>
                      <SelectItem value="phone_call">Phone Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newInterview.priority} onValueChange={(value) => setNewInterview({...newInterview, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newInterview.description}
                  onChange={(e) => setNewInterview({...newInterview, description: e.target.value})}
                  placeholder="Additional details about the interview..."
                  rows={3}
                />
              </div>
              
              {/* Available Slots */}
              {availableSlots.length > 0 && (
                <div>
                  <Label>Available Time Slots</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                    {availableSlots.slice(0, 10).map((slot, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        onClick={() => {
                          const dateTime = moment(`${slot.date} ${slot.start_time}`).format('YYYY-MM-DDTHH:mm')
                          setNewInterview({...newInterview, scheduled_date: dateTime})
                        }}
                      >
                        <Clock className="mr-2 h-3 w-3" />
                        {moment(slot.date).format('MMM DD')} at {slot.start_time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <Button onClick={handleCreateInterview} className="w-full">
                Schedule Interview
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterInterviewer} onValueChange={setFilterInterviewer}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Interviewer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Interviewers</SelectItem>
                {interviewers.map((interviewer) => (
                  <SelectItem key={interviewer.id} value={interviewer.id}>
                    {interviewer.first_name} {interviewer.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={calendarView} onValueChange={setCalendarView}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <div style={{ height: 600 }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={calendarView as any}
              onView={setCalendarView}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              components={{
                event: CustomEvent
              }}
              popup
              style={{ height: '100%' }}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Candidate</Label>
                  <p className="text-sm">{selectedEvent.candidate_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Interviewer</Label>
                  <p className="text-sm">{selectedEvent.interviewer_name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm">
                    {moment(selectedEvent.start).format('MMMM DD, YYYY')}
                    <br />
                    {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Meeting Type</Label>
                  <p className="text-sm capitalize">{selectedEvent.meeting_type.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Badge className={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status}
                </Badge>
                <Badge className={getPriorityColor(selectedEvent.priority)}>
                  {selectedEvent.priority} priority
                </Badge>
              </div>
              
              <div className="flex gap-2 pt-4">
                {selectedEvent.status === 'scheduled' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateInterviewStatus(selectedEvent.id, 'complete')}
                    >
                      Mark Complete
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateInterviewStatus(selectedEvent.id, 'cancel')}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(selectedEvent.url, '_blank')}
                >
                  View Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
