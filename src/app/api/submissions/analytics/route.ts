import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Submission Analytics API for R33.3

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const timeRange = searchParams.get('timeRange') || '7d'; // 7d, 30d, 90d
    const includeSteps = searchParams.get('includeSteps') === 'true';

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate date range
    const now = new Date();
    const daysAgo = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 7;
    const startDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));

    try {
      // Get user's analytics
      const whereClause = {
        userId: user.id,
        ...(challengeId && { challengeId }),
        createdAt: { gte: startDate }
      };

      const analytics = await (prisma as any).submissionAnalytics?.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      }) || [];

      // Calculate aggregated metrics
      const totalSessions = analytics.length;
      const completedJourneys = analytics.filter((a: any) => a.completed).length;
      const abandonedJourneys = analytics.filter((a: any) => a.journeyAbandoned).length;
      const totalTimeSpent = analytics.reduce((sum: number, a: any) => sum + (a.totalTimeSpent || 0), 0);
      const avgTimeSpent = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;
      const conversionRate = totalSessions > 0 ? Math.round((completedJourneys / totalSessions) * 100) : 0;

      // Content method breakdown
      const methodBreakdown = analytics.reduce((acc: any, a: any) => {
        const method = a.contentMethod || 'unknown';
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});

      // Step completion analysis
      let stepAnalysis = null;
      if (includeSteps) {
        const stepData = analytics.map((a: any) => ({
          maxStep: a.maxStepReached,
          currentStep: a.currentStep,
          completed: a.completed,
          timeSpent: a.totalTimeSpent
        }));
        
        stepAnalysis = {
          averageStepsCompleted: stepData.length > 0 ? 
            stepData.reduce((sum: number, s: { maxStep: string }) => sum + (parseInt(s.maxStep) || 0), 0) / stepData.length : 0,
          commonDropOffPoints: [], // Simplified for now
          stepCompletionRates: {} // Simplified for now
        };
      }

      // Device/browser analytics
      const deviceBreakdown = analytics.reduce((acc: any, a: any) => {
        const device = a.deviceType || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {});

      const browserBreakdown = analytics.reduce((acc: any, a: any) => {
        const browser = a.browserType || 'unknown';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      }, {});

      // Recent activity
      const recentActivity = analytics.slice(0, 10).map((a: any) => ({
        id: a.id,
        challengeId: a.challengeId,
        contentMethod: a.contentMethod,
        timeSpent: a.totalTimeSpent,
        completed: a.completed,
        maxStepReached: a.maxStepReached,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt
      }));

      return NextResponse.json({
        success: true,
        timeRange,
        summary: {
          totalSessions,
          completedJourneys,
          abandonedJourneys,
          conversionRate,
          totalTimeSpent,
          avgTimeSpent
        },
        breakdowns: {
          contentMethods: methodBreakdown,
          devices: deviceBreakdown,
          browsers: browserBreakdown
        },
        stepAnalysis,
        recentActivity,
        generatedAt: new Date()
      });

    } catch (error) {
      console.error('Analytics query failed:', error);
      return NextResponse.json({
        success: false,
        message: 'Analytics system initializing',
        summary: {
          totalSessions: 0,
          completedJourneys: 0,
          abandonedJourneys: 0,
          conversionRate: 0,
          totalTimeSpent: 0,
          avgTimeSpent: 0
        },
        breakdowns: {
          contentMethods: {},
          devices: {},
          browsers: {}
        },
        recentActivity: []
      });
    }

  } catch (error) {
    console.error('Error loading analytics:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics' }, 
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
      eventType, // 'step_completed', 'regeneration', 'save', 'preview', 'edit'
      eventData = {},
      timeSpent = 0,
      currentStep,
      deviceInfo = {}
    } = body;

    if (!challengeId || !eventType) {
      return NextResponse.json({ error: 'Challenge ID and event type required' }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    try {
      // Update analytics based on event type
      const updateData: any = {
        updatedAt: new Date(),
        totalTimeSpent: { increment: timeSpent }
      };

      if (currentStep) {
        updateData.currentStep = currentStep.toString();
        updateData.maxStepReached = currentStep.toString();
      }

      switch (eventType) {
        case 'regeneration':
          updateData.regenerateCount = { increment: 1 };
          break;
        case 'save':
          updateData.saveCount = { increment: 1 };
          break;
        case 'preview':
          updateData.previewCount = { increment: 1 };
          break;
        case 'edit':
          updateData.editCount = { increment: 1 };
          break;
        case 'step_completed':
          updateData.stepsData = eventData.stepsData;
          updateData.stepTransitions = eventData.stepTransitions;
          break;
      }

      // Update or create analytics record
      await (prisma as any).submissionAnalytics?.upsert({
        where: {
          userId_challengeId: {
            userId: user.id,
            challengeId
          }
        },
        update: updateData,
        create: {
          userId: user.id,
          challengeId,
          totalTimeSpent: timeSpent,
          currentStep: currentStep?.toString() || '0',
          maxStepReached: currentStep?.toString() || '0',
          saveCount: eventType === 'save' ? 1 : 0,
          regenerateCount: eventType === 'regeneration' ? 1 : 0,
          previewCount: eventType === 'preview' ? 1 : 0,
          editCount: eventType === 'edit' ? 1 : 0,
          deviceType: deviceInfo.deviceType || 'unknown',
          browserType: deviceInfo.browserType || 'unknown',
          sessionId: deviceInfo.sessionId || crypto.randomUUID(),
          journeyStarted: new Date(),
          createdAt: new Date()
        }
      });

      return NextResponse.json({ 
        success: true,
        eventTracked: eventType,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Analytics tracking failed:', error);
      return NextResponse.json(
        { error: 'Failed to track analytics', details: error instanceof Error ? error.message : 'Unknown error' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in analytics POST:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics request' }, 
      { status: 500 }
    );
  }
}

// Helper methods for step analysis (would be moved to a separate utility file in production)
function calculateDropOffPoints(stepData: any[]) {
  const dropOffs: { [key: string]: number } = {};
  stepData.forEach(data => {
    if (!data.completed && data.maxStep) {
      dropOffs[data.maxStep] = (dropOffs[data.maxStep] || 0) + 1;
    }
  });
  return Object.entries(dropOffs)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([step, count]) => ({ step, count }));
}

function calculateStepCompletionRates(stepData: any[]) {
  const stepCounts: { [key: string]: { total: number; completed: number } } = {};
  
  stepData.forEach(data => {
    const maxStep = parseInt(data.maxStep) || 0;
    for (let i = 1; i <= maxStep; i++) {
      const stepKey = i.toString();
      if (!stepCounts[stepKey]) {
        stepCounts[stepKey] = { total: 0, completed: 0 };
      }
      stepCounts[stepKey].total++;
      if (i <= maxStep) {
        stepCounts[stepKey].completed++;
      }
    }
  });

  return Object.entries(stepCounts).map(([step, counts]) => ({
    step,
    completionRate: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
    totalAttempts: counts.total
  }));
}
