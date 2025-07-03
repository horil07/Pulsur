import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, Target, AlertCircle, CheckCircle, XCircle, Trophy, Upload, Eye } from 'lucide-react'
import { useChallengeStatus, ChallengeStatus } from '@/hooks/useChallengeStatus'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ChallengeStatusBannerProps {
  challengeIds?: string[]
  compact?: boolean
  showStats?: boolean
  onSubmissionClick?: (challengeId: string) => void
}

export function ChallengeStatusBanner({ 
  challengeIds = [], 
  compact = false, 
  showStats = true,
  onSubmissionClick 
}: ChallengeStatusBannerProps) {
  const { data: session } = useSession()
  const { challengeStatuses, loading, error, formatTimeRemaining, isSubmissionDeadlineSoon } = useChallengeStatus(challengeIds, true, 600000) // 10 minutes refresh interval
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null)

  const getStatusColor = (status: ChallengeStatus) => {
    switch (status.computedStatus) {
      case 'OPEN':
        return isSubmissionDeadlineSoon(status.timeRemaining) ? 'destructive' : 'default'
      case 'UPCOMING':
        return 'secondary'
      case 'SUBMISSIONS_CLOSED':
        return 'destructive'
      case 'JUDGING':
        return 'default'
      case 'WINNERS_ANNOUNCED':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: ChallengeStatus) => {
    switch (status.computedStatus) {
      case 'OPEN':
        return isSubmissionDeadlineSoon(status.timeRemaining) ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />
      case 'UPCOMING':
        return <Clock className="h-4 w-4" />
      case 'SUBMISSIONS_CLOSED':
        return <XCircle className="h-4 w-4" />
      case 'JUDGING':
        return <Eye className="h-4 w-4" />
      case 'WINNERS_ANNOUNCED':
        return <Trophy className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusText = (status: ChallengeStatus) => {
    switch (status.computedStatus) {
      case 'OPEN':
        return 'Open for Submissions'
      case 'UPCOMING':
        return 'Coming Soon'
      case 'SUBMISSIONS_CLOSED':
        return 'Submissions Closed'
      case 'JUDGING':
        return 'Under Review'
      case 'WINNERS_ANNOUNCED':
        return 'Winners Announced'
      default:
        return status.status
    }
  }

  const handleSubmissionClick = (challengeId: string) => {
    if (onSubmissionClick) {
      onSubmissionClick(challengeId)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                <div className="h-6 bg-gray-300 rounded w-24"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load challenge status: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (challengeStatuses.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="pt-6">
          <div className="text-center text-gray-600">
            <Target className="h-8 w-8 mx-auto mb-2" />
            <p>No active challenges at the moment</p>
            <p className="text-sm">Check back later for new challenges!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {challengeStatuses.map((status) => (
        <Card key={status.challengeId} className={`transition-all duration-200 ${
          status.computedStatus === 'OPEN' && isSubmissionDeadlineSoon(status.timeRemaining) 
            ? 'border-amber-200 bg-amber-50' 
            : status.computedStatus === 'OPEN' 
            ? 'border-green-200 bg-green-50' 
            : ''
        }`}>
          <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CardTitle className={compact ? 'text-lg' : 'text-xl'}>
                  {status.title}
                </CardTitle>
                <Badge variant={getStatusColor(status)} className="flex items-center space-x-1">
                  {getStatusIcon(status)}
                  <span>{getStatusText(status)}</span>
                </Badge>
              </div>
              {!compact && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedChallenge(
                    expandedChallenge === status.challengeId ? null : status.challengeId
                  )}
                >
                  {expandedChallenge === status.challengeId ? 'Less' : 'More'}
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {status.timeRemaining && (
                  <div className="flex items-center space-x-2 min-w-0">
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className={`text-sm truncate ${
                      isSubmissionDeadlineSoon(status.timeRemaining) 
                        ? 'text-amber-700 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {formatTimeRemaining(status.timeRemaining)} remaining
                    </span>
                  </div>
                )}
                
                {showStats && (
                  <div className="flex items-center space-x-2 min-w-0">
                    <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {status.totalSubmissions} submissions
                    </span>
                  </div>
                )}
                
                {session?.user && (
                  <div className="flex items-center space-x-2 min-w-0">
                    <Target className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate">
                      {status.userSubmissionCount}/{status.maxEntriesPerUser} used
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                {status.canSubmit && session?.user && (
                  <Button
                    size="sm"
                    onClick={() => handleSubmissionClick(status.challengeId)}
                    className="flex items-center justify-center space-x-1 w-full sm:w-auto"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Submit Entry</span>
                  </Button>
                )}
                
                {!session?.user && status.computedStatus === 'OPEN' && (
                  <Link href="/api/auth/signin" className="w-full sm:w-auto">
                    <Button size="sm" variant="outline" className="w-full">
                      Login to Submit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Expanded section */}
            {expandedChallenge === status.challengeId && !compact && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700">Phase</div>
                    <div className="text-gray-600 capitalize">{status.phase.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Status</div>
                    <div className="text-gray-600">{status.status}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Max Entries</div>
                    <div className="text-gray-600">{status.maxEntriesPerUser} per user</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">Last Updated</div>
                    <div className="text-gray-600">
                      {new Date(status.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {status.userSubmissionCount > 0 && session?.user && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700">
                      You have {status.userSubmissionCount} active submission{status.userSubmissionCount !== 1 ? 's' : ''} in this challenge
                    </div>
                    <Link href={`/profile?challenge=${status.challengeId}`}>
                      <Button size="sm" variant="outline">
                        View My Submissions
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
