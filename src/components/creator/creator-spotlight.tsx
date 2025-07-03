'use client'

import { Instagram, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Artwork {
  id: string
  imageUrl: string
  title?: string
}

interface Creator {
  name: string
  username: string
  quote: string
  instagramHandle: string
  portfolioUrl?: string
  profileImage?: string
}

interface CreatorSpotlightProps {
  creator: Creator
  featuredArtwork: Artwork
  artworkGallery: Artwork[]
  onInstagramClick?: () => void
  onPortfolioClick?: () => void
  onArtworkClick?: (artwork: Artwork) => void
  className?: string
}

export function CreatorSpotlight({
  creator,
  featuredArtwork,
  artworkGallery,
  onInstagramClick,
  onPortfolioClick,
  onArtworkClick,
  className = ""
}: CreatorSpotlightProps) {
  const handleInstagramClick = () => {
    if (onInstagramClick) {
      onInstagramClick()
    } else {
      window.open(`https://instagram.com/${creator.instagramHandle}`, '_blank')
    }
  }

  const handlePortfolioClick = () => {
    if (onPortfolioClick) {
      onPortfolioClick()
    } else if (creator.portfolioUrl) {
      window.open(creator.portfolioUrl, '_blank')
    }
  }

  const handleArtworkClick = (artwork: Artwork) => {
    if (onArtworkClick) {
      onArtworkClick(artwork)
    } else {
      console.log('View artwork:', artwork.title || artwork.id)
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent transform -rotate-2 inline-block">
              CREATOR
            </span>
            <br />
            <span className="text-white transform rotate-1 inline-block ml-4 sm:ml-8">
              SPOTLIGHT
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Featured Artwork */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Featured Image or Video */}
            <Card className="overflow-hidden bg-white/5 border-white/20 backdrop-blur-sm group cursor-pointer hover:border-red-500/50 transition-all duration-300">
              <div 
                className="relative aspect-[4/3] w-full"
                onClick={() => handleArtworkClick(featuredArtwork)}
              >
                <Image
                  src={featuredArtwork.imageUrl}
                  alt={featuredArtwork.title || 'Featured artwork'}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Card>

            {/* Gallery Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {artworkGallery.slice(0, 3).map((artwork, index) => (
                <Card 
                  key={artwork.id}
                  className="overflow-hidden bg-white/5 border-white/20 backdrop-blur-sm group cursor-pointer hover:border-red-500/50 transition-all duration-300"
                >
                  <div 
                    className="relative aspect-square w-full"
                    onClick={() => handleArtworkClick(artwork)}
                  >
                    {artwork.imageUrl.endsWith('.mp4') ? (
                      <video
                        src={artwork.imageUrl}
                        className="object-cover transition-transform duration-500 group-hover:scale-110 w-full h-full rounded-md"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        poster={artwork.title || ''}
                      />
                    ) : (
                      <Image
                        src={artwork.imageUrl}
                        alt={artwork.title || `Artwork ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 22vw, 200px"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Creator Info */}
          <div className="space-y-6 lg:space-y-8">
            <Card className="relative bg-white/5 border-white/20 backdrop-blur-sm p-6 sm:p-8 overflow-hidden">
              {/* Translucent gradient background */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-red-500/30 via-transparent to-blue-500/30 pointer-events-none" />
              <div className="space-y-6 relative z-10">
                {/* Creator Name */}
                <div>
                  <h3 className="text-[50px] font-bold text-white mb-2">
                    Alex Frank
                  </h3>
                </div>

                {/* Quote */}
                <div className="relative">
                  <div className="text-4xl sm:text-5xl text-red-500/30 font-serif absolute -top-2 -left-2">"</div>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed pl-6 italic">
                    Riding a bike offers a unique sense of freedom and connection with the world around you. Whether you’re cruising through city streets, climbing winding mountain trails, or commuting to work, cycling combines practicality with adventure. It’s an eco-friendly way to travel, reducing carbon emissions while improving your fitness and mental well-being. From sleek road bikes to rugged mountain bikes and versatile hybrids, there’s a bicycle for every rider and every journey
                  </p>
                  <div className="text-4xl sm:text-5xl text-red-500/30 font-serif absolute -bottom-4 -right-2">"</div>
                </div>

                {/* Social Links */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleInstagramClick}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    <span>@alexfrank</span>
                  </Button>
                  <Button
                    onClick={handlePortfolioClick}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    <span>Portfolio</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
