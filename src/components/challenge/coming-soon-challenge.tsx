'use client'

import { Calendar, Bell } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ComingSoonChallengeProps {
  title: string
  description: string
  backgroundImage: string
  launchDate: string
  onNotifyClick?: () => void
  className?: string
}

export function ComingSoonChallenge({
  title,
  description,
  backgroundImage,
  launchDate,
  onNotifyClick,
  className = ""
}: ComingSoonChallengeProps) {
  const handleNotifyClick = () => {
    if (onNotifyClick) {
      onNotifyClick()
    } else {
      // Default action - could open notification signup modal
      console.log('Subscribe to notifications for:', title)
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              Coming
            </span>
            <span className="text-white"> Soon</span>
          </h2>
        </div>

        {/* Coming Soon Card */}
        <Card className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-red-500/50 transition-all duration-300 overflow-hidden w-full max-w-full group">
          {/* Background Image with Overlay */}
          <div className="relative w-full max-w-full overflow-hidden">
            <div className="relative aspect-[4/3] sm:aspect-video w-full">
              <Image
                src={backgroundImage}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              
              {/* Dark Overlay for Better Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
              
              {/* Coming Soon Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 transform rotate-[-5deg] opacity-90">
                    <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                      COMING
                    </span>
                  </h3>
                  <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white transform rotate-[5deg] opacity-90">
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                      SOON
                    </span>
                  </h3>
                </div>
              </div>

              {/* Motion Lines Effect (Optional) */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform skew-y-12" />
                <div className="absolute top-2/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent transform skew-y-12" />
                <div className="absolute top-3/4 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent transform skew-y-12" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 md:p-8 w-full max-w-full">
            {/* Title */}
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight break-words">
              {title}
            </h3>

            {/* Description */}
            <p className="text-sm sm:text-base text-white/70 mb-4 sm:mb-6 leading-relaxed break-words">
              {description}
            </p>

            {/* Launch Date and Notify Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Launch Date */}
              <div className="flex items-center gap-2 text-white/60">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base font-medium">
                  {launchDate}
                </span>
              </div>

              {/* Get Notified Button */}
              <Button
                onClick={handleNotifyClick}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 group/btn"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover/btn:animate-pulse" />
                <span>Get Notified</span>
              </Button>
            </div>

            {/* Status Badge */}
            <div className="mt-4 sm:mt-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" />
                Coming Soon
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
