'use client'

import { useState } from 'react'
import { Clock, Heart, Trash2, Eye, Calendar, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SafeImage } from '@/components/ui/safe-image'
import { useVoteHistory } from '@/hooks/useVoteLimits'
import { formatTimeUntilReset } from '@/hooks/useVoteLimits'

interface VoteHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * R39.3: Vote History Management Component
 * Displays user's voting history with ability to manage votes
 */
export function VoteHistoryModal({ isOpen, onClose }: VoteHistoryModalProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('today')
  const { history, loading, error, pagination, fetchHistory, removeVote, refetch } = useVoteHistory(timeRange)

  const handleRemoveVote = async (voteId: string, submissionId: string, submissionTitle: string) => {
    if (confirm(`Remove your vote for "${submissionTitle}"?`)) {
      const result = await removeVote(voteId, submissionId)
      if (result.success) {
        // Refresh history after successful removal
        refetch()
      } else {
        alert(`Failed to remove vote: ${result.error}`)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60)
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden glass-panel">
        <CardHeader className="border-b border-white/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Your Vote History
            </CardTitle>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex gap-4 p-4 border border-white/20 rounded-lg">
                    <div className="w-16 h-16 bg-white/20 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No votes found for {timeRange}</p>
              <p className="text-sm text-gray-500">Start voting on submissions to see your history here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  {pagination.total} vote{pagination.total !== 1 ? 's' : ''} in {timeRange === 'today' ? 'today' : timeRange}
                </p>
                {timeRange === 'today' && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Resets at midnight
                  </Badge>
                )}
              </div>

              {history.map((vote) => (
                <Card key={vote.id} className="border border-white/20 hover:border-white/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Submission Preview */}
                      <div className="w-16 h-16 flex-shrink-0">
                        <SafeImage
                          src={vote.submission.contentUrl}
                          alt={vote.submission.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded"
                          fallback={
                            <div className="w-full h-full bg-gray-700 rounded flex items-center justify-center">
                              <Eye className="w-6 h-6 text-gray-400" />
                            </div>
                          }
                        />
                      </div>

                      {/* Submission Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate mb-1">
                          {vote.submission.title}
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                          by {vote.submission.creator.name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Voted {formatDate(vote.votedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {vote.submission.voteCount} total votes
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {vote.submission.type.replace('_', ' ').toLowerCase()}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {vote.canChangeVote && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveVote(vote.id, vote.submission.id, vote.submission.title)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fetchHistory(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-400 px-4 py-2">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fetchHistory(pagination.page + 1)}
                    disabled={!pagination.hasMore}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Compact Vote History Button for Header/Navigation
 */
interface VoteHistoryButtonProps {
  className?: string
}

export function VoteHistoryButton({ className = '' }: VoteHistoryButtonProps) {
  const [showHistory, setShowHistory] = useState(false)
  const { history } = useVoteHistory('today')

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHistory(true)}
        className={`text-white hover:text-[#FF006F] ${className}`}
      >
        <Heart className="w-4 h-4 mr-2" />
        My Votes
        {history.length > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {history.length}
          </Badge>
        )}
      </Button>
      
      <VoteHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  )
}
