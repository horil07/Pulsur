import { prisma } from './prisma'

export interface TrafficSource {
  source: 'organic' | 'campaign' | 'self-discovery' | 'social' | 'direct'
  medium?: string
  campaign?: string
  referrer?: string
}

export interface SessionData {
  sessionId: string
  userId?: string
  ipAddress?: string
  userAgent?: string
  trafficSource?: TrafficSource
  landingPage?: string
  country?: string
  device?: string
}

export class AnalyticsService {
  static async trackSession(sessionData: SessionData) {
    try {
      await prisma.userSession.create({
        data: {
          sessionId: sessionData.sessionId,
          userId: sessionData.userId,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          trafficSource: sessionData.trafficSource?.source,
          referrer: sessionData.trafficSource?.referrer,
          landingPage: sessionData.landingPage,
          country: sessionData.country,
          device: sessionData.device,
        }
      })
    } catch (error) {
      console.error('Failed to track session:', error)
    }
  }

  static async trackEvent(
    event: string, 
    userId?: string, 
    sessionId?: string, 
    metadata?: Record<string, unknown>
  ) {
    try {
      await prisma.analytics.create({
        data: {
          event,
          userId,
          sessionId,
          metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
        }
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  static async trackSocialShare(
    userId: string,
    platform: string,
    shareUrl: string,
    submissionId?: string
  ) {
    try {
      await prisma.socialShare.create({
        data: {
          userId,
          submissionId,
          platform,
          shareUrl
        }
      })
    } catch (error) {
      console.error('Failed to track social share:', error)
    }
  }

  static detectTrafficSource(req: Request): TrafficSource {
    const url = new URL(req.url)
    const referrer = req.headers.get('referer')
    const utmSource = url.searchParams.get('utm_source')
    const utmMedium = url.searchParams.get('utm_medium')
    const utmCampaign = url.searchParams.get('utm_campaign')

    // Campaign traffic (has UTM parameters)
    if (utmSource || utmMedium || utmCampaign) {
      return {
        source: 'campaign',
        medium: utmMedium || undefined,
        campaign: utmCampaign || undefined,
        referrer: referrer || undefined
      }
    }

    // Social media traffic
    if (referrer) {
      const socialPlatforms = ['facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'tiktok.com']
      const isSocial = socialPlatforms.some(platform => referrer.includes(platform))
      if (isSocial) {
        return {
          source: 'social',
          referrer
        }
      }

      // Search engine traffic (organic)
      const searchEngines = ['google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com']
      const isOrganic = searchEngines.some(engine => referrer.includes(engine))
      if (isOrganic) {
        return {
          source: 'organic',
          referrer
        }
      }

      // Other referrer traffic
      return {
        source: 'self-discovery',
        referrer
      }
    }

    // Direct traffic
    return {
      source: 'direct'
    }
  }

  static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }

  static getDeviceType(userAgent: string): string {
    const mobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
    const tablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)
    
    if (tablet) return 'tablet'
    if (mobile) return 'mobile'
    return 'desktop'
  }
}
