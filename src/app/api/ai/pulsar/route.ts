/**
 * Pulsar AI API Route
 * Handles all AI-related functionality including skill assessment,
 * content suggestions, and quality scoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pulsarAI, CreatorSkillLevel } from '@/lib/pulsar-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, ...params } = await request.json()

    switch (action) {
      case 'assess-skill':
        return await handleSkillAssessment(session.user.id)
      
      case 'generate-suggestions':
        return await handleContentSuggestions(params)
      
      case 'score-quality':
        return await handleQualityScoring(params)
      
      case 'generate-content':
        return await handleContentGeneration(params)
      
      case 'get-capabilities':
        return await handleGetCapabilities()
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Pulsar AI API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

async function handleSkillAssessment(userId: string) {
  try {
    const skillLevel = await pulsarAI.assessCreatorSkill(userId)
    return NextResponse.json({ success: true, skillLevel })
  } catch (error) {
    console.error('Skill assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to assess creator skill' }, 
      { status: 500 }
    )
  }
}

async function handleContentSuggestions(params: {
  prompt: string
  contentType: 'image' | 'music' | 'video'
  userLevel?: CreatorSkillLevel
  context?: string
}) {
  try {
    const { prompt, contentType, userLevel, context } = params
    
    if (!prompt || !contentType) {
      return NextResponse.json(
        { error: 'Prompt and content type are required' }, 
        { status: 400 }
      )
    }

    const defaultUserLevel: CreatorSkillLevel = {
      level: 'beginner',
      confidence: 0.5,
      metrics: {
        submissionCount: 0,
        averageVotes: 0,
        completionRate: 0,
        timeSpent: [],
        toolsUsed: []
      },
      recommendations: {
        nextTools: [],
        skillBuilding: [],
        challenges: []
      }
    }

    const suggestions = await pulsarAI.generateContentSuggestions({
      prompt,
      contentType,
      userLevel: userLevel || defaultUserLevel,
      context
    })

    return NextResponse.json({ success: true, suggestions })
  } catch (error) {
    console.error('Content suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content suggestions' }, 
      { status: 500 }
    )
  }
}

async function handleQualityScoring(params: {
  type: 'image' | 'music' | 'video'
  url: string
  prompt?: string
  metadata?: Record<string, unknown>
}) {
  try {
    const { type, url, prompt, metadata } = params
    
    if (!type || !url) {
      return NextResponse.json(
        { error: 'Content type and URL are required' }, 
        { status: 400 }
      )
    }

    const qualityScore = await pulsarAI.scoreContentQuality({
      type,
      url,
      prompt,
      metadata
    })

    return NextResponse.json({ success: true, qualityScore })
  } catch (error) {
    console.error('Quality scoring error:', error)
    return NextResponse.json(
      { error: 'Failed to score content quality' }, 
      { status: 500 }
    )
  }
}

async function handleContentGeneration(params: {
  type: 'image' | 'music' | 'video'
  prompt: string
  style?: string
  options?: Record<string, unknown>
}) {
  try {
    const { type, prompt, style, options } = params
    
    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Content type and prompt are required' }, 
        { status: 400 }
      )
    }

    const result = await pulsarAI.generateContent({
      type,
      prompt,
      style,
      options
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' }, 
      { status: 500 }
    )
  }
}

async function handleGetCapabilities() {
  try {
    const capabilities = await pulsarAI.getCapabilities()
    return NextResponse.json({ success: true, capabilities })
  } catch (error) {
    console.error('Get capabilities error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI capabilities' }, 
      { status: 500 }
    )
  }
}
