"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Brain,
  Users,
  BarChart3,
  Clock,
  Shield,
  Star,
  CheckCircle,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

const heroImages = [
  {
    src: "/placeholder.svg?height=600&width=800&text=AI+Dashboard+Analytics",
    alt: "AI Dashboard Analytics",
    title: "Advanced Analytics",
  },
  {
    src: "/placeholder.svg?height=600&width=800&text=Video+Interview+Analysis",
    alt: "Video Interview Analysis",
    title: "Video Analysis",
  },
  {
    src: "/placeholder.svg?height=600&width=800&text=Candidate+Management+System",
    alt: "Candidate Management",
    title: "Smart Management",
  },
  {
    src: "/placeholder.svg?height=600&width=800&text=AI+Scoring+Interface",
    alt: "AI Scoring Interface",
    title: "AI Scoring",
  },
]

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced sentiment analysis and behavioral insights from video interviews",
    },
    {
      icon: Users,
      title: "Candidate Management",
      description: "Comprehensive candidate tracking and profile management system",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Real-time reporting and performance metrics for data-driven decisions",
    },
    {
      icon: Clock,
      title: "Automated Scheduling",
      description: "Seamless interview scheduling with calendar integration",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with compliance and data protection",
    },
    {
      icon: Star,
      title: "Performance Scoring",
      description: "Automated candidate scoring based on AI-driven assessments",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director at TechCorp",
      content:
        "ElevateHire transformed our hiring process. We've reduced time-to-hire by 60% while improving candidate quality.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Talent Acquisition Lead",
      content:
        "The AI insights are incredibly accurate. It's like having an expert interviewer analyze every candidate.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Recruitment Manager",
      content: "Best investment we've made in HR technology. The ROI was evident within the first month.",
      rating: 5,
    },
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length)
  }

  return (
    <div className=" bg-white">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200"
      >
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">ElevateHire AI</span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-8">
              <motion.a
                href="#features"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Features
              </motion.a>
              <motion.a
                href="#testimonials"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Testimonials
              </motion.a>
              <motion.a
                href="#pricing"
                className="text-slate-600 hover:text-slate-900 transition-colors"
                whileHover={{ y: -2 }}
              >
                Pricing
              </motion.a>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth">
                    <Button variant="outline" className="mr-2 bg-transparent border-slate-300 hover:bg-slate-50">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white">Get Started</Button>
                    </motion.div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Sliding Images */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">
                    🚀 AI-Powered Recruitment Platform
                  </Badge>
                </motion.div>
                <motion.h1
                  className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Revolutionizing
                  <span className="text-slate-600"> Recruitment </span>
                  with AI-driven Insights
                </motion.h1>
                <motion.p
                  className="text-xl text-slate-600 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Transform your hiring process with advanced AI analysis, automated candidate scoring, and intelligent
                  insights that help you find the perfect candidates faster than ever.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link href="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white text-lg px-8">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 bg-transparent border-slate-300 hover:bg-slate-50"
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                className="flex items-center space-x-8 text-sm text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-slate-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-slate-500" />
                  <span>14-day free trial</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Sliding Image Carousel */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={heroImages[currentImageIndex].src || "/placeholder.svg"}
                      alt={heroImages[currentImageIndex].alt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/20" />
                    <div className="absolute bottom-6 left-6 text-white">
                      <h3 className="text-xl font-semibold">{heroImages[currentImageIndex].title}</h3>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 w-20 h-20 bg-slate-100 rounded-full opacity-60"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-slate-200 rounded-full opacity-40"
                animate={{
                  y: [0, 10, 0],
                  rotate: [360, 180, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section with Animations */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Powerful AI-Driven Features</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to streamline your recruitment process and make better hiring decisions
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-white h-full">
                  <CardContent className="p-0 space-y-4">
                    <motion.div
                      className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Testimonials</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">Trusted by Leading Companies</h2>
            <p className="text-xl text-slate-600">See what our customers say about transforming their hiring process</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 border-0 bg-white shadow-lg h-full">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.2 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-slate-600 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-slate-900"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            className="space-y-8"
            initial={{ y: 50 }}
            whileInView={{ y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white">Ready to Transform Your Hiring Process?</h2>
            <p className="text-xl text-slate-300">
              Join thousands of companies using ElevateHire AI to make better hiring decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 text-lg px-8">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-slate-900 text-lg px-8 bg-transparent"
                >
                  Schedule Demo
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-xl font-bold">ElevateHire AI</span>
              </div>
              <p className="text-slate-400">
                Revolutionizing recruitment with AI-driven insights and intelligent automation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ElevateHire AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
