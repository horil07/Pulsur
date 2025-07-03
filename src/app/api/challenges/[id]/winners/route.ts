import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Simple admin check
const isAdmin = (email: string) => {
  return email === 'testuser@example.com' || email.includes('admin')
}

// Mock winners data - in production this would come from a database
const challengeWinners: { [challengeId: string]: Array<{
  id: string
  position: number
  user: {
    id: string
    name: string
    image?: string
  }
  submission: {
    id: string
    title: string
    voteCount: number
  }
  prize: string
}> } = {}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const params = await context.params
    const challengeId = params.id
    const winners = challengeWinners[challengeId] || []

    return NextResponse.json({ winners })
  } catch (error) {
    console.error('Failed to fetch winners:', error)
    return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const params = await context.params
    const challengeId = params.id
    const { position, submissionId, prize } = await request.json()

    if (!submissionId || !prize) {
      return NextResponse.json({ error: 'Submission ID and prize are required' }, { status: 400 })
    }

    const newWinner = {
      id: `winner_${Date.now()}`,
      position: position || 1,
      user: {
        id: 'user_placeholder', // Would be fetched from submission
        name: 'User Name', // Would be fetched from submission
        image: undefined
      },
      submission: {
        id: submissionId,
        title: 'Submission Title', // Would be fetched from submission
        voteCount: 0 // Would be fetched from submission
      },
      prize: prize || 'Prize'
    }

    if (!challengeWinners[challengeId]) {
      challengeWinners[challengeId] = []
    }

    challengeWinners[challengeId].push(newWinner)

    return NextResponse.json({ 
      success: true, 
      winner: newWinner 
    })
  } catch (error) {
    console.error('Failed to add winner:', error)
    return NextResponse.json({ error: 'Failed to add winner' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const params = await context.params
    const challengeId = params.id
    const { winnerId } = await request.json()

    if (!winnerId) {
      return NextResponse.json({ error: 'Winner ID is required' }, { status: 400 })
    }

    if (challengeWinners[challengeId]) {
      challengeWinners[challengeId] = challengeWinners[challengeId].filter(w => w.id !== winnerId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove winner:', error)
    return NextResponse.json({ error: 'Failed to remove winner' }, { status: 500 })
  }
}
