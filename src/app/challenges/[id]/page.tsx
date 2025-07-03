'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ChallengeOnboarding } from '@/components/challenge/challenge-onboarding'
import { Loader2 } from 'lucide-react'

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
  validationRules?: unknown
  contentRequirements?: unknown
  isFeatured: boolean
  submissions?: unknown[]
  submissionCount: number
  createdAt: string
  updatedAt: string
}

export default function ChallengePage() {
  const { data: session, status } = useSession()
  const params = useParams()
  const router = useRouter()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const challengeId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      if (challengeId) {
        await fetchChallenge()
      }
    }
    fetchData()
  }, [challengeId])

  const fetchChallenge = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/challenges/${challengeId}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setChallenge(data.challenge)
      } else {
        setError(data.error || 'Failed to load challenge')
      }
    } catch (err) {
      console.error('Error fetching challenge:', err)
      setError('Failed to load challenge')
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    // Redirect to challenge creation page
    router.push(`/challenge?id=${challengeId}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading challenge...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    router.push('/')
    return null
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Challenge Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The challenge you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/challenges')}
            className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Browse All Challenges
          </button>
        </div>
      </div>
    )
  }

  return (
    <ChallengeOnboarding
      challenge={challenge}
      onComplete={handleOnboardingComplete}
    />
  )
}
