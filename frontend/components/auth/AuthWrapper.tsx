"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth-check'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth')
    }
  }, [router])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Redirecting to login...</h2>
          <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}