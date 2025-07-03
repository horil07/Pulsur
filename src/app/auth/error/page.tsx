'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'OAuthSignin':
        return 'Error occurred during OAuth sign in.'
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account.'
      case 'EmailCreateAccount':
        return 'Could not create email account.'
      case 'Callback':
        return 'Error occurred during callback.'
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.'
      case 'EmailSignin':
        return 'The email could not be sent.'
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      case 'Default':
      default:
        return 'An unexpected error occurred during authentication.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2 text-white hover:text-red-500 transition-colors group mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 neon-glow-pink">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-[#FF0000]">Be</span>
              <span className="text-white">Followed</span>
            </span>
          </Link>
        </div>

        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center flex items-center justify-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>Authentication Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200">{getErrorMessage(error)}</p>
            </div>

            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full cyber-button">
                  Try Again
                </Button>
              </Link>
              
              <Link href="/">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>

            {error === 'OAuthAccountNotLinked' && (
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 text-left">
                <p className="text-blue-200 text-sm">
                  <strong>Why is this happening?</strong><br/>
                  You previously signed in with a different method. Please use the same authentication method you used before.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ErrorPageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardContent className="text-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4 neon-glow-pink"></div>
            <p className="text-gray-400">Loading...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<ErrorPageFallback />}>
      <AuthErrorContent />
    </Suspense>
  )
}
