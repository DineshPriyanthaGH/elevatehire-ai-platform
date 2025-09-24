"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SidebarTrigger } from "@/components/ui/sidebar"
import AddCandidateForm from '@/components/candidates/add-candidate-form'
import CandidateList from '@/components/candidates/candidate-list'
import CandidateDetail from '@/components/candidates/candidate-detail'
import EditCandidateForm from '@/components/candidates/edit-candidate-form'
import AuthComponent from '@/components/auth/AuthComponent'
import { authApi } from '@/lib/api'

type View = 'list' | 'add' | 'detail' | 'edit'

export default function CandidatesPage() {
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      // Always require authentication for candidate management
      setIsAuthenticated(authApi.isAuthenticated())
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  const handleAddCandidate = () => {
    setCurrentView('add')
  }

  const handleViewCandidate = (id: string) => {
    setSelectedCandidateId(id)
    setCurrentView('detail')
  }

  const handleEditCandidate = (id: string) => {
    setSelectedCandidateId(id)
    setCurrentView('edit')
  }

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this candidate?')) {
      return
    }

    try {
      const { candidateApi } = await import('@/lib/api')
      
      const result = await candidateApi.delete(id)
      
      if (result.success) {
        toast.success('Candidate deleted successfully')
        setRefreshTrigger(prev => prev + 1) // Trigger refresh
      } else {
        throw new Error(result.error || 'Failed to delete candidate')
      }
    } catch (error) {
      console.error('Error deleting candidate:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete candidate')
    }
  }

  const handleUpdateCandidate = async (formData: FormData) => {
    if (!selectedCandidateId) return
    
    setLoading(true)
    try {
      const { candidateApi } = await import('@/lib/api')
      
      const result = await candidateApi.update(selectedCandidateId, formData)
      
      if (result.success) {
        toast.success('Candidate updated successfully!')
        setCurrentView('list')
        setSelectedCandidateId(null)
        setRefreshTrigger(prev => prev + 1) // Trigger refresh
      } else {
        throw new Error(result.error || 'Failed to update candidate')
      }
    } catch (error) {
      console.error('Error updating candidate:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update candidate')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitCandidate = async (formData: FormData) => {
    setLoading(true)
    try {
      const { candidateApi } = await import('@/lib/api')
      
      const result = await candidateApi.create(formData)
      
      if (result.success) {
        toast.success('Candidate added successfully! CV is being processed for automatic data extraction.')
        setCurrentView('list')
        setRefreshTrigger(prev => prev + 1) // Trigger refresh
      } else {
        throw new Error(result.error || 'Failed to create candidate')
      }
    } catch (error) {
      console.error('Error submitting candidate:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add candidate')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setCurrentView('list')
    setSelectedCandidateId(null)
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth component if not authenticated
  if (!isAuthenticated) {
    return <AuthComponent onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <SidebarTrigger />
      </div>
      
      {currentView === 'list' && (
        <CandidateList
          onAddCandidate={handleAddCandidate}
          onViewCandidate={handleViewCandidate}
          onEditCandidate={handleEditCandidate}
          onDeleteCandidate={handleDeleteCandidate}
          refreshTrigger={refreshTrigger}
        />
      )}

      {currentView === 'add' && (
        <div>
          <AddCandidateForm
            onSubmit={handleSubmitCandidate}
            loading={loading}
          />
          <div className="mt-6 text-center">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to candidates
            </button>
          </div>
        </div>
      )}

      {currentView === 'detail' && selectedCandidateId && (
        <CandidateDetail
          candidateId={selectedCandidateId}
          onBack={handleBack}
          onEdit={handleEditCandidate}
        />
      )}

      {currentView === 'edit' && selectedCandidateId && (
        <EditCandidateForm
          candidateId={selectedCandidateId}
          onSubmit={handleUpdateCandidate}
          onCancel={handleBack}
          loading={loading}
        />
      )}
    </div>
  )
}
