'use client'

import { useEffect, useState } from 'react'
import { AnalyticsService } from '@/lib/analytics'

export interface TrafficSource {
  source: string
  medium: string
  campaign?: string
  content?: string
  term?: string
  referrer?: string
  utmParams?: Record<string, string>
}

export function useTrafficSource() {
  const [trafficSource, setTrafficSource] = useState<TrafficSource | null>(null)
  const [isTracked, setIsTracked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || isTracked) return

    const urlParams = new URLSearchParams(window.location.search)
    const referrer = document.referrer
    
    // Extract UTM parameters
    const utmParams: Record<string, string> = {}
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    
    utmKeys.forEach(key => {
      const value = urlParams.get(key)
      if (value) {
        utmParams[key] = value
      }
    })

    // Determine traffic source
    let source = 'direct'
    let medium = 'none'
    
    if (utmParams.utm_source) {
      source = utmParams.utm_source
      medium = utmParams.utm_medium || 'unknown'
    } else if (referrer) {
      const referrerDomain = new URL(referrer).hostname
      
      // Check for common social media and search engines
      if (referrerDomain.includes('google')) {
        source = 'google'
        medium = 'organic'
      } else if (referrerDomain.includes('facebook')) {
        source = 'facebook'
        medium = 'social'
      } else if (referrerDomain.includes('twitter') || referrerDomain.includes('x.com')) {
        source = 'twitter'
        medium = 'social'
      } else if (referrerDomain.includes('instagram')) {
        source = 'instagram'
        medium = 'social'
      } else if (referrerDomain.includes('linkedin')) {
        source = 'linkedin'
        medium = 'social'
      } else if (referrerDomain.includes('youtube')) {
        source = 'youtube'
        medium = 'social'
      } else if (referrerDomain.includes('tiktok')) {
        source = 'tiktok'
        medium = 'social'
      } else {
        source = referrerDomain
        medium = 'referral'
      }
    }

    const trafficData: TrafficSource = {
      source,
      medium,
      campaign: utmParams.utm_campaign,
      content: utmParams.utm_content,
      term: utmParams.utm_term,
      referrer: referrer || undefined,
      utmParams: Object.keys(utmParams).length > 0 ? utmParams : undefined
    }

    setTrafficSource(trafficData)
    
    // Track the session with traffic source
    const sessionId = AnalyticsService.generateSessionId()
    AnalyticsService.trackSession({
      sessionId,
      landingPage: window.location.pathname,
      trafficSource: {
        source: (source === 'google' || source === 'facebook' || source === 'twitter' || source === 'instagram' || source === 'linkedin' || source === 'youtube' || source === 'tiktok') 
          ? (medium === 'social' ? 'social' : 'organic') 
          : (medium === 'referral' ? 'self-discovery' : 'direct') as 'organic' | 'campaign' | 'self-discovery' | 'social' | 'direct',
        medium,
        campaign: trafficData.campaign,
        referrer: trafficData.referrer
      },
      device: AnalyticsService.getDeviceType(navigator.userAgent),
      userAgent: navigator.userAgent
    }).catch(console.error)
    
    // Store session ID and traffic source
    localStorage.setItem('sessionId', sessionId)
    localStorage.setItem('trafficSource', JSON.stringify(trafficData))
    
    setIsTracked(true)
  }, [isTracked])

  return trafficSource
}
