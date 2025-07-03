import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface ChallengeStatus {
  challengeId: string
  title: string
  status: string
  computedStatus: string
  phase: string
  timeRemaining: number | null
  canSubmit: boolean
  userSubmissionCount: number
  maxEntriesPerUser: number
  totalSubmissions: number
  lastUpdated: string
  serverTime: string
}

export interface ChallengeStatusHookResult {
  challengeStatuses: ChallengeStatus[]
  loading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  getChallengeStatus: (challengeId: string) => ChallengeStatus | undefined
  formatTimeRemaining: (timeRemaining: number | null) => string
  isSubmissionDeadlineSoon: (timeRemaining: number | null) => boolean
}

export function useChallengeStatus(
  challengeIds: string[] = [],
  autoRefresh: boolean = true,
  refreshInterval: number = 300000 // 5 minutes (300,000ms) - Much more reasonable for challenge status
): ChallengeStatusHookResult {
  const { data: session } = useSession()
  const [challengeStatuses, setChallengeStatuses] = useState<ChallengeStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastFetchTimeRef = useRef<number>(0)
  
  // Enforce minimum refresh interval of 60 seconds to prevent server overload
  const actualRefreshInterval = Math.max(refreshInterval, 60000)

  const fetchChallengeStatus = useCallback(async () => {
    // Rate limiting: Don't fetch more than once every 60 seconds
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTimeRef.current
    if (timeSinceLastFetch < 60000) {
      return
    }
    
    try {
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      abortControllerRef.current = new AbortController()
      lastFetchTimeRef.current = now
      
      const params = new URLSearchParams()
      if (challengeIds.length > 0) {
        params.append('ids', challengeIds.join(','))
      }
      
      const response = await fetch(`/api/challenges/status?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setChallengeStatuses(data.statusUpdates)
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch challenge status')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching challenge status:', err)
        setError(err.message || 'Failed to fetch challenge status')
      }
    } finally {
      setLoading(false)
    }
  }, [challengeIds])

  const refreshStatus = useCallback(async () => {
    setLoading(true)
    await fetchChallengeStatus()
  }, [fetchChallengeStatus])

  const getChallengeStatus = useCallback((challengeId: string): ChallengeStatus | undefined => {
    return challengeStatuses.find(status => status.challengeId === challengeId)
  }, [challengeStatuses])

  const formatTimeRemaining = useCallback((timeRemaining: number | null): string => {
    if (!timeRemaining || timeRemaining <= 0) return 'Expired'
    
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else if (minutes > 0) {
      return `${minutes}m remaining`
    } else {
      return 'Less than 1m remaining'
    }
  }, [])

  const isSubmissionDeadlineSoon = useCallback((timeRemaining: number | null): boolean => {
    if (!timeRemaining) return false
    // Consider "soon" as less than 24 hours (86400000 ms)
    return timeRemaining < 86400000 && timeRemaining > 0
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchChallengeStatus()
  }, [fetchChallengeStatus])

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      intervalRef.current = setInterval(() => {
        fetchChallengeStatus()
      }, actualRefreshInterval)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    } else {
      // Clear interval if autoRefresh is disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, actualRefreshInterval, fetchChallengeStatus])

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    challengeStatuses,
    loading,
    error,
    refreshStatus,
    getChallengeStatus,
    formatTimeRemaining,
    isSubmissionDeadlineSoon
  }
}
