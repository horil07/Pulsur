import { Suspense } from 'react'
import SignUpContent from './signup-content'

function SignUpFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-black/40 border border-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white/60">Loading sign up options...</p>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFallback />}>
      <SignUpContent />
    </Suspense>
  )
}
