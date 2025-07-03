"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Trash2, 
  Clock, 
  FileText,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Draft {
  id: string;
  draftName: string;
  challengeId: string;
  type: 'AI_ARTWORK' | 'UPLOAD_ARTWORK';
  title?: string;
  currentStep: number;
  totalSteps: number;
  isCompleted: boolean;
  contentMethod?: string;
  timeSpent: number;
  lastSaved: Date;
  progress: number;
}

interface DraftManagerProps {
  challengeId: string;
  onDraftSelected: (draft: Draft) => void;
  onNewDraft: () => void;
  currentDraftId?: string;
}

export default function DraftManager({
  challengeId,
  onDraftSelected,
  onNewDraft,
  currentDraftId
}: DraftManagerProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load drafts for current challenge
  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/submissions/drafts?challengeId=${challengeId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      } else {
        throw new Error('Failed to load drafts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  // Delete draft
  const deleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`/api/submissions/drafts?draftId=${draftId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
      } else {
        throw new Error('Failed to delete draft');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete draft');
    }
  };

  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  // Get draft status
  const getDraftStatus = (draft: Draft) => {
    if (draft.isCompleted) return { label: 'Completed', color: 'bg-green-500' };
    if (draft.currentStep > 1) return { label: 'In Progress', color: 'bg-blue-500' };
    return { label: 'Started', color: 'bg-gray-500' };
  };

  useEffect(() => {
    loadDrafts();
  }, [challengeId, loadDrafts]);

  if (loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-blue-400 animate-spin mr-2" />
            <span className="text-gray-400">Loading drafts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-red-400 mr-2" />
            <span className="text-red-400">{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Your Drafts</CardTitle>
          <Button
            onClick={onNewDraft}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Draft
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {drafts.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Drafts Yet</h3>
            <p className="text-gray-400 mb-4">
              Start creating your first draft for this challenge
            </p>
            <Button
              onClick={onNewDraft}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create First Draft
            </Button>
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {drafts.map((draft) => {
              const status = getDraftStatus(draft);
              const isActive = draft.id === currentDraftId;
              
              return (
                <div
                  key={draft.id}
                  className={`
                    p-4 rounded-lg border cursor-pointer transition-all
                    ${isActive 
                      ? 'bg-blue-900/30 border-blue-500/50' 
                      : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                    }
                  `}
                  onClick={() => onDraftSelected(draft)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-white">
                          {draft.draftName || draft.title || 'Untitled Draft'}
                        </h4>
                        <Badge 
                          className={`text-xs text-white ${status.color}`}
                        >
                          {status.label}
                        </Badge>
                        {isActive && (
                          <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeSpent(draft.timeSpent)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Save className="h-3 w-3" />
                          <span>{formatLastSaved(draft.lastSaved)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Step {draft.currentStep} of {draft.totalSteps}</span>
                        </div>
                      </div>
                      
                      {draft.contentMethod && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {draft.contentMethod === 'ai-generation' ? 'AI Generated' : 'Manual Upload'}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{Math.round(draft.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`bg-blue-500 h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min(100, Math.max(0, draft.progress))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {draft.isCompleted && (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      )}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDraft(draft.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
