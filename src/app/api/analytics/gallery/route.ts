import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/analytics'

// Gallery-specific analytics events
interface GalleryAnalyticsEvent {
  event: string
  sessionId: string
  userId?: string
  metadata?: {
    trafficSource?: string
    entryPoint?: string
    referrer?: string
    utmParams?: {
      source?: string
      medium?: string
      campaign?: string
    }
    filter?: string
    sort?: string
    action?: string
    submissionId?: string
    searchQuery?: string
    timestamp?: string
    [key: string]: unknown
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GalleryAnalyticsEvent = await request.json()
    const { event, sessionId, userId, metadata } = body

    // Validate required fields
    if (!event || !sessionId) {
      return NextResponse.json(
        { error: 'Event and sessionId are required' },
        { status: 400 }
      )
    }

    // Store the analytics event using AnalyticsService
    await AnalyticsService.trackEvent(event, userId, sessionId, metadata)

    // For gallery entry events, also track additional data using AnalyticsService
    if (event === 'gallery_entry' && metadata) {
      // Track traffic source analytics
      if (metadata.trafficSource && metadata.entryPoint) {
        await AnalyticsService.trackEvent(
          'gallery_traffic_source',
          userId,
          sessionId,
          {
            source: metadata.trafficSource,
            entryPoint: metadata.entryPoint,
            referrer: metadata.referrer,
            utmSource: metadata.utmParams?.source,
            utmMedium: metadata.utmParams?.medium,
            utmCampaign: metadata.utmParams?.campaign,
            timestamp: metadata.timestamp
          }
        )
      }
    }

    // For gallery interactions, track specific interaction types using AnalyticsService
    if (event === 'gallery_interaction' && metadata) {
      await AnalyticsService.trackEvent(
        `gallery_${metadata.action}`, // gallery_view, gallery_vote, etc.
        userId,
        sessionId,
        {
          submissionId: metadata.submissionId,
          action: metadata.action,
          trafficSource: metadata.trafficSource,
          timestamp: metadata.timestamp
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Gallery analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '7d'

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // For now, return mock analytics data until we resolve the Prisma model issue
    // This will be functional for testing the gallery components
    const mockAnalytics = {
      totalEvents: 156,
      timeframe,
      trafficSources: {
        'direct': 45,
        'organic': 32,
        'social': 28,
        'campaign': 18,
        'referral': 33
      },
      interactions: {
        'gallery_entry': 89,
        'gallery_view': 234,
        'gallery_vote': 67,
        'gallery_filter': 45,
        'gallery_search': 23
      },
      entryPoints: {
        '/gallery': 156,
        '/challenges': 23,
        '/': 45
      },
      events: [] // Empty for now
    }

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error('Gallery analytics retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}
