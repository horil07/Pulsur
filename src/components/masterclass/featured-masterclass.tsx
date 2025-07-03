'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

interface Instructor {
  name: string
  title: string
  avatar: string
}

interface FeaturedMasterclassProps {
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  instructor: Instructor
  duration?: string
  onPlayClick?: () => void
  className?: string
}

export function FeaturedMasterclass({
  title,
  description,
  thumbnail,
  videoUrl,
  instructor,
  duration,
  onPlayClick,
  className = ""
}: FeaturedMasterclassProps) {
  const handlePlayClick = () => {
    if (onPlayClick) {
      onPlayClick()
    } else if (videoUrl) {
      // Default action - could open video in modal or navigate
      window.open(videoUrl, '_blank')
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              Featured
            </span>
            <span className="text-white"> Masterclass</span>
          </h2>
        </div>

        {/* Masterclass Card */}
        <div className="flex flex-col gap-8">
         
  <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 overflow-hidden w-full max-w-full">
            {/* Video Thumbnail or Video */}
            <div className="relative w-full max-w-full overflow-hidden">
              <div className="relative aspect-video w-full">
                <video
                  src="https://videos.pexels.com/video-files/9607286/9607286-uhd_2560_1440_25fps.mp4"
                  className="object-cover w-full h-full"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/images/masterclass2.jpg"
                />
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                  <div className="bg-black/70 text-white text-xs sm:text-sm px-2 py-1 rounded">
                    30 min
                  </div>
                </div>
                {/* Video Progress Bar (optional) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-blue-500 w-0" />
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8 w-full max-w-full">
              {/* Title */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight break-words">
                "AI Video Editing Masterclass"<br />
                <span className="block">with Priya Singh</span>
              </h3>
              {/* Description */}
              <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 leading-relaxed break-words">
                Learn the latest AI-powered video editing techniques to make your content stand out.
              </p>
              {/* Instructor Info */}
              <div className="flex items-center gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
                <div className="flex-shrink-0">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src={instructor.avatar || "/images/default-avatar.png"}
                      alt="Priya Singh"
                      fill
                      className="object-cover rounded-full"
                      sizes="(max-width: 768px) 40px, 48px"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-white break-words">
                    Priya Singh
                  </h4>
                  <p className="text-xs sm:text-sm text-white/50 break-words">
                    AI Video Specialist
                  </p>
                </div>
              </div>
            </div>
          </Card>
          {/* Second Featured Masterclass Card (example, static content) */}
          <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 overflow-hidden w-full max-w-full">
            {/* Video Thumbnail or Video */}
            <div className="relative w-full max-w-full overflow-hidden">
              <div className="relative aspect-video w-full">
                <video
                  src="https://videos.pexels.com/video-files/9607286/9607286-uhd_2560_1440_25fps.mp4"
                  className="object-cover w-full h-full"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  poster="/images/masterclass2.jpg"
                />
                {/* Duration Badge */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                  <div className="bg-black/70 text-white text-xs sm:text-sm px-2 py-1 rounded">
                    30 min
                  </div>
                </div>
                {/* Video Progress Bar (optional) */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div className="h-full bg-blue-500 w-0" />
                </div>
              </div>
            </div>
            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8 w-full max-w-full">
              {/* Title */}
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight break-words">
                "AI Video Editing Masterclass"<br />
                <span className="block">with Priya Singh</span>
              </h3>
              {/* Description */}
              <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 leading-relaxed break-words">
                Learn the latest AI-powered video editing techniques to make your content stand out.
              </p>
              {/* Instructor Info */}
              <div className="flex items-center gap-3 sm:gap-4 w-full max-w-full overflow-hidden">
                <div className="flex-shrink-0">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src={instructor.avatar || "/images/default-avatar.png"}
                      alt="Priya Singh"
                      fill
                      className="object-cover rounded-full"
                      sizes="(max-width: 768px) 40px, 48px"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-white break-words">
                    Priya Singh
                  </h4>
                  <p className="text-xs sm:text-sm text-white/50 break-words">
                    AI Video Specialist
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
