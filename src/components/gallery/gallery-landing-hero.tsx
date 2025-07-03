'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight,
  Eye,
  Heart,
  Zap
} from 'lucide-react'
import { pulsarTheme } from '@/lib/theme'
import Link from 'next/link'
import Image from 'next/image'

interface GalleryStats {
  totalSubmissions: number
  totalVotes: number
  activeUsers: number
  featuredSubmissions: Array<{
    id: string
    title: string
    type: string
    contentUrl: string
    voteCount: number
    user: { name: string }
  }>
}

interface GalleryLandingHeroProps {
  stats: GalleryStats
  trafficSource?: string
}

export function GalleryLandingHero({ 
  stats, 
  trafficSource = 'direct' 
}: GalleryLandingHeroProps) {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Generated Content",
      description: "Discover amazing AI creations from our community"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Trending Now",
      description: "See what's popular and getting the most votes"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Driven",
      description: "Join thousands of creators sharing their work"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [features.length])

  // Customize messaging based on traffic source
  const getWelcomeMessage = () => {
    switch (trafficSource) {
      case 'campaign':
        return "Welcome to our exclusive gallery showcase!"
      case 'social':
        return "Thanks for joining us from social media!"
      case 'organic':
        return "Discover what you've been searching for!"
      default:
        return "Explore Submission"
    }
  }

  const getCallToAction = () => {
    switch (trafficSource) {
      case 'campaign':
        return "Explore Campaign Highlights"
      case 'social':
        return "See What's Trending"
      case 'organic':
        return "Browse All Content"
      default:
        return "Start Exploring"
    }
  }

  return (
    <div className="relative overflow-hidden bg-black min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10 h-full w-full pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop"
          alt="Futuristic sports bike speeding on a road"
          fill
          sizes="100vw"
          className="object-cover object-center brightness-75"
          priority
        />
        {/* Overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" aria-hidden="true" />
      </div>

      {/* Background Effects with bike theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20" />
      <div className="absolute inset-0 bike-hero-overlay" />

      <div className="relative container mx-auto px-4 py-16 pt-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center z-10 relative">
          {/* Left Column - Hero Content */}
          <div className="space-y-8">
            {/* Traffic Source Badge */}
            {trafficSource !== 'direct' && (
              <Badge 
                variant="outline" 
                className="border-red-500/50 text-red-500 bg-red-500/10"
              >
                <Zap className="w-3 h-3 mr-1" />
                {trafficSource === 'campaign' && 'Special Campaign'}
                {trafficSource === 'social' && 'Social Visitor'}
                {trafficSource === 'organic' && 'Search Discovery'}
              </Badge>
            )}

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                  {getWelcomeMessage()}
                </span>
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Explore incredible creations from our community of riders and creators. 
                From AI-generated masterpieces to stunning uploads - discover inspiration 
                that moves you.
              </p>
            </div>

            {/* Stats Row */}
            {/* Rotating Features */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 p-3 rounded-full bg-gradient-to-r from-red-500 to-blue-500">
                    {features[currentFeature].icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-white mb-1">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
                
                {/* Feature indicators */}
                <div className="flex space-x-2 mt-4 justify-center">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 w-8 rounded-full transition-all duration-300 ${
                        index === currentFeature 
                          ? 'bg-red-500' 
                          : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full btn-primary group"
                asChild
              >
                <Link href="#gallery-content">
                  {getCallToAction()}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/how-to-play">
                  Learn How to Create
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Featured Content Preview */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Featured This Week
              </h3>
              <p className="text-white/60">
                Top-voted content from our community
              </p>
            </div>

            <div className="grid gap-4">
              {stats.featuredSubmissions.slice(0, 3).map((submission, index) => (
                <Card 
                  key={submission.id} 
                  className="glass-panel cyber-shadow hover:scale-105 transition-transform cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold">
                            #{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-white mb-1">
                          {submission.title}
                        </h4>
                        <p className="text-white/60 text-sm mb-2">
                          by {submission.user.name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-white/60">
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{submission.voteCount}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {submission.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="glass-panel cyber-shadow">
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold text-white mb-3">
                  Ready to Create?
                </h4>
                <div className="flex justify-center space-x-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/challenges">
                      Join Challenge
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/gallery?filter=ai_artwork">
                      AI Gallery
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
