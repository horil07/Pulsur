'use client'

import { useState } from 'react'
import Image from 'next/image'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  fallback?: React.ReactNode
}

export function SafeImage({ 
  src, 
  alt, 
  fill = false, 
  width = 400, 
  height = 300, 
  className = '', 
  fallback 
}: SafeImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isValidUrl] = useState(() => {
    try {
      new URL(src)
      return true
    } catch {
      return false
    }
  })

  // If URL is invalid or image failed to load, show fallback
  if (!isValidUrl || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {fallback || (
          <div className="text-center text-gray-400">
            <div className="text-2xl mb-1">🖼️</div>
            <div className="text-sm">Preview unavailable</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      onError={() => setImageError(true)}
      onLoad={() => setImageError(false)}
    />
  )
}
