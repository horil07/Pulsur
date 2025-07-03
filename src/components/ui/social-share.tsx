'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Share2, Twitter, Facebook, Instagram, Linkedin, Copy, Check } from 'lucide-react'
import { AnalyticsService } from '@/lib/analytics'
import { SafeImage } from '@/components/ui/safe-image'

interface SocialShareProps {
  submissionId?: string
  submissionTitle?: string
  submissionImage?: string
  url?: string
  userId?: string
  onShare?: (platform: string) => void
}

export function SocialShare({
  submissionId,
  submissionTitle = "Check out my submission on BeFollowed!",
  submissionImage,
  url,
  userId,
  onShare
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const shareUrl = url || window.location.href
  const shareText = `${submissionTitle} - Join the BeFollowed community and showcase your riding skills! 🏍️`

  const handleShare = async (platform: string) => {
    setIsSharing(true)
    
    try {
      // Track social share
      if (userId) {
        await AnalyticsService.trackSocialShare(userId, platform, shareUrl, submissionId)
      }
      
      // Track analytics event
      const sessionId = localStorage.getItem('sessionId')
      await AnalyticsService.trackEvent('social_share', userId, sessionId || undefined, {
        platform,
        submissionId,
        shareUrl
      })

      let shareUrlFormatted = ''
      
      switch (platform) {
        case 'twitter':
          shareUrlFormatted = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
          break
        case 'facebook':
          shareUrlFormatted = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
          break
        case 'linkedin':
          shareUrlFormatted = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(submissionTitle)}&summary=${encodeURIComponent(shareText)}`
          break
        case 'instagram':
          // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          onShare?.(platform)
          setIsSharing(false)
          return
        default:
          break
      }

      if (shareUrlFormatted) {
        window.open(shareUrlFormatted, '_blank', 'width=600,height=400')
      }
      
      onShare?.(platform)
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      // Track copy link event
      if (userId) {
        const sessionId = localStorage.getItem('sessionId')
        await AnalyticsService.trackEvent('link_copied', userId, sessionId || undefined, {
          submissionId,
          shareUrl
        })
      }
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-sm border-white/20">
      <CardHeader className="text-center">
        <CardTitle className="text-white flex items-center justify-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Submission
        </CardTitle>
        <CardDescription className="text-white/80">
          Show off your riding skills to the world!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview */}
        {submissionImage && (
          <div className="aspect-video bg-white/10 rounded-lg overflow-hidden">
            <SafeImage 
              src={submissionImage} 
              alt={submissionTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Share Title */}
        <div className="text-center">
          <h3 className="text-white font-medium text-sm mb-2">{submissionTitle}</h3>
          <Badge variant="secondary" className="bg-white/20 text-white">
            BeFollowed Challenge
          </Badge>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleShare('twitter')}
            disabled={isSharing}
            className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/90 text-white"
          >
            <Twitter className="h-4 w-4 mr-2" />
            Twitter
          </Button>
          
          <Button
            onClick={() => handleShare('facebook')}
            disabled={isSharing}
            className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
          >
            <Facebook className="h-4 w-4 mr-2" />
            Facebook
          </Button>
          
          <Button
            onClick={() => handleShare('instagram')}
            disabled={isSharing}
            className="bg-gradient-to-r from-[#E4405F] to-[#F56040] hover:opacity-90 text-white"
          >
            <Instagram className="h-4 w-4 mr-2" />
            Instagram
          </Button>
          
          <Button
            onClick={() => handleShare('linkedin')}
            disabled={isSharing}
            className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
          >
            <Linkedin className="h-4 w-4 mr-2" />
            LinkedIn
          </Button>
        </div>

        {/* Copy Link */}
        <div className="space-y-2">
          <p className="text-white/60 text-xs text-center">Or copy the link to share anywhere</p>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>

        {/* Share Stats */}
        <div className="text-center">
          <p className="text-white/60 text-xs">
            Sharing helps grow the BeFollowed community! 🏍️
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
