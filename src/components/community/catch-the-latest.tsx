'use client'

import { Heart, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface LatestArtwork {
  id: string
  imageUrl: string
  title?: string
  creator?: string
  category?: string
}

interface CatchTheLatestProps {
  artworks?: LatestArtwork[]
  onJoinMovement?: () => void
  onArtworkClick?: (artwork: LatestArtwork) => void
  className?: string
}

export function CatchTheLatest({ 
  artworks = defaultArtworks, 
  onJoinMovement, 
  onArtworkClick,
  className = "" 
}: CatchTheLatestProps) {
  const handleJoinMovement = () => {
    if (onJoinMovement) {
      onJoinMovement()
    } else {
      console.log('Join the Pulsar community')
    }
  }

  const handleArtworkClick = (artwork: LatestArtwork) => {
    if (onArtworkClick) {
      onArtworkClick(artwork)
    } else {
      console.log('View artwork:', artwork.title || artwork.id)
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="text-white">Catch the Latest</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              #BeFollowed
            </span>
          </h2>
        </div>

        {/* Artworks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {artworks.slice(0, 4).map((artwork, index) => (
            <Card
              key={artwork.id}
              className="bg-white/5 border-white/20 backdrop-blur-sm overflow-hidden group cursor-pointer hover:border-red-500/50 transition-all duration-300 hover:scale-105"
              onClick={() => handleArtworkClick(artwork)}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={artwork.imageUrl}
                  alt={artwork.title || `Latest artwork ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                {(artwork.title || artwork.creator) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    {artwork.title && (
                      <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                        {artwork.title}
                      </h3>
                    )}
                    {artwork.creator && (
                      <p className="text-white/70 text-xs sm:text-sm">
                        by {artwork.creator}
                      </p>
                    )}
                  </div>
                )}

                {/* Category Badge */}
                {artwork.category && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {artwork.category}
                    </div>
                  </div>
                )}

                {/* Trending Badge for first item */}
                {index === 0 && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Trending
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Default artworks data
const defaultArtworks: LatestArtwork[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
    title: 'Golden Thunder',
    creator: 'Alex Rodriguez',
    category: 'Digital Art'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=600&fit=crop&crop=center',
    title: 'Neon Speed',
    creator: 'Maya Chen',
    category: 'AI Generated'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center',
    title: 'Urban Rider',
    creator: 'Sam Wilson',
    category: 'Photography'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop&crop=center',
    title: 'Future Biker',
    creator: 'Lisa Park',
    category: 'Concept Art'
  }
]
