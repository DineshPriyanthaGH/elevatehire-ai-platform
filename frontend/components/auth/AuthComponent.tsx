'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'

interface AuthComponentProps {
  onAuthSuccess: () => void
}

export default function AuthComponent({ onAuthSuccess }: AuthComponentProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if already authenticated
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      onAuthSuccess()
    }
  }, [onAuthSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const result = await authApi.login(email, password)
        if (result.success) {
          onAuthSuccess()
        } else {
          setError(result.error || 'Login failed')
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        
        const result = await authApi.register(email, password, confirmPassword)
        if (result.success) {
          setError('')
          setIsLogin(true)
          setPassword('')
          setConfirmPassword('')
          setError('Registration successful! Please login.')
        } else {
          setError(result.error || 'Registration failed')
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Register'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Enter your credentials to access the candidate management system'
              : 'Create an account to get started'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant={error.includes('successful') ? 'default' : 'destructive'}>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setPassword('')
                setConfirmPassword('')
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {isLogin 
                ? "Don't have an account? Register here"
                : "Already have an account? Login here"
              }
            </button>
          </div>
          
          {/* Demo credentials hint */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p className="font-medium text-blue-800">Demo Access:</p>
            <p className="text-blue-600">
              You can register a new account or use any email/password to get started.
              The system will create a test user for development.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
