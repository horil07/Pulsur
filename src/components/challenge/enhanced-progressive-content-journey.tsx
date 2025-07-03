"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Save, 
  PlayCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Bookmark,
  BarChart,
  Layers
} from 'lucide-react';
import ContentMethodSelection, { ContentMethod } from './content-method-selection';
import { AdvancedAIGenerator } from '@/components/ai/advanced-ai-generator';
import DraftManager from './draft-manager';
import SubmissionAnalyticsDashboard from './submission-analytics-dashboard';
import { useAutoSave, useDraftManager } from '@/hooks/useAutoSave';
import { useSubmissionAnalytics } from '@/hooks/useSubmissionAnalytics';

interface ContentJourneyStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  optional?: boolean;
}

interface JourneyProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  savedData: Record<string, unknown>;
  lastSaved: Date | null;
  contentMethod: ContentMethod;
}

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

interface EnhancedProgressiveContentJourneyProps {
  challengeId: string;
  challengeTitle: string;
  onSubmissionComplete: (data: unknown) => void;
  onSaveProgress?: (progress: JourneyProgress) => void;
  initialProgress?: JourneyProgress | null;
}

export default function EnhancedProgressiveContentJourney({
  challengeId,
  challengeTitle,
  onSubmissionComplete,
  onSaveProgress,
  initialProgress
}: EnhancedProgressiveContentJourneyProps) {
  const [contentMethod, setContentMethod] = useState<ContentMethod>(
    initialProgress?.contentMethod || null
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(
    initialProgress?.currentStep || 0
  );
  const [completedSteps, setCompletedSteps] = useState<string[]>(
    initialProgress?.completedSteps || []
  );
  const [savedData, setSavedData] = useState<Record<string, unknown>>(
    initialProgress?.savedData || {}
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(
    initialProgress?.lastSaved || null
  );
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);

  // Enhanced features for R33-R33.3
  
  // Analytics tracking
  const analytics = useSubmissionAnalytics({
    challengeId,
    enabled: true,
    batchSize: 5,
    flushInterval: 30000
  });

  // Draft management with auto-save
  const draftManager = useDraftManager({
    challengeId,
    autoSave: true,
    autoSaveInterval: 30000
  });

  // Auto-save current journey state
  const journeyState = {
    contentMethod,
    currentStep: currentStepIndex,
    completedSteps,
    savedData,
    challengeId,
    type: contentMethod === 'ai-generation' ? 'AI_ARTWORK' : 'UPLOAD_ARTWORK',
    timeSpent: Date.now() - (lastSaved?.getTime() || Date.now())
  };

  const autoSaveState = useAutoSave(journeyState, {
    challengeId,
    interval: 30000,
    enabled: contentMethod !== null,
    onSave: async (data: unknown) => {
      setIsAutoSaving(true);
      try {
        await draftManager.actions.updateDraft(data as Partial<Draft>);
        setLastSaved(new Date());
        analytics.trackEvent({
          eventType: 'save',
          currentStep: currentStepIndex,
          timeSpent: 30
        });
      } finally {
        setIsAutoSaving(false);
      }
    },
    onError: (error) => {
      console.error('Auto-save failed:', error);
      analytics.trackEvent({
        eventType: 'save',
        currentStep: currentStepIndex,
        eventData: { error: error.message, success: false }
      });
    }
  });

  // Define journey steps based on content method
  const getJourneySteps = (method: ContentMethod): ContentJourneyStep[] => {
    const baseSteps: ContentJourneyStep[] = [
      {
        id: 'method-selection',
        title: 'Choose Creation Method',
        description: 'Select how you want to create your content',
        completed: method !== null,
        current: method === null
      }
    ];

    if (method === 'ai-generation') {
      return [
        ...baseSteps,
        {
          id: 'ai-setup',
          title: 'AI Generation Setup',
          description: 'Configure your AI generation parameters',
          completed: completedSteps.includes('ai-setup'),
          current: currentStepIndex === 1 && method === 'ai-generation'
        },
        {
          id: 'ai-generation',
          title: 'Generate Content',
          description: 'Let AI create your content based on your inputs',
          completed: completedSteps.includes('ai-generation'),
          current: currentStepIndex === 2 && method === 'ai-generation'
        },
        {
          id: 'ai-refinement',
          title: 'Refine & Enhance',
          description: 'Polish and enhance your AI-generated content',
          completed: completedSteps.includes('ai-refinement'),
          current: currentStepIndex === 3 && method === 'ai-generation',
          optional: true
        },
        {
          id: 'review-submit',
          title: 'Review & Submit',
          description: 'Final review and submission of your content',
          completed: completedSteps.includes('review-submit'),
          current: currentStepIndex === 4 && method === 'ai-generation'
        }
      ];
    } else if (method === 'manual-upload') {
      return [
        ...baseSteps,
        {
          id: 'upload-content',
          title: 'Upload Content',
          description: 'Upload your pre-created content files',
          completed: completedSteps.includes('upload-content'),
          current: currentStepIndex === 1 && method === 'manual-upload'
        },
        {
          id: 'content-details',
          title: 'Add Details',
          description: 'Add title, description, and metadata',
          completed: completedSteps.includes('content-details'),
          current: currentStepIndex === 2 && method === 'manual-upload'
        },
        {
          id: 'content-enhancement',
          title: 'Enhance Content',
          description: 'Apply filters, effects, and optimizations',
          completed: completedSteps.includes('content-enhancement'),
          current: currentStepIndex === 3 && method === 'manual-upload',
          optional: true
        },
        {
          id: 'review-submit',
          title: 'Review & Submit',
          description: 'Final review and submission of your content',
          completed: completedSteps.includes('review-submit'),
          current: currentStepIndex === 4 && method === 'manual-upload'
        }
      ];
    }

    return baseSteps;
  };

  const steps = getJourneySteps(contentMethod);
  const currentStep = steps[currentStepIndex];

  const handleDraftSelected = (draft: Draft) => {
    setCurrentDraft(draft);
    setContentMethod(draft.contentMethod as ContentMethod);
    setCurrentStepIndex(draft.currentStep);
    setShowDrafts(false);
    
    // Track draft load analytics
    analytics.trackEvent({
      eventType: 'save', // Using 'save' as closest valid type for draft loading
      currentStep: draft.currentStep,
      eventData: { draftId: draft.id, draftName: draft.draftName }
    });
  };

  const handleNewDraft = () => {
    setCurrentDraft(null);
    setContentMethod(null);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setSavedData({});
    setShowDrafts(false);
  };

  const handleMethodSelection = (method: ContentMethod) => {
    // Track method selection analytics
    if (method) {
      analytics.trackStepCompleted(0, { methodSelected: method });
    }

    setContentMethod(method);
    if (method) {
      setCurrentStepIndex(1);
      setCompletedSteps(['method-selection']);
      
      // Create new draft for this journey
      draftManager.actions.createDraft({
        draftName: `${method === 'ai-generation' ? 'AI Generated' : 'Manual Upload'} - ${new Date().toLocaleDateString()}`,
        type: method === 'ai-generation' ? 'AI_ARTWORK' : 'UPLOAD_ARTWORK',
        contentMethod: method,
        currentStep: 1,
        totalSteps: getJourneySteps(method).length
      });
    }
  };

  const handleStepComplete = (stepId: string, data?: Record<string, unknown>) => {
    const wasAlreadyCompleted = completedSteps.includes(stepId);
    
    if (!wasAlreadyCompleted) {
      setCompletedSteps(prev => [...prev, stepId]);
      
      // Track step completion
      analytics.trackStepCompleted(currentStepIndex, {
        stepId,
        stepData: data,
        contentMethod,
        timeSpent: autoSaveState.isEnabled ? 30 : undefined
      });
    }
    
    if (data) {
      setSavedData(prev => ({ ...prev, [stepId]: data }));
      
      // Track data edit
      analytics.trackEdit('step_data_update', {
        stepId,
        dataKeys: Object.keys(data),
        contentMethod
      });
    }

    // Move to next step if not already at the end
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const calculateProgress = () => {
    return Math.round((completedSteps.length / steps.length) * 100);
  };

  const getStepIcon = (step: ContentJourneyStep) => {
    if (step.completed) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (step.current) return <PlayCircle className="h-5 w-5 text-blue-500" />;
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const renderCurrentStepContent = () => {
    if (!currentStep) return null;

    switch (currentStep.id) {
      case 'method-selection':
        return (
          <ContentMethodSelection
            onMethodSelected={handleMethodSelection}
            selectedMethod={contentMethod}
            challengeType="mixed"
          />
        );

      case 'ai-setup':
      case 'ai-generation':
      case 'ai-refinement':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h3>
              <p className="text-gray-400">{currentStep.description}</p>
            </div>
            <AdvancedAIGenerator
              onGenerated={(generatedContent) => {
                handleStepComplete(currentStep.id, { generatedContent });
              }}
              onSaveForLater={(params, step) => {
                setSavedData(prev => ({ 
                  ...prev, 
                  [currentStep.id]: { params, step, savedAt: new Date() }
                }));
              }}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h3>
              <p className="text-gray-400">{currentStep.description}</p>
            </div>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">⚡</div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    Enhanced {currentStep.title}
                  </h4>
                  <p className="text-gray-400 mb-4">
                    This step now includes advanced analytics tracking and auto-save functionality
                  </p>
                  <Button 
                    onClick={() => handleStepComplete(currentStep.id, { completed: true })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Complete {currentStep.title}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // Show draft manager
  if (showDrafts) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Manage Drafts</h2>
          <Button
            onClick={() => setShowDrafts(false)}
            variant="outline"
            className="border-gray-600 text-gray-400"
          >
            Back to Journey
          </Button>
        </div>
        
        <DraftManager
          challengeId={challengeId}
          onDraftSelected={handleDraftSelected}
          onNewDraft={handleNewDraft}
          currentDraftId={currentDraft?.id}
        />
      </div>
    );
  }

  // Show analytics dashboard
  if (showAnalytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <Button
            onClick={() => setShowAnalytics(false)}
            variant="outline"
            className="border-gray-600 text-gray-400"
          >
            Back to Journey
          </Button>
        </div>
        
        <SubmissionAnalyticsDashboard
          challengeId={challengeId}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Progress and Actions */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">
          Create for {challengeTitle}
        </h1>
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="flex items-center space-x-2">
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {isAutoSaving && (
                <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />
              )}
            </div>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          <p className="text-sm text-gray-400">
            {calculateProgress()}% complete
          </p>
        </div>

        {/* Enhanced Action Bar */}
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => setShowDrafts(true)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            <Layers className="h-4 w-4 mr-2" />
            Drafts ({draftManager.drafts.length})
          </Button>
          
          <Button
            onClick={() => setShowAnalytics(true)}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-400 hover:text-white"
          >
            <BarChart className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          
          {currentDraft && (
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Draft: {currentDraft.draftName}
            </Badge>
          )}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-2">
              <div className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap
                ${step.current ? 'bg-blue-500/20 border border-blue-500/50' : ''}
                ${step.completed ? 'bg-green-500/20 border border-green-500/50' : ''}
                ${!step.current && !step.completed ? 'bg-gray-800 border border-gray-700' : ''}
              `}>
                {getStepIcon(step)}
                <span className={`text-sm font-medium ${
                  step.current ? 'text-blue-400' : 
                  step.completed ? 'text-green-400' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </span>
                {step.optional && (
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                    Optional
                  </Badge>
                )}
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Content */}
      <div className="min-h-[600px]">
        {renderCurrentStepContent()}
      </div>

      {/* Navigation Controls */}
      {contentMethod && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Progress saved automatically every 30s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
