import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Get submission and verify ownership
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: true,
        versions: {
          orderBy: { version: 'asc' },
          include: {
            modifications: {
              where: { isApplied: true },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        parent: true,
        modifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this submission' }, { status: 403 })
    }

    // Get version history (including this submission if it has versions)
    const versionHistory = []

    // Add parent if this is a version
    if (submission.parent) {
      versionHistory.push({
        id: submission.parent.id,
        version: submission.parent.version,
        contentUrl: submission.parent.contentUrl,
        prompt: submission.parent.prompt,
        title: submission.parent.title,
        isLatest: submission.parent.isLatest,
        isOriginal: submission.parent.version === 1,
        createdAt: submission.parent.createdAt,
        modifications: []
      })
    }

    // Add current submission
    versionHistory.push({
      id: submission.id,
      version: submission.version,
      contentUrl: submission.contentUrl,
      prompt: submission.prompt,
      title: submission.title,
      isLatest: submission.isLatest,
      isOriginal: submission.version === 1 && !submission.parent,
      createdAt: submission.createdAt,
      modifications: submission.modifications
    })

    // Add child versions
    submission.versions.forEach(version => {
      versionHistory.push({
        id: version.id,
        version: version.version,
        contentUrl: version.contentUrl,
        prompt: version.prompt,
        title: version.title,
        isLatest: version.isLatest,
        isOriginal: false,
        createdAt: version.createdAt,
        modifications: version.modifications
      })
    })

    // Sort by version number
    versionHistory.sort((a, b) => a.version - b.version)

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        title: submission.title,
        version: submission.version,
        isLatest: submission.isLatest
      },
      versionHistory,
      totalVersions: versionHistory.length
    })

  } catch (error) {
    console.error('Error fetching version history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { submissionId, action, modificationId } = await request.json()

    if (!submissionId || !action) {
      return NextResponse.json({ error: 'Submission ID and action are required' }, { status: 400 })
    }

    // Get submission and verify ownership
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { user: true, modifications: true }
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this submission' }, { status: 403 })
    }

    let result

    switch (action) {
      case 'apply_modification':
        result = await applyModification(submissionId, modificationId, session.user.id)
        break
      case 'create_version':
        result = await createNewVersion(submissionId, session.user.id)
        break
      case 'revert_to_original':
        result = await revertToOriginal(submissionId)
        break
      case 'set_as_latest':
        result = await setAsLatest(submissionId)
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Action '${action}' completed successfully`
    })

  } catch (error) {
    console.error('Error managing content version:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function applyModification(submissionId: string, modificationId: string, userId: string) {
  if (!modificationId) {
    throw new Error('Modification ID is required for apply_modification action')
  }

  // Get the modification
  const modification = await prisma.contentModification.findUnique({
    where: { id: modificationId }
  })

  if (!modification || modification.userId !== userId) {
    throw new Error('Modification not found or unauthorized')
  }

  if (modification.processingStatus !== 'COMPLETED') {
    throw new Error('Cannot apply incomplete modification')
  }

  // Update submission with modification result
  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      contentUrl: modification.resultUrl || '',
      prompt: modification.newPrompt || undefined,
      modificationHistory: {
        applied: new Date().toISOString(),
        modificationType: modification.modificationType,
        modificationId: modification.id
      }
    }
  })

  // Mark modification as applied
  await prisma.contentModification.update({
    where: { id: modificationId },
    data: {
      isApplied: true,
      appliedAt: new Date()
    }
  })

  return { updatedSubmission, appliedModification: modification }
}

async function createNewVersion(submissionId: string, userId: string) {
  const originalSubmission = await prisma.submission.findUnique({
    where: { id: submissionId }
  })

  if (!originalSubmission) {
    throw new Error('Original submission not found')
  }

  // Get the highest version number for this submission family
  const rootId = originalSubmission.parentId || submissionId
  const highestVersion = await prisma.submission.findFirst({
    where: {
      OR: [
        { id: rootId },
        { parentId: rootId }
      ]
    },
    orderBy: { version: 'desc' }
  })

  const newVersion = (highestVersion?.version || 0) + 1

  // Create new version
  const newSubmission = await prisma.submission.create({
    data: {
      userId,
      challengeId: originalSubmission.challengeId,
      type: originalSubmission.type,
      title: `${originalSubmission.title} (v${newVersion})`,
      caption: originalSubmission.caption,
      contentUrl: originalSubmission.contentUrl,
      prompt: originalSubmission.prompt,
      status: originalSubmission.status,
      version: newVersion,
      isLatest: true,
      parentId: originalSubmission.parentId || submissionId,
      originalPrompt: originalSubmission.originalPrompt || originalSubmission.prompt
    }
  })

  // Update previous versions to not be latest
  await prisma.submission.updateMany({
    where: {
      OR: [
        { id: rootId },
        { parentId: rootId }
      ],
      id: { not: newSubmission.id }
    },
    data: { isLatest: false }
  })

  return newSubmission
}

async function revertToOriginal(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { parent: true }
  })

  if (!submission) {
    throw new Error('Submission not found')
  }

  const originalSubmission = submission.parent || submission

  // Update current submission with original values
  const revertedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      contentUrl: originalSubmission.contentUrl,
      prompt: originalSubmission.originalPrompt || originalSubmission.prompt,
      title: originalSubmission.title.replace(/ \(v\d+\)$/, ''), // Remove version suffix
      modificationHistory: {
        reverted: new Date().toISOString(),
        revertedTo: 'original'
      }
    }
  })

  // Mark all modifications as not applied
  await prisma.contentModification.updateMany({
    where: { submissionId },
    data: {
      isApplied: false,
      appliedAt: null
    }
  })

  return revertedSubmission
}

async function setAsLatest(submissionId: string) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId }
  })

  if (!submission) {
    throw new Error('Submission not found')
  }

  const rootId = submission.parentId || submissionId

  // Update all versions in the family to not be latest
  await prisma.submission.updateMany({
    where: {
      OR: [
        { id: rootId },
        { parentId: rootId }
      ]
    },
    data: { isLatest: false }
  })

  // Set this version as latest
  const updatedSubmission = await prisma.submission.update({
    where: { id: submissionId },
    data: { isLatest: true }
  })

  return updatedSubmission
}
