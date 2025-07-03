'use client'

import { Heart, Instagram, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JoinTheMovementProps {
  onInstagramClick?: () => void
  onYoutubeClick?: () => void
  className?: string
}

export function JoinTheMovement({ 
  onInstagramClick,
  onYoutubeClick,
  className = "" 
}: JoinTheMovementProps) {
  const handleInstagramClick = () => {
    if (onInstagramClick) {
      onInstagramClick()
    } else {
      // Default Instagram link
      window.open('https://instagram.com/pulsar', '_blank')
    }
  }

  const handleYoutubeClick = () => {
    if (onYoutubeClick) {
      onYoutubeClick()
    } else {
      // Default YouTube link
      window.open('https://youtube.com/@pulsar', '_blank')
    }
  }

  return (
    <div className={`w-full flex flex-col items-center justify-center min-h-[400px] ${className}`}>
      {/* Main Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight text-center">
        <span className="neon-text-pink">Join the Movement</span>
        <span className="ml-3">
          <Heart className="inline w-8 h-8 sm:w-10 sm:h-10 text-red-500 fill-red-500" />
        </span>
      </h2>

      {/* Description */}
      <p className="text-lg sm:text-xl text-gray-300 mb-8 sm:mb-12 max-w-xl leading-relaxed text-center">
        Connect with creators, share your work and be part of the Pulsar community.
      </p>

      {/* Social Media Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Instagram Button */}
        <Button
          onClick={handleInstagramClick}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 hover:from-orange-500 hover:via-pink-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[250px]"
        >
          <Instagram className="w-6 h-6 mr-3" />
          Follow on Instagram
        </Button>

        {/* YouTube Button */}
        <Button
          onClick={handleYoutubeClick}
          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl min-w-[250px]"
        >
          <Youtube className="w-6 h-6 mr-3" />
          Subscribe on YouTube
        </Button>
      </div>

      {/* Additional Call to Action */}
      <div className="mt-8 pt-6 border-t border-gray-700 max-w-xl">
        <p className="text-sm text-gray-400 text-center">
          Be the first to know about new challenges, featured artists, and exclusive content
        </p>
      </div>
    </div>
  )
}
