'use client'

import { Trophy, ArrowRight, Award, Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Reward {
  id: string
  title: string
  description: string
  gradient: string
  icon: React.ComponentType<any>
  iconColor: string
}

interface RewardsComponentProps {
  rewards?: Reward[]
  onViewFullRewards?: () => void
  className?: string
}

export function RewardsComponent({ 
  rewards = defaultRewards, 
  onViewFullRewards, 
  className = "" 
}: RewardsComponentProps) {
  const handleViewFullRewards = () => {
    if (onViewFullRewards) {
      onViewFullRewards()
    } else {
      console.log('Navigate to full rewards page')
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="text-white">Win Big. Get Seen.</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              #BeFollowed
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed px-4">
            Top 25 don't just win—they get clout, collabs, and cool stuff. Your turn.
          </p>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16 place-items-stretch">
          {rewards.map((reward) => {
            const IconComponent = reward.icon
            const cardClass = `${reward.gradient} border-0 overflow-hidden group hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl max-w-xs w-full mx-auto flex flex-col h-full min-h-[8rem]` // max-w-xs for smaller width, min-h-[8rem] for shorter cards
            return (
              <Card
                key={reward.id}
                className={cardClass}
              >
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 w-full flex flex-col items-center flex-1">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${reward.iconColor} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 sm:space-y-3 text-center flex flex-col justify-center w-full">
                    <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      {reward.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/90 leading-relaxed break-words">
                      {reward.description}
                    </p>
                  </div>

                  {/* Trophy Illustration */}
                  <div className="flex justify-center mt-auto pt-4">
                    <div className="relative">
                      <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-yellow-400 drop-shadow-2xl group-hover:rotate-12 transition-transform duration-500" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-pulse opacity-80" />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* View Full Rewards Button */}
        <div className="text-center">
          <Button
            onClick={handleViewFullRewards}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 group"
          >
            <span>View Full Rewards</span>
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Default rewards data
const defaultRewards: Reward[] = [
  {
    id: '1',
    title: 'Win a Custom Pulsar Bike',
    description: 'Work with the real design minds behind India\'s biggest bikes.',
    gradient: 'bg-gradient-to-br from-orange-500 via-red-500 to-orange-600',
    icon: Trophy,
    iconColor: 'bg-yellow-500/20'
  },
  {
    id: '2',
    title: 'Internship at Top Design Studio',
    description: 'Work with industry professionals and learn from the best creative minds.',
    gradient: 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600',
    icon: Award,
    iconColor: 'bg-purple-500/20'
  },
  {
    id: '3',
    title: 'Featured on Pulsar Social',
    description: 'Get your work showcased to millions of Pulsar fans and enthusiasts.',
    gradient: 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600',
    icon: Star,
    iconColor: 'bg-blue-500/20'
  },
  {
    id: '4',
    title: 'Exclusive Merchandise Pack',
    description: 'Grab limited edition Pulsar gear and show off your achievement in style.',
    gradient: 'bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600',
    icon: Trophy,
    iconColor: 'bg-green-500/20'
  }
]
