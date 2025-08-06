"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Brain, Mail, Lock, User, Building, Eye, EyeOff, ArrowRight, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

const steps = [
  { id: 1, title: "Account", description: "Create your account" },
  { id: 2, title: "Profile", description: "Tell us about yourself" },
  { id: 3, title: "Company", description: "Company information" },
]

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
    company: "",
    industry: "",
    companySize: "",
  })
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSignup()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSignup = async () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.password
      case 2:
        return formData.firstName && formData.lastName && formData.role
      case 3:
        return formData.company && formData.industry && formData.companySize
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">ElevateHire AI</span>
          </Link>
          <p className="text-slate-600 mt-2">Welcome to the future of recruitment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="space-y-1 pb-4">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isLogin ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isLogin ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {!isLogin && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Step {currentStep} of 3</span>
                      <span>{Math.round((currentStep / 3) * 100)}%</span>
                    </div>
                    <Progress value={(currentStep / 3) * 100} className="h-2" />
                  </div>

                  {/* Steps Indicator */}
                  <div className="flex justify-between">
                    {steps.map((step) => (
                      <div key={step.id} className="flex flex-col items-center space-y-1">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            step.id < currentStep
                              ? "bg-slate-900 text-white"
                              : step.id === currentStep
                                ? "bg-slate-900 text-white"
                                : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-medium text-slate-900">{step.title}</p>
                          <p className="text-xs text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              <CardTitle className="text-2xl text-center">
                {isLogin ? "Welcome Back" : steps[currentStep - 1]?.title}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin ? "Sign in to your account" : steps[currentStep - 1]?.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLogin ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 border-slate-200 focus:border-slate-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 border-slate-200 focus:border-slate-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <span className="text-slate-600">Remember me</span>
                    </label>
                    <a href="#" className="text-sm text-slate-900 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              ) : (
                <div>
                  {/* Multi-Step Signup Form */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {currentStep === 1 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="signupEmail">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                id="signupEmail"
                                type="email"
                                placeholder="Enter your email"
                                className="pl-10 border-slate-200 focus:border-slate-900"
                                value={formData.email}
                                onChange={(e) => updateFormData("email", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signupPassword">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                id="signupPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                className="pl-10 pr-10 border-slate-200 focus:border-slate-900"
                                value={formData.password}
                                onChange={(e) => updateFormData("password", e.target.value)}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500">
                            Password must be at least 8 characters with uppercase, lowercase, and numbers.
                          </div>
                        </div>
                      )}

                      {currentStep === 2 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                <Input
                                  id="firstName"
                                  placeholder="John"
                                  className="pl-10 border-slate-200 focus:border-slate-900"
                                  value={formData.firstName}
                                  onChange={(e) => updateFormData("firstName", e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                placeholder="Doe"
                                className="border-slate-200 focus:border-slate-900"
                                value={formData.lastName}
                                onChange={(e) => updateFormData("lastName", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">Your Role</Label>
                            <Input
                              id="role"
                              placeholder="e.g., HR Manager, Recruiter, Talent Acquisition"
                              className="border-slate-200 focus:border-slate-900"
                              value={formData.role}
                              onChange={(e) => updateFormData("role", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}

                      {currentStep === 3 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="company">Company Name</Label>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                id="company"
                                placeholder="Your company name"
                                className="pl-10 border-slate-200 focus:border-slate-900"
                                value={formData.company}
                                onChange={(e) => updateFormData("company", e.target.value)}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input
                              id="industry"
                              placeholder="e.g., Technology, Healthcare, Finance"
                              className="border-slate-200 focus:border-slate-900"
                              value={formData.industry}
                              onChange={(e) => updateFormData("industry", e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companySize">Company Size</Label>
                            <Input
                              id="companySize"
                              placeholder="e.g., 1-10, 11-50, 51-200, 200+"
                              className="border-slate-200 focus:border-slate-900"
                              value={formData.companySize}
                              onChange={(e) => updateFormData("companySize", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="border-slate-200 hover:bg-slate-50 bg-transparent"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid() || isLoading}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {isLoading ? (
                        "Creating account..."
                      ) : currentStep === 3 ? (
                        "Create Account"
                      ) : (
                        <span className="flex items-center">
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Social Login */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-slate-500">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button variant="outline" className="w-full bg-transparent border-slate-200 hover:bg-slate-50">
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent border-slate-200 hover:bg-slate-50">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-sm text-slate-600 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          By signing up, you agree to our{" "}
          <a href="#" className="text-slate-900 hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-slate-900 hover:underline">
            Privacy Policy
          </a>
        </motion.p>
      </div>
    </div>
  )
}
