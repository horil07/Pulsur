import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Enhanced Draft Management API for R33-R33.3

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // For now, get submission drafts using the existing model until Prisma client updates
    const whereClause = challengeId ? 
      { userId: user.id, challengeId } : 
      { userId: user.id };

    // Try to get drafts - fallback to empty array if model not found yet
    let drafts = [];
    try {
      drafts = await (prisma as any).submissionDraft?.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        take: 20
      }) || [];
    } catch (error) {
      console.log('SubmissionDraft model not yet available:', error);
      // Return empty state for now
      return NextResponse.json({ 
        drafts: [],
        analytics: null,
        message: 'Draft management system initializing'
      });
    }

    // Get analytics if requested
    let analytics = null;
    if (includeAnalytics && challengeId) {
      try {
        analytics = await (prisma as any).submissionAnalytics?.findFirst({
          where: { userId: user.id, challengeId }
        }) || null;
      } catch (error) {
        console.log('Analytics model not yet available:', error);
      }
    }

    return NextResponse.json({ 
      drafts: drafts.map((draft: any) => ({
        id: draft.id,
        draftName: draft.draftName || `Draft ${draft.id.slice(-4)}`,
        challengeId: draft.challengeId,
        type: draft.type,
        title: draft.title,
        currentStep: draft.step || 0,
        totalSteps: draft.totalSteps || 1,
        isCompleted: draft.isCompleted || false,
        contentMethod: draft.contentMethod,
        timeSpent: draft.timeSpent || 0,
        lastSaved: draft.updatedAt,
        autoSavedAt: draft.autoSavedAt,
        createdAt: draft.createdAt
      })),
      analytics,
      totalDrafts: drafts.length
    });

  } catch (error) {
    console.error('Error loading drafts:', error);
    return NextResponse.json(
      { error: 'Failed to load drafts', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      challengeId, 
      draftName,
      type = 'AI_ARTWORK',
      title,
      caption,
      contentUrl,
      prompt,
      contentMethod,
      currentStep = 0,
      totalSteps = 1,
      timeSpent = 0,
      isCompleted = false,
      progress = {}
    } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or update draft
    try {
      const draftData = {
        userId: user.id,
        challengeId,
        draftName: draftName || `${contentMethod || 'Draft'} - ${new Date().toLocaleDateString()}`,
        type,
        title,
        caption,
        contentUrl,
        prompt,
        contentMethod,
        step: currentStep,
        totalSteps,
        timeSpent,
        isCompleted,
        progress,
        isActive: true,
        autoSavedAt: new Date(),
        updatedAt: new Date()
      };

      const draft = await (prisma as any).submissionDraft?.upsert({
        where: {
          userId_challengeId: {
            userId: user.id,
            challengeId
          }
        },
        update: {
          ...draftData,
          version: { increment: 1 }
        },
        create: {
          ...draftData,
          version: 1,
          createdAt: new Date()
        }
      });

      if (!draft) {
        throw new Error('Failed to create/update draft - model not available');
      }

      // Try to create analytics record
      try {
        await (prisma as any).submissionAnalytics?.upsert({
          where: {
            userId_challengeId: {
              userId: user.id,
              challengeId
            }
          },
          update: {
            totalTimeSpent: { increment: timeSpent },
            currentStep: currentStep.toString(),
            maxStepReached: currentStep.toString(),
            saveCount: { increment: 1 },
            contentMethod,
            lastStepReached: currentStep.toString(),
            updatedAt: new Date()
          },
          create: {
            userId: user.id,
            challengeId,
            draftId: draft.id,
            totalTimeSpent: timeSpent,
            currentStep: currentStep.toString(),
            maxStepReached: currentStep.toString(),
            saveCount: 1,
            contentMethod,
            journeyStarted: new Date(),
            deviceType: 'unknown',
            browserType: 'unknown',
            sessionId: crypto.randomUUID()
          }
        });
      } catch (analyticsError) {
        console.log('Analytics tracking failed:', analyticsError);
        // Don't fail the main request
      }

      return NextResponse.json({ 
        success: true,
        draft: {
          id: draft.id,
          draftName: draft.draftName,
          challengeId: draft.challengeId,
          savedAt: draft.updatedAt,
          version: draft.version || 1,
          autoSavedAt: draft.autoSavedAt
        }
      });

    } catch (error) {
      console.error('Draft creation failed:', error);
      return NextResponse.json(
        { error: 'Failed to save draft', details: error instanceof Error ? error.message : 'Unknown error' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in draft POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('draftId');
    const challengeId = searchParams.get('challengeId');

    if (!draftId && !challengeId) {
      return NextResponse.json({ error: 'Draft ID or Challenge ID required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      if (draftId) {
        // Delete specific draft
        await (prisma as any).submissionDraft?.delete({
          where: {
            id: draftId,
            userId: user.id
          }
        });
      } else if (challengeId) {
        // Delete all drafts for challenge
        await (prisma as any).submissionDraft?.deleteMany({
          where: {
            challengeId,
            userId: user.id
          }
        });
      }

      return NextResponse.json({ success: true });

    } catch (error) {
      console.error('Draft deletion failed:', error);
      return NextResponse.json(
        { error: 'Failed to delete draft', details: error instanceof Error ? error.message : 'Unknown error' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in draft DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
