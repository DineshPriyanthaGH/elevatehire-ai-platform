// Authentication check utility
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false
  
  const token = localStorage.getItem('access_token')
  return !!token
}

export const requireAuth = () => {
  if (!isAuthenticated()) {
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
    return false
  }
  return true
}

export const getUserData = () => {
  if (typeof window === 'undefined') return null
  
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
}