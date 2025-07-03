'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { PlayCircle, Pause, CheckCircle2, ArrowRight, ArrowLeft, Clock, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TutorialStep {
  id: number
  title: string
  description: string
  content: string
  media?: string | null
  duration: number
}

interface ChallengeTutorialProps {
  challengeId: string
  challengeTitle: string
  tutorialSteps: TutorialStep[]
  onComplete: () => void
  onSkip?: () => void
  className?: string
}

export function ChallengeTutorial({
  challengeId,
  challengeTitle,
  tutorialSteps,
  onComplete,
  onSkip,
  className
}: ChallengeTutorialProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const currentTutorialStep = tutorialSteps[currentStep]
  const totalSteps = tutorialSteps.length
  const isLastStep = currentStep === totalSteps - 1

  // Auto-progress timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    
    if (isPlaying && currentTutorialStep) {
      interval = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = prev + (100 / currentTutorialStep.duration)
          if (newProgress >= 100) {
            setIsPlaying(false)
            setCompletedSteps(prev => new Set([...prev, currentStep]))
            return 100
          }
          return newProgress
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, currentTutorialStep, currentStep])

  // Update overall progress
  useEffect(() => {
    const overallProgress = ((currentStep + (stepProgress / 100)) / totalSteps) * 100
    setProgress(overallProgress)
  }, [currentStep, stepProgress, totalSteps])

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(prev => prev + 1)
      setStepProgress(0)
      setIsPlaying(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setStepProgress(0)
      setIsPlaying(false)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setStepProgress(0)
    setIsPlaying(false)
  }

  const handleComplete = async () => {
    try {
      // Save tutorial progress to the backend
      await fetch('/api/challenges/tutorial/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          currentStep: totalSteps,
          completed: true
        })
      })
      
      onComplete()
    } catch (error) {
      console.error('Failed to save tutorial progress:', error)
      onComplete() // Continue even if save fails
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    } else {
      onComplete()
    }
  }

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]', className)}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Challenge Tutorial
            </h1>
            <p className="text-gray-400">
              {challengeTitle}
            </p>
          </div>
          {onSkip && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Skip Tutorial
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-gray-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {tutorialSteps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all',
                    index === currentStep
                      ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white'
                      : completedSteps.has(index)
                      ? 'bg-green-600/20 text-green-400 border border-green-600'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {completedSteps.has(index) ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs',
                        index === currentStep
                          ? 'border-white bg-white text-red-500'
                          : 'border-gray-400'
                      )}>
                        {index + 1}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {step.title}
                      </div>
                      <div className="text-xs opacity-70">
                        {step.duration}s
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant="outline" className="text-red-500 border-red-500">
                    Step {currentStep + 1}
                  </Badge>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {currentTutorialStep.duration}s
                  </div>
                </div>
                <CardTitle className="text-white text-xl mb-2">
                  {currentTutorialStep.title}
                </CardTitle>
                <p className="text-gray-400">
                  {currentTutorialStep.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Media Content */}
                {currentTutorialStep.media && (
                  <div className="relative rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={currentTutorialStep.media}
                      alt={currentTutorialStep.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                )}

                {/* Text Content */}
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed">
                    {currentTutorialStep.content}
                  </p>
                </div>

                {/* Step Progress */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={isPlaying ? handlePause : handlePlay}
                      className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-300"
                      disabled={stepProgress >= 100}
                    >
                      {isPlaying ? (
                        <><Pause className="w-4 h-4 mr-2" /> Pause</>
                      ) : stepProgress >= 100 ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Completed</>
                      ) : (
                        <><PlayCircle className="w-4 h-4 mr-2" /> Start</>
                      )}
                    </Button>
                    <div className="flex-1">
                      <Progress value={stepProgress} className="h-2" />
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>

                    <Button
                      onClick={handleNext}
                      disabled={stepProgress < 100 && !completedSteps.has(currentStep)}
                      className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-300"
                    >
                      {isLastStep ? 'Complete Tutorial' : 'Next Step'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
