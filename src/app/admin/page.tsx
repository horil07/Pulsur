'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, XCircle, Clock, Eye, User, Calendar, Trophy, BarChart3, Users } from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'
import Link from 'next/link'

interface Submission {
  id: string
  title: string
  caption: string
  type: string
  contentUrl: string
  prompt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user: {
    name: string
    image?: string
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simple admin check - in production, you'd want proper role-based auth
  const isAdmin = session?.user?.email === 'testuser@example.com' || 
                  session?.user?.email?.includes('admin')

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/submissions?status=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.submissions)
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  const updateSubmissionStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        // Remove from current list since status changed
        setSubmissions(prev => prev.filter(sub => sub.id !== id))
      }
    } catch (error) {
      console.error('Failed to update submission:', error)
    }
  }

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>Please log in to access the admin panel</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don&apos;t have admin privileges</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage submissions, challenges, and platform content</p>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/admin/challenges">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <CardTitle className="text-lg">Challenges</CardTitle>
                <CardDescription>
                  Create and manage AI challenges
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-75">
            <CardHeader className="text-center">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">Analytics</CardTitle>
              <CardDescription>
                View platform statistics
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-75">
            <CardHeader className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <CardTitle className="text-lg">User Management</CardTitle>
              <CardDescription>
                Manage user accounts
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Submissions Management Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submissions Review</h2>
          <p className="text-gray-600">Review and moderate user submissions</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} submissions
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' ? 'All submissions have been reviewed' : `No ${activeTab} submissions to display`}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {submissions.map((submission) => (
                  <Card key={submission.id} className="overflow-hidden">
                    <div className="flex">
                      {/* Content Preview */}
                      <div className="w-48 h-48 relative bg-gray-200 flex-shrink-0">
                        <SafeImage
                          src={submission.contentUrl}
                          alt={submission.title}
                          fill
                          className="object-cover"
                          fallback={
                            <div className="text-center text-gray-400">
                              <div className="text-2xl mb-2">
                                {submission.type === 'AI_SONG' ? '🎵' : 
                                 submission.type === 'UPLOAD_REEL' ? '🎬' : 
                                 submission.type === 'AI_ARTWORK' ? '🎨' : '📄'}
                              </div>
                              <div className="text-sm">
                                {submission.type.replace('_', ' ')}
                              </div>
                              <div className="text-xs mt-1 text-gray-500">
                                Preview unavailable
                              </div>
                            </div>
                          }
                        />
                      </div>

                      {/* Submission Details */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {submission.title}
                            </h3>
                            <Badge variant="outline" className="mb-2">
                              {submission.type.replace('_', ' ')}
                            </Badge>
                            <p className="text-gray-600 text-sm">{submission.caption}</p>
                          </div>
                          <Badge 
                            variant={
                              submission.status === 'PENDING' ? 'secondary' :
                              submission.status === 'APPROVED' ? 'default' : 'destructive'
                            }
                          >
                            {submission.status}
                          </Badge>
                        </div>

                        {submission.prompt && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-1">AI Prompt:</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded italic">
                              &quot;{submission.prompt}&quot;
                            </p>
                          </div>
                        )}

                        {/* User Info */}
                        <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {submission.user.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(submission.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {submission.status === 'PENDING' && (
                          <div className="flex gap-3">
                            <Button
                              onClick={() => updateSubmissionStatus(submission.id, 'APPROVED')}
                              className="bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateSubmissionStatus(submission.id, 'REJECTED')}
                              variant="destructive"
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
