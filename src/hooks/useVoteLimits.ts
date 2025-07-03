'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface VoteLimits {
  dailyLimit: number
  votesUsed: number
  remainingVotes: number
  canVote: boolean
  timeUntilReset: number
  resetTime: string
  isGuest: boolean
}

export interface VoteHistory {
  id: string
  votedAt: string
  submission: {
    id: string
    title: string
    type: string
    contentUrl: string
    caption?: string
    voteCount: number
    creator: {
      id: string
      name: string
      image?: string
    }
  }
  canChangeVote: boolean
}

/**
 * R39: Enhanced Voting System Hook
 * Manages daily vote limits, tracking, and history
 */
export function useVoteLimits() {
  const { data: session, status } = useSession()
  const [limits, setLimits] = useState<VoteLimits>({
    dailyLimit: 3,
    votesUsed: 0,
    remainingVotes: 3,
    canVote: false,
    timeUntilReset: 0,
    resetTime: new Date().toISOString(),
    isGuest: true
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLimits = useCallback(async () => {
    // Don't fetch if session is still loading
    if (status === 'loading') {
      return
    }
    
    // If no session or unauthenticated, set guest state
    if (status === 'unauthenticated' || !session) {
      setLimits(prev => ({ ...prev, isGuest: true, canVote: false, remainingVotes: 0 }))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/votes/limits')
      const data = await response.json()

      if (response.ok) {
        setLimits({
          dailyLimit: data.dailyLimit,
          votesUsed: data.votesUsed,
          remainingVotes: data.remainingVotes,
          canVote: data.canVote,
          timeUntilReset: data.timeUntilReset,
          resetTime: data.resetTime,
          isGuest: data.isGuest || false
        })
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch vote limits')
      }
    } catch (err) {
      setError('Network error fetching vote limits')
      console.error('Vote limits fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [session, status])

  // Update limits after a vote action
  const updateLimitsAfterVote = useCallback((action: 'added' | 'removed', newRemainingVotes: number, newVotesUsed: number) => {
    setLimits(prev => ({
      ...prev,
      votesUsed: newVotesUsed,
      remainingVotes: newRemainingVotes,
      canVote: newRemainingVotes > 0
    }))
  }, [])

  // Fetch limits on mount and session change
  useEffect(() => {
    fetchLimits()
  }, [fetchLimits])

  // Auto-refresh limits every minute to handle reset time
  useEffect(() => {
    const interval = setInterval(() => {
      if (limits.timeUntilReset > 0 && limits.timeUntilReset < 60000) {
        // Reset happening soon, refresh limits
        fetchLimits()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [limits.timeUntilReset, fetchLimits])

  return {
    limits,
    loading,
    error,
    refetch: fetchLimits,
    updateLimitsAfterVote
  }
}

/**
 * R39.3: Vote History Hook
 */
export function useVoteHistory(timeRange: 'today' | 'week' | 'month' | 'all' = 'today') {
  const { data: session } = useSession()
  const [history, setHistory] = useState<VoteHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  const fetchHistory = useCallback(async (page = 1) => {
    if (!session) {
      setHistory([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/votes/history?page=${page}&limit=${pagination.limit}&timeRange=${timeRange}`)
      const data = await response.json()

      if (response.ok) {
        setHistory(data.votes)
        setPagination(data.pagination)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch vote history')
      }
    } catch (err) {
      setError('Network error fetching vote history')
      console.error('Vote history fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [session, timeRange, pagination.limit])

  const removeVote = useCallback(async (voteId: string, submissionId: string) => {
    try {
      const response = await fetch(`/api/votes/history?voteId=${voteId}&submissionId=${submissionId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (response.ok) {
        // Remove vote from history
        setHistory(prev => prev.filter(vote => vote.id !== voteId))
        return { success: true, message: data.message }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      console.error('Remove vote error:', err)
      return { success: false, error: 'Network error removing vote' }
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    removeVote,
    refetch: () => fetchHistory(1)
  }
}

/**
 * R39.1 & R39.2: Format time until reset for display
 */
export function formatTimeUntilReset(timeUntilReset: number): string {
  if (timeUntilReset <= 0) return 'Resetting now...'

  const hours = Math.floor(timeUntilReset / (1000 * 60 * 60))
  const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) {
    return `${hours}h ${minutes}m until reset`
  } else if (minutes > 0) {
    return `${minutes}m until reset`
  } else {
    return 'Less than 1m until reset'
  }
}
