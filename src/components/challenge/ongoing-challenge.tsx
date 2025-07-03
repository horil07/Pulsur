'use client'

import { Clock, Users, Trophy, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface OngoingChallengeProps {
  title: string
  subtitle: string
  description: string
  videoThumbnail: string
  challengeTitle: string
  challengeDescription: string
  tags: string[]
  prizeAmount: string
  participantCount: string
  timeRemaining: string
  onPlayVideo?: () => void
  onJoinChallenge?: () => void
  className?: string
}

export function OngoingChallenge({
  title,
  subtitle,
  description,
  videoThumbnail,
  challengeTitle,
  challengeDescription,
  tags,
  prizeAmount,
  participantCount,
  timeRemaining,
  onPlayVideo,
  onJoinChallenge,
  className = ""
}: OngoingChallengeProps) {
  const handlePlayVideo = () => {
    if (onPlayVideo) {
      onPlayVideo()
    } else {
      console.log('Play video')
    }
  }

  const handleJoinChallenge = () => {
    if (onJoinChallenge) {
      onJoinChallenge()
    } else {
      console.log('Join challenge')
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Hero Text */}
          <div className="space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                  {title.split(' ')[0]}
                </span>
                <span className="text-blue-400 ml-3">
                  {title.split(' ').slice(1, 3).join(' ')}
                </span>
                <br />
                <span className="text-white">
                  {title.split(' ').slice(3).join(' ')}
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Live Now Badge */}
            <div className="flex items-center">
              <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white px-4 py-2 text-sm font-semibold rounded-full">
                LIVE NOW
              </Badge>
            </div>
          </div>

          {/* Right Column - Challenge Card */}
          <div className="w-full">
            <Card className="bg-white/5 border-2 border-red-500/50 backdrop-blur-sm overflow-hidden w-full group hover:border-red-500/70 transition-all duration-300 max-w-xl mx-auto">
              {/* Video Thumbnail */}
              <div className="relative w-full z-10">
                <div className="relative aspect-[16/9] w-full min-h-[260px]">
                  {videoThumbnail.match(/\.(mp4|webm|ogg)$/i) ? (
                    <div className="relative w-full h-full">
                      <video
                        src={videoThumbnail}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="object-cover w-full h-full rounded-xl"
                        poster=""
                        preload="auto"
                        onLoadedData={e => { try { e.currentTarget.play(); } catch {} }}
                      />
                    </div>
                  ) : (
                    <Image
                      src={videoThumbnail}
                      alt={challengeTitle}
                      fill
                      className="object-cover w-full h-full rounded-xl"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                    />
                  )}
                  {/* Dark Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Challenge Title */}
                <h3 className="text-lg font-bold text-white leading-tight mb-1 truncate">
                  {challengeTitle}
                </h3>

                {/* Challenge Description */}
                <p className="text-xs text-white/70 leading-snug mb-2 line-clamp-2">
                  {challengeDescription}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-white/10 text-white/80 hover:bg-white/20 transition-colors px-2 py-0.5 text-[10px] font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Prize and Participation Info */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-green-400">
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="font-semibold">
                      Win {prizeAmount}
                    </span>
                  </div>
                  <div className="text-white/60">|</div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {participantCount} Participated
                    </span>
                  </div>
                </div>

                {/* Join Challenge Button */}
                <Button
                  onClick={handleJoinChallenge}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 rounded-full text-xs font-semibold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 group/btn"
                >
                  <span>Join Challenge</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                {/* Ends in 5 days with sandclock icon */}
                <div className="flex items-center justify-center gap-2 mt-2 text-white/70 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Ends in 5 days</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
