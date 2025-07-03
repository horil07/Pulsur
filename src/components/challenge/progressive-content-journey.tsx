"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
  Bookmark
} from 'lucide-react';
import ContentMethodSelection, { ContentMethod } from './content-method-selection';
import { AdvancedAIGenerator } from '@/components/ai/advanced-ai-generator';
import PulsarAIDashboard from '@/components/ai/pulsar-ai-dashboard';
import IntelligentSuggestionsPanel from '@/components/ai/intelligent-suggestions-panel';
import ContentQualityScorer from '@/components/ai/content-quality-scorer';
import { InspirationPanel } from '@/components/ui/inspiration-panel';
import { useAutoSave, useDraftManager } from '@/hooks/useAutoSave';
import { useSubmissionAnalytics } from '@/hooks/useSubmissionAnalytics';
import { useSession } from 'next-auth/react';

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

interface InspirationData {
  submission?: { 
    title: string; 
    user?: { name: string } 
  };
  inspirationType: string;
  originalTitle?: string;
  originalType?: string;
}

interface ProgressiveContentJourneyProps {
  challengeId: string;
  challengeTitle: string;
  onSubmissionComplete: (data: unknown) => void;
  onSaveProgress?: (progress: JourneyProgress) => void;
  initialProgress?: JourneyProgress | null;
  inspirationData?: InspirationData | null; // R40: Inspiration data from gallery
}

export default function ProgressiveContentJourney({
  challengeId,
  challengeTitle,
  onSubmissionComplete,
  onSaveProgress,
  initialProgress,
  inspirationData
}: ProgressiveContentJourneyProps) {
  const { data: session } = useSession();
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
        await draftManager.actions.updateDraft(data as Record<string, unknown>);
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

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!contentMethod) return;

    setIsAutoSaving(true);
    
    const progress: JourneyProgress = {
      currentStep: currentStepIndex,
      totalSteps: steps.length,
      completedSteps,
      savedData,
      lastSaved: new Date(),
      contentMethod
    };

    try {
      // Save to localStorage for persistence
      localStorage.setItem(
        `content-journey-${challengeId}`, 
        JSON.stringify(progress)
      );
      
      setLastSaved(new Date());
      onSaveProgress?.(progress);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  }, [challengeId, currentStepIndex, steps.length, completedSteps, savedData, contentMethod, onSaveProgress]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (contentMethod) {
      const interval = setInterval(autoSave, 30000);
      return () => clearInterval(interval);
    }
  }, [contentMethod, autoSave]);

  const handleMethodSelection = (method: ContentMethod) => {
    // Track method selection analytics
    if (contentMethod && contentMethod !== method && method) {
      analytics.trackMethodSwitch(contentMethod, method);
    } else if (method) {
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

      autoSave();
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

    autoSave();
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleManualSave = () => {
    autoSave();
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
              <p className="text-gray-400 mb-6">{currentStep.description}</p>
            </div>
            
            {/* Pulsar AI Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AdvancedAIGenerator
                  onGenerated={(generatedContent) => {
                    handleStepComplete(currentStep.id, { generatedContent });
                  }}
                  onSaveForLater={(params, step) => {
                    setSavedData(prev => ({ 
                      ...prev, 
                      [currentStep.id]: { params, step, savedAt: new Date() }
                    }));
                    autoSave();
                  }}
                />
              </div>
              
              <div className="space-y-4">
                {/* R40: Inspiration Panel */}
                {inspirationData && (
                  <InspirationPanel
                    inspirationData={inspirationData}
                    onUsePrompt={(prompt) => {
                      // Update the current step's prompt with inspiration
                      setSavedData(prev => ({
                        ...prev,
                        [currentStep.id]: {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ...(prev[currentStep.id] as any || {}),
                          params: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ...((prev[currentStep.id] as any)?.params || {}),
                            prompt: prompt
                          }
                        }
                      }));
                    }}
                    onUseStyle={(style) => {
                      // Add style to existing prompt or create new one
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const currentPrompt = (savedData[currentStep.id] as any)?.params?.prompt || ''
                      const newPrompt = currentPrompt ? `${currentPrompt}, ${style}` : style
                      setSavedData(prev => ({
                        ...prev,
                        [currentStep.id]: {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          ...(prev[currentStep.id] as any || {}),
                          params: {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            ...((prev[currentStep.id] as any)?.params || {}),
                            prompt: newPrompt
                          }
                        }
                      }));
                    }}
                  />
                )}

                {/* AI Dashboard */}
                <PulsarAIDashboard 
                  userId={session?.user?.id}
                  onSuggestionApply={(suggestion) => {
                    // Apply suggestion to current generation
                    console.log('Applied suggestion:', suggestion);
                  }}
                />
                
                {/* eslint-disable @typescript-eslint/no-explicit-any */}
                {/* Intelligent Suggestions */}
                {(savedData[currentStep.id] as any)?.params?.prompt && (
                  <IntelligentSuggestionsPanel
                    prompt={(savedData[currentStep.id] as any)?.params?.prompt}
                    contentType={(savedData[currentStep.id] as any)?.params?.contentType || 'image'}
                    onPromptUpdate={(newPrompt) => {
                      setSavedData(prev => ({
                        ...prev,
                        [currentStep.id]: {
                          ...(prev[currentStep.id] as any || {}),
                          params: {
                            ...((prev[currentStep.id] as any)?.params || {}),
                            prompt: newPrompt
                          }
                        }
                      }));
                    }}
                  />
                )}
                
                {/* Quality Scorer */}
                {(savedData[currentStep.id] as any)?.generatedContent?.contentUrl && (
                  <ContentQualityScorer
                    contentUrl={(savedData[currentStep.id] as any)?.generatedContent?.contentUrl}
                    contentType={(savedData[currentStep.id] as any)?.params?.contentType || 'image'}
                    prompt={(savedData[currentStep.id] as any)?.params?.prompt}
                    onScoreUpdate={(score) => {
                      setSavedData(prev => ({
                        ...prev,
                        [currentStep.id]: {
                          ...(prev[currentStep.id] as any || {}),
                          qualityScore: score
                        }
                      }));
                    }}
                  />
                )}
                {/* eslint-enable @typescript-eslint/no-explicit-any */}
              </div>
            </div>
          </div>
        );

      case 'upload-content':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h3>
              <p className="text-gray-400">{currentStep.description}</p>
            </div>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <h4 className="text-xl font-semibold text-white mb-2">Upload Content Component</h4>
                  <p className="text-gray-400 mb-4">
                    This would be replaced with the actual upload component
                  </p>
                  <Button 
                    onClick={() => handleStepComplete(currentStep.id, { uploaded: true })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Simulate Upload Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'content-details':
      case 'content-enhancement':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h3>
              <p className="text-gray-400">{currentStep.description}</p>
            </div>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✨</div>
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {currentStep.title} Component
                  </h4>
                  <p className="text-gray-400 mb-4">
                    This would be replaced with the actual {currentStep.title.toLowerCase()} component
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

      case 'review-submit':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to Submit!</h3>
              <p className="text-gray-400">Review your content and submit to the challenge</p>
            </div>
            <Card className="bg-gray-900/50 border-gray-700">
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎯</div>
                  <h4 className="text-xl font-semibold text-white mb-2">Final Review</h4>
                  <p className="text-gray-400 mb-6">
                    Your content is ready! This would show the final review interface.
                  </p>
                  <Button 
                    onClick={() => {
                      handleStepComplete(currentStep.id, { submitted: true });
                      onSubmissionComplete(savedData);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    size="lg"
                  >
                    Submit to Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Step Not Implemented</h3>
            <p className="text-gray-400">This step is still being developed.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Progress - Desktop Enhanced */}
      <div className="text-center space-y-4">
        <div className="hidden lg:block">
          <h1 className="text-4xl font-bold text-white mb-6">
            Create for {challengeTitle}
          </h1>
        </div>
        <div className="lg:hidden">
          <h1 className="text-3xl font-bold text-white">
            Create for {challengeTitle}
          </h1>
        </div>
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
      </div>

      {/* Step Navigation - Enhanced for Desktop */}
      <div className="flex justify-center">
        <div className="hidden lg:flex items-center space-x-4 overflow-x-auto pb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center space-x-4">
              <div className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl whitespace-nowrap min-w-[200px] transition-all duration-300
                ${step.current ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/20' : ''}
                ${step.completed ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 shadow-lg shadow-green-500/20' : ''}
                ${!step.current && !step.completed ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-700/50' : ''}
              `}>
                <div className="flex-shrink-0">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${
                    step.current ? 'text-blue-400' : 
                    step.completed ? 'text-green-400' : 
                    'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {step.description}
                  </div>
                </div>
                {step.optional && (
                  <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 flex-shrink-0">
                    Optional
                  </Badge>
                )}
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-5 w-5 text-gray-600" />
              )}
            </div>
          ))}
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden flex items-center space-x-2 overflow-x-auto pb-2">
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

      {/* Current Step Content - Enhanced Layout */}
      <div className="min-h-[600px]">
        <div className="hidden lg:block">
          {/* Desktop Layout with Sidebar */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8">
              {renderCurrentStepContent()}
            </div>
            <div className="col-span-4 space-y-6">
              {/* Progress Summary */}
              <Card className="bg-gray-900/30 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-blue-400" />
                    Progress Summary
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Step:</span>
                      <span className="text-white">{currentStep?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completed:</span>
                      <span className="text-green-400">{completedSteps.length}/{steps.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Method:</span>
                      <span className="text-blue-400 capitalize">
                        {contentMethod?.replace('-', ' ') || 'Not selected'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gray-900/30 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-white font-semibold mb-3 flex items-center">
                    <Save className="h-4 w-4 mr-2 text-green-400" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Button
                      onClick={handleManualSave}
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-600 text-gray-400 hover:text-white"
                      disabled={isAutoSaving}
                    >
                      {isAutoSaving ? 'Saving...' : 'Save Progress'}
                    </Button>
                    {currentStepIndex > 0 && (
                      <Button
                        onClick={handleStepBack}
                        variant="outline"
                        size="sm"
                        className="w-full border-gray-600 text-gray-400 hover:text-white"
                      >
                        Previous Step
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Auto-save Status */}
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Bookmark className="h-3 w-3" />
                <span>Progress saved automatically</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {renderCurrentStepContent()}
        </div>
      </div>

      {/* Navigation Controls - Mobile Only */}
      {contentMethod && (
        <div className="lg:hidden flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleStepBack}
              disabled={currentStepIndex === 0}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleManualSave}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
              disabled={isAutoSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isAutoSaving ? 'Saving...' : 'Save Progress'}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              Progress saved automatically
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
