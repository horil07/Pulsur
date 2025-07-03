import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/challenges - Get all challenges with status information
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const includeStats = searchParams.get('includeStats') === 'true'
    
    const session = await getServerSession(authOptions)
    
    // Build where clause based on status filter
    const whereClause: any = {
      isActive: true
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }
    
    // Get challenges with optional stats
    const challenges = await prisma.challenge.findMany({
      where: whereClause,
      include: includeStats ? {
        submissions: {
          where: {
            status: 'APPROVED'
          },
          select: {
            id: true,
            userId: true,
            createdAt: true,
            voteCount: true
          }
        },
        _count: {
          select: {
            submissions: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      } : {
        _count: {
          select: {
            submissions: {
              where: {
                status: 'APPROVED'
              }
            }
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { startDate: 'desc' }
      ]
    })
    
    // Transform challenges with computed status information
    const transformedChallenges = challenges.map((challenge: any) => {
      const now = new Date()
      const startDate = new Date(challenge.startDate)
      const endDate = new Date(challenge.endDate)
      
      // Compute real-time status
      let computedStatus = challenge.status
      let timeRemaining = null
      let canSubmit = false
      
      if (challenge.status === 'OPEN') {
        if (now < startDate) {
          computedStatus = 'UPCOMING'
          timeRemaining = Math.max(0, startDate.getTime() - now.getTime())
        } else if (now > endDate) {
          computedStatus = 'SUBMISSIONS_CLOSED'
        } else {
          canSubmit = true
          timeRemaining = Math.max(0, endDate.getTime() - now.getTime())
        }
      }
      
      // Calculate user-specific submission stats if authenticated
      let userSubmissionCount = 0
      let userCanSubmit = canSubmit
      
      if (session?.user?.id && includeStats && challenge.submissions) {
        userSubmissionCount = challenge.submissions.filter(
          (sub: any) => sub.userId === session.user.id
        ).length
        userCanSubmit = canSubmit && userSubmissionCount < challenge.maxEntriesPerUser
      }
      
      // Calculate participation stats
      const participantCount = includeStats && challenge.submissions ? 
        new Set(challenge.submissions.map((sub: any) => sub.userId)).size : 0
      
      const totalVotes = includeStats && challenge.submissions ?
        challenge.submissions.reduce((sum: number, sub: any) => sum + (sub.voteCount || 0), 0) : 0
      
      return {
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        image: challenge.image,
        status: challenge.status,
        computedStatus,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        winnersAnnounceDate: challenge.winnersAnnounceDate,
        maxEntriesPerUser: challenge.maxEntriesPerUser,
        timeRemaining,
        canSubmit: userCanSubmit,
        userSubmissionCount,
        isFeatured: challenge.isFeatured,
        createdAt: challenge.createdAt,
        updatedAt: challenge.updatedAt,
        ...(includeStats && {
          stats: {
            totalSubmissions: challenge._count.submissions,
            participantCount,
            totalVotes,
            avgVotesPerSubmission: challenge._count.submissions > 0 ? 
              Math.round(totalVotes / challenge._count.submissions * 10) / 10 : 0
          }
        })
      }
    })
    
    return NextResponse.json({
      success: true,
      challenges: transformedChallenges,
      meta: {
        total: transformedChallenges.length,
        openChallenges: transformedChallenges.filter((c: any) => c.computedStatus === 'OPEN').length,
        closedChallenges: transformedChallenges.filter((c: any) => c.computedStatus === 'SUBMISSIONS_CLOSED').length,
        upcomingChallenges: transformedChallenges.filter((c: any) => c.computedStatus === 'UPCOMING').length
      }
    })
    
  } catch (error) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch challenges' },
      { status: 500 }
    )
  }
}

// POST /api/challenges - Create new challenge (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Check if user is admin (you may want to implement proper role checking)
    // For now, we'll skip admin validation
    
    const body = await request.json()
    const {
      title,
      description,
      objective,
      assignment,
      category,
      startDate,
      endDate,
      winnersAnnounceDate,
      maxEntriesPerUser = 3,
      prizes,
      topPrize,
      tutorialEnabled = true,
      tutorialSteps,
      toolkitAssets,
      contentRequirements,
      validationRules
    } = body
    
    // Validate required fields
    if (!title || !description || !category || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      )
    }
    
    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        objective,
        assignment,
        category,
        startDate: start,
        endDate: end,
        winnersAnnounceDate: winnersAnnounceDate ? new Date(winnersAnnounceDate) : null,
        maxEntriesPerUser,
        prizes,
        topPrize,
        tutorialEnabled,
        tutorialSteps,
        toolkitAssets,
        contentRequirements,
        validationRules,
        hasToolkitAssets: !!toolkitAssets,
        createdBy: session.user.id,
        status: 'DRAFT', // New challenges start as draft
        isActive: true
      }
    })
    
    return NextResponse.json({
      success: true,
      challenge
    })
    
  } catch (error) {
    console.error('Error creating challenge:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create challenge' },
      { status: 500 }
    )
  }
}
