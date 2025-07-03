import { useEffect, useRef, useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';

// Auto-save hook for R33.1: Auto-Save Functionality

interface AutoSaveOptions {
  challengeId: string;
  interval?: number; // Auto-save interval in milliseconds (default: 30 seconds)
  onSave?: (data: unknown) => Promise<void>;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

interface AutoSaveState {
  lastSaved: Date | null;
  isSaving: boolean;
  saveCount: number;
  error: string | null;
}

export function useAutoSave(data: unknown, options: AutoSaveOptions) {
  const { data: session } = useSession();
  const {
    challengeId,
    interval = 30000, // 30 seconds default
    onSave,
    onError,
    enabled = true
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    lastSaved: null,
    isSaving: false,
    saveCount: 0,
    error: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<unknown>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save function
  const debouncedSave = useCallback(async (saveData: unknown) => {
    if (!enabled || !session?.user?.email || !challengeId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setState(prev => ({ ...prev, isSaving: true, error: null }));

        if (onSave) {
          // Use custom save function if provided
          await onSave(saveData);
        } else {
          // Default save to drafts API
          const payload = typeof saveData === 'object' && saveData !== null
            ? { challengeId, ...(saveData as Record<string, unknown>), timeSpent: 30 }
            : { challengeId, data: saveData, timeSpent: 30 };

          await fetch('/api/submissions/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }

        setState(prev => ({
          ...prev,
          lastSaved: new Date(),
          isSaving: false,
          saveCount: prev.saveCount + 1,
          error: null
        }));

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: errorMessage
        }));
        
        if (onError) {
          onError(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    }, 2000); // 2 second debounce

  }, [enabled, session, challengeId, onSave, onError]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled || !session?.user?.email) return;

    intervalRef.current = setInterval(() => {
      if (data && JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
        debouncedSave(data);
        lastDataRef.current = data;
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [data, enabled, session, interval, debouncedSave]);

  // Save on data change (debounced)
  useEffect(() => {
    if (data && JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
      debouncedSave(data);
      lastDataRef.current = data;
    }
  }, [data, debouncedSave]);

  // Manual save function
  const saveNow = useCallback(async () => {
    if (data) {
      await debouncedSave(data);
    }
  }, [data, debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    saveNow,
    isEnabled: enabled && !!session?.user?.email
  };
}

// Enhanced draft management hook for R33.2: Draft Management
interface DraftManagerOptions {
  challengeId: string;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

interface Draft {
  id: string;
  draftName: string;
  challengeId: string;
  type: string;
  title?: string;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  contentMethod?: string;
  timeSpent: number;
  lastSaved: Date;
  createdAt: Date;
}

export function useDraftManager(options: DraftManagerOptions) {
  const { challengeId, autoSave = true, autoSaveInterval = 30000 } = options;
  const { data: session } = useSession();
  
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load drafts for challenge
  const loadDrafts = useCallback(async () => {
    if (!session?.user?.email || !challengeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/drafts?challengeId=${challengeId}`);
      const result = await response.json();

      if (result.drafts) {
        setDrafts(result.drafts);
        // Set most recent draft as current if none selected
        if (!currentDraft && result.drafts.length > 0) {
          setCurrentDraft(result.drafts[0]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drafts';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session, challengeId, currentDraft]);

  // Create new draft
  const createDraft = useCallback(async (draftData: Partial<Draft> & { draftName: string }) => {
    if (!session?.user?.email || !challengeId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/submissions/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          ...draftData
        })
      });

      const result = await response.json();

      if (result.success && result.draft) {
        await loadDrafts(); // Reload drafts list
        return result.draft;
      } else {
        throw new Error(result.error || 'Failed to create draft');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create draft';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, challengeId, loadDrafts]);

  // Update current draft
  const updateDraft = useCallback(async (updates: Partial<Draft>) => {
    if (!currentDraft) return;

    const updatedDraft = { ...currentDraft, ...updates };
    setCurrentDraft(updatedDraft);

    // Update draft via API
    try {
      await fetch('/api/submissions/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedDraft,
          challengeId
        })
      });
    } catch (err) {
      console.error('Failed to update draft:', err);
    }
  }, [currentDraft, challengeId]);

  // Delete draft
  const deleteDraft = useCallback(async (draftId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/submissions/drafts?draftId=${draftId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        if (currentDraft?.id === draftId) {
          setCurrentDraft(null);
        }
      } else {
        throw new Error('Failed to delete draft');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete draft';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentDraft]);

  // Auto-save current draft
  const autoSaveState = useAutoSave(currentDraft, {
    challengeId,
    interval: autoSaveInterval,
    enabled: autoSave && !!currentDraft,
    onSave: async (data) => {
      const payload = typeof data === 'object' && data !== null
        ? { challengeId, ...(data as Record<string, unknown>) }
        : { challengeId, data };
        
      await fetch('/api/submissions/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    },
    onError: (err) => setError(err.message)
  });

  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  return {
    drafts,
    currentDraft,
    setCurrentDraft,
    loading,
    error,
    autoSaveState,
    actions: {
      loadDrafts,
      createDraft,
      updateDraft,
      deleteDraft,
      saveNow: autoSaveState.saveNow
    }
  };
}
