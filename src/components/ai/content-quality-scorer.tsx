'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  Star,
  Eye,
  Heart,
  MessageCircle,
  Award,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QualityScore } from '@/lib/pulsar-ai'

interface ContentQualityScorerProps {
  contentUrl?: string
  contentType: 'image' | 'music' | 'video'
  prompt?: string
  metadata?: any
  onScoreUpdate?: (score: QualityScore) => void
  autoScore?: boolean
}

export default function ContentQualityScorer({
  contentUrl,
  contentType,
  prompt,
  metadata,
  onScoreUpdate,
  autoScore = true
}: ContentQualityScorerProps) {
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (contentUrl && autoScore) {
      scoreContent()
    }
  }, [contentUrl, autoScore])

  const scoreContent = async () => {
    if (!contentUrl) return

    try {
      setIsScoring(true)
      setError(null)

      const response = await fetch('/api/ai/pulsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'score-quality',
          type: contentType,
          url: contentUrl,
          prompt,
          metadata
        })
      })

      if (!response.ok) {
        throw new Error('Failed to score content quality')
      }

      const { qualityScore: score } = await response.json()
      setQualityScore(score)
      onScoreUpdate?.(score)
    } catch (error) {
      console.error('Quality scoring error:', error)
      setError('Failed to assess content quality')
    } finally {
      setIsScoring(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (score >= 0.6) return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    return <AlertTriangle className="w-4 h-4 text-red-500" />
  }

  const formatScore = (score: number) => Math.round(score * 100)

  if (!contentUrl) {
    return (
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            Quality Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">Generate or upload content to see quality assessment</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isScoring) {
    return (
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF] animate-spin" />
            Analyzing Quality...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/20 rounded"></div>
              <div className="h-4 bg-white/20 rounded w-3/4"></div>
              <div className="h-4 bg-white/20 rounded w-1/2"></div>
            </div>
            <div className="text-center text-gray-300">
              AI is analyzing your content for quality and engagement potential...
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-panel border-white/20 border-red-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Quality Assessment Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-300 mb-4">{error}</p>
          <Button 
            onClick={scoreContent}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Assessment
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!qualityScore) {
    return (
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" />
            Quality Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Button 
              onClick={scoreContent}
              className="bg-gradient-to-r from-[#FF006F] to-[#00E5FF] text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Assess Quality
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className={cn(
        'glass-panel border-white/20',
        qualityScore.readyForPublication 
          ? 'border-green-500/30 bg-green-500/5' 
          : 'border-yellow-500/30 bg-yellow-500/5'
      )}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00E5FF]" />
              Content Quality Score
            </div>
            <Badge 
              className={cn(
                'text-white',
                qualityScore.readyForPublication 
                  ? 'bg-green-500' 
                  : 'bg-yellow-500'
              )}
            >
              {qualityScore.readyForPublication ? 'Ready to Publish' : 'Needs Improvement'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {getScoreIcon(qualityScore.overall)}
              <span className="text-white font-semibold">Overall Score</span>
            </div>
            <div className={cn('text-2xl font-bold', getScoreColor(qualityScore.overall))}>
              {formatScore(qualityScore.overall)}%
            </div>
          </div>
          
          <Progress 
            value={qualityScore.overall * 100} 
            className="h-3 mb-4"
          />

          {/* Quality Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Creativity</span>
                <span className={cn('font-semibold', getScoreColor(qualityScore.breakdown.creativity))}>
                  {formatScore(qualityScore.breakdown.creativity)}%
                </span>
              </div>
              <Progress value={qualityScore.breakdown.creativity * 100} className="h-1" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Technical</span>
                <span className={cn('font-semibold', getScoreColor(qualityScore.breakdown.technical))}>
                  {formatScore(qualityScore.breakdown.technical)}%
                </span>
              </div>
              <Progress value={qualityScore.breakdown.technical * 100} className="h-1" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Engagement</span>
                <span className={cn('font-semibold', getScoreColor(qualityScore.breakdown.engagement))}>
                  {formatScore(qualityScore.breakdown.engagement)}%
                </span>
              </div>
              <Progress value={qualityScore.breakdown.engagement * 100} className="h-1" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Coherence</span>
                <span className={cn('font-semibold', getScoreColor(qualityScore.breakdown.coherence))}>
                  {formatScore(qualityScore.breakdown.coherence)}%
                </span>
              </div>
              <Progress value={qualityScore.breakdown.coherence * 100} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      {qualityScore.feedback.length > 0 && (
        <Card className="glass-panel border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-500" />
              AI Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityScore.feedback.map((feedback, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-200 text-sm">{feedback}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvement Areas */}
      {qualityScore.improvementAreas.length > 0 && (
        <Card className="glass-panel border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FF006F]" />
              Improvement Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {qualityScore.improvementAreas.map((area, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded bg-yellow-500/10 border border-yellow-500/20">
                  <Info className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-200 text-sm">{area}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Prediction */}
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-[#00E5FF]" />
            Engagement Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {Math.round(qualityScore.breakdown.engagement * 100)}
              </div>
              <div className="text-xs text-gray-300">Views</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {Math.round(qualityScore.overall * 50)}
              </div>
              <div className="text-xs text-gray-300">Likes</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-lg font-bold text-white">
                {qualityScore.readyForPublication ? 'High' : 'Medium'}
              </div>
              <div className="text-xs text-gray-300">Ranking</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Re-analyze Button */}
      <div className="flex justify-center">
        <Button 
          onClick={scoreContent}
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-analyze Content
        </Button>
      </div>
    </div>
  )
}
