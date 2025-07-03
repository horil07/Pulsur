import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface TutorialProgress {
  userId: string
  challengeId: string
  currentStep: number
  completedSteps: string[]
  startedAt: string
  lastActivityAt: string
  completedAt?: string
  totalTimeSpent: number // in seconds
  skipCount: number
  stepData: Record<string, {
    startedAt: string
    completedAt?: string
    timeSpent: number
    attempts: number
    actionCompleted?: boolean
  }>
}

// Mock storage - in production, this would be in a database
const tutorialProgress: Record<string, TutorialProgress> = {}

// GET - Get user's tutorial progress
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get('challengeId')
    
    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    const progressKey = `${session.user.id}-${challengeId}`
    const progress = tutorialProgress[progressKey]
    
    return NextResponse.json({
      success: true,
      progress: progress || null
    })
  } catch (error) {
    console.error('Failed to fetch tutorial progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

// POST - Update tutorial progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const {
      challengeId,
      stepId,
      action,
      timeSpent,
      actionCompleted
    } = await request.json()
    
    if (!challengeId || !stepId || !action) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID, step ID, and action are required' },
        { status: 400 }
      )
    }
    
    const progressKey = `${session.user.id}-${challengeId}`
    let progress = tutorialProgress[progressKey]
    
    // Initialize progress if it doesn't exist
    if (!progress) {
      progress = {
        userId: session.user.id,
        challengeId,
        currentStep: 0,
        completedSteps: [],
        startedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        totalTimeSpent: 0,
        skipCount: 0,
        stepData: {}
      }
    }
    
    // Update progress based on action
    switch (action) {
      case 'start':
        progress.stepData[stepId] = {
          startedAt: new Date().toISOString(),
          timeSpent: 0,
          attempts: 1,
          actionCompleted: false
        }
        break
        
      case 'complete':
        if (progress.stepData[stepId]) {
          progress.stepData[stepId].completedAt = new Date().toISOString()
          progress.stepData[stepId].timeSpent += timeSpent || 0
          progress.stepData[stepId].actionCompleted = actionCompleted !== false
        }
        
        if (!progress.completedSteps.includes(stepId)) {
          progress.completedSteps.push(stepId)
        }
        
        progress.currentStep = Math.max(progress.currentStep, progress.completedSteps.length)
        break
        
      case 'skip':
        progress.skipCount += 1
        if (!progress.completedSteps.includes(stepId)) {
          progress.completedSteps.push(stepId)
        }
        progress.currentStep = Math.max(progress.currentStep, progress.completedSteps.length)
        break
        
      case 'action':
        if (progress.stepData[stepId]) {
          progress.stepData[stepId].actionCompleted = true
        }
        break
        
      case 'finish':
        progress.completedAt = new Date().toISOString()
        break
    }
    
    // Update timestamps and time tracking
    progress.lastActivityAt = new Date().toISOString()
    if (timeSpent) {
      progress.totalTimeSpent += timeSpent
    }
    
    tutorialProgress[progressKey] = progress
    
    return NextResponse.json({
      success: true,
      progress
    })
  } catch (error) {
    console.error('Failed to update tutorial progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}

// DELETE - Reset tutorial progress
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get('challengeId')
    
    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    const progressKey = `${session.user.id}-${challengeId}`
    delete tutorialProgress[progressKey]
    
    return NextResponse.json({
      success: true,
      message: 'Tutorial progress reset successfully'
    })
  } catch (error) {
    console.error('Failed to reset tutorial progress:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset progress' },
      { status: 500 }
    )
  }
}
