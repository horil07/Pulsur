'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  RotateCw, 
  Heart, 
  Share2, 
  Calendar, 
  User, 
  Clock,
  Tag,
  Eye,
  Download,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check
} from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'
import { useToast } from '@/hooks/use-toast'

interface Submission {
  id: string
  title: string
  type: string
  contentUrl: string
  caption?: string
  prompt?: string
  voteCount: number
  createdAt: string
  user: {
    name: string
    image?: string
  }
  hasVoted?: boolean
}

interface ContentPreviewModalProps {
  submission: Submission | null
  isOpen: boolean
  onClose: () => void
  onVote: (submissionId: string) => void
  userCanVote: boolean
}

/**
 * R38: Detailed Content Preview Modal
 * R38.1: Content Playback Controls - Full media controls for audio and video
 * R38.2: Content Information Display - Comprehensive submission information
 * R38.3: Content Sharing Options - Social media sharing with attribution
 */
export function ContentPreviewModal({
  submission,
  isOpen,
  onClose,
  onVote,
  userCanVote
}: ContentPreviewModalProps) {
  const { toast } = useToast()
  
  // R38.1: Media playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  
  // R38.3: Sharing state
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isAudio = submission?.type === 'AI_SONG'
  const isVideo = submission?.type === 'UPLOAD_REEL'
  const isImage = submission?.type === 'AI_ARTWORK' || submission?.type === 'UPLOAD_ARTWORK'
  
  // R38.1: Media Control Functions
  const togglePlayPause = () => {
    const media = isAudio ? audioRef.current : videoRef.current
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      setCurrentTime(media.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      setDuration(media.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = isAudio ? audioRef.current : videoRef.current
    const newTime = parseFloat(e.target.value)
    if (media) {
      media.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      media.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      const newMuted = !isMuted
      media.muted = newMuted
      setIsMuted(newMuted)
    }
  }

  const changePlaybackRate = (rate: number) => {
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      media.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const skipTime = (seconds: number) => {
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      media.currentTime = Math.max(0, Math.min(duration, media.currentTime + seconds))
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // R38.3: Sharing Functions
  const getShareUrl = () => {
    return `${window.location.origin}/gallery?highlight=${submission?.id || ''}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setLinkCopied(true)
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      })
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      })
    }
  }

  const shareToSocial = (platform: string) => {
    if (!submission) return
    
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(`Check out "${submission.title}" by ${submission.user.name} on BeFollowed`)
    
    let shareUrl = ''
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  // R38.1: Media event handlers
  useEffect(() => {
    if (!submission) return
    
    const media = isAudio ? audioRef.current : videoRef.current
    if (media) {
      const handlePlay = () => setIsPlaying(true)
      const handlePause = () => setIsPlaying(false)
      const handleLoadStart = () => setIsLoading(true)
      const handleCanPlay = () => setIsLoading(false)

      media.addEventListener('play', handlePlay)
      media.addEventListener('pause', handlePause)
      media.addEventListener('timeupdate', handleTimeUpdate)
      media.addEventListener('loadedmetadata', handleLoadedMetadata)
      media.addEventListener('loadstart', handleLoadStart)
      media.addEventListener('canplay', handleCanPlay)

      return () => {
        media.removeEventListener('play', handlePlay)
        media.removeEventListener('pause', handlePause)
        media.removeEventListener('timeupdate', handleTimeUpdate)
        media.removeEventListener('loadedmetadata', handleLoadedMetadata)
        media.removeEventListener('loadstart', handleLoadStart)
        media.removeEventListener('canplay', handleCanPlay)
      }
    }
  }, [submission?.id, isAudio, handleLoadedMetadata, handleTimeUpdate])

  if (!submission) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl neon-text-pink">
            {submission.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* R38: Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* R38.1: Media Player */}
            <Card className="glass-panel overflow-hidden">
              <CardContent className="p-0">
                {isAudio && (
                  <div className="p-6">
                    <audio
                      ref={audioRef}
                      src={submission.contentUrl}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center space-y-4 text-white">
                      <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-blue-500 rounded-full flex items-center justify-center neon-glow-pink">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-center">{submission.title}</h3>
                    </div>
                  </div>
                )}

                {isVideo && (
                  <video
                    ref={videoRef}
                    src={submission.contentUrl}
                    className="w-full h-auto max-h-96 bg-black"
                    poster="/video-poster.jpg"
                  />
                )}

                {isImage && (
                  <div className="relative aspect-video">
                    <SafeImage
                      src={submission.contentUrl}
                      alt={submission.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* R38.1: Media Controls (for audio/video) */}
            {(isAudio || isVideo) && (
              <Card className="glass-panel">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-white/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => skipTime(-10)}
                        className="text-white hover:text-blue-500"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="default"
                        size="lg"
                        onClick={togglePlayPause}
                        disabled={isLoading}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-blue-500 hover:scale-110 transition-transform"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => skipTime(10)}
                        className="text-white hover:text-blue-500"
                      >
                        <RotateCw className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Volume and Speed Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleMute}
                          className="text-white hover:text-blue-500"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-white/60">Speed:</span>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                          <Button
                            key={rate}
                            variant={playbackRate === rate ? "default" : "ghost"}
                            size="sm"
                            onClick={() => changePlaybackRate(rate)}
                            className="text-xs px-2 py-1 h-auto"
                          >
                            {rate}x
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* R38.2: Content Information */}
          <div className="space-y-4">
            {/* Creator Info */}
            <Card className="glass-panel">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-blue-500 flex items-center justify-center neon-glow-pink">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{submission.user.name}</h3>
                    <p className="text-sm text-white/60">Content Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card className="glass-panel">
              <CardContent className="p-4 space-y-4">
                <h4 className="font-semibold text-white">Details</h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-white/80">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(submission.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-white/80">
                    <Heart className="w-4 h-4" />
                    <span>{submission.voteCount} votes</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-white/80">
                    <Tag className="w-4 h-4" />
                    <Badge variant="outline" className="border-red-500/50 text-red-500">
                      {submission.type.replace('_', ' ').toLowerCase()}
                    </Badge>
                  </div>
                </div>

                {submission.caption && (
                  <div>
                    <h5 className="font-medium text-white mb-2">Description</h5>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {submission.caption}
                    </p>
                  </div>
                )}

                {submission.prompt && (
                  <div>
                    <h5 className="font-medium text-white mb-2">AI Prompt</h5>
                    <p className="text-xs text-white/60 bg-white/5 rounded p-2 font-mono">
                      {submission.prompt}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* R38.2: Actions */}
            <Card className="glass-panel">
              <CardContent className="p-4 space-y-3">
                <h4 className="font-semibold text-white">Actions</h4>
                
                {/* Vote Button */}
                {userCanVote && (
                  <Button
                    onClick={() => onVote(submission.id)}
                    variant={submission.hasVoted ? "secondary" : "default"}
                    className="w-full"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${submission.hasVoted ? 'fill-current' : ''}`} />
                    {submission.hasVoted ? 'Voted' : 'Vote'}
                  </Button>
                )}

                {/* R38.3: Share Button */}
                <div className="relative">
                  <Button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>

                  {/* Share Menu */}
                  {showShareMenu && (
                    <Card className="absolute top-full left-0 right-0 mt-2 z-10 glass-panel">
                      <CardContent className="p-3 space-y-2">
                        <Button
                          onClick={() => shareToSocial('twitter')}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-white hover:text-[#1DA1F2]"
                        >
                          <Twitter className="w-4 h-4 mr-2" />
                          Share on Twitter
                        </Button>
                        
                        <Button
                          onClick={() => shareToSocial('facebook')}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-white hover:text-[#4267B2]"
                        >
                          <Facebook className="w-4 h-4 mr-2" />
                          Share on Facebook
                        </Button>
                        
                        <Button
                          onClick={() => shareToSocial('linkedin')}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-white hover:text-[#0077B5]"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          Share on LinkedIn
                        </Button>
                        
                        <Button
                          onClick={copyToClipboard}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-white hover:text-blue-500"
                        >
                          {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          {linkCopied ? 'Copied!' : 'Copy Link'}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Button
                  onClick={() => window.open(submission.contentUrl, '_blank')}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Original
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
