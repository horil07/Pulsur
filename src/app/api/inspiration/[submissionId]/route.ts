import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// R40.1: Get inspiration data for content creation
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ submissionId: string }> }
) {
  try {
    const params = await context.params;
    const submissionId = params.submissionId

    // Get the submission
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // For now, assume remixing is allowed (we'll add metadata later)
    const allowRemixing = true

    // Generate inspiration prompts based on content
    const inspirationData = generateInspirationPrompts(submission)

    return NextResponse.json({
      submission: {
        id: submission.id,
        title: submission.title,
        type: submission.type,
        contentUrl: submission.contentUrl,
        caption: submission.caption,
        prompt: submission.prompt,
        user: submission.user
      },
      inspiration: inspirationData,
      allowRemixing
    })

  } catch (error) {
    console.error('Error fetching inspiration data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inspiration data' },
      { status: 500 }
    )
  }
}

// Helper function to generate inspiration prompts
function generateInspirationPrompts(submission: any) {
  const basePrompts = {
    similar: [
      `Create content similar to "${submission.title}"`,
      `Inspired by the style and mood of "${submission.title}"`,
      `Make something in the spirit of "${submission.title}"`
    ],
    remix: [
      `Remix and reimagine "${submission.title}"`,
      `Build upon the concept of "${submission.title}"`,
      `Take "${submission.title}" in a new direction`
    ],
    style: [] as string[]
  }

  // Add content-specific prompts based on type
  if (submission.type === 'AI_ARTWORK') {
    basePrompts.style.push(
      'Create artwork with similar visual elements',
      'Use a similar color palette and composition',
      'Apply the same artistic style to different subject matter'
    )
  } else if (submission.type === 'AI_SONG') {
    basePrompts.style.push(
      'Create music with similar mood and energy',
      'Use similar instruments or vocal style',
      'Compose in the same genre but with different lyrics'
    )
  }

  // Include original prompt if available for AI content
  if (submission.prompt) {
    basePrompts.similar.unshift(`Based on: "${submission.prompt}"`)
  }

  return {
    prompts: basePrompts,
    metadata: {
      originalType: submission.type,
      hasPrompt: !!submission.prompt,
      suggestedTypes: getSuggestedContentTypes(submission.type)
    }
  }
}

// Helper function to suggest compatible content types for remixing
function getSuggestedContentTypes(originalType: string): string[] {
  const suggestions: Record<string, string[]> = {
    'AI_ARTWORK': ['AI_ARTWORK', 'UPLOAD_ARTWORK'],
    'AI_SONG': ['AI_SONG', 'UPLOAD_REEL'],
    'UPLOAD_ARTWORK': ['AI_ARTWORK', 'UPLOAD_ARTWORK'],
    'UPLOAD_REEL': ['AI_SONG', 'UPLOAD_REEL']
  }
  
  return suggestions[originalType] || [originalType]
}
