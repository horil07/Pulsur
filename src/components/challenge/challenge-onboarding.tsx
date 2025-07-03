'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChallengeTutorial } from './challenge-tutorial'
import { ToolkitAssets } from './toolkit-assets'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ArrowRight, Trophy, Calendar, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TutorialStep {
  id: number
  title: string
  description: string
  content: string
  media?: string | null
  duration: number
}

interface ToolkitAsset {
  id: string
  title: string
  description: string
  fileUrl: string
  fileSize: string
  fileType: string
}

interface OnboardingFlow {
  steps: string[]
  currentStep: string
}

interface Challenge {
  id: string
  title: string
  description: string
  objective?: string
  assignment?: string
  category: string
  image?: string
  status: string
  startDate: string
  endDate: string
  winnersAnnounceDate?: string
  maxEntriesPerUser: number
  currentParticipants: number
  prizes?: string[]
  topPrize?: string
  tutorialEnabled: boolean
  tutorialSteps?: TutorialStep[]
  onboardingFlow?: OnboardingFlow
  hasToolkitAssets: boolean
  toolkitAssets?: ToolkitAsset[]
  deliverables?: string[]
}

interface ChallengeOnboardingProps {
  challenge: Challenge
  onComplete: () => void
  className?: string
}

type OnboardingStep = 'welcome' | 'tutorial' | 'toolkit' | 'ready'

export function ChallengeOnboarding({
  challenge,
  onComplete,
  className
}: ChallengeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [completedSteps, setCompletedSteps] = useState<Set<OnboardingStep>>(new Set())
  const [progress, setProgress] = useState(0)

  const steps: { key: OnboardingStep; title: string; description: string }[] = [
    { key: 'welcome', title: 'Welcome', description: 'Challenge overview' },
    { key: 'tutorial', title: 'Tutorial', description: 'Learn the basics' },
    { key: 'toolkit', title: 'Toolkit', description: 'Download assets' },
    { key: 'ready', title: 'Ready', description: 'Start creating' }
  ]

  useEffect(() => {
    const stepIndex = steps.findIndex(step => step.key === currentStep)
    const newProgress = ((stepIndex + 1) / steps.length) * 100
    setProgress(newProgress)
  }, [currentStep, steps])

  const handleStepComplete = (step: OnboardingStep) => {
    setCompletedSteps(prev => new Set([...prev, step]))
    
    // Move to next step
    const currentIndex = steps.findIndex(s => s.key === step)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key)
    }
  }

  const handleTutorialComplete = () => {
    handleStepComplete('tutorial')
  }

  const handleToolkitComplete = () => {
    handleStepComplete('toolkit')
  }

  const handleSkipTutorial = () => {
    setCompletedSteps(prev => new Set([...prev, 'tutorial']))
    setCurrentStep('toolkit')
  }

  const handleStartChallenge = () => {
    onComplete()
  }

  // Welcome Step
  if (currentStep === 'welcome') {
    return (
      <div className={cn('min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]', className)}>
        <div className="container mx-auto px-4 py-8">
          
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Challenge Onboarding</span>
              <span className="text-sm text-gray-400">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg',
                    step.key === currentStep ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white' :
                    completedSteps.has(step.key) ? 'bg-green-600 text-white' :
                    'bg-gray-800 text-gray-400'
                  )}>
                    {completedSteps.has(step.key) ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-xs">
                        {index + 1}
                      </div>
                    )}
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-600 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Challenge Hero */}
            <div className="text-center mb-8">
              <Badge variant="outline" className="text-red-500 border-red-500 mb-4">
                {challenge.category}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 neon-text-pink">
                {challenge.title}
              </h1>
              <p className="text-xl text-gray-400 mb-6">
                {challenge.description}
              </p>
            </div>

            {/* Challenge Image */}
            {challenge.image && (
              <div className="relative rounded-xl overflow-hidden mb-8">
                <Image
                  src={challenge.image}
                  alt={challenge.title}
                  width={800}
                  height={320}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Challenge Details */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white">Challenge Brief</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {challenge.objective && (
                      <div>
                        <h3 className="text-red-500 font-medium mb-2">Objective</h3>
                        <p className="text-gray-300">{challenge.objective}</p>
                      </div>
                    )}
                    {challenge.assignment && (
                      <div>
                        <h3 className="text-red-500 font-medium mb-2">Assignment</h3>
                        <p className="text-gray-300">{challenge.assignment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Deliverables */}
                {challenge.deliverables && Array.isArray(challenge.deliverables) && challenge.deliverables.length > 0 && (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">What You Need to Submit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.isArray(challenge.deliverables) && challenge.deliverables.map((deliverable, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-[#FF006F] mt-0.5 flex-shrink-0" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Challenge Stats */}
              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Challenge Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-[#FF006F]" />
                      <div>
                        <div className="text-white font-medium">Top Prize</div>
                        <div className="text-gray-400">{challenge.topPrize}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-[#FF006F]" />
                      <div>
                        <div className="text-white font-medium">Ends</div>
                        <div className="text-gray-400">
                          {new Date(challenge.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-[#FF006F]" />
                      <div>
                        <div className="text-white font-medium">Participants</div>
                        <div className="text-gray-400">{challenge.currentParticipants}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Prizes */}
                {challenge.prizes && Array.isArray(challenge.prizes) && challenge.prizes.length > 0 && (
                  <Card className="bg-gray-900 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white">Prizes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {Array.isArray(challenge.prizes) && challenge.prizes.map((prize, index) => (
                          <li key={index} className="text-gray-300 text-sm">
                            {prize}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => {
                  handleStepComplete('welcome')
                }}
                className="bg-[#FF006F] hover:bg-[#FF006F]/80 text-white px-8 py-3 text-lg"
              >
                Start Onboarding
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Tutorial Step
  if (currentStep === 'tutorial') {
    if (!challenge.tutorialEnabled || !challenge.tutorialSteps) {
      // Skip tutorial if not enabled
      handleTutorialComplete()
      return null
    }

    return (
      <ChallengeTutorial
        challengeId={challenge.id}
        challengeTitle={challenge.title}
        tutorialSteps={challenge.tutorialSteps}
        onComplete={handleTutorialComplete}
        onSkip={handleSkipTutorial}
        className={className}
      />
    )
  }

  // Toolkit Step
  if (currentStep === 'toolkit') {
    if (!challenge.hasToolkitAssets || !challenge.toolkitAssets) {
      // Skip toolkit if no assets
      handleToolkitComplete()
      return null
    }

    return (
      <ToolkitAssets
        challengeId={challenge.id}
        challengeTitle={challenge.title}
        assets={challenge.toolkitAssets}
        onComplete={handleToolkitComplete}
        className={className}
      />
    )
  }

  // Ready Step
  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center', className)}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              You&apos;re All Set!
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              You&apos;ve completed the onboarding for <span className="text-[#FF006F]">{challenge.title}</span>. 
              Now it&apos;s time to create your submission and show us what you&apos;ve got!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-[#FF006F] mb-2">
                  {challenge.maxEntriesPerUser}
                </div>
                <div className="text-gray-400">Max Entries</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold text-[#FF006F] mb-2">
                  {Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-gray-400">Days Left</div>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={handleStartChallenge}
            className="bg-[#FF006F] hover:bg-[#FF006F]/80 text-white px-12 py-4 text-lg"
          >
            Start Creating
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
