import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// R40.2: Create inspired submission with attribution
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const {
      sourceSubmissionId,
      inspirationType, // 'similar', 'remix', 'inspired'
      attributionText,
      submissionData // The actual submission data
    } = await request.json()

    // Validate required fields
    if (!sourceSubmissionId || !inspirationType || !submissionData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify source submission exists
    const sourceSubmission = await prisma.submission.findUnique({
      where: { id: sourceSubmissionId },
      select: { id: true, title: true, user: { select: { name: true } } }
    })

    if (!sourceSubmission) {
      return NextResponse.json(
        { error: 'Source submission not found' },
        { status: 404 }
      )
    }

    // Create the new submission
    const newSubmission = await prisma.submission.create({
      data: {
        userId: session.user.id,
        type: submissionData.type,
        title: submissionData.title,
        caption: submissionData.caption,
        contentUrl: submissionData.contentUrl,
        prompt: submissionData.prompt,
        status: 'PENDING'
      }
    })

    // For now, we'll track inspiration in a simple way
    // Later we'll implement the full InspirationLink model when Prisma client is updated
    console.log('Created inspired submission:', {
      newSubmissionId: newSubmission.id,
      sourceSubmissionId,
      inspirationType,
      attributionText
    })

    return NextResponse.json({
      success: true,
      submission: newSubmission,
      inspirationLink: {
        sourceId: sourceSubmissionId,
        inspirationType,
        attributionText
      }
    })

  } catch (error) {
    console.error('Error creating inspired submission:', error)
    return NextResponse.json(
      { error: 'Failed to create inspired submission' },
      { status: 500 }
    )
  }
}
