'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, 
  Upload, 
  Trash2, 
  Edit3, 
  Eye, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Submission {
  id: string
  title: string
  type: string
  status: string
  voteCount: number
  createdAt: string
  contentUrl: string
}

interface SubmissionQuotaProps {
  challengeId: string
  challengeTitle: string
  onCreateNew?: () => void
  onEditSubmission?: (submissionId: string) => void
  className?: string
}

export function SubmissionQuota({
  challengeId,
  challengeTitle,
  onCreateNew,
  onEditSubmission,
  className
}: SubmissionQuotaProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    challenge: {
      id: string
      title: string
      maxEntriesPerUser: number
      isActive: boolean
    }
    submissions: {
      current: Submission[]
      count: number
      maxAllowed: number
      remaining: number
      canSubmit: boolean
    }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      await fetchSubmissionData()
    }
    loadData()
  }, [challengeId])

  const fetchSubmissionData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/challenges/${challengeId}/submissions`)
      const result = await response.json()

      if (response.ok && result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error || 'Failed to load submission data')
      }
    } catch (err) {
      console.error('Error fetching submission data:', err)
      setError('Failed to load submission data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(submissionId)
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Refresh data after deletion
        await fetchSubmissionData()
      } else {
        alert(result.error || 'Failed to delete submission')
      }
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-500'
      case 'PENDING':
        return 'text-yellow-500'
      case 'REJECTED':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AI_ARTWORK':
      case 'AI_SONG':
        return '🤖'
      case 'UPLOAD_ARTWORK':
        return '🎨'
      case 'UPLOAD_REEL':
        return '🎥'
      default:
        return '📄'
    }
  }

  if (loading) {
    return (
      <Card className={cn('bg-gray-900 border-gray-800', className)}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF006F]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className={cn('bg-gray-900 border-gray-800', className)}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-400">{error || 'Failed to load submission data'}</p>
            <Button 
              onClick={fetchSubmissionData}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { submissions } = data
  const progressPercentage = (submissions.count / submissions.maxAllowed) * 100

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quota Overview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Submission Quota</CardTitle>
            <Badge variant="outline" className="text-[#FF006F] border-[#FF006F]">
              {challengeTitle}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {submissions.count} of {submissions.maxAllowed} submissions used
              </span>
              <span className="text-gray-400">
                {submissions.remaining} remaining
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-3"
            />
          </div>

          {/* Status Message */}
          <div className="space-y-3">
            {submissions.canSubmit ? (
              <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-600 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-400 font-medium">
                    You can submit {submissions.remaining} more {submissions.remaining === 1 ? 'entry' : 'entries'}
                  </p>
                  <p className="text-green-300 text-sm">
                    Make each submission count!
                  </p>
                </div>
              </div>
            ) : submissions.count >= submissions.maxAllowed ? (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-red-400 font-medium">
                    Maximum submissions reached
                  </p>
                  <p className="text-red-300 text-sm">
                    You can edit or delete existing submissions to make room for new ones
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-medium">
                    Challenge submissions are closed
                  </p>
                  <p className="text-yellow-300 text-sm">
                    You can still manage your existing submissions
                  </p>
                </div>
              </div>
            )}

            {/* Create New Button */}
            {submissions.canSubmit && onCreateNew && (
              <Button
                onClick={onCreateNew}
                className="w-full bg-[#FF006F] hover:bg-[#FF006F]/80 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Create New Submission
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Submissions */}
      {submissions.current.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Submissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submissions.current.map((submission) => (
              <div
                key={submission.id}
                className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                {/* Content Preview */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-xl">
                    {getTypeIcon(submission.type)}
                  </div>
                </div>

                {/* Submission Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">
                      {submission.title}
                    </h3>
                    {getStatusIcon(submission.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className={getStatusColor(submission.status)}>
                      {submission.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {submission.voteCount} votes
                    </span>
                    <span>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(submission.contentUrl, '_blank')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {submission.status !== 'APPROVED' && onEditSubmission && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSubmission(submission.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSubmission(submission.id)}
                    disabled={deletingId === submission.id}
                    className="text-gray-400 hover:text-red-400"
                  >
                    {deletingId === submission.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
