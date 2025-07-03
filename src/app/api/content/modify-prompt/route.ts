import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { submissionId, newPrompt, parameters } = await request.json()

    if (!submissionId || !newPrompt) {
      return NextResponse.json({ error: 'Submission ID and new prompt are required' }, { status: 400 })
    }

    // Check if user owns the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this submission' }, { status: 403 })
    }

    // Create a new content modification record
    const modification = await prisma.contentModification.create({
      data: {
        submissionId,
        userId: session.user.id,
        modificationType: 'PROMPT_MODIFICATION',
        originalPrompt: submission.prompt,
        newPrompt,
        parameters: parameters || {},
        processingStatus: 'PENDING'
      }
    })

    // Simulate AI processing (in a real app, this would be async)
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update the modification with the result
    const updatedModification = await prisma.contentModification.update({
      where: { id: modification.id },
      data: {
        processingStatus: 'COMPLETED',
        resultUrl: generateModifiedContentUrl(submission.contentUrl, 'prompt_modified'),
        previewUrl: generatePreviewUrl(submission.contentUrl, 'prompt_modified'),
        processingTime: 2000
      }
    })

    return NextResponse.json({
      success: true,
      modification: updatedModification,
      message: 'Prompt modification completed successfully'
    })

  } catch (error) {
    console.error('Error modifying prompt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    // Get all prompt modifications for this submission
    const modifications = await prisma.contentModification.findMany({
      where: {
        submissionId,
        userId: session.user.id,
        modificationType: 'PROMPT_MODIFICATION'
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      modifications,
      count: modifications.length
    })

  } catch (error) {
    console.error('Error fetching prompt modifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateModifiedContentUrl(originalUrl: string, modificationType: string): string {
  // In a real application, this would generate content using AI
  // For now, we'll simulate by returning a modified URL
  const timestamp = Date.now()
  return `${originalUrl}?modified=${modificationType}&t=${timestamp}`
}

function generatePreviewUrl(originalUrl: string, modificationType: string): string {
  // Generate a preview/thumbnail URL
  const timestamp = Date.now()
  return `${originalUrl}?preview=${modificationType}&t=${timestamp}&w=300&h=200`
}
