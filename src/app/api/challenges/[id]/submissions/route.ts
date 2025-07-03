import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const challengeId = resolvedParams.id

    // Get challenge details
    const challenge = await prisma.challenge.findUnique({
      where: { 
        id: challengeId,
        isActive: true 
      },
      select: {
        id: true,
        title: true,
        maxEntriesPerUser: true,
        status: true,
        endDate: true
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Check if challenge is still accepting submissions
    const now = new Date()
    const isActive = challenge.status === 'OPEN' && challenge.endDate > now

    // Get user's current submissions for this challenge
    const userSubmissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
        challengeId: challengeId,
        status: {
          in: ['PENDING', 'APPROVED'] // Don't count rejected submissions
        }
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        voteCount: true,
        createdAt: true,
        contentUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const submissionCount = userSubmissions.length
    const remainingSlots = challenge.maxEntriesPerUser - submissionCount
    const canSubmit = isActive && remainingSlots > 0

    return NextResponse.json({
      success: true,
      data: {
        challenge: {
          id: challenge.id,
          title: challenge.title,
          maxEntriesPerUser: challenge.maxEntriesPerUser,
          isActive: isActive
        },
        submissions: {
          current: userSubmissions,
          count: submissionCount,
          maxAllowed: challenge.maxEntriesPerUser,
          remaining: remainingSlots,
          canSubmit: canSubmit
        }
      }
    })

  } catch (error) {
    console.error('Submission limits check error:', error)
    return NextResponse.json(
      { error: 'Failed to check submission limits' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionId } = await request.json()

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    // Verify the submission belongs to the user
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        userId: true,
        challengeId: true,
        title: true
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete the submission
    await prisma.submission.delete({
      where: { id: submissionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    })

  } catch (error) {
    console.error('Submission deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}
