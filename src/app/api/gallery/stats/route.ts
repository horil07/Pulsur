import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total submissions
    const totalSubmissions = await prisma.submission.count()

    // Get total votes
    const totalVotes = await prisma.vote.count()

    // Get active users (users who have submitted or voted in the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const activeSubmitters = await prisma.submission.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    const activeVoters = await prisma.vote.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        userId: true
      },
      distinct: ['userId']
    })

    // Combine and deduplicate active users
    const allActiveUserIds = new Set([
      ...activeSubmitters.map(s => s.userId),
      ...activeVoters.map(v => v.userId)
    ])
    const activeUsers = allActiveUserIds.size

    // Get featured submissions (top 5 by vote count)
    const featuredSubmissions = await prisma.submission.findMany({
      take: 5,
      orderBy: {
        voteCount: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({
      totalSubmissions,
      totalVotes,
      activeUsers,
      featuredSubmissions: featuredSubmissions.map(sub => ({
        id: sub.id,
        title: sub.title,
        type: sub.type,
        contentUrl: sub.contentUrl,
        voteCount: sub.voteCount,
        user: {
          name: sub.user.name || 'Anonymous'
        }
      }))
    })
  } catch (error) {
    console.error('Gallery stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery stats' },
      { status: 500 }
    )
  }
}
