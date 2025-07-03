'use client'

import { ArrowRight, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pulsarTheme } from '@/lib/theme'
import Link from 'next/link'
import Image from 'next/image'

interface ChallengeCardProps {
  title: string
  subtitle: string
  description: string
  prize: string
  participants: string
  timeLeft: string
  imageUrl?: string
  featured?: boolean
  onJoinClick?: () => void
}

export function ChallengeCard({
  title,
  subtitle,
  description,
  prize,
  participants,
  timeLeft,
  imageUrl,
  featured = false,
  onJoinClick
}: ChallengeCardProps) {
  const defaultImage = pulsarTheme.images.gallery[0]

  return (
    <div className={`relative challenge-card ${featured ? 'animate-fade-in' : ''}`}>
      {/* Challenge Badge */}
      {featured && (
        <div className="mb-4">
          <div className="inline-block bg-gradient-to-r from-red-500 to-blue-500 text-white px-6 py-3 rounded-full font-semibold animate-fade-in">
            Featured Challenge
          </div>
        </div>
      )}

      {/* Challenge Image Card */}
      <div className="gradient-border mb-6 card-hover">
        <div className="relative aspect-square rounded-3xl overflow-hidden">
          <Image
            src={imageUrl || defaultImage}
            alt={`${title} challenge`}
            fill
            className="object-cover"
          />
          {/* Overlay with challenge info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <div className="text-white font-bold text-lg">{title}</div>
            <div className="text-white/80 text-sm">{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Challenge Details */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-white">
          Pulsar Playgrounds
        </h3>
        <h4 className="text-xl font-semibold text-white">
          {title}
        </h4>
        
        <p className="text-white/80 text-base leading-relaxed">
          {description}
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 py-4">
          <div className="text-center">
            <div className="text-green-400 font-bold text-lg">{prize}</div>
            <div className="text-white/60 text-sm">Prize</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold text-lg flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              {participants}
            </div>
            <div className="text-white/60 text-sm">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold text-lg flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              {timeLeft}
            </div>
            <div className="text-white/60 text-sm">Time Left</div>
          </div>
        </div>

        {/* Join Challenge Button */}
        <Link href="/challenge">
          <Button className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-semibold text-lg rounded-full border-none shadow-lg flex items-center justify-center gap-2 btn-primary">
            Join Challenge
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
