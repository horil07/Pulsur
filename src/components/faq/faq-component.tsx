'use client'

import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface FAQ {
  id: string
  question: string
  answer: string
  image?: string // Optional image property
}

interface FAQComponentProps {
  faqs?: FAQ[]
  onViewAllClick?: () => void
  className?: string
}

export function FAQComponent({ 
  faqs = defaultFAQs, 
  onViewAllClick, 
  className = "" 
}: FAQComponentProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 2 // Show 2 FAQ cards at once
  const totalPages = Math.ceil(faqs.length / itemsPerPage)

  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick()
    } else {
      console.log('Navigate to FAQs page')
    }
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }

  const getCurrentFAQs = () => {
    const startIndex = currentIndex * itemsPerPage
    return faqs.slice(startIndex, startIndex + itemsPerPage)
  }

  return (
    <div className={`w-full max-w-full overflow-x-hidden ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            FAQs
          </h2>
          <Button
            onClick={handleViewAllClick}
            variant="ghost"
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-sm sm:text-base font-medium group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* FAQ Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 sm:mb-12">
          {getCurrentFAQs().map((faq) => (
            <Card
              key={faq.id}
              className="relative flex flex-col justify-center w-full h-48 sm:h-56 rounded-xl overflow-hidden shadow-lg border-none"
              style={{ minWidth: '100%', minHeight: '12rem', maxHeight: '14rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.5) 0%, rgba(59,130,246,0.5) 100%)', backdropFilter: 'blur(8px)' }}
            >
              {/* Overlay for extra translucency */}
              <div className="absolute inset-0 z-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
              {/* FAQ Text */}
              <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 text-center">
                <h3 className="text-lg sm:text-xl font-bold text-white leading-tight mb-2 truncate">
                  {faq.question}
                </h3>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed line-clamp-3">
                  {faq.answer}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>

            {/* Page Indicators */}
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-red-500 scale-125'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Default FAQ data
const defaultFAQs: FAQ[] = [
  {
    id: '1',
    question: 'What is Pulsar AI Playground?',
    answer: 'Pulsar AI Playground is a next-gen digital arena where creators can explore, play, and compete using AI-powered tools for visual art, reels, gaming, and more.',
    image: '/images/faq1.png'
  },
  {
    id: '2',
    question: 'How do I submit my work?',
    answer: 'You can submit your work by uploading your creation through the challenge submission form on the platform.',
    image: '/images/faq2.png'
  },
  {
    id: '3',
    question: 'What are the submission guidelines?',
    answer: 'All submissions must be original work created using the provided tools and templates. Please ensure your content follows our community guidelines and copyright policies.',
    image: '/images/faq3.png'
  },
  {
    id: '4',
    question: 'How are winners selected?',
    answer: 'Winners are selected through a combination of community voting and expert judging based on creativity, technical execution, and adherence to the challenge brief.',
    image: '/images/faq4.png'
  },
  {
    id: '5',
    question: 'Can I participate in multiple challenges?',
    answer: 'Yes, you can participate in as many challenges as you like, as long as you meet the requirements for each.',
    image: '/images/faq5.png'
  },
  {
    id: '6',
    question: 'Is there a fee to join Pulsar AI Playground?',
    answer: 'No, joining and participating in Pulsar AI Playground is completely free for all users.',
    image: '/images/faq6.png'
  }
]
