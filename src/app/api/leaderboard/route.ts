import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause = { 
      status: 'APPROVED' as const,
      voteCount: { gt: 0 } // Only show entries with votes
    }
    
    if (category !== 'all') {
      Object.assign(whereClause, { type: category.toUpperCase() })
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      orderBy: [
        { voteCount: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      }
    })

    // Add rank to each entry
    const entries = submissions.map((submission, index) => ({
      ...submission,
      rank: index + 1
    }))

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
