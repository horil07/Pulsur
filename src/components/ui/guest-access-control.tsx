'use client'

import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Lock, Eye, Heart, Upload, UserPlus } from 'lucide-react'
import { ProgressiveRegistration } from '@/components/progressive-registration'
import { useState } from 'react'

interface GuestAccessControlProps {
  action: 'vote' | 'submit' | 'comment' | 'view_profile' | 'leaderboard'
  children?: React.ReactNode
  message?: string
  showRegistration?: boolean
  allowPreview?: boolean
}

const ACTION_CONFIG = {
  vote: {
    icon: Heart,
    title: 'Join to Vote',
    description: 'Sign up to vote on submissions and help decide the winners!',
    badge: 'Voting Restricted'
  },
  submit: {
    icon: Upload,
    title: 'Join to Submit',
    description: 'Create an account to submit your own content and participate in challenges!',
    badge: 'Submission Required'
  },
  comment: {
    icon: UserPlus,
    title: 'Join to Comment',
    description: 'Sign up to interact with the community and leave comments!',
    badge: 'Comments Restricted'
  },
  view_profile: {
    icon: Eye,
    title: 'Join to View Profiles',
    description: 'Create an account to view detailed profiles and connect with riders!',
    badge: 'Profile Access'
  },
  leaderboard: {
    icon: Eye,
    title: 'Limited Access',
    description: 'Sign up to see detailed leaderboard stats and rankings!',
    badge: 'Limited View'
  }
}

export function GuestAccessControl({
  action,
  children,
  message,
  showRegistration = false,
  allowPreview = false
}: GuestAccessControlProps) {
  const { data: session, status } = useSession()
  const [showRegForm, setShowRegForm] = useState(showRegistration)
  
  // If user is authenticated, allow access
  if (session?.user) {
    return <>{children}</>
  }

  // If loading, show loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    )
  }

  const config = ACTION_CONFIG[action]
  const Icon = config.icon

  // For certain actions, show preview with overlay
  if (allowPreview && children) {
    return (
      <div className="relative">
        {/* Preview content with blur */}
        <div className="filter blur-sm pointer-events-none opacity-50">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-sm mx-4 bg-black/90 backdrop-blur-sm border-white/20">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white mb-2">
                {config.badge}
              </Badge>
              <CardTitle className="text-white text-lg">
                {config.title}
              </CardTitle>
              <CardDescription className="text-white/80">
                {message || config.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowRegForm(true)}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show registration form if requested
  if (showRegForm) {
    return (
      <div className="max-w-md mx-auto">
        <ProgressiveRegistration
          onComplete={() => setShowRegForm(false)}
          onSkip={() => setShowRegForm(false)}
          allowSkip={true}
        />
      </div>
    )
  }

  // Default blocked access UI
  return (
    <Card className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-sm border-white/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white mb-2">
          {config.badge}
        </Badge>
        <CardTitle className="text-white">
          {config.title}
        </CardTitle>
        <CardDescription className="text-white/80">
          {message || config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Button
            onClick={() => setShowRegForm(true)}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Join BeFollowed
          </Button>
          
          <div className="text-center">
            <p className="text-white/60 text-xs">
              Free to join • Connect with riders • Showcase your skills
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="border-t border-white/20 pt-4">
          <h4 className="text-white font-medium text-sm mb-3">What you get:</h4>
          <ul className="space-y-2 text-white/80 text-xs">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
              Vote on submissions
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
              Submit your own content
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
              Connect with riders
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full mr-2"></div>
              Track your progress
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook to check guest limitations
export function useGuestAccess() {
  const { data: session, status } = useSession()
  
  const canVote = !!session?.user
  const canSubmit = !!session?.user
  const canComment = !!session?.user
  const canViewProfiles = !!session?.user
  const canViewFullLeaderboard = !!session?.user
  
  const isGuest = !session?.user && status !== 'loading'
  const isLoading = status === 'loading'
  
  return {
    canVote,
    canSubmit,
    canComment,
    canViewProfiles,
    canViewFullLeaderboard,
    isGuest,
    isLoading,
    user: session?.user
  }
}
