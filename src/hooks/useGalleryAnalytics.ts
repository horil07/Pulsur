'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export interface GalleryAnalytics {
  sessionId: string
  trafficSource: string
  entryPoint: string
  referrer?: string
  utmParams?: {
    source?: string
    medium?: string
    campaign?: string
  }
}

interface UseGalleryAnalyticsReturn {
  analytics: GalleryAnalytics | null
  trackEvent: (event: string, metadata?: Record<string, unknown>) => Promise<void>
  trackGalleryView: (filter?: string, sort?: string) => Promise<void>
  trackContentInteraction: (
    action: 'view' | 'vote' | 'share' | 'filter' | 'search',
    submissionId?: string,
    metadata?: Record<string, unknown>
  ) => Promise<void>
}

export function useGalleryAnalytics(): UseGalleryAnalyticsReturn {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [analytics, setAnalytics] = useState<GalleryAnalytics | null>(null)

  // Initialize analytics on mount
  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem('gallery_session_id')
        if (!sessionId) {
          sessionId = `gallery_${Date.now()}_${Math.random().toString(36).substring(2)}`
          sessionStorage.setItem('gallery_session_id', sessionId)
        }

        // Detect traffic source
        const referrer = document.referrer
        const utmSource = searchParams.get('utm_source')
        const utmMedium = searchParams.get('utm_medium')
        const utmCampaign = searchParams.get('utm_campaign')

        let trafficSource = 'direct'
        if (utmSource || utmMedium || utmCampaign) {
          trafficSource = 'campaign'
        } else if (referrer) {
          if (referrer.includes('google.com') || referrer.includes('bing.com')) {
            trafficSource = 'organic'
          } else if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('instagram.com')) {
            trafficSource = 'social'
          } else {
            trafficSource = 'referral'
          }
        }

        const analyticsData: GalleryAnalytics = {
          sessionId,
          trafficSource,
          entryPoint: pathname,
          referrer: referrer || undefined,
          utmParams: {
            source: utmSource || undefined,
            medium: utmMedium || undefined,
            campaign: utmCampaign || undefined,
          }
        }

        setAnalytics(analyticsData)

        // Track initial gallery visit
        await fetch('/api/analytics/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'gallery_entry',
            sessionId,
            metadata: {
              trafficSource,
              entryPoint: pathname,
              referrer,
              utmParams: analyticsData.utmParams,
              timestamp: new Date().toISOString()
            }
          })
        })
      } catch (error) {
        console.error('Failed to initialize gallery analytics:', error)
      }
    }

    initializeAnalytics()
  }, [pathname, searchParams])

  // Generic event tracking
  const trackEvent = useCallback(async (
    event: string, 
    metadata?: Record<string, unknown>
  ) => {
    if (!analytics) return

    try {
      await fetch('/api/analytics/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          sessionId: analytics.sessionId,
          metadata: {
            ...metadata,
            trafficSource: analytics.trafficSource,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('Failed to track gallery event:', error)
    }
  }, [analytics])

  // Track gallery view with filters
  const trackGalleryView = useCallback(async (
    filter?: string,
    sort?: string
  ) => {
    await trackEvent('gallery_view', {
      filter: filter || 'all',
      sort: sort || 'recent',
      page: 'gallery'
    })
  }, [trackEvent])

  // Track content interactions
  const trackContentInteraction = useCallback(async (
    action: 'view' | 'vote' | 'share' | 'filter' | 'search',
    submissionId?: string,
    metadata?: Record<string, unknown>
  ) => {
    await trackEvent('gallery_interaction', {
      action,
      submissionId,
      ...metadata
    })
  }, [trackEvent])

  return {
    analytics,
    trackEvent,
    trackGalleryView,
    trackContentInteraction
  }
}

// Hook for gallery statistics
export function useGalleryStats() {
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalVotes: 0,
    activeUsers: 0,
    featuredSubmissions: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/gallery/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch gallery stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}

// Hook for gallery entry point optimization
export function useGalleryEntryOptimization() {
  const [optimizedContent, setOptimizedContent] = useState<{
    heroMessage: string
    ctaText: string
    featuredFilter: string
  } | null>(null)

  const { analytics } = useGalleryAnalytics()

  useEffect(() => {
    if (!analytics) return

    // Optimize content based on traffic source
    const getOptimizedContent = () => {
      switch (analytics.trafficSource) {
        case 'campaign':
          return {
            heroMessage: 'Welcome to our exclusive showcase!',
            ctaText: 'Explore Campaign Highlights',
            featuredFilter: 'featured'
          }
        case 'social':
          return {
            heroMessage: 'Thanks for joining us from social!',
            ctaText: 'See What\'s Trending',
            featuredFilter: 'popular'
          }
        case 'organic':
          return {
            heroMessage: 'Discover what you\'ve been searching for!',
            ctaText: 'Browse All Content',
            featuredFilter: 'all'
          }
        default:
          return {
            heroMessage: 'Welcome to the Pulsar Gallery',
            ctaText: 'Start Exploring',
            featuredFilter: 'recent'
          }
      }
    }

    setOptimizedContent(getOptimizedContent())
  }, [analytics])

  return optimizedContent
}
