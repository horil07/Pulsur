import { Suspense } from 'react'
import SignInContent from './signin-content'

function SignInFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading sign in options...</p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  )
}

