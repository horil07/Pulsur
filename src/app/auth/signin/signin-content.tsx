'use client'

import { useState, useEffect } from 'react'
import { signIn, getProviders, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import MobileAuth from '@/components/mobile-auth'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

export default function SignInContent() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [showMobileAuth, setShowMobileAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  useEffect(() => {
    // Redirect if already signed in
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
      return
    }

    const setupProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    setupProviders()
  }, [callbackUrl, router, session, status])

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn('email', { 
        email, 
        callbackUrl,
        redirect: false 
      })
      // Show success message or handle email verification
    } catch (error) {
      console.error('Email sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMobileAuthSuccess = (user: any) => {
    // Session will be automatically updated by NextAuth
    // The useEffect will handle the redirect
    console.log('Mobile auth completed, waiting for session update...')
  }

  const handleMobileAuthError = (error: string) => {
    console.error('Mobile auth error:', error)
  }

  if (showMobileAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowMobileAuth(false)}
              className="text-white/60 hover:text-white"
            >
              ← Back to login options
            </Button>
          </div>
          <MobileAuth
            onSuccess={handleMobileAuthSuccess}
            onError={handleMobileAuthError}
            mode="login"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center mb-8">
            <div className="relative w-16 h-16">
              <Image
                src="/logo.png"
                alt="Pulsar Logo"
                fill
                className="object-contain"
                priority
                sizes="64px"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your creative journey</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
            {error === 'OAuthSignin' && 'Error occurred during OAuth sign in'}
            {error === 'OAuthCallback' && 'Error occurred during OAuth callback'}
            {error === 'OAuthCreateAccount' && 'Could not create OAuth account'}
            {error === 'EmailCreateAccount' && 'Could not create email account'}
            {error === 'Callback' && 'Error occurred during callback'}
            {error === 'OAuthAccountNotLinked' && 'Account not linked. Please try a different sign in method.'}
            {error === 'EmailSignin' && 'Check your email for the sign in link'}
            {!['OAuthSignin', 'OAuthCallback', 'OAuthCreateAccount', 'EmailCreateAccount', 'Callback', 'OAuthAccountNotLinked', 'EmailSignin'].includes(error) && 'An error occurred during sign in'}
          </div>
        )}

        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Options */}
            {providers && Object.values(providers).filter(provider => provider.type === 'oauth').map((provider) => (
              <Button
                key={provider.id}
                onClick={() => signIn(provider.id, { callbackUrl })}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                size="lg"
              >
                {provider.name === 'Google' && '🔴'} 
                {provider.name === 'Facebook' && '🔵'}
                {provider.name !== 'Google' && provider.name !== 'Facebook' && '🔗'}
                Continue with {provider.name}
              </Button>
            ))}

            {/* Mobile Authentication */}
            <Button
              onClick={() => setShowMobileAuth(true)}
              className="w-full bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white"
              size="lg"
            >
              📱 Sign in with Mobile Number
            </Button>

            <Separator className="bg-white/20" />

            {/* Email Form - Only show in production */}
            {process.env.NODE_ENV === 'production' ? (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-red-500"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full cyber-button"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Sending...' : 'Send Magic Link'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-400 text-sm text-center">
                  📧 Email authentication is disabled in development mode.<br />
                  Please use Mobile OTP or OAuth providers above.
                </p>
              </div>
            )}

            <div className="text-center text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-red-400 hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-red-400 hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  )
}
