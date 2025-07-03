'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Share2, Trophy, Heart, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { pulsarTheme } from '@/lib/theme'

export default function GratificationPage() {
  const { data: session } = useSession()
  const [submissionStats, setSubmissionStats] = useState({
    totalSubmissions: 0,
    totalVotes: 0,
    currentRank: 0
  })

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })

    // Fetch submission stats (mock data for now)
    setSubmissionStats({
      totalSubmissions: 1247,
      totalVotes: 8932,
      currentRank: Math.floor(Math.random() * 100) + 1
    })
  }, [])

  const shareOnSocial = (platform: string) => {
    const url = window.location.origin
    const text = "I just submitted my entry to Pulsar! Ready to ride with the best! 🏍️🎨"
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            {/* Success Header */}
            <div className="mb-12">
              <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Submission Complete! 🎉
              </h1>
              <p className="text-xl text-white/70 mb-8">
                Thank you, {session?.user?.name}! Your entry has been submitted successfully to the Pulsar community.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/70">Total Submissions</CardDescription>
                  <CardTitle className="text-3xl text-blue-400">{submissionStats.totalSubmissions.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/70">Community Votes</CardDescription>
                  <CardTitle className="text-3xl text-red-400">{submissionStats.totalVotes.toLocaleString()}</CardTitle>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardDescription className="text-white/70">Your Current Rank</CardDescription>
                  <CardTitle className="text-3xl text-yellow-400">#{submissionStats.currentRank}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Share Section */}
            <Card className="bg-gradient-to-r from-red-500/20 to-blue-500/20 backdrop-blur-sm border-red-500/30 mb-12 hover:from-red-500/30 hover:to-blue-500/30 transition-all duration-300">
              <CardHeader>
                <Share2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-2xl text-white">Share Your Achievement</CardTitle>
                <CardDescription className="text-white/70">
                  Let your fellow riders know about your awesome creation!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button 
                    onClick={() => shareOnSocial('twitter')}
                    className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 transition-all duration-300"
                  >
                    Share on Twitter
                  </Button>
                  <Button 
                    onClick={() => shareOnSocial('facebook')}
                    className="bg-blue-700 hover:bg-blue-800 transform hover:scale-105 transition-all duration-300"
                  >
                    Share on Facebook
                  </Button>
                  <Button 
                    onClick={() => shareOnSocial('linkedin')}
                    className="bg-blue-600 hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
                  >
                    Share on LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-left hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white text-center mb-6">What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Moderation Review</h3>
                    <p className="text-white/70">Your submission will be reviewed for compliance with our community guidelines.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Public Gallery</h3>
                    <p className="text-white/70">Once approved, your entry will appear in the public gallery for voting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Community Voting</h3>
                    <p className="text-white/70">The community will vote on their favorite entries to determine winners.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Leaderboard Rankings</h3>
                    <p className="text-white/70">Track your position on the leaderboard and compete for top spots!</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Link href="/gallery">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300">
                  <Users className="w-4 h-4 mr-2" />
                  View Gallery
                </Button>
              </Link>
              
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-red-500/50 transition-all duration-300">
                  <Trophy className="w-4 h-4 mr-2" />
                  Check Leaderboard
                </Button>
              </Link>
              
              <Link href="/challenge">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-red-500 hover:from-blue-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300">
                  Create Another <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Engagement Tips */}
            <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 backdrop-blur-sm border-emerald-500/30 mt-12 hover:from-emerald-500/30 hover:to-teal-600/30 transition-all duration-300">
              <CardHeader>
                <Heart className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                <CardTitle className="text-xl text-white">Boost Your Riding Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 text-left">
                  <div>
                    <h4 className="text-white font-semibold mb-2">📱 Share on Social Media</h4>
                    <p className="text-white/70 text-sm">Share your entry to get more visibility and votes from your network.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">👥 Engage with Riders</h4>
                    <p className="text-white/70 text-sm">Vote on other entries to build relationships in the riding community.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">🎨 Quality Matters</h4>
                    <p className="text-white/70 text-sm">High-quality, creative entries tend to perform better in voting.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">⏰ Stay Active</h4>
                    <p className="text-white/70 text-sm">Regular participation increases your visibility and following.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
