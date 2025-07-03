import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const challengeId = resolvedParams.id

    const challenge = await prisma.challenge.findUnique({
      where: { 
        id: challengeId,
        isActive: true 
      },
      include: {
        submissions: {
          select: {
            id: true,
            userId: true,
            title: true,
            voteCount: true,
            createdAt: true
          },
          where: {
            status: 'APPROVED'
          },
          orderBy: {
            voteCount: 'desc'
          },
          take: 10
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
      }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    // Format the response
    const formattedChallenge = {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      objective: challenge.objective,
      assignment: challenge.assignment,
      category: challenge.category,
      image: challenge.image,
      status: challenge.status,
      startDate: challenge.startDate.toISOString(),
      endDate: challenge.endDate.toISOString(),
      winnersAnnounceDate: challenge.winnersAnnounceDate?.toISOString(),
      maxEntriesPerUser: challenge.maxEntriesPerUser,
      currentParticipants: challenge.currentParticipants,
      prizes: challenge.prizes as string[],
      topPrize: challenge.topPrize,
      tutorialEnabled: challenge.tutorialEnabled,
      tutorialSteps: challenge.tutorialSteps,
      onboardingFlow: challenge.onboardingFlow,
      hasToolkitAssets: challenge.hasToolkitAssets,
      toolkitAssets: challenge.toolkitAssets,
      deliverables: challenge.deliverables as string[],
      validationRules: challenge.validationRules,
      contentRequirements: challenge.contentRequirements,
      isFeatured: challenge.isFeatured,
      submissions: challenge.submissions,
      submissionCount: challenge._count.submissions,
      createdAt: challenge.createdAt.toISOString(),
      updatedAt: challenge.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      challenge: formattedChallenge
    })

  } catch (error) {
    console.error('Challenge fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    )
  }
}
