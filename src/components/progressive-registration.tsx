'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowRight, Check, AlertCircle } from 'lucide-react'
import { AnalyticsService } from '@/lib/analytics'
import MobileAuth from '@/components/mobile-auth'

interface ProgressiveRegistrationProps {
  onComplete?: () => void
  onSkip?: () => void
  allowSkip?: boolean
}

interface UserProfile {
  name?: string
  email?: string
  bio?: string
  preferences?: {
    notifications: boolean
    publicProfile: boolean
    shareSubmissions: boolean
  }
}

export function ProgressiveRegistration({ 
  onComplete, 
  onSkip, 
  allowSkip = true
}: ProgressiveRegistrationProps) {
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState<UserProfile>({
    preferences: {
      notifications: true,
      publicProfile: true,
      shareSubmissions: false
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authMethod, setAuthMethod] = useState<'social' | 'email' | 'mobile' | null>(null)
  const [showMobileAuth, setShowMobileAuth] = useState(false)

  const totalSteps = 3

  // Check if user already has completed profile
  useEffect(() => {
    if (session?.user) {
      // Pre-populate with existing data
      setProfile(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  const handleSocialSignIn = async (provider: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Track registration start
      const sessionId = localStorage.getItem('sessionId')
      await AnalyticsService.trackEvent('registration_started', undefined, sessionId || undefined, {
        method: provider,
        step: 'social_signin'
      })
      
      await signIn(provider, { 
        callbackUrl: window.location.href,
        redirect: false 
      })
    } catch (err) {
      setError('Failed to sign in. Please try again.')
      console.error('Social sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailRegistration = async () => {
    if (!profile.email || !profile.name) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Track email registration
      const sessionId = localStorage.getItem('sessionId')
      await AnalyticsService.trackEvent('registration_started', undefined, sessionId || undefined, {
        method: 'email',
        step: 'email_registration'
      })

      // For now, we'll use the credentials provider for development
      // In production, this would integrate with email verification
      const result = await signIn('credentials', {
        email: profile.email,
        name: profile.name,
        redirect: false
      })

      if (result?.error) {
        setError('Registration failed. Please try again.')
      } else {
        setStep(2) // Move to profile completion
      }
    } catch (err) {
      setError('Registration failed. Please try again.')
      console.error('Email registration error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Save profile data
      const trafficSource = localStorage.getItem('trafficSource')
      const sessionId = localStorage.getItem('sessionId')
      
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...profile,
          trafficSource: trafficSource ? JSON.parse(trafficSource) : null,
          sessionId
        }),
      })

      if (response.ok) {
        await AnalyticsService.trackEvent('registration_completed', session?.user?.id, sessionId || undefined, {
          profileComplete: true,
          step: 'profile_completion'
        })
        setStep(3) // Move to completion
      } else {
        setError('Failed to save profile. Please try again.')
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error('Profile update error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    const sessionId = localStorage.getItem('sessionId')
    AnalyticsService.trackEvent('registration_skipped', session?.user?.id, sessionId || undefined, {
      step: step
    })
    onSkip?.()
  }

  const handleComplete = () => {
    const sessionId = localStorage.getItem('sessionId')
    AnalyticsService.trackEvent('onboarding_completed', session?.user?.id, sessionId || undefined, {
      totalSteps: step
    })
    onComplete?.()
  }

  // Handle mobile authentication success
  const handleMobileAuthSuccess = (user: { id: string; mobile: string; name?: string; profileComplete: boolean }) => {
    setShowMobileAuth(false)
    setStep(2) // Move to profile completion
    setProfile(prev => ({
      ...prev,
      name: user.name,
      // Mobile users start with step 2 (profile completion)
    }))
  }

  // Handle mobile authentication error
  const handleMobileAuthError = (error: string) => {
    setError(error)
  }

  // Show mobile auth dialog
  const showMobileAuthDialog = () => {
    setAuthMethod('mobile')
    setShowMobileAuth(true)
  }

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-sm border-white/20">
      <CardHeader className="text-center">
        <div className="flex justify-center space-x-2 mb-4">
          {[...Array(totalSteps)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i + 1 <= step ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
        <CardTitle className="text-white">
          {step === 1 && 'Join BeFollowed'}
          {step === 2 && 'Complete Your Profile'}
          {step === 3 && 'Welcome to BeFollowed!'}
        </CardTitle>
        <CardDescription className="text-white/80">
          {step === 1 && 'Sign up to participate in challenges and connect with riders'}
          {step === 2 && 'Tell us a bit about yourself to personalize your experience'}
          {step === 3 && "You're all set! Start exploring and creating amazing content."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            {/* Social Sign In Options */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialSignIn('google')}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <Button
                onClick={() => handleSocialSignIn('facebook')}
                disabled={isLoading}
                className="w-full bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-white/60">Or continue with email</span>
              </div>
            </div>

            {/* Email Registration Form */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={profile.email || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>
              <Button
                onClick={handleEmailRegistration}
                disabled={isLoading || !profile.email || !profile.name}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>

            {/* Mobile Authentication Button */}
            <div className="text-center">
              <Button
                onClick={() => showMobileAuthDialog()}
                className="w-full bg-green-500 hover:bg-green-400 text-white"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12C24 5.373 18.627 0 12 0zm0 22.627c-5.857 0-10.627-4.77-10.627-10.627S6.143 1.373 12 1.373 22.627 6.143 22.627 12 17.857 22.627 12 22.627z"/>
                  <path d="M16.243 8.757a.996.996 0 00-1.408 0L12 11.586 9.165 8.757a.996.996 0 00-1.408 1.408l3.536 3.536a.996.996 0 001.408 0l3.536-3.536a.996.996 0 000-1.408z"/>
                </svg>
                Continue with Mobile
              </Button>
            </div>
          </div>
        )}

        {step === 2 && session && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio" className="text-white">Bio (Optional)</Label>
              <textarea
                id="bio"
                placeholder="Tell us about your riding style and interests..."
                value={profile.bio || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-medium">Preferences</h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.preferences?.notifications || false}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, notifications: e.target.checked }
                    }))}
                    className="rounded border-white/20 bg-white/10"
                  />
                  <span className="text-white text-sm">Email notifications about new challenges</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.preferences?.publicProfile || false}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, publicProfile: e.target.checked }
                    }))}
                    className="rounded border-white/20 bg-white/10"
                  />
                  <span className="text-white text-sm">Make my profile public</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.preferences?.shareSubmissions || false}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences!, shareSubmissions: e.target.checked }
                    }))}
                    className="rounded border-white/20 bg-white/10"
                  />
                  <span className="text-white text-sm">Auto-share my submissions on social media</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              {allowSkip && (
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Skip for now
                </Button>
              )}
              <Button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="flex-1 bg-white text-black hover:bg-white/90"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-semibold">You&apos;re all set!</h3>
              <p className="text-white/80 text-sm">
                Welcome to the BeFollowed community. Start exploring challenges and connect with fellow riders.
              </p>
            </div>
            <Button
              onClick={handleComplete}
              className="w-full bg-white text-black hover:bg-white/90"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Mobile Authentication Component */}
        {showMobileAuth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative max-w-md mx-4">
              <Button
                onClick={() => setShowMobileAuth(false)}
                className="absolute -top-2 -right-2 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full w-8 h-8 p-0"
              >
                ×
              </Button>
              <MobileAuth
                onSuccess={handleMobileAuthSuccess}
                onError={handleMobileAuthError}
                mode="registration"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
