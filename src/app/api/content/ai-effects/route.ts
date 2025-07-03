import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { submissionId, effects, parameters } = await request.json()

    if (!submissionId || !effects || !Array.isArray(effects) || effects.length === 0) {
      return NextResponse.json({ error: 'Submission ID and effects array are required' }, { status: 400 })
    }

    // Check if user owns the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this submission' }, { status: 403 })
    }

    // Create a new content modification record
    const modification = await prisma.contentModification.create({
      data: {
        submissionId,
        userId: session.user.id,
        modificationType: 'AI_EFFECTS_ENHANCEMENT',
        aiEffects: {
          appliedEffects: effects,
          parameters: parameters || {},
          timestamp: new Date().toISOString()
        },
        parameters: parameters || {},
        processingStatus: 'PROCESSING'
      }
    })

    // Simulate AI processing (longer for effects)
    const processingTime = 3000 + (effects.length * 1000) // More effects = longer processing
    await new Promise(resolve => setTimeout(resolve, processingTime))

    try {
      // Update the modification with the result
      const updatedModification = await prisma.contentModification.update({
        where: { id: modification.id },
        data: {
          processingStatus: 'COMPLETED',
          resultUrl: generateEnhancedContentUrl(submission.contentUrl, effects),
          previewUrl: generatePreviewUrl(submission.contentUrl, effects),
          processingTime
        }
      })

      return NextResponse.json({
        success: true,
        modification: updatedModification,
        message: `AI effects applied successfully: ${effects.join(', ')}`
      })

    } catch (updateError) {
      // If update fails, mark as failed
      await prisma.contentModification.update({
        where: { id: modification.id },
        data: {
          processingStatus: 'FAILED',
          errorMessage: 'Failed to apply AI effects',
          processingTime
        }
      })
      throw updateError
    }

  } catch (error) {
    console.error('Error applying AI effects:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Get all AI effects modifications for this submission
    const modifications = await prisma.contentModification.findMany({
      where: {
        submissionId,
        userId: session.user.id,
        modificationType: 'AI_EFFECTS_ENHANCEMENT'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      modifications,
      count: modifications.length,
      availableEffects: getAvailableEffects()
    })

  } catch (error) {
    console.error('Error fetching AI effects modifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateEnhancedContentUrl(originalUrl: string, effects: string[]): string {
  const timestamp = Date.now()
  const effectsParam = effects.join(',')
  return `${originalUrl}?enhanced=${effectsParam}&t=${timestamp}`
}

function generatePreviewUrl(originalUrl: string, effects: string[]): string {
  const timestamp = Date.now()
  const effectsParam = effects.join(',')
  return `${originalUrl}?preview=enhanced&effects=${effectsParam}&t=${timestamp}&w=300&h=200`
}

function getAvailableEffects() {
  return [
    {
      id: 'enhance_colors',
      name: 'Enhance Colors',
      description: 'Boost color saturation and vibrancy',
      category: 'color',
      processingTime: 2
    },
    {
      id: 'sharpen',
      name: 'Sharpen',
      description: 'Increase image sharpness and detail',
      category: 'detail',
      processingTime: 1
    },
    {
      id: 'noise_reduction',
      name: 'Noise Reduction',
      description: 'Remove noise and grain',
      category: 'cleanup',
      processingTime: 3
    },
    {
      id: 'style_transfer',
      name: 'Style Transfer',
      description: 'Apply artistic style effects',
      category: 'artistic',
      processingTime: 5
    },
    {
      id: 'upscale',
      name: 'Upscale',
      description: 'Increase resolution using AI',
      category: 'resolution',
      processingTime: 4
    },
    {
      id: 'cinematic',
      name: 'Cinematic Look',
      description: 'Apply cinematic color grading',
      category: 'style',
      processingTime: 3
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Style',
      description: 'Apply neon cyberpunk effects',
      category: 'style',
      processingTime: 4
    },
    {
      id: 'vintage',
      name: 'Vintage Filter',
      description: 'Apply retro vintage look',
      category: 'style',
      processingTime: 2
    }
  ]
}
