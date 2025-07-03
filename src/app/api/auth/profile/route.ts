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
    const { name, bio, preferences, trafficSource, sessionId } = body

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || session.user.name,
        bio,
        profileComplete: true,
        preferences: preferences ? JSON.stringify(preferences) : null,
        ...(trafficSource && {
          trafficSource: trafficSource.source,
          trafficMedium: trafficSource.medium,
          trafficCampaign: trafficSource.campaign,
          trafficReferrer: trafficSource.referrer
        })
      }
    })

    // Track profile completion
    await AnalyticsService.trackEvent(
      'profile_completed',
      session.user.id,
      sessionId,
      {
        hasName: !!name,
        hasBio: !!bio,
        hasPreferences: !!preferences,
        trafficSource: trafficSource?.source
      }
    )

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio,
        profileComplete: updatedUser.profileComplete,
        preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences as string) : null
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        profileComplete: true,
        preferences: true,
        trafficSource: true,
        trafficMedium: true,
        trafficCampaign: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        ...user,
        preferences: user.preferences || null
      }
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
