'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Sparkles, Upload, Vote, Trophy } from 'lucide-react'
import Link from 'next/link'
import { pulsarTheme } from '@/lib/theme'

export default function HomeSimple() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 pt-20">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Pulsar
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-blue-400">
                {" "}Playground
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 mb-8 max-w-3xl mx-auto">
              Create stunning AI motorcycle content, compete with fellow riders, and win amazing prizes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/challenge">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 hover:border-red-500/50 py-3 px-8 rounded-full transition-all duration-300"
              >
                Login to Vote
              </Button>
            </div>
          </header>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <Sparkles className="h-8 w-8 text-red-400 mb-2" />
                <CardTitle className="text-white">AI Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Create unique motorcycle artwork and content using cutting-edge AI technology
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <Upload className="h-8 w-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Upload Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Share your own bike photos and creations alongside AI-generated content
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <Vote className="h-8 w-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Community Voting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Vote on your favorite submissions and discover trending rider content
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <Trophy className="h-8 w-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-white/70">
                  Compete for amazing rewards and recognition in the riding community
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <section className="text-center">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-8">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to ride with us?
                </h2>
                <p className="text-white/70 mb-6">
                  Join our community of riders and creators and start sharing your amazing content today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/gallery">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-red-500/50 transition-all duration-300">
                      Browse Gallery
                    </Button>
                  </Link>
                  <Link href="/leaderboard">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300">
                      View Leaderboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
