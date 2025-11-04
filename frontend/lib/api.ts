// API utility functions for candidate management and interview scheduling

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api'
const PRODUCTION_MODE = process.env.PRODUCTION_MODE === 'true'

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

// Create headers with auth token
const createHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {}
  
  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }
  
  return headers
}

// API Response interface
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Candidate interfaces
export interface Candidate {
  id: string
  full_name: string
  email: string
  phone?: string
  status: string
  summary?: string
  experience_years?: number
  current_position?: string
  current_company?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  skills?: string[]
  education?: any[]
  work_experience?: any[]
  certifications?: any[]
  languages?: string[]
  cv_file?: string
  extracted_text?: string
  extraction_confidence?: number
  created_at: string
  updated_at: string
  added_by_name?: string
  tags?: Array<{
    id: number
    name: string
    color: string
  }>
}

export interface CreateCandidateData {
  full_name: string
  email: string
  phone?: string
  status?: string
  summary?: string
  experience_years?: number
  current_position?: string
  current_company?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  cv_file: File
}

// API functions
export const candidateApi = {
  // Create a new candidate
  async create(formData: FormData): Promise<ApiResponse<Candidate>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/`, {
        method: 'POST',
        headers: createHeaders(true),
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create candidate')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error creating candidate:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get all candidates
  async getAll(params?: {
    search?: string
    status?: string
    ordering?: string
    page?: number
    page_size?: number
  }): Promise<ApiResponse<{ results: Candidate[], count: number }>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.search) queryParams.append('search', params.search)
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.ordering) queryParams.append('ordering', params.ordering)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString())

      const response = await fetch(`${API_BASE_URL}/candidates/?${queryParams}`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch candidates')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching candidates:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get a single candidate by ID
  async getById(id: string): Promise<ApiResponse<Candidate>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch candidate')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching candidate:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Update candidate status
  async updateStatus(id: string, status: string): Promise<ApiResponse<Candidate>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/status/`, {
        method: 'PATCH',
        headers: {
          ...createHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update candidate status')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error updating candidate status:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Update a candidate
  async update(id: string, formData: FormData): Promise<ApiResponse<Candidate>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/`, {
        method: 'PATCH',
        headers: createHeaders(true),
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update candidate')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error updating candidate:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Download candidate CV
  async downloadCv(id: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/download_cv/`, {
        method: 'GET',
        headers: createHeaders(true)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download CV')
      }

      const blob = await response.blob()
      return { success: true, data: blob }
    } catch (error) {
      console.error('Error downloading CV:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Delete a candidate
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/`, {
        method: 'DELETE',
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to delete candidate')
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting candidate:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get candidate activities
  async getActivities(id: string): Promise<ApiResponse<Array<{
    id: number
    activity_type: string
    description: string
    performed_by_name: string
    created_at: string
  }>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/activities/`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch candidate activities')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching activities:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Add note to candidate
  async addNote(id: string, note: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${id}/add_note/`, {
        method: 'POST',
        headers: {
          ...createHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note })
      })

      if (!response.ok) {
        throw new Error('Failed to add note')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error adding note:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Check CV parsing status
  async getCvParsingStatus(): Promise<ApiResponse<{ cv_parsing_available: boolean, message: string }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/cv-parsing-status/`)

      if (!response.ok) {
        throw new Error('Failed to check CV parsing status')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error checking CV parsing status:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}

// Authentication API
export const authApi = {
  // Login
  async login(email: string, password: string): Promise<ApiResponse<{ access: string, refresh: string, user: any }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email_or_username: email, password })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed')
      }
      
      // Store tokens in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', result.tokens.access)
        localStorage.setItem('refresh_token', result.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(result.user))
      }

      return { success: true, data: result.tokens }
    } catch (error) {
      console.error('Error logging in:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Register
  async register(email: string, password: string, confirmPassword: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          password, 
          confirm_password: confirmPassword 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Registration failed')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error registering:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token')
    }
    return false
  },

  // Get current user
  getCurrentUser(): any | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    }
    return null
  }
}

// Interview interfaces
export interface Interview {
  id: string
  title: string
  description?: string
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
  interviewer: string
  interviewer_name: string
  interviewer_email: string
  additional_interviewers?: string[]
  additional_interviewer_names?: string[]
  scheduled_date: string
  end_time: string
  duration_minutes: number
  meeting_type: string
  meeting_link?: string
  meeting_location?: string
  meeting_id?: string
  meeting_password?: string
  status: string
  priority: string
  feedback?: string
  rating?: number
  outcome?: string
  follow_up_required: boolean
  follow_up_notes?: string
  preparation_materials?: string
  interview_questions?: string
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
  is_upcoming: boolean
  is_today: boolean
  is_overdue: boolean
  time_until_interview?: string
  
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

export interface InterviewType {
  id: string
  name: string
  description?: string
  duration_minutes: number
  color: string
  is_active: boolean
  created_at: string
  interview_count?: number
}

export interface InterviewCalendarEvent {
  id: string
  title: string
  start: string
  end: string
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

export interface AvailableSlot {
  interviewer_id: string
  interviewer_name: string
  date: string
  start_time: string
  end_time: string
  available_duration: number
}

export interface CreateInterviewData {
  title: string
  description?: string
  candidate: string
  interview_type: string
  interviewer: string
  additional_interviewers?: string[]
  scheduled_date: string
  duration_minutes?: number
  meeting_type: string
  meeting_link?: string
  meeting_location?: string
  meeting_id?: string
  meeting_password?: string
  priority?: string
  preparation_materials?: string
  interview_questions?: string
  send_reminders?: boolean
}

// Interview API
export const interviewApi = {
  // Get all interviews
  async getAll(params?: {
    status?: string
    interviewer?: string
    candidate?: string
    start_date?: string
    end_date?: string
    upcoming?: boolean
    page?: number
    page_size?: number
  }): Promise<ApiResponse<{ results: Interview[], count: number }>> {
    try {
      const queryParams = new URLSearchParams()
      
      if (params?.status) queryParams.append('status', params.status)
      if (params?.interviewer) queryParams.append('interviewer', params.interviewer)
      if (params?.candidate) queryParams.append('candidate', params.candidate)
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.upcoming) queryParams.append('upcoming', 'true')
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.page_size) queryParams.append('page_size', params.page_size.toString())

      const response = await fetch(`${API_BASE_URL}/interviews/interviews/?${queryParams}`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interviews')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching interviews:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get calendar events
  async getCalendarEvents(start?: string, end?: string): Promise<ApiResponse<InterviewCalendarEvent[]>> {
    try {
      const queryParams = new URLSearchParams()
      if (start) queryParams.append('start', start)
      if (end) queryParams.append('end', end)

      const response = await fetch(`${API_BASE_URL}/interviews/interviews/calendar_events/?${queryParams}`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch calendar events')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Create a new interview
  async create(interviewData: CreateInterviewData): Promise<ApiResponse<Interview>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interviews/`, {
        method: 'POST',
        headers: {
          ...createHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interviewData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create interview')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error creating interview:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get interview by ID
  async getById(id: string): Promise<ApiResponse<Interview>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interviews/${id}/`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interview')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching interview:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Update interview
  async update(id: string, updateData: Partial<CreateInterviewData>): Promise<ApiResponse<Interview>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interviews/${id}/`, {
        method: 'PATCH',
        headers: {
          ...createHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update interview')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error updating interview:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Cancel interview
  async cancel(id: string, reason?: string): Promise<ApiResponse<Interview>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interviews/${id}/cancel/`, {
        method: 'POST',
        headers: {
          ...createHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel interview')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error cancelling interview:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Complete interview
  async complete(id: string, notes?: string): Promise<ApiResponse<Interview>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interviews/${id}/complete/`, {
        method: 'POST',
        headers: {
          ...createHeaders(true),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to complete interview')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error completing interview:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get interview types
  async getTypes(): Promise<ApiResponse<InterviewType[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interview-types/`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interview types')
      }

      const data = await response.json()
      return { success: true, data: data.results || data }
    } catch (error) {
      console.error('Error fetching interview types:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get available slots
  async getAvailableSlots(params: {
    interviewer_id: string
    start_date: string
    end_date: string
    duration?: number
  }): Promise<ApiResponse<AvailableSlot[]>> {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('interviewer_id', params.interviewer_id)
      queryParams.append('start_date', params.start_date)
      queryParams.append('end_date', params.end_date)
      if (params.duration) queryParams.append('duration', params.duration.toString())

      const response = await fetch(`${API_BASE_URL}/interviews/availability/available_slots/?${queryParams}`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch available slots')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get interviewers list
  async getInterviewers(search?: string): Promise<ApiResponse<Array<{
    id: string
    username: string
    first_name: string
    last_name: string
    full_name: string
    email: string
  }>>> {
    try {
      const queryParams = new URLSearchParams()
      if (search) queryParams.append('search', search)

      const response = await fetch(`${API_BASE_URL}/interviews/interviews/interviewers/?${queryParams}`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interviewers')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching interviewers:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  },

  // Get interview types for scheduling
  async getInterviewTypes(): Promise<ApiResponse<InterviewType[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/interview-types/`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interview types')
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching interview types:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }
    }
  }
}

// Export default API object
export const api = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: createHeaders(true)
    })
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  },
  
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...createHeaders(true),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  },

  patch: async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        ...createHeaders(true),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: createHeaders(true)
    })
    if (!response.ok) throw new Error('API request failed')
    return response.json()
  }
}

// Dashboard interfaces
export interface DashboardStats {
  total_interviews: number
  upcoming_interviews: number  
  today_interviews: number
  completed_interviews: number
  cancelled_interviews: number
  total_candidates: number
  recent_candidates: number
  average_score: number
  success_rate: number
  time_saved: number
}

export interface MonthlyTrend {
  month: string
  interviews: number
  hires: number
  candidates: number
}

export interface ScoreDistribution {
  range: string
  count: number
  percentage: number
}

export interface RecentActivity {
  interviews: Interview[]
  candidates: Candidate[]
}

// Dashboard API
export const dashboardApi = {
  // Get overall dashboard statistics
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const [interviewsResponse, candidatesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/interviews/stats/`, {
          headers: createHeaders(true)
        }),
        fetch(`${API_BASE_URL}/candidates/stats/`, {
          headers: createHeaders(true)
        })
      ])

      if (!interviewsResponse.ok || !candidatesResponse.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const [interviewStats, candidateStats] = await Promise.all([
        interviewsResponse.json(),
        candidatesResponse.json()
      ])

      // Calculate derived metrics  
      const averageScore = interviewStats.completed_interviews > 0 
        ? Math.round((interviewStats.total_score || 0) / interviewStats.completed_interviews)
        : 0

      const successRate = interviewStats.total_interviews > 0
        ? Math.round((interviewStats.completed_interviews / interviewStats.total_interviews) * 100)
        : 0

      const timeSaved = interviewStats.completed_interviews * 2.5 // Assume 2.5 hours saved per AI analysis

      const dashboardStats: DashboardStats = {
        total_interviews: interviewStats.total_interviews || 0,
        upcoming_interviews: interviewStats.upcoming_interviews || 0,
        today_interviews: interviewStats.today_interviews || 0,
        completed_interviews: interviewStats.completed_interviews || 0,
        cancelled_interviews: interviewStats.cancelled_interviews || 0,
        total_candidates: candidateStats.total_candidates || 0,
        recent_candidates: candidateStats.recent_candidates || 0,
        average_score: averageScore,
        success_rate: successRate,
        time_saved: Math.round(timeSaved)
      }

      return { success: true, data: dashboardStats }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stats'
      }
    }
  },

  // Get monthly trends for charts
  async getMonthlyTrends(): Promise<ApiResponse<MonthlyTrend[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/stats/`, {
        headers: createHeaders(true)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trends')
      }

      const data = await response.json()
      const monthlyTrends = data.monthly_trends || {}

      // Convert to chart format
      const trends: MonthlyTrend[] = Object.entries(monthlyTrends).map(([monthKey, value]: [string, any]) => ({
        month: new Date(monthKey).toLocaleDateString('en', { month: 'short' }),
        interviews: value.interviews || 0,
        hires: value.completed || 0,
        candidates: value.candidates || 0
      })).reverse().slice(-6) // Last 6 months

      return { success: true, data: trends }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch trends'
      }
    }
  },

  // Get score distribution for charts
  async getScoreDistribution(): Promise<ApiResponse<ScoreDistribution[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/`, {
        headers: createHeaders(true),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch score distribution')
      }

      const data = await response.json()
      const interviews = data.results || []

      // Calculate score distribution
      const scoreRanges = {
        '90-100': 0,
        '80-89': 0,
        '70-79': 0,
        '60-69': 0,
        '<60': 0
      }

      let totalScored = 0

      interviews.forEach((interview: any) => {
        if (interview.confidence_score && interview.communication_score && 
            interview.technical_score && interview.engagement_score) {
          const avgScore = (interview.confidence_score + interview.communication_score + 
                          interview.technical_score + interview.engagement_score) / 4
          totalScored++

          if (avgScore >= 90) scoreRanges['90-100']++
          else if (avgScore >= 80) scoreRanges['80-89']++
          else if (avgScore >= 70) scoreRanges['70-79']++
          else if (avgScore >= 60) scoreRanges['60-69']++
          else scoreRanges['<60']++
        }
      })

      const distribution: ScoreDistribution[] = Object.entries(scoreRanges).map(([range, count]) => ({
        range,
        count,
        percentage: totalScored > 0 ? Math.round((count / totalScored) * 100) : 0
      }))

      return { success: true, data: distribution }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch score distribution'
      }
    }
  },

  // Get recent activity
  async getRecentActivity(): Promise<ApiResponse<RecentActivity>> {
    try {
      const [interviewsResponse, candidatesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/interviews/?ordering=-created_at&limit=5`, {
          headers: createHeaders(true)
        }),
        fetch(`${API_BASE_URL}/candidates/?ordering=-created_at&limit=5`, {
          headers: createHeaders(true)
        })
      ])

      if (!interviewsResponse.ok || !candidatesResponse.ok) {
        throw new Error('Failed to fetch recent activity')
      }

      const [interviewsData, candidatesData] = await Promise.all([
        interviewsResponse.json(),
        candidatesResponse.json()
      ])

      const activity: RecentActivity = {
        interviews: interviewsData.results || [],
        candidates: candidatesData.results || []
      }

      return { success: true, data: activity }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recent activity'
      }
    }
  }
}

// Video Interview interfaces
export interface VideoInterview {
  id: string
  interview: string
  title: string
  description: string
  video_file: string
  file_size: number
  file_size_mb: number
  duration: string
  duration_formatted: string
  video_format: string
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed'
  processing_started_at?: string
  processing_completed_at?: string
  error_message?: string
  uploaded_by: string
  uploaded_by_name: string
  created_at: string
  updated_at: string
  transcript?: VideoTranscript
  ai_analyses?: AIAnalysis[]
  analytics_summary?: VideoAnalyticsSummary
}

export interface VideoTranscript {
  transcript_text: string
  confidence_score: number
  segments: Array<{
    start: number
    end: number
    text: string
  }>
}

export interface AIAnalysis {
  id: string
  analysis_type: string
  analysis_type_display: string
  results: Record<string, any>
  score: number
  summary: string
  recommendations: string
  ai_model_used: string
  confidence_level: number
  processing_time_formatted: string
}

export interface VideoAnalyticsSummary {
  overall_score: number
  overall_grade: string
  communication_score: number
  technical_score: number
  behavioral_score: number
  strengths: string[]
  weaknesses: string[]
  key_topics: string[]
  sentiment_distribution: Record<string, number>
  speaking_pace: number
  filler_words_count: number
  recommendation: string
  next_steps: string
}

// Interview AI Analysis API
export const interviewAIAnalysisApi = {
  // Upload video for AI analysis
  uploadVideo: async (interviewId: string, videoFile: File): Promise<ApiResponse<{ message: string; interview_id: string; status: string }>> => {
    try {
      const formData = new FormData()
      formData.append('video_file', videoFile)
      
      const response = await fetch(`${API_BASE_URL}/interviews/ai-analysis/${interviewId}/upload_video/`, {
        method: 'POST',
        headers: createHeaders(true), // Don't set Content-Type for FormData
        body: formData
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        success: true,
        data: data
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      }
    }
  },

  // Get AI analysis status and results
  getAnalysisStatus: async (interviewId: string): Promise<ApiResponse<{
    interview_id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    has_video: boolean
    processed_at?: string
    analysis_results?: {
      confidence_score: number
      communication_score: number
      technical_score: number
      engagement_score: number
      sentiment: string
      keywords: string[]
      recommendations: string[]
      summary: string
      transcript: string
    }
  }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/ai-analysis/${interviewId}/analysis_status/`, {
        headers: createHeaders(true)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        success: true,
        data: data
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get analysis status' 
      }
    }
  },

  // Restart AI analysis
  reanalyze: async (interviewId: string): Promise<ApiResponse<{ message: string; interview_id: string; status: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/ai-analysis/${interviewId}/reanalyze/`, {
        method: 'POST',
        headers: createHeaders(true)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        success: true,
        data: data
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Reanalysis failed' 
      }
    }
  },

  // Get analysis statistics
  getStatistics: async (): Promise<ApiResponse<{
    total_interviews: number
    analyzed_interviews: number
    processing_interviews: number
    failed_analyses: number
    analysis_completion_rate: number
    average_scores: {
      confidence: number
      communication: number
      technical: number
      engagement: number
    }
    sentiment_distribution: Record<string, number>
  }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/ai-analysis/statistics/`, {
        headers: createHeaders(true)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return {
        success: true,
        data: data
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch statistics' 
      }
    }
  },

  // Download transcript
  downloadTranscript: async (interviewId: string): Promise<ApiResponse<Blob>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/interviews/ai-analysis/${interviewId}/download_transcript/`, {
        headers: createHeaders(true)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      return {
        success: true,
        data: blob
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Download failed' 
      }
    }
  }
}
