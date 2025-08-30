"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Mail, User, Lock, AlertCircle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const router = useRouter()

  const [loginData, setLoginData] = useState({
    email_or_username: '',
    password: ''
  })

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (data.success) {
        // Store tokens
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' })
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Login failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      })

      const data = await response.json()

      if (data.success) {
        // Store tokens
        localStorage.setItem('access_token', data.tokens.access)
        localStorage.setItem('refresh_token', data.tokens.refresh)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        setMessage({ type: 'success', text: 'Registration successful! Redirecting...' })
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        const errorText = Object.values(data.errors).flat().join(', ')
        setMessage({ type: 'error', text: errorText })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ElevateHire AI</span>
          </motion.div>
          <p className="text-slate-600">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {message.text && (
              <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email_or_username">Email or Username</Label>
                  <Input
                    id="email_or_username"
                    placeholder="Enter your email or username"
                    className="border-slate-200 focus:border-slate-900"
                    value={loginData.email_or_username}
                    onChange={(e) => setLoginData({ ...loginData, email_or_username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="border-slate-200 focus:border-slate-900"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Choose a username"
                    className="border-slate-200 focus:border-slate-900"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="border-slate-200 focus:border-slate-900"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      className="border-slate-200 focus:border-slate-900"
                      value={registerData.first_name}
                      onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      className="border-slate-200 focus:border-slate-900"
                      value={registerData.last_name}
                      onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    className="border-slate-200 focus:border-slate-900"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="passwordConfirm">Confirm Password</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    placeholder="Confirm your password"
                    className="border-slate-200 focus:border-slate-900"
                    value={registerData.password_confirm}
                    onChange={(e) => setRegisterData({ ...registerData, password_confirm: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-600 hover:text-slate-900"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
