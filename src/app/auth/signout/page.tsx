'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut({ redirect: false })
        // Redirect to home after 2 seconds
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } catch (error) {
        console.error('Sign out error:', error)
        // Redirect anyway
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }
    performSignOut()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 text-white hover:text-red-500 transition-colors group">
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
            <CardTitle className="text-white text-center">Signing Out</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto neon-glow-pink"></div>
            <p className="text-gray-400">You have been successfully signed out.</p>
            <p className="text-gray-500 text-sm">Redirecting you to the home page...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
