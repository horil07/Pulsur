import { useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

// Analytics tracking hook for R33.3: Submission Analytics

interface AnalyticsEvent {
  eventType: 'step_completed' | 'regeneration' | 'save' | 'preview' | 'edit' | 'method_switch' | 'abandon';
  eventData?: Record<string, unknown>;
  currentStep?: number;
  timeSpent?: number;
}

interface AnalyticsOptions {
  challengeId: string;
  sessionId?: string;
  enabled?: boolean;
  batchSize?: number;
  flushInterval?: number; // ms
}

interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browserType: string;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export function useSubmissionAnalytics(options: AnalyticsOptions) {
  const { challengeId, sessionId, enabled = true, batchSize = 10, flushInterval = 60000 } = options;
  const { data: session } = useSession();
  
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const startTime = useRef<number>(Date.now());
  const lastFlush = useRef<number>(Date.now());
  const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deviceInfoRef = useRef<DeviceInfo | null>(null);

  // Get device information
  const getDeviceInfo = useCallback((): DeviceInfo => {
    if (deviceInfoRef.current) return deviceInfoRef.current;

    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    
    const deviceType = screenWidth <= 768 ? 'mobile' : 
                      screenWidth <= 1024 ? 'tablet' : 'desktop';
    
    const browserType = /chrome/i.test(userAgent) ? 'chrome' :
                       /safari/i.test(userAgent) ? 'safari' :
                       /firefox/i.test(userAgent) ? 'firefox' :
                       /edge/i.test(userAgent) ? 'edge' : 'other';

    deviceInfoRef.current = {
      deviceType,
      browserType,
      screenWidth,
      screenHeight,
      userAgent
    };

    return deviceInfoRef.current;
  }, []);

  // Flush events to server
  const flushEvents = useCallback(async (force = false) => {
    if (!enabled || !session?.user?.email || eventQueue.current.length === 0) return;

    const now = Date.now();
    const timeSinceLastFlush = now - lastFlush.current;
    
    if (!force && timeSinceLastFlush < flushInterval && eventQueue.current.length < batchSize) {
      return;
    }

    const eventsToFlush = [...eventQueue.current];
    eventQueue.current = [];
    lastFlush.current = now;

    try {
      // Send events in batch
      for (const event of eventsToFlush) {
        await fetch('/api/submissions/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            challengeId,
            eventType: event.eventType,
            eventData: event.eventData,
            timeSpent: event.timeSpent || 0,
            currentStep: event.currentStep,
            deviceInfo: getDeviceInfo()
          })
        });
      }
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
      // Re-queue events for retry (simplified retry logic)
      eventQueue.current = [...eventsToFlush, ...eventQueue.current];
    }
  }, [enabled, session, challengeId, batchSize, flushInterval, getDeviceInfo]);

  // Track an analytics event
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (!enabled || !session?.user?.email) return;

    const now = Date.now();
    const timeSpent = event.timeSpent || (now - startTime.current);
    
    eventQueue.current.push({
      ...event,
      timeSpent
    });

    // Auto-flush if batch size reached
    if (eventQueue.current.length >= batchSize) {
      flushEvents();
    }
  }, [enabled, session, batchSize, flushEvents]);

  // Convenience methods for common events
  const trackStepCompleted = useCallback((step: number, stepData?: Record<string, unknown>) => {
    trackEvent({
      eventType: 'step_completed',
      currentStep: step,
      eventData: stepData
    });
  }, [trackEvent]);

  const trackRegeneration = useCallback((regenerationType: string, promptData?: Record<string, unknown>) => {
    trackEvent({
      eventType: 'regeneration',
      eventData: { regenerationType, ...promptData }
    });
  }, [trackEvent]);

  const trackPreview = useCallback((previewType: string, contentData?: Record<string, unknown>) => {
    trackEvent({
      eventType: 'preview',
      eventData: { previewType, ...contentData }
    });
  }, [trackEvent]);

  const trackEdit = useCallback((editType: string, editData?: Record<string, unknown>) => {
    trackEvent({
      eventType: 'edit',
      eventData: { editType, ...editData }
    });
  }, [trackEvent]);

  const trackMethodSwitch = useCallback((fromMethod: string, toMethod: string) => {
    trackEvent({
      eventType: 'method_switch',
      eventData: { fromMethod, toMethod }
    });
  }, [trackEvent]);

  const trackAbandon = useCallback((lastStep: number, reason?: string) => {
    trackEvent({
      eventType: 'abandon',
      currentStep: lastStep,
      eventData: { reason }
    });
  }, [trackEvent]);

  // Auto-flush timer
  useEffect(() => {
    if (!enabled) return;

    flushTimeoutRef.current = setInterval(() => {
      flushEvents();
    }, flushInterval);

    return () => {
      if (flushTimeoutRef.current) {
        clearInterval(flushTimeoutRef.current);
      }
    };
  }, [enabled, flushInterval, flushEvents]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      flushEvents(true);
    };
  }, [flushEvents]);

  // Flush on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushEvents(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushEvents]);

  // Track session start
  useEffect(() => {
    if (enabled && session?.user?.email) {
      trackEvent({
        eventType: 'step_completed',
        currentStep: 0,
        eventData: { sessionStart: true }
      });
    }
  }, [enabled, session, trackEvent]);

  return {
    trackEvent,
    trackStepCompleted,
    trackRegeneration,
    trackPreview,
    trackEdit,
    trackMethodSwitch,
    trackAbandon,
    flushEvents: () => flushEvents(true),
    queueSize: eventQueue.current.length,
    deviceInfo: getDeviceInfo(),
    sessionId: sessionId || 'default',
    isEnabled: enabled && !!session?.user?.email
  };
}
