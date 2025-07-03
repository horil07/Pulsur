import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AnalyticsService } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, deviceType, userAgent, action } = body

    if (action === 'start') {
      // Start a new session
      const newSession = await prisma.userSession.create({
        data: {
          userId: session.user.id,
          sessionId: sessionId || AnalyticsService.generateSessionId(),
          deviceType,
          userAgent,
          isActive: true,
          startTime: new Date(),
          landingPage: '/'
        }
      })

      // Update user's last login
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastLoginAt: new Date() }
      })

      return NextResponse.json({ 
        success: true, 
        sessionId: newSession.sessionId 
      })
    }

    if (action === 'end') {
      // End the session
      await prisma.userSession.updateMany({
        where: {
          userId: session.user.id,
          sessionId: sessionId,
          isActive: true
        },
        data: {
          isActive: false,
          endTime: new Date()
        }
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'sync') {
      // Get all active sessions for the user
      const activeSessions = await prisma.userSession.findMany({
        where: {
          userId: session.user.id,
          isActive: true
        },
        orderBy: {
          startTime: 'desc'
        }
      })

      return NextResponse.json({
        success: true,
        sessions: activeSessions.map(s => ({
          sessionId: s.sessionId,
          deviceType: s.deviceType,
          startTime: s.startTime,
          lastActivity: s.updatedAt
        }))
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Session management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get session stats
    const sessionStats = await prisma.userSession.aggregate({
      where: { userId: session.user.id },
      _count: { id: true }
    })

    const activeSessions = await prisma.userSession.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    })

    const recentSessions = await prisma.userSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'desc' },
      take: 10,
      select: {
        sessionId: true,
        deviceType: true,
        startTime: true,
        endTime: true,
        isActive: true
      }
    })

    return NextResponse.json({
      totalSessions: sessionStats._count.id,
      activeSessions,
      recentSessions
    })
  } catch (error) {
    console.error('Session stats error:', error)
    return NextResponse.json(
      { error: 'Failed to get session stats' },
      { status: 500 }
    )
  }
}
