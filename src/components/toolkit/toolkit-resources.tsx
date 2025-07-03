'use client'

import { ArrowRight, Monitor, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ResourceCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: string
}

interface ToolkitResourcesProps {
  onExploreClick?: () => void
  className?: string
}

export function ToolkitResources({ onExploreClick, className = "" }: ToolkitResourcesProps) {
  const resources: ResourceCard[] = [
    {
      id: 'design-templates',
      title: 'Design Template',
      description: 'Bikes, Helmets, Jackets',
      icon: Monitor,
      category: 'templates'
    },
    {
      id: 'ai-prompt-packs',
      title: 'AI Prompt Packs',
      description: 'Midjourney, DALL E, Sora',
      icon: Bot,
      category: 'ai-tools'
    }
  ]

  const handleExploreClick = () => {
    if (onExploreClick) {
      onExploreClick()
    } else {
      // Default action - could navigate to resources page
      console.log('Navigate to resources page')
    }
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">
              Toolkit
            </span>
            <span className="text-white"> & Resources</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed px-2">
            Access everything you need to create standout submissions. From templates and AI prompt 
            packs to tutorial and masterclass videos.
          </p>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 w-full max-w-full">
          {resources.map((resource) => {
            const IconComponent = resource.icon
            return (
              <Card
                key={resource.id}
                className="bg-white/5 border-white/20 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 cursor-pointer group overflow-hidden w-full max-w-full"
                onClick={() => console.log(`Navigate to ${resource.category}`)}
              >
                <div className="p-4 sm:p-6 w-full max-w-full">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2 break-words">
                        {resource.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/60 break-words">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Explore Button */}
        <div className="text-center w-full max-w-full">
          <Button
            onClick={handleExploreClick}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 group"
          >
            <span>Explore All Resources</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
