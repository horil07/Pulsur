'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Heart, Play, Eye } from 'lucide-react'
import Link from 'next/link'
import { SafeImage } from '@/components/ui/safe-image'
import { GalleryLandingHero } from '@/components/gallery/gallery-landing-hero'
import { AdvancedSearch } from '@/components/gallery/advanced-search'
import { ContentPreviewModal } from '@/components/gallery/content-preview-modal'
import { VoteLimitDisplay } from '@/components/ui/vote-limit-display'
import { InspirationButtonGroup } from '@/components/ui/inspiration-button'
import { useGalleryAnalytics, useGalleryStats } from '@/hooks/useGalleryAnalytics'
import { useGalleryFilters } from '@/hooks/useGalleryFilters'
import { useVoteLimits } from '@/hooks/useVoteLimits'
import { useToast } from '@/hooks/use-toast'
import { ChallengeStatusBanner } from '@/components/ui/challenge-status-banner'
import { VotePermissionGate } from '@/components/ui/user-permission-handler'
import { pulsarTheme } from '@/lib/theme'

interface Submission {
  id: string
  title: string
  type: string
  contentUrl: string
  caption?: string
  prompt?: string
  voteCount: number
  createdAt: string
  userId: string
  user: {
    name: string
    image?: string
  }
  hasVoted?: boolean
  version?: number
  isLatest?: boolean
}

function GalleryPage() {
  const { data: session } = useSession()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  
  // R39: Enhanced Voting System
  const { limits, updateLimitsAfterVote } = useVoteLimits()
  const { toast } = useToast()

  // Handle submission updates for R41
  const handleSubmissionUpdate = useCallback((updatedSubmission: Submission) => {
    setSubmissions(prev => prev.map(sub => 
      sub.id === updatedSubmission.id ? updatedSubmission : sub
    ))
  }, [])

  // R37: Advanced Gallery Filtering with Persistence
  const {
    filters,
    isLoaded: filtersLoaded,
    updateFilters,
    resetFilters,
    clearSearch,
    getApiParams,
    hasActiveFilters,
    filterSummary
  } = useGalleryFilters()

  // R36: Advanced Gallery Navigation with Analytics
  const { analytics, trackGalleryView, trackContentInteraction } = useGalleryAnalytics()
  const { stats, loading: statsLoading } = useGalleryStats()

  // Note: Challenge status is now handled by ChallengeStatusBanner component to avoid duplicate polling
  
  const fetchSubmissions = useCallback(async () => {
    if (!filtersLoaded) return // Wait for filters to load from localStorage
    
    setLoading(true)
    try {
      const params = getApiParams()
      params.set('page', page.toString())
      params.set('limit', '12')

      const response = await fetch(`/api/submissions?${params}`)
      const data = await response.json()
      
      if (page === 1) {
        setSubmissions(data.submissions || [])
      } else {
        setSubmissions(prev => [...prev, ...(data.submissions || [])])
      }

      // R36: Track gallery view with current filters
      await trackGalleryView(filters.filter, filters.sort)
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    } finally {
      setLoading(false)
    }
  }, [page, filters, filtersLoaded, getApiParams, trackGalleryView])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  // R37: Enhanced filter change handlers with analytics tracking
  const handleFiltersChange = async (updates: Partial<typeof filters>) => {
    updateFilters(updates)
    setPage(1)
    
    // Track filter interactions
    if (updates.filter) {
      await trackContentInteraction('filter', undefined, { filter: updates.filter })
    }
    if (updates.sort) {
      await trackContentInteraction('filter', undefined, { sort: updates.sort })
    }
    if (updates.search && updates.search.length > 2) {
      await trackContentInteraction('search', undefined, { query: updates.search })
    }
  }

  const handleClearSearch = async () => {
    clearSearch()
    setPage(1)
    await trackContentInteraction('filter', undefined, { action: 'clear_search' })
  }

  const handleResetFilters = async () => {
    resetFilters()
    setPage(1)
    await trackContentInteraction('filter', undefined, { action: 'reset_filters' })
  }

  const handleVote = async (submissionId: string) => {
    // R39.4: Guest User Vote Restrictions
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please sign in to vote on submissions",
        variant: "default"
      })
      return
    }

    // R39: Check if user has reached daily limit (client-side check)
    if (!limits.canVote) {
      toast({
        title: "Daily Limit Reached",
        description: `You've used all ${limits.dailyLimit} votes for today. Try again tomorrow!`,
        variant: "destructive"
      })
      return
    }

    console.log('Attempting to vote for submission:', submissionId)
    console.log('Session user:', session.user)

    try {
      const requestBody = { submissionId }
      console.log('Request body:', requestBody)

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log('Vote response status:', response.status)
      console.log('Vote response data:', data)

      if (response.ok) {
        // Update the submission in the state based on the vote action
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId 
            ? { 
                ...sub, 
                voteCount: data.voteCount,
                hasVoted: data.action === 'added'
              }
            : sub
        ))

        // R39.1 & R39.2: Update vote limits and show feedback
        if (data.remainingVotes !== undefined && data.votesUsed !== undefined) {
          updateLimitsAfterVote(data.action, data.remainingVotes, data.votesUsed)
        }

        // R39.2: Vote Confirmation Feedback
        toast({
          title: data.action === 'added' ? "Vote Cast!" : "Vote Removed",
          description: data.message || `${data.action === 'added' ? 'Added' : 'Removed'} vote for "${submissions.find(s => s.id === submissionId)?.title}"`,
          variant: "default"
        })
        
        console.log('Vote successful:', data.action, 'New count:', data.voteCount)
        
        // R36: Track vote interaction
        await trackContentInteraction('vote', submissionId, { 
          action: data.action,
          voteCount: data.voteCount,
          remainingVotes: data.remainingVotes 
        })
      } else {
        console.error('Vote failed:', response.status, data.error)
        
        // R39: Handle specific limit errors
        if (response.status === 429 && data.limitReached) {
          toast({
            title: "Daily Limit Reached",
            description: data.message,
            variant: "destructive"
          })
          // Update local limits state if server says limit reached
          if (data.remainingVotes !== undefined && data.votesUsed !== undefined) {
            updateLimitsAfterVote('added', data.remainingVotes, data.votesUsed)
          }
        } else {
          toast({
            title: "Vote Failed",
            description: data.error || 'Failed to process vote',
            variant: "destructive"
          })
        }
        // Show user-friendly error message
        alert(`Voting failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Vote error:', error)
      alert('Voting failed due to network error')
    }
  }

  // R37.2: Client-side filtering for search (API also handles this, but this provides instant feedback)
  const filteredSubmissions = submissions.filter(submission => {
    if (!filters.search.trim()) return true
    const searchLower = filters.search.toLowerCase()
    return (
      submission.title.toLowerCase().includes(searchLower) ||
      submission.caption?.toLowerCase().includes(searchLower) ||
      submission.user.name?.toLowerCase().includes(searchLower)
    )
  })

  // Handle submission flow integration  
  const handleSubmissionClick = useCallback((challengeId: string) => {
    // Default to AI generation method, or show quick submission flow
    handleSubmissionStart(challengeId, 'ai')
  }, [])
  
  const handleSubmissionStart = useCallback((challengeId: string, method: 'upload' | 'ai') => {
    // Track analytics for submission flow
    trackContentInteraction('share', `${challengeId}-${method}`)
    
    // Navigate to challenge page with method
    window.location.href = `/challenge?id=${challengeId}&method=${method}`
  }, [trackContentInteraction])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section with Background Image */}
      <section
        className="relative w-full min-h-[400px] sm:min-h-[600px] lg:min-h-[700px] flex items-end"
        aria-label="Explore Submission Hero"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://thumbs.dreamstime.com/b/man-riding-motorcycle-road-beautiful-sunset-background-scene-peaceful-serene-as-enjoys-ride-scenery-354686879.jpg')",
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>
        </div>
        {/* Hero Content - bottom left, semi-bold, centered left on desktop */}
        <div className="relative z-10 w-full flex flex-col items-start justify-end h-full">
          <div className="max-w-xl px-4 pb-8 sm:pb-14 md:pb-20 lg:pb-24 lg:ml-24 lg:self-center">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl mb-2 leading-tight text-white text-left font-semibold">
              Explore Submission
            </h1>
            <p className="text-white/80 text-base sm:text-lg md:text-xl text-left mt-4">
              Explore incredible creations from our community of riders and creators. From AI-generated masterpieces to stunning uploads - discover inspiration that moves you.
            </p>
          </div>
        </div>
      </section>

      {/* R36.2: Gallery Landing Optimization - Enhanced Hero Section */}
      {!statsLoading && (
        <GalleryLandingHero 
          stats={stats}
          trafficSource={analytics?.trafficSource}
        />
      )}

      <div className="container mx-auto px-4 py-16 pt-24 pb-24 md:pb-16 overflow-x-hidden" id="gallery-content">
        {/* Enhanced Header with Analytics Insights */}
        <header className="text-center mb-12">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
              Gallery
            </span>{' '}
            <span className="text-white">Showcase</span>
          </h2>
          <p className="text-white/80 text-lg mb-4">
            Explore {stats.totalSubmissions} amazing creations from our community
          </p>
          {analytics?.trafficSource && analytics.trafficSource !== 'direct' && (
            <p className="text-sm text-red-500 mb-8">
              Welcome, {analytics.trafficSource} visitor! 
              {analytics.trafficSource === 'social' && ' Thanks for joining us from social media!'}
              {analytics.trafficSource === 'organic' && ' Hope you find what you\'re looking for!'}
              {analytics.trafficSource === 'campaign' && ' Enjoy our exclusive showcase!'}
            </p>
          )}
        </header>

        {/* R42: Challenge Status Integration */}
        <div className="mb-8 w-full overflow-hidden">
          <ChallengeStatusBanner 
            compact={true}
            showStats={true}
            onSubmissionClick={handleSubmissionClick}
          />
        </div>

        {/* R39.1: Daily Vote Limit Display */}
        {session && (
          <div className="mb-8 max-w-md mx-auto">
            <VoteLimitDisplay showDetails={true} />
          </div>
        )}

        {/* R37: Advanced Filter & Sorting System */}
        <AdvancedSearch
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearSearch={handleClearSearch}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          filterSummary={filterSummary}
          isLoading={loading}
        />

        {/* Gallery Grid */}
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass-panel animate-pulse" style={{ borderColor: pulsarTheme.colors.accent + '40' }}>
                <div className="h-48 rounded-t-lg bg-accent-20"></div>
                <CardContent className="p-4">
                  <div className="h-4 rounded mb-2 bg-accent-30"></div>
                  <div className="h-3 rounded w-2/3 bg-accent-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filters.viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSubmissions.map((submission) => (
                  <SubmissionCard 
                    key={submission.id} 
                    submission={submission} 
                    onVote={handleVote}
                    userCanVote={!!session}
                    onPreview={setSelectedSubmission}
                    currentUserId={session?.user?.id}
                    onSubmissionUpdate={handleSubmissionUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((submission) => (
                  <SubmissionListItem 
                    key={submission.id} 
                    submission={submission} 
                    onVote={handleVote}
                    userCanVote={!!session}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!loading && filteredSubmissions.length > 0 && (
              <div className="text-center mt-12">
                <Button 
                  onClick={() => setPage(prev => prev + 1)}
                  className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredSubmissions.length === 0 && (
          <Card className="glass-panel text-center py-16" style={{ borderColor: pulsarTheme.colors.accent + '40' }}>
            <CardContent>
              <Eye className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <CardTitle className="text-white mb-2">No submissions found</CardTitle>
              <CardDescription className="text-white/70 mb-6">
                {filters.search || hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Be the first to submit an entry!'}
              </CardDescription>
              {(filters.search || hasActiveFilters) ? (
                <Button 
                  onClick={handleResetFilters}
                  variant="outline"
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500"
                >
                  Clear All Filters
                </Button>
              ) : (
                <Link href="/challenge">
                  <Button className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
                    Create Entry
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* R38: Detailed Content Preview Modal */}
      <ContentPreviewModal
        submission={selectedSubmission}
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        onVote={handleVote}
        userCanVote={!!session}
      />
    </div>
  )
}

// Loading component for Suspense boundary
function GalleryLoading() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mb-4"></div>
        <p className="text-white/70">Loading gallery...</p>
      </div>
    </div>
  )
}

// Wrapper component with Suspense boundary
export default function GalleryPageWrapper() {
  return (
    <Suspense fallback={<GalleryLoading />}>
      <GalleryPage />
    </Suspense>
  )
}

function SubmissionCard({ 
  submission, 
  onVote, 
  onPreview}: { 
  submission: Submission
  onVote: (id: string) => Promise<void>
  userCanVote: boolean
  onPreview: (submission: Submission) => void
  currentUserId?: string
  onSubmissionUpdate?: (updatedSubmission: Submission) => void
}) {
  const isVideo = submission.type.includes('REEL') || submission.type.includes('SONG')
  
  // Mock duration for demo - in real app this would come from submission data
  const duration = isVideo ? "00:48" : null
  
  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:scale-[1.02] border border-gray-800"
         onClick={() => onPreview(submission)}>
      
      {/* Video/Image Thumbnail */}
      <div className="relative aspect-[9/16] sm:aspect-video overflow-hidden">
        {isVideo ? (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
            <SafeImage 
              src={submission.contentUrl} 
              alt={submission.title}
              fill
              className="object-cover"
              fallback={
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                  <div className="text-center text-white/80">
                    <div className="text-2xl mb-1">🎥</div>
                    <div className="text-sm">Video content</div>
                  </div>
                </div>
              }
            />
            
            {/* Dark overlay for better contrast */}
            <div className="absolute inset-0 bg-black/30"></div>
            
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Play className="w-8 h-8 text-white ml-1" fill="white" />
              </div>
            </div>
            
            {/* Duration badge */}
            {duration && (
              <div className="absolute top-3 right-3 z-20">
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm font-medium">
                  {duration}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full relative">
            <SafeImage 
              src={submission.contentUrl} 
              alt={submission.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-white/80">
                  <div className="text-center">
                    <div className="text-2xl mb-1">🖼️</div>
                    <div className="text-sm">Image content</div>
                  </div>
                </div>
              }
            />
            
            {/* Content type badge */}
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {submission.type.includes('AI') ? 'AI' : 'Upload'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Content Info */}
      <div className="p-4 space-y-3">
        {/* Title and Challenge */}
        <div>
          <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-red-400 transition-colors">
            {submission.title}
          </h3>
          <p className="text-gray-400 text-sm">
            {submission.caption || 'Streetwear Challenge'}
          </p>
        </div>
        
        {/* Creator Info */}
        <div className="flex items-center gap-2">
          <SafeImage 
            src={submission.user.image || '/default-avatar.png'} 
            alt={submission.user.name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full"
            fallback={
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {submission.user.name?.[0]?.toUpperCase() || '?'}
              </div>
            }
          />
          <div>
            <p className="text-white font-medium text-sm">{submission.user.name}</p>
            <p className="text-gray-400 text-xs">@{submission.user.name?.toLowerCase().replace(/\s+/g, '_') || 'user'}</p>
          </div>
        </div>
        
        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            {/* Like Button */}
            <VotePermissionGate
              fallback={
                <button disabled className="flex items-center gap-1 text-gray-500">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{submission.voteCount > 999 ? `${(submission.voteCount/1000).toFixed(1)}k` : submission.voteCount}</span>
                </button>
              }
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onVote(submission.id)
                }}
                className={`flex items-center gap-1 transition-all duration-200 ${
                  submission.hasVoted 
                    ? 'text-red-500' 
                    : 'text-gray-400 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${submission.hasVoted ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {submission.voteCount > 999 ? `${(submission.voteCount/1000).toFixed(1)}k` : submission.voteCount}
                </span>
              </button>
            </VotePermissionGate>
            
            {/* Comments */}
            <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">121</span>
            </button>
            
            {/* Share */}
            <button
              className="text-gray-400 hover:text-white transition-colors"
              title="Share"
              aria-label="Share"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
          
          {/* Remix Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Handle remix action
              console.log('Remix submission:', submission.id)
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105"
          >
            Remix
          </button>
        </div>
      </div>
    </div>
  )
}

function SubmissionListItem({ 
  submission, 
  onVote, 
  userCanVote 
}: { 
  submission: Submission
  onVote: (id: string) => void
  userCanVote: boolean
}) {
  const isVideo = submission.type.includes('REEL') || submission.type.includes('SONG')
  
  return (
    <Card className="glass-panel hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]" 
          style={{ 
            borderColor: pulsarTheme.colors.accent + '40',
            boxShadow: `0 0 15px ${pulsarTheme.colors.accent}15`
          }}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden ring-2 ring-red-500/20">
            {isVideo ? (
              <div className="w-full h-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <Play className="w-6 h-6 text-white relative z-10" />
              </div>
            ) : (
              <SafeImage 
                src={submission.contentUrl} 
                alt={submission.title}
                width={400}
                height={200}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                fallback={
                  <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-blue-500/20 flex items-center justify-center text-white">
                    🏍️
                  </div>
                }
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-white font-semibold text-lg hover:text-red-400 transition-colors">{submission.title}</h3>
              <span className="bg-black/50 text-blue-400 text-xs px-2 py-1 rounded flex-shrink-0 ml-2 border border-blue-400/30">
                {submission.type.replace('_', ' ').toLowerCase()}
              </span>
            </div>
            
            {submission.caption && (
              <p className="text-white/80 mb-3">{submission.caption}</p>
            )}
            
            <div className="space-y-3">
              {/* First row: User info and vote button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SafeImage 
                    src={submission.user.image || '/default-avatar.png'}
                    alt={submission.user.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full ring-2 ring-red-500/30"
                    fallback={
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-red-500 to-blue-500 flex items-center justify-center text-white text-xs ring-2 ring-red-500/30">
                        {submission.user.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    }
                  />
                  <span className="text-white/90 text-sm font-medium">{submission.user.name}</span>
                  <span className="text-white/60 text-sm">
                    • {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  variant={submission.hasVoted ? 'default' : 'outline'}
                  onClick={() => userCanVote && onVote(submission.id)}
                  disabled={!userCanVote}
                  title={userCanVote ? (submission.hasVoted ? 'Click to remove vote' : 'Click to vote') : 'Login to vote'}
                  className={`transition-all duration-200 ${
                    submission.hasVoted 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 border-red-500 shadow-lg hover:shadow-xl' 
                      : 'bg-white/10 text-white border-white/30 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-md backdrop-blur-sm'
                  } ${!userCanVote ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <Heart className={`w-4 h-4 mr-1 transition-all ${
                    submission.hasVoted 
                      ? 'fill-current text-white' 
                      : 'text-red-300 hover:text-red-200'
                  }`} />
                  <span className="font-medium">{submission.voteCount}</span>
                </Button>
              </div>

              {/* R40: Second row: Inspiration actions */}
              <div className="flex items-center justify-center pt-2 border-t border-white/10">
                <InspirationButtonGroup
                  submissionId={submission.id}
                  submissionTitle={submission.title}
                  submissionType={submission.type}
                  compact={false}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

