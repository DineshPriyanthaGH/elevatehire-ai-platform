"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Search, Filter, MoreHorizontal, Eye, Edit, Download, Trash2, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from 'date-fns'

interface Candidate {
  id: string
  full_name: string
  email: string
  phone: string
  status: string
  experience_years: number | null
  skills: string[]
  current_position: string
  current_company: string
  extraction_confidence: number
  created_at: string
  updated_at: string
  created_by_name: string
  tags: Array<{
    id: number
    name: string
    color: string
  }>
}

interface CandidateListProps {
  onAddCandidate: () => void
  onViewCandidate: (id: string) => void
  onEditCandidate: (id: string) => void
  onDeleteCandidate: (id: string) => void
  refreshTrigger?: number // Add refresh trigger
}

const CANDIDATE_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'screening', label: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { value: 'offered', label: 'Offered', color: 'bg-green-100 text-green-800' },
  { value: 'hired', label: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
]

export default function CandidateList({
  onAddCandidate,
  onViewCandidate,
  onEditCandidate,
  onDeleteCandidate,
  refreshTrigger = 0
}: CandidateListProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [error, setError] = useState<string | null>(null)

  // Mock data for development
  const mockCandidates: Candidate[] = [
    {
      id: '1',
      full_name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1 234 567 8900',
      status: 'interview',
      experience_years: 5,
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      current_position: 'Senior Developer',
      current_company: 'Tech Corp',
      extraction_confidence: 0.95,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
      created_by_name: 'Admin User',
      tags: [
        { id: 1, name: 'Frontend', color: '#3B82F6' },
        { id: 2, name: 'Senior', color: '#10B981' }
      ]
    },
    {
      id: '2',
      full_name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 234 567 8901',
      status: 'new',
      experience_years: 3,
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      current_position: 'Backend Developer',
      current_company: 'StartupXYZ',
      extraction_confidence: 0.87,
      created_at: '2024-01-14T15:45:00Z',
      updated_at: '2024-01-14T15:45:00Z',
      created_by_name: 'Admin User',
      tags: [
        { id: 3, name: 'Backend', color: '#8B5CF6' }
      ]
    }
  ]

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true)
        const { candidateApi } = await import('@/lib/api')
        
        const result = await candidateApi.getAll({
          search: searchTerm || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          ordering: sortOrder === 'desc' ? `-${sortBy}` : sortBy
        })
        
        if (result.success && result.data) {
          setCandidates(
            (result.data.results || []).map((candidate: any) => ({
              ...candidate,
              created_by_name: candidate.created_by_name ?? "",
            }))
          )
          setError(null)
        } else {
          // If API fails, try without authentication or use mock data
          console.log('API call failed, using mock data for development')
          setCandidates(mockCandidates)
          setError(null) // Don't show error in development mode
        }
      } catch (err) {
        console.error('Error fetching candidates:', err)
        
        // Use mock data for development
        console.log('Using mock data for development')
        setCandidates(mockCandidates)
        setError(null) // Don't show error in development
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [searchTerm, statusFilter, sortBy, sortOrder, refreshTrigger])

  const getStatusBadgeClass = (status: string) => {
    const statusConfig = CANDIDATE_STATUSES.find(s => s.value === status)
    return statusConfig?.color || 'bg-gray-100 text-gray-800'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' || 
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.current_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let aValue: any = a[sortBy as keyof Candidate]
    let bValue: any = b[sortBy as keyof Candidate]
    
    if (sortBy === 'created_at' || sortBy === 'updated_at') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading candidates...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600">Manage and track all your candidates</p>
        </div>
        <Button onClick={onAddCandidate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search candidates by name, email, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {CANDIDATE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order as 'asc' | 'desc')
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="full_name-asc">Name A-Z</SelectItem>
                  <SelectItem value="full_name-desc">Name Z-A</SelectItem>
                  <SelectItem value="experience_years-desc">Most Experience</SelectItem>
                  <SelectItem value="experience_years-asc">Least Experience</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {sortedCandidates.length} of {candidates.length} candidates
      </div>

      {/* Candidates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(candidate.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{candidate.full_name}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                        {candidate.current_position && candidate.current_company && (
                          <div className="text-xs text-gray-400">
                            {candidate.current_position} at {candidate.current_company}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusBadgeClass(candidate.status)}>
                      {CANDIDATE_STATUSES.find(s => s.value === candidate.status)?.label || candidate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {candidate.experience_years ? `${candidate.experience_years} years` : 'Not specified'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {candidate.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${getConfidenceColor(candidate.extraction_confidence)}`}>
                      {Math.round(candidate.extraction_confidence * 100)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewCandidate(candidate.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditCandidate(candidate.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download CV
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteCandidate(candidate.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {sortedCandidates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No candidates found</p>
              {searchTerm || statusFilter !== 'all' ? (
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
              ) : (
                <Button className="mt-4" onClick={onAddCandidate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Candidate
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
