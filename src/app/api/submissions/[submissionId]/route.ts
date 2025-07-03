import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const submissionId = resolvedParams.submissionId

    // Get submission details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            maxEntriesPerUser: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Check if user owns this submission
    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        title: submission.title,
        caption: submission.caption,
        type: submission.type,
        contentUrl: submission.contentUrl,
        prompt: submission.prompt,
        status: submission.status,
        voteCount: submission._count.votes,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        challenge: submission.challenge,
        user: submission.user
      }
    })

  } catch (error) {
    console.error('Submission fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const submissionId = resolvedParams.submissionId

    const { title, caption, contentUrl, prompt } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Verify submission exists and belongs to user
    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        userId: true,
        status: true,
        contentUrl: true
      }
    })

    if (!existingSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (existingSubmission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Don't allow editing approved submissions that are being voted on
    if (existingSubmission.status === 'APPROVED') {
      return NextResponse.json({ 
        error: 'Cannot edit approved submissions' 
      }, { status: 400 })
    }

    // Update the submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        title,
        caption,
        contentUrl: contentUrl || existingSubmission.contentUrl,
        prompt,
        status: 'PENDING', // Reset to pending for review
        updatedAt: new Date()
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      submission: {
        id: updatedSubmission.id,
        title: updatedSubmission.title,
        caption: updatedSubmission.caption,
        type: updatedSubmission.type,
        contentUrl: updatedSubmission.contentUrl,
        prompt: updatedSubmission.prompt,
        status: updatedSubmission.status,
        createdAt: updatedSubmission.createdAt.toISOString(),
        updatedAt: updatedSubmission.updatedAt.toISOString(),
        challenge: updatedSubmission.challenge
      }
    })

  } catch (error) {
    console.error('Submission update error:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const submissionId = resolvedParams.submissionId

    // Verify submission exists and belongs to user
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        userId: true,
        title: true,
        challengeId: true
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete all votes for this submission first
    await prisma.vote.deleteMany({
      where: { submissionId: submissionId }
    })

    // Delete the submission
    await prisma.submission.delete({
      where: { id: submissionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully'
    })

  } catch (error) {
    console.error('Submission deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    )
  }
}
