import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * R39.1: Vote Limit Tracking API
 * Gets user's remaining votes for the current day
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      // Return success response for unauthenticated users (guests)
      return NextResponse.json({ 
        success: true,
        dailyLimit: 3,
        remainingVotes: 0,
        votesUsed: 0,
        canVote: false,
        isGuest: true,
        timeUntilReset: 0,
        resetTime: new Date().toISOString(),
        message: 'Sign in to start voting'
      }, { status: 200 })
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
        error: 'User not found',
        dailyLimit: 3,
        remainingVotes: 3,
        votesUsed: 0
      }, { status: 404 })
    }

    // Get today's date range (local timezone)
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    // Count votes cast today
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
    
    // Calculate time until next reset (midnight)
    const tomorrow = new Date(startOfDay)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const timeUntilReset = tomorrow.getTime() - now.getTime()

    return NextResponse.json({
      success: true,
      dailyLimit,
      votesUsed: votesToday,
      remainingVotes,
      canVote: remainingVotes > 0,
      timeUntilReset, // milliseconds until midnight
      resetTime: tomorrow.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    })

  } catch (error) {
    console.error('Error getting vote limits:', error)
    return NextResponse.json({ 
      error: 'Failed to get vote limits',
      dailyLimit: 3,
      remainingVotes: 0,
      votesUsed: 0
    }, { status: 500 })
  }
}
