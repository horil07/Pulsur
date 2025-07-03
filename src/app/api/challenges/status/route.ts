import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/challenges/status - Get real-time status updates for all challenges
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const challengeIds = searchParams.get('ids')?.split(',') || []
    
    const session = await getServerSession(authOptions)
    const now = new Date()
    
    // Get current challenges
    const challenges = await prisma.challenge.findMany({
      where: challengeIds.length > 0 ? {
        id: { in: challengeIds },
        isActive: true
      } : {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        winnersAnnounceDate: true,
        maxEntriesPerUser: true,
        updatedAt: true,
        _count: {
          select: {
            submissions: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        },
        ...(session?.user?.id && {
          submissions: {
            where: {
              userId: session.user.id,
              status: 'APPROVED'
            },
            select: {
              id: true
            }
          }
        })
      }
    })
    
    // Compute real-time status for each challenge
    const statusUpdates = challenges.map((challenge: any) => {
      const startDate = new Date(challenge.startDate)
      const endDate = new Date(challenge.endDate)
      
      let computedStatus = challenge.status
      let timeRemaining = null
      let canSubmit = false
      let phase = 'unknown'
      
      if (challenge.status === 'OPEN') {
        if (now < startDate) {
          computedStatus = 'UPCOMING'
          timeRemaining = startDate.getTime() - now.getTime()
          phase = 'pre_launch'
        } else if (now > endDate) {
          computedStatus = 'SUBMISSIONS_CLOSED'
          phase = 'submission_closed'
        } else {
          canSubmit = true
          timeRemaining = endDate.getTime() - now.getTime()
          phase = 'open_for_submissions'
        }
      } else if (challenge.status === 'JUDGING') {
        phase = 'judging'
      } else if (challenge.status === 'WINNERS_ANNOUNCED') {
        phase = 'winners_announced'
      }
      
      // Calculate user submission status
      let userSubmissionCount = 0
      let userCanSubmit = canSubmit
      
      if (session?.user?.id && challenge.submissions) {
        userSubmissionCount = challenge.submissions.length
        userCanSubmit = canSubmit && userSubmissionCount < challenge.maxEntriesPerUser
      }
      
      return {
        challengeId: challenge.id,
        title: challenge.title,
        status: challenge.status,
        computedStatus,
        phase,
        timeRemaining,
        canSubmit: userCanSubmit,
        userSubmissionCount,
        maxEntriesPerUser: challenge.maxEntriesPerUser,
        totalSubmissions: challenge._count.submissions,
        lastUpdated: challenge.updatedAt,
        serverTime: now.toISOString()
      }
    })
    
    return NextResponse.json({
      success: true,
      statusUpdates,
      serverTime: now.toISOString()
    })
    
  } catch (error) {
    console.error('Error fetching challenge status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenge status' },
      { status: 500 }
    )
  }
}
