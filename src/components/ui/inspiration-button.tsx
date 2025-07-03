'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, RotateCcw, Heart, Lightbulb } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

interface InspirationButtonProps {
  submissionId: string
  submissionTitle: string
  submissionType: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'similar' | 'remix' | 'inspired'
  className?: string
}

export function InspirationButton({ 
  submissionId, 
  submissionTitle, 
  submissionType,
  size = 'sm',
  variant = 'similar',
  className = ''
}: InspirationButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const variants = {
    similar: {
      icon: Lightbulb,
      label: 'Create Similar',
      color: 'from-blue-500 to-cyan-500',
      description: 'Create content in a similar style'
    },
    remix: {
      icon: RotateCcw,
      label: 'Remix This',
      color: 'from-purple-500 to-pink-500',
      description: 'Build upon this content'
    },
    inspired: {
      icon: Sparkles,
      label: 'Get Inspired',
      color: 'from-green-500 to-emerald-500',
      description: 'Use as inspiration'
    }
  }

  const config = variants[variant]
  const Icon = config.icon

  const handleInspiration = async () => {
    // R40.4: Check authentication
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please sign in to create inspired content",
        variant: "default"
      })
      return
    }

    setIsLoading(true)

    try {
      // R40.1: Fetch inspiration data
      const response = await fetch(`/api/inspiration/${submissionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch inspiration data')
      }

      const inspirationData = await response.json()

      // R40.1: Navigate to creation flow with inspiration context
      const params = new URLSearchParams({
        inspired_by: submissionId,
        inspiration_type: variant,
        title: `${variant === 'remix' ? 'Remix of' : 'Inspired by'} "${submissionTitle}"`,
        original_type: submissionType
      })

      // R40.3: Navigate to challenge creation with inspiration
      router.push(`/challenge?${params.toString()}`)

      toast({
        title: "Inspiration Loaded!",
        description: `Creating ${variant} content based on "${submissionTitle}"`,
        variant: "default"
      })

    } catch (error) {
      console.error('Error loading inspiration:', error)
      toast({
        title: "Error",
        description: "Failed to load inspiration data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  return (
    <Button
      onClick={handleInspiration}
      disabled={isLoading}
      size={size}
      variant="ghost"
      className={`
        relative overflow-hidden
        bg-gradient-to-r ${config.color}
        text-white border-0
        hover:scale-105 hover:shadow-lg
        transition-all duration-200
        ${sizeClasses[size]}
        ${className}
      `}
      title={config.description}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'default' ? 'w-4 h-4' : 'w-5 h-5'}`} />
        <span>{isLoading ? 'Loading...' : config.label}</span>
      </div>
      
      {/* Cyber glow effect */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity duration-200" />
    </Button>
  )
}

// R40: Inspiration button group for gallery items
export function InspirationButtonGroup({ 
  submissionId, 
  submissionTitle, 
  submissionType,
  compact = false 
}: {
  submissionId: string
  submissionTitle: string
  submissionType: string
  compact?: boolean
}) {
  if (compact) {
    // Compact view - single dropdown-style button
    return (
      <div className="flex gap-1">
        <InspirationButton
          submissionId={submissionId}
          submissionTitle={submissionTitle}
          submissionType={submissionType}
          variant="similar"
          size="sm"
        />
      </div>
    )
  }

  // Full view - all inspiration options
  return (
    <div className="flex flex-wrap gap-1">
      <InspirationButton
        submissionId={submissionId}
        submissionTitle={submissionTitle}
        submissionType={submissionType}
        variant="similar"
        size="sm"
      />
      <InspirationButton
        submissionId={submissionId}
        submissionTitle={submissionTitle}
        submissionType={submissionType}
        variant="remix"
        size="sm"
      />
      <InspirationButton
        submissionId={submissionId}
        submissionTitle={submissionTitle}
        submissionType={submissionType}
        variant="inspired"
        size="sm"
      />
    </div>
  )
}
