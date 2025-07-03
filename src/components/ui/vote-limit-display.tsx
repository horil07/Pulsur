'use client'

import { Clock, Heart, User, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useVoteLimits, formatTimeUntilReset } from '@/hooks/useVoteLimits'

interface VoteLimitDisplayProps {
  showDetails?: boolean
  compact?: boolean
  className?: string
}

/**
 * R39.1: Vote Limit Tracking Display Component
 * Shows remaining votes, countdown timer, and limit information
 */
export function VoteLimitDisplay({ 
  showDetails = true, 
  compact = false, 
  className = '' 
}: VoteLimitDisplayProps) {
  const { limits, loading, error, refetch } = useVoteLimits()

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className={`border-red-200 bg-red-50 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Error loading vote limits</span>
            <Button size="sm" variant="ghost" onClick={refetch}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (limits.isGuest) {
    return (
      <Card className={`border-blue-200 bg-blue-50 ${className}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-blue-600">
            <User className="w-4 h-4" />
            <span className="text-sm">Login to vote on submissions</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = (limits.votesUsed / limits.dailyLimit) * 100

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Heart className={`w-4 h-4 ${limits.canVote ? 'text-red-500' : 'text-gray-400'}`} />
        <span className="text-sm font-medium">
          {limits.remainingVotes}/{limits.dailyLimit}
        </span>
        {limits.remainingVotes === 0 && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {formatTimeUntilReset(limits.timeUntilReset)}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <Card className={`${className} ${limits.remainingVotes === 0 ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className={`w-5 h-5 ${limits.canVote ? 'text-red-500' : 'text-gray-400'}`} />
            <span className="font-semibold text-gray-800">Daily Votes</span>
          </div>
          <Badge variant={limits.remainingVotes > 0 ? 'default' : 'secondary'}>
            {limits.remainingVotes} remaining
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{limits.votesUsed} used</span>
            <span>{limits.dailyLimit} total</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                limits.remainingVotes === 0 
                  ? 'bg-orange-500' 
                  : progressPercentage > 66 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {showDetails && (
          <div className="text-sm text-gray-600">
            {limits.remainingVotes > 0 ? (
              <p>You have <span className="font-medium text-green-600">{limits.remainingVotes} votes</span> remaining today.</p>
            ) : (
              <div>
                <p className="text-orange-600 font-medium mb-2">
                  You've used all your votes for today!
                </p>
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeUntilReset(limits.timeUntilReset)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * R39.2: Vote Button with Limit Awareness
 */
interface VoteButtonProps {
  submissionId: string
  currentVoteCount: number
  hasVoted: boolean
  onVote: (submissionId: string) => Promise<any>
  disabled?: boolean
  size?: 'sm' | 'lg' | 'default'
  className?: string
}

export function VoteButton({
  submissionId,
  currentVoteCount,
  hasVoted,
  onVote,
  disabled = false,
  size = 'default',
  className = ''
}: VoteButtonProps) {
  const { limits } = useVoteLimits()

  const canVote = !limits.isGuest && (hasVoted || limits.canVote) && !disabled
  const buttonText = hasVoted ? 'Voted' : 'Vote'
  const buttonTitle = limits.isGuest 
    ? 'Login to vote' 
    : !limits.canVote && !hasVoted
      ? `Daily limit reached (${limits.votesUsed}/${limits.dailyLimit}). Try again tomorrow!`
      : hasVoted 
        ? 'Click to remove vote' 
        : `Vote for this submission (${limits.remainingVotes} votes remaining)`

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  return (
    <Button
      size={size}
      variant={hasVoted ? 'default' : 'outline'}
      onClick={(e) => {
        e.stopPropagation()
        onVote(submissionId)
      }}
      disabled={!canVote}
      title={buttonTitle}
      className={`transition-all duration-200 ${
        hasVoted 
          ? 'cyber-button neon-glow-pink' 
          : canVote
            ? 'bg-black/30 text-[#00E5FF] border-[#00E5FF]/50 hover:bg-[#00E5FF]/10 hover:border-[#00E5FF] backdrop-blur-sm'
            : 'opacity-50 cursor-not-allowed'
      } ${sizeClasses[size]} ${className}`}
    >
      <Heart className={`w-4 h-4 mr-1 transition-all ${
        hasVoted 
          ? 'fill-current text-white' 
          : canVote
            ? 'text-[#00E5FF] hover:text-[#FF006F]'
            : 'text-gray-400'
      }`} />
      <span className="font-medium">{currentVoteCount}</span>
      {!limits.isGuest && limits.remainingVotes <= 1 && !hasVoted && limits.canVote && (
        <Badge variant="secondary" className="ml-2 text-xs">
          Last vote!
        </Badge>
      )}
    </Button>
  )
}
