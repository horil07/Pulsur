'use client'

import Image from 'next/image'
import { Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'

interface Challenge {
  id: string
  title: string
  description: string
  image: string
  status: 'OPEN' | 'CLOSED' | 'ANNOUNCED'
  participants?: number
  endDate: string
  category: string
  isFeatured?: boolean
}

interface ChallengeCardProps {
  challenge: Challenge
  showSubmitButton?: boolean
  showViewEntriesButton?: boolean
}

export function ChallengeCard({ 
  challenge, 
  showSubmitButton = true, 
  showViewEntriesButton = true 
}: ChallengeCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleChallengeClick = () => {
    router.push(`/challenges/${challenge.id}`)
  }

  // All challenges use the same featured design layout
  return (
    <Card 
      className="bg-white/5 border-white/20 backdrop-blur-sm hover:border-red-500/50 transition-all duration-300 cursor-pointer mb-4 mx-1 sm:mb-6 sm:mx-0 overflow-hidden w-full max-w-full"
      onClick={handleChallengeClick}
    >
      <div className="relative w-full max-w-full overflow-hidden">
        <Image
          src={challenge.image}
          alt={challenge.title}
          width={400}
          height={200}
          className="w-full h-40 object-cover sm:h-48 md:h-64 max-w-full"
        />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <Badge className="bg-gray-600/80 text-white border-none text-xs">
            {challenge.category}
          </Badge>
        </div>
        {/* Only show FEATURED badge if challenge is actually featured */}
        {challenge.isFeatured && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <Badge className="bg-gradient-to-r from-red-500 to-blue-500 text-white border-none text-xs">
              FEATURED
            </Badge>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 md:p-6 w-full max-w-full">
        <h3 className="text-lg font-semibold text-white mb-2 leading-tight sm:text-xl md:text-2xl sm:mb-3 break-words">
          {challenge.title}
        </h3>
        <p className="text-sm text-white/70 mb-3 line-clamp-2 sm:text-base sm:mb-4 break-words">
          {challenge.description}
        </p>

        <div className="flex items-center justify-between text-xs text-white/60 mb-3 sm:text-sm sm:mb-4 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Ends {formatDate(challenge.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 flex-shrink-0">
            <Users className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{(challenge.participants || 0).toLocaleString()}</span>
          </div>
        </div>

        {(showSubmitButton || showViewEntriesButton) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full max-w-full">
            {showSubmitButton && (
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm py-2.5 sm:flex-1 sm:text-base"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/challenge?id=${challenge.id}`)
                }}
              >
                Submit Now
              </Button>
            )}
            {showViewEntriesButton && (
              <Button 
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 text-sm py-2.5 sm:flex-1 sm:text-base"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/gallery?challenge=${challenge.id}`)
                }}
              >
                View Entries
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
