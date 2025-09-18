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
  candidate: string
  candidate_name: string
  candidate_email: string
  candidate_phone?: string
  interview_type: string
  interview_type_name: string
  interview_type_color: string
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

      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/?${queryParams}`, {
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

      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/calendar_events/?${queryParams}`, {
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
      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/`, {
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
      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/${id}/`, {
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
      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/${id}/`, {
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
      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/${id}/cancel/`, {
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
      const response = await fetch(`${API_BASE_URL}/interviews/api/interviews/${id}/complete/`, {
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
      const response = await fetch(`${API_BASE_URL}/interviews/api/interview-types/`, {
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

      const response = await fetch(`${API_BASE_URL}/interviews/api/availability/available_slots/?${queryParams}`, {
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

      const response = await fetch(`${API_BASE_URL}/auth/users/?${queryParams}`, {
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
