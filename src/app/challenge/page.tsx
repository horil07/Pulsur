'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SubmissionQuota } from '@/components/challenge/submission-quota'
import ProgressiveContentJourney from '@/components/challenge/progressive-content-journey'

interface JourneyProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  savedData: Record<string, unknown>;
  lastSaved: Date | null;
  contentMethod: 'ai-generation' | 'manual-upload' | null;
}

function ChallengePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [challengeTitle, setChallengeTitle] = useState<string>('Challenge')
  const [savedProgress, setSavedProgress] = useState<JourneyProgress | null>(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  
  // R40: Inspiration state
  const [inspirationData, setInspirationData] = useState<{
    submission?: { title: string; user?: { name: string } };
    inspirationType: string;
    originalTitle?: string;
    originalType?: string;
  } | null>(null)
  const [loadingInspiration, setLoadingInspiration] = useState(false)

  const loadSavedProgress = useCallback(async (challengeId: string) => {
    if (!session?.user?.email) return
    
    setLoadingProgress(true)
    try {
      const response = await fetch(`/api/challenges/journey-progress?challengeId=${challengeId}`)
      const data = await response.json()
      
      if (data.progress) {
        setSavedProgress(data.progress)
      }
    } catch (error) {
      console.error('Failed to load saved progress:', error)
    } finally {
      setLoadingProgress(false)
    }
  }, [session?.user?.email])

  // R40: Load inspiration data from source submission
  const loadInspirationData = useCallback(async (sourceId: string, inspirationType: string) => {
    setLoadingInspiration(true)
    try {
      const response = await fetch(`/api/inspiration/${sourceId}`)
      if (response.ok) {
        const data = await response.json()
        setInspirationData({
          ...data,
          inspirationType,
          originalTitle: searchParams.get('title'),
          originalType: searchParams.get('original_type')
        })
      }
    } catch (error) {
      console.error('Failed to load inspiration data:', error)
    } finally {
      setLoadingInspiration(false)
    }
  }, [searchParams])

  useEffect(() => {
    const id = searchParams.get('id')
    const inspiredBy = searchParams.get('inspired_by')
    const inspirationType = searchParams.get('inspiration_type')
    
    if (id) {
      setChallengeId(id)
      setChallengeTitle('Current Challenge')
      loadSavedProgress(id)
    }

    // R40.1: Load inspiration data if present
    if (inspiredBy && inspirationType) {
      loadInspirationData(inspiredBy, inspirationType)
    }
  }, [searchParams, loadSavedProgress, loadInspirationData])

  const handleSaveProgress = async (progress: JourneyProgress) => {
    if (!challengeId || !session?.user?.email) return
    
    try {
      await fetch('/api/challenges/journey-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId,
          progress
        })
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleSubmissionComplete = async (submissionData: unknown) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(submissionData as Record<string, unknown>),
          challengeId: challengeId
        })
      })

      if (response.ok) {
        // Clear saved progress after successful submission
        if (challengeId) {
          await fetch(`/api/challenges/journey-progress?challengeId=${challengeId}`, {
            method: 'DELETE'
          })
        }
        router.push('/gratification')
      } else {
        const error = await response.json()
        console.error('Submission failed:', error)
        alert('Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">      
      <div className="container mx-auto px-4 py-16 pt-20 pb-24 md:pb-16">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
            {/* Left Sidebar - Challenge Info & Progress */}
            <div className="col-span-3 space-y-6 overflow-y-auto">
              <div className="sticky top-0 bg-black/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h2 className="text-2xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                    {challengeTitle}
                  </span>
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  Express your creativity through our challenge
                </p>
                
                {challengeId && (
                  <SubmissionQuota
                    challengeId={challengeId}
                    challengeTitle={challengeTitle}
                    onCreateNew={() => {
                      setSavedProgress(null)
                    }}
                    onEditSubmission={(submissionId) => {
                      console.log('Edit submission:', submissionId)
                    }}
                  />
                )}
              </div>

              {/* R40: Inspiration context for desktop */}
              {inspirationData && (
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <span className="text-xl mr-2">🎨</span>
                    Creating {inspirationData.inspirationType} content
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Inspired by &ldquo;{inspirationData.submission?.title}&rdquo; by {inspirationData.submission?.user?.name}
                  </p>
                </div>
              )}

              {/* Tips & Guidelines */}
              <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                <h3 className="text-white font-semibold mb-3 flex items-center">
                  <span className="text-lg mr-2">💡</span>
                  Pro Tips
                </h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• Save your progress frequently</li>
                  <li>• Experiment with different styles</li>
                  <li>• Use high-quality references</li>
                  <li>• Review before submitting</li>
                </ul>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-9">
              <div className="h-full flex flex-col">
                <header className="text-center mb-8">
                  <h1 className="text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                      Create
                    </span>{' '}
                    <span className="text-white">Your Entry</span>
                  </h1>
                  <p className="text-xl text-white/80">
                    Choose how you want to participate in the challenge
                  </p>
                </header>

                {/* R40: Show inspiration loading state */}
                {loadingInspiration && (
                  <div className="text-center py-8 mb-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF] mx-auto mb-2" />
                    <p className="text-white text-sm">Loading inspiration...</p>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto">
                  {loadingProgress ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
                      <p className="text-white">Loading your progress...</p>
                    </div>
                  ) : (
                    <ProgressiveContentJourney
                      challengeId={challengeId!}
                      challengeTitle={challengeTitle}
                      initialProgress={savedProgress}
                      inspirationData={inspirationData}
                      onSaveProgress={handleSaveProgress}
                      onSubmissionComplete={handleSubmissionComplete}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout (preserved as-is) */}
        <div className="block lg:hidden">
          <div className="max-w-4xl mx-auto">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                  Create
                </span>{' '}
                <span className="text-white">Your Entry</span>
              </h1>
              <p className="text-xl text-white/80">
                Choose how you want to participate in the challenge
              </p>
            </header>

            {challengeId && (
              <div className="mb-8">
                <SubmissionQuota
                  challengeId={challengeId}
                  challengeTitle={challengeTitle}
                  onCreateNew={() => {
                    setSavedProgress(null)
                  }}
                  onEditSubmission={(submissionId) => {
                    console.log('Edit submission:', submissionId)
                  }}
                />
              </div>
            )}

            {/* R40: Show inspiration loading state */}
            {loadingInspiration && (
              <div className="text-center py-8 mb-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF] mx-auto mb-2" />
                <p className="text-white text-sm">Loading inspiration...</p>
              </div>
            )}

            {/* R40: Show inspiration context if available */}
            {inspirationData && (
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                <div className="text-center">
                  <h3 className="text-white font-semibold mb-2">
                    🎨 Creating {inspirationData.inspirationType} content
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Inspired by &ldquo;{inspirationData.submission?.title}&rdquo; by {inspirationData.submission?.user?.name}
                  </p>
                </div>
              </div>
            )}

            {loadingProgress ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
                <p className="text-white">Loading your progress...</p>
              </div>
            ) : (
              <ProgressiveContentJourney
                challengeId={challengeId!}
                challengeTitle={challengeTitle}
                initialProgress={savedProgress}
                inspirationData={inspirationData}
                onSaveProgress={handleSaveProgress}
                onSubmissionComplete={handleSubmissionComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    }>
      <ChallengePageContent />
    </Suspense>
  )
}
