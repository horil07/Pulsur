import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { challengeId, currentStep, completed } = await request.json()

    if (!challengeId || typeof currentStep !== 'number') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Check if challenge exists
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { 
        id: true, 
        tutorialSteps: true,
        tutorialEnabled: true 
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    if (!challenge.tutorialEnabled) {
      return NextResponse.json({ error: 'Tutorial not enabled for this challenge' }, { status: 400 })
    }

    const tutorialSteps = challenge.tutorialSteps as any[]
    const totalSteps = tutorialSteps?.length || 0

    // Upsert tutorial progress
    const tutorialProgress = await prisma.challengeTutorialProgress.upsert({
      where: {
        userId_challengeId: {
          userId: session.user.id,
          challengeId: challengeId
        }
      },
      update: {
        currentStep: currentStep,
        totalSteps: totalSteps,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date()
      },
      create: {
        userId: session.user.id,
        challengeId: challengeId,
        currentStep: currentStep,
        totalSteps: totalSteps,
        completed: completed || false,
        completedAt: completed ? new Date() : null
      }
    })

    return NextResponse.json({
      success: true,
      tutorialProgress: {
        id: tutorialProgress.id,
        currentStep: tutorialProgress.currentStep,
        totalSteps: tutorialProgress.totalSteps,
        completed: tutorialProgress.completed,
        completedAt: tutorialProgress.completedAt
      }
    })

  } catch (error) {
    console.error('Tutorial progress save error:', error)
    return NextResponse.json(
      { error: 'Failed to save tutorial progress' },
      { status: 500 }
    )
  }
}
