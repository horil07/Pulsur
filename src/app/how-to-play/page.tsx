'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Trophy, Sparkles, Vote } from 'lucide-react'
import Link from 'next/link'
import { pulsarTheme } from '@/lib/theme'

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 pt-20">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <header className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              How to Ride
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto">
              Learn how to participate in Pulsar&apos;s challenges and compete for the top spots on the leaderboard!
            </p>
          </header>

          {/* Game Flow */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <CardTitle className="text-white">Sign Up</CardTitle>
                <CardDescription className="text-white/70">
                  Create your rider account with our quick dev bypass or OAuth providers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <CardTitle className="text-white">Create</CardTitle>
                <CardDescription className="text-white/70">
                  Generate AI content or upload your own creative motorcycle-themed work
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <CardTitle className="text-white">Submit</CardTitle>
                <CardDescription className="text-white/70">
                  Share your entry with the riding community for moderation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">4</span>
                </div>
                <CardTitle className="text-white">Win</CardTitle>
                <CardDescription className="text-white/70">
                  Get votes and climb the leaderboard for prizes
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Detailed Instructions */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <Sparkles className="w-8 h-8 text-red-400 mb-2" />
                <CardTitle className="text-white text-2xl">Creating Content</CardTitle>
              </CardHeader>
              <CardContent className="text-white/70 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">AI Generated Content:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Generate stunning motorcycle artwork using AI prompts</li>
                    <li>• Create unique bike-themed compositions</li>
                    <li>• Experiment with racing and adventure styles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Upload Your Own:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Share your original motorcycle photography</li>
                    <li>• Upload creative riding video reels</li>
                    <li>• Showcase your unique bike modifications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <Vote className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white text-2xl">Voting System</CardTitle>
              </CardHeader>
              <CardContent className="text-white/70 space-y-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">How Voting Works:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Browse approved submissions in the gallery</li>
                    <li>• Click the heart icon to vote for favorites</li>
                    <li>• You can change your vote anytime</li>
                    <li>• Cannot vote for your own submissions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Earning Votes:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Create high-quality, engaging content</li>
                    <li>• Follow current trends and riding themes</li>
                    <li>• Engage with the rider community</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rules & Tips */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-16 hover:bg-white/15 transition-all duration-300">
            <CardHeader>
              <Trophy className="w-8 h-8 text-yellow-400 mb-2" />
              <CardTitle className="text-white text-2xl">Rules & Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-white font-semibold mb-3">Community Guidelines:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Keep content appropriate and family-friendly</li>
                    <li>• No offensive, harmful, or inappropriate material</li>
                    <li>• Original content only (no copyrighted material)</li>
                    <li>• Respect other riders and their work</li>
                    <li>• Follow the theme if there&apos;s an active challenge</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-3">Pro Tips:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Add descriptive captions to your submissions</li>
                    <li>• Experiment with unique motorcycle AI prompts</li>
                    <li>• Engage with other riders&apos; content</li>
                    <li>• Check the leaderboard for inspiration</li>
                    <li>• Submit regularly to build your presence</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-red-500/20 to-blue-500/20 backdrop-blur-sm border-red-500/30 max-w-2xl mx-auto hover:from-red-500/30 hover:to-blue-500/30 transition-all duration-300">
              <CardHeader>
                <Play className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <CardTitle className="text-3xl text-white">Ready to Ride?</CardTitle>
                <CardDescription className="text-white/70 text-lg">
                  Join the rider community and start creating amazing motorcycle content!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/challenge">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300"
                  >
                    Create Your First Entry
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-white/30 text-white hover:bg-white/10 hover:border-red-500/50 transition-all duration-300"
                  >
                    Browse Gallery
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
