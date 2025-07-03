import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnalyticsService } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  console.log('🗳️ Vote API called')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session?.user?.email || 'No session')
    
    if (!session?.user?.email) {
      console.log('❌ Unauthorized: No session or email')
      return NextResponse.json({ 
        error: 'Authentication required', 
        message: 'Please sign in to vote on submissions',
        requiresAuth: true 
      }, { status: 401 })
    }

    const body = await request.json()
    console.log('Request body:', body)
    const { submissionId, sessionId } = body

    if (!submissionId) {
      console.log('❌ Missing submission ID')
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    console.log('Looking for submission:', submissionId)

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: session.user.email },
          { id: session.user.id }
        ]
      }
    })

    if (!user) {
      console.log('Creating new user for:', session.user.email)
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || '',
          provider: 'google',
          providerId: session.user.email, // Use email as fallback for provider ID
        }
      })
    }

    console.log('User found/created:', user.id, user.email)

    // Track the vote attempt
    try {
      await AnalyticsService.trackEvent(
        'vote_attempted',
        user.id,
        sessionId || undefined,
        {
          submissionId
        }
      )
    } catch (analyticsError) {
      console.error('Analytics tracking failed:', analyticsError)
      // Continue with vote processing even if analytics fails
    }

    // Check if submission exists and is approved
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    if (!submission) {
      console.log('❌ Submission not found:', submissionId)
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    console.log('Submission found:', submission.id, 'Status:', submission.status, 'Owner:', submission.userId)

    if (submission.status !== 'APPROVED') {
      console.log('❌ Submission not approved:', submission.status)
      return NextResponse.json({ 
        error: 'Submission not available for voting',
        debug: {
          submissionId,
          status: submission.status,
          title: submission.title
        }
      }, { status: 400 })
    }

    // Check if user is trying to vote for their own submission
    if (submission.userId === user.id) {
      console.log('❌ User trying to vote for own submission')
      console.log('User ID:', user.id, 'Submission User ID:', submission.userId)
      return NextResponse.json({ 
        error: 'Cannot vote for your own submission',
        debug: {
          userId: user.id,
          submissionUserId: submission.userId,
          userEmail: user.email,
          submissionTitle: submission.title
        }
      }, { status: 400 })
    }

    // R39: Daily Vote Limit System - Check daily vote limits before processing
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const votesToday = await prisma.vote.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const dailyLimit = 3
    const remainingVotes = Math.max(0, dailyLimit - votesToday)

    // Check if user has already voted for this submission
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_submissionId: {
          userId: user.id,
          submissionId: submissionId
        }
      }
    })

    if (existingVote) {
      // Remove vote (toggle off)
      console.log('✅ Removing existing vote')
      await prisma.$transaction([
        prisma.vote.delete({
          where: { id: existingVote.id }
        }),
        prisma.submission.update({
          where: { id: submissionId },
          data: { voteCount: { decrement: 1 } }
        })
      ])

      return NextResponse.json({ 
        success: true, 
        action: 'removed',
        voteCount: submission.voteCount - 1,
        remainingVotes: remainingVotes + 1, // User gets vote back
        dailyLimit,
        votesUsed: votesToday - 1
      })
    } else {
      // R39: Check daily vote limit before adding vote
      if (remainingVotes <= 0) {
        console.log('❌ Daily vote limit reached')
        const tomorrow = new Date(startOfDay)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const timeUntilReset = tomorrow.getTime() - now.getTime()
        
        return NextResponse.json({ 
          error: 'Daily vote limit reached',
          message: `You have used all ${dailyLimit} votes for today. Try again tomorrow!`,
          dailyLimit,
          votesUsed: votesToday,
          remainingVotes: 0,
          timeUntilReset,
          resetTime: tomorrow.toISOString(),
          limitReached: true
        }, { status: 429 }) // Too Many Requests
      }

      // Add vote (toggle on)
      console.log('✅ Adding new vote')
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId: user.id,
            submissionId: submissionId
          }
        }),
        prisma.submission.update({
          where: { id: submissionId },
          data: { voteCount: { increment: 1 } }
        })
      ])

      return NextResponse.json({ 
        success: true, 
        action: 'added',
        voteCount: submission.voteCount + 1,
        remainingVotes: remainingVotes - 1, // User used a vote
        dailyLimit,
        votesUsed: votesToday + 1,
        message: remainingVotes - 1 === 0 
          ? `Vote cast! You have used all ${dailyLimit} votes for today.`
          : `Vote cast! You have ${remainingVotes - 1} votes remaining today.`
      })
    }
  } catch (error) {
    console.error('❌ Vote error:', error)
    return NextResponse.json({ error: 'Vote operation failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Find user
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: session.user.email },
          { id: session.user.id }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ hasVoted: false })
    }

    // Check if user has voted for this submission
    const vote = await prisma.vote.findUnique({
      where: {
        userId_submissionId: {
          userId: user.id,
          submissionId: submissionId
        }
      }
    })

    return NextResponse.json({ 
      hasVoted: !!vote,
      voteId: vote?.id 
    })
  } catch (error) {
    console.error('Vote check error:', error)
    return NextResponse.json({ error: 'Failed to check vote status' }, { status: 500 })
  }
}
