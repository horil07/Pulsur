import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get stats for the leaderboard
    const [totalSubmissions, totalVotes, totalParticipants] = await Promise.all([
      prisma.submission.count({
        where: { status: 'APPROVED' }
      }),
      prisma.vote.count(),
      prisma.user.count()
    ])

    // Get campaign end date (mock for now, would come from active campaign)
    const campaignEndDate = new Date('2024-12-31').toISOString()

    return NextResponse.json({
      totalSubmissions,
      totalVotes,
      totalParticipants,
      campaignEndDate
    })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
