import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * R39.3: Vote History Management API
 * Gets user's voting history with ability to manage votes
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const timeRange = searchParams.get('timeRange') || 'today' // today, week, month, all

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
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Calculate date range based on timeRange parameter
    let dateFilter = {}
    const now = new Date()
    
    switch (timeRange) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
        dateFilter = {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: weekAgo
          }
        }
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = {
          createdAt: {
            gte: monthAgo
          }
        }
        break
      default:
        dateFilter = {} // No filter for 'all'
    }

    // Get vote history with submission details
    const votes = await prisma.vote.findMany({
      where: {
        userId: user.id,
        ...dateFilter
      },
      include: {
        submission: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count for pagination
    const totalVotes = await prisma.vote.count({
      where: {
        userId: user.id,
        ...dateFilter
      }
    })

    // Format response
    const voteHistory = votes.map(vote => ({
      id: vote.id,
      votedAt: vote.createdAt,
      submission: {
        id: vote.submission.id,
        title: vote.submission.title,
        type: vote.submission.type,
        contentUrl: vote.submission.contentUrl,
        caption: vote.submission.caption,
        voteCount: vote.submission.voteCount,
        creator: {
          id: vote.submission.user.id,
          name: vote.submission.user.name,
          image: vote.submission.user.image
        }
      },
      canChangeVote: true // For now, allow changing votes (could add time limit logic)
    }))

    return NextResponse.json({
      success: true,
      votes: voteHistory,
      pagination: {
        page,
        limit,
        total: totalVotes,
        totalPages: Math.ceil(totalVotes / limit),
        hasMore: page * limit < totalVotes
      },
      timeRange,
      summary: {
        totalVotes,
        todayVotes: timeRange === 'today' ? totalVotes : null
      }
    })

  } catch (error) {
    console.error('Error getting vote history:', error)
    return NextResponse.json({ 
      error: 'Failed to get vote history' 
    }, { status: 500 })
  }
}

/**
 * DELETE: Remove a vote (change vote)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const voteId = searchParams.get('voteId')
    const submissionId = searchParams.get('submissionId')

    if (!voteId && !submissionId) {
      return NextResponse.json({ 
        error: 'Vote ID or Submission ID required' 
      }, { status: 400 })
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
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Find and delete the vote
    const whereClause = voteId 
      ? { id: voteId, userId: user.id }
      : { submissionId: submissionId!, userId: user.id }

    const vote = await prisma.vote.findFirst({
      where: whereClause,
      include: { submission: true }
    })

    if (!vote) {
      return NextResponse.json({ 
        error: 'Vote not found' 
      }, { status: 404 })
    }

    // Delete the vote and update submission vote count
    await prisma.$transaction([
      prisma.vote.delete({
        where: { id: vote.id }
      }),
      prisma.submission.update({
        where: { id: vote.submissionId },
        data: {
          voteCount: {
            decrement: 1
          }
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Vote removed successfully',
      submissionId: vote.submissionId,
      newVoteCount: vote.submission.voteCount - 1
    })

  } catch (error) {
    console.error('Error removing vote:', error)
    return NextResponse.json({ 
      error: 'Failed to remove vote' 
    }, { status: 500 })
  }
}
