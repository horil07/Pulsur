import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { pulsarAI } from '@/lib/pulsar-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, prompt, style, theme, voice, options } = await request.json()

    // Map legacy type to new content type
    const contentType = type === 'artwork' ? 'image' : type === 'song' ? 'music' : type

    // Get user skill level for personalized generation
    const skillLevel = await pulsarAI.assessCreatorSkill(session.user.id)

    // Generate content suggestions before generation
    const suggestions = await pulsarAI.generateContentSuggestions({
      prompt,
      contentType,
      userLevel: skillLevel
    })

    // Use Pulsar AI for content generation with enhanced prompts
    const enhancedOptions = {
      style: style || theme,
      voice,
      skillLevel: skillLevel.level,
      suggestions: suggestions.slice(0, 3), // Use top 3 suggestions
      ...options
    }

    const result = await pulsarAI.generateContent({
      type: contentType,
      prompt,
      style: style || theme,
      options: enhancedOptions
    })

    if (!result.success) {
      return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
    }

    // Score the generated content quality
    const qualityScore = await pulsarAI.scoreContentQuality({
      type: contentType,
      url: result.contentUrl,
      prompt,
      metadata: result.metadata
    })

    return NextResponse.json({ 
      success: true, 
      contentUrl: result.contentUrl,
      type: contentType,
      metadata: result.metadata,
      qualityScore,
      suggestions: suggestions.slice(0, 5), // Return top 5 suggestions
      skillLevel,
      generationId: result.generationId
    })
  } catch (error) {
    console.error('AI Generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}


