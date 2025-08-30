// API utility functions for candidate management

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
    // For testing - don't require auth if no token available
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
