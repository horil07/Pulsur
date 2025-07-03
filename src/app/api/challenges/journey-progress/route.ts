import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


// Analytics tracking helper
async function trackAnalytics(
  userId: string, 
  challengeId: string | null, 
  draftId: string,
  eventType: 'save' | 'load' | 'create' | 'update'
  // additionalData parameter removed as it was unused
) {
  try {
    const analytics = await prisma.submissionAnalytics.findFirst({
      where: { userId, challengeId, draftId }
    });

    if (analytics) {
      // Update existing analytics
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      
      if (eventType === 'save') {
        updateData.saveCount = analytics.saveCount + 1;
      } else if (eventType === 'load') {
        updateData.loadCount = analytics.loadCount + 1;
      }
      
      await prisma.submissionAnalytics.update({
        where: { id: analytics.id },
        data: updateData
      });
    }
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Don't fail the main request if analytics fails
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const draftId = searchParams.get('draftId');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If draftId provided, get specific draft
    if (draftId) {
      const draft = await prisma.submissionDraft.findFirst({
        where: {
          id: draftId,
          userId: user.id
        }
      });

      if (!draft) {
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }

      // Track load analytics
      await trackAnalytics(user.id, draft.challengeId, draft.id, 'load');

      return NextResponse.json({ 
        draft: {
          id: draft.id,
          draftName: draft.draftName,
          challengeId: draft.challengeId,
          type: draft.type,
          title: draft.title,
          caption: draft.caption,
          contentUrl: draft.contentUrl,
          prompt: draft.prompt,
          currentStep: draft.step,
          totalSteps: draft.totalSteps,
          isCompleted: draft.isCompleted,
          contentMethod: draft.contentMethod,
          progress: draft.progress,
          timeSpent: draft.timeSpent,
          lastSaved: draft.updatedAt,
          autoSavedAt: draft.autoSavedAt,
          createdAt: draft.createdAt
        }
      });
    }

    // Get drafts for challenge or all user drafts
    const where = challengeId ? 
      { userId: user.id, challengeId, isActive: true } : 
      { userId: user.id, isActive: true };

    const drafts = await prisma.submissionDraft.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 10 // Limit to recent drafts
    });

    // Get analytics if requested
    let analytics = null;
    if (includeAnalytics && challengeId) {
      analytics = await prisma.submissionAnalytics.findFirst({
        where: { userId: user.id, challengeId }
      });
    }

    // Track load analytics for active draft
    const activeDraft = drafts.find(d => d.challengeId === challengeId && d.isActive);
    if (activeDraft) {
      await trackAnalytics(user.id, challengeId, activeDraft.id, 'load');
    }

    return NextResponse.json({ 
      drafts: drafts.map(draft => ({
        id: draft.id,
        draftName: draft.draftName,
        challengeId: draft.challengeId,
        type: draft.type,
        title: draft.title,
        currentStep: draft.step,
        totalSteps: draft.totalSteps,
        isCompleted: draft.isCompleted,
        contentMethod: draft.contentMethod,
        timeSpent: draft.timeSpent,
        lastSaved: draft.updatedAt,
        createdAt: draft.createdAt
      })),
      analytics
    });

  } catch (error) {
    console.error('Error loading journey progress:', error);
    return NextResponse.json(
      { error: 'Failed to load progress' }, 
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
    const { challengeId, progress, draftData, timeSpent = 0 } = body;

    if (!challengeId && !draftData?.id) {
      return NextResponse.json(
        { error: 'Challenge ID or draft ID required' }, 
        { status: 400 }
      );
    }

    // Get user with all needed fields
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        trafficSource: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user agent info for analytics (unused for now)
    // const userAgent = request.headers.get('user-agent') || '';
    // const { deviceType, browserType } = getUserAgentInfo(userAgent);

    // Prepare draft data
    const draftUpdateData = {
      step: progress?.currentStep || draftData?.currentStep || 0,
      totalSteps: progress?.totalSteps || draftData?.totalSteps || 1,
      progress: progress || draftData?.progress,
      title: draftData?.title,
      caption: draftData?.caption,
      contentUrl: draftData?.contentUrl,
      prompt: draftData?.prompt,
      draftName: draftData?.draftName,
      contentMethod: progress?.contentMethod || draftData?.contentMethod,
      isCompleted: draftData?.isCompleted || false,
      timeSpent: (draftData?.timeSpent || 0) + timeSpent,
      stepsCompleted: draftData?.stepsCompleted,
      lastStepReached: draftData?.currentStep?.toString(),
      autoSavedAt: new Date(),
      version: (draftData?.version || 0) + 1,
      updatedAt: new Date()
    };

    // Ensure we have a valid challengeId
    const validChallengeId = challengeId || draftData?.challengeId;
    if (!validChallengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    // Save or update draft
    const draft = await prisma.submissionDraft.upsert({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId: validChallengeId
        }
      },
      update: draftUpdateData,
      create: {
        userId: user.id,
        challengeId: validChallengeId,
        type: draftData?.type || 'AI_ARTWORK',
        isActive: true,
        autoSaveEnabled: true,
        ...draftUpdateData,
        createdAt: new Date()
      }
    });

    // Update or create analytics
    const existingAnalytics = await prisma.submissionAnalytics.findFirst({
      where: {
        userId: user.id,
        challengeId: validChallengeId
      }
    });

    if (existingAnalytics) {
      await prisma.submissionAnalytics.update({
        where: { id: existingAnalytics.id },
        data: {
          totalTimeSpent: (existingAnalytics.totalTimeSpent || 0) + timeSpent,
          currentStep: progress?.currentStep?.toString() || draftData?.currentStep?.toString(),
          maxStepReached: progress?.maxStepReached || draftData?.currentStep?.toString(),
          saveCount: { increment: 1 },
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.submissionAnalytics.create({
        data: {
          userId: user.id,
          challengeId: validChallengeId,
          totalTimeSpent: timeSpent,
          currentStep: progress?.currentStep?.toString() || draftData?.currentStep?.toString(),
          maxStepReached: progress?.maxStepReached || draftData?.currentStep?.toString(),
          saveCount: 1,
          contentMethod: draftData?.contentMethod || 'unknown',
          deviceType: request.headers.get('sec-ch-ua-platform')?.replace(/"/g, '') || 'unknown',
          browserType: request.headers.get('user-agent')?.split(' ')[0] || 'unknown',
          sessionId: request.headers.get('x-session-id') || crypto.randomUUID(),
          journeyStarted: new Date()
        }
      });
    }

    // Track save analytics
    await trackAnalytics(user.id, validChallengeId, draft.id, 'save');

    return NextResponse.json({ 
      success: true, 
      draftId: draft.id,
      savedAt: draft.updatedAt,
      version: draft.version,
      autoSavedAt: draft.autoSavedAt
    });

  } catch (error) {
    console.error('Error saving journey progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' }, 
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
    const challengeId = searchParams.get('challengeId');
    const draftId = searchParams.get('draftId');
    const clearAnalytics = searchParams.get('clearAnalytics') === 'true';

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (draftId) {
      // Delete specific draft
      await prisma.submissionDraft.delete({
        where: {
          id: draftId,
          userId: user.id
        }
      });
    } else if (challengeId) {
      // Delete all drafts for challenge
      await prisma.submissionDraft.deleteMany({
        where: {
          challengeId,
          userId: user.id
        }
      });
    } else {
      return NextResponse.json({ error: 'Draft ID or Challenge ID required' }, { status: 400 });
    }

    // Clear analytics if requested
    if (clearAnalytics && challengeId) {
      await prisma.submissionAnalytics.updateMany({
        where: {
          userId: user.id,
          challengeId
        },
        data: {
          journeyAbandoned: new Date(),
          completed: false
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error clearing journey progress:', error);
    return NextResponse.json(
      { error: 'Failed to clear progress' }, 
      { status: 500 }
    );
  }
}
