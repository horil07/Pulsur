'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Award, 
  Lightbulb,
  Star,
  Users,
  Zap,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreatorSkillLevel, ContentSuggestion, QualityScore } from '@/lib/pulsar-ai'

interface PulsarAIDashboardProps {
  userId?: string
  onSuggestionApply?: (suggestion: ContentSuggestion) => void
}

export default function PulsarAIDashboard({ userId, onSuggestionApply }: PulsarAIDashboardProps) {
  const [skillLevel, setSkillLevel] = useState<CreatorSkillLevel | null>(null)
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (userId) {
      loadAIData()
    }
  }, [userId])

  const loadAIData = async () => {
    try {
      setIsLoading(true)
      
      // Load skill assessment
      const skillResponse = await fetch('/api/ai/pulsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assess-skill' })
      })
      
      if (skillResponse.ok) {
        const { skillLevel: skill } = await skillResponse.json()
        setSkillLevel(skill)
        
        // Load personalized suggestions based on skill level
        await loadSuggestions(skill)
      }
    } catch (error) {
      console.error('Failed to load AI data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSuggestions = async (skill: CreatorSkillLevel) => {
    try {
      const suggestionsResponse = await fetch('/api/ai/pulsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'generate-suggestions',
          prompt: 'general guidance',
          contentType: 'image',
          userLevel: skill
        })
      })
      
      if (suggestionsResponse.ok) {
        const { suggestions: sug } = await suggestionsResponse.json()
        setSuggestions(sug)
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    }
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-blue-500'
      case 'advanced': return 'bg-purple-500'
      case 'expert': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getSkillLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner': return <Target className="w-4 h-4" />
      case 'intermediate': return <TrendingUp className="w-4 h-4" />
      case 'advanced': return <Award className="w-4 h-4" />
      case 'expert': return <Star className="w-4 h-4" />
      default: return <Brain className="w-4 h-4" />
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'prompt': return <Lightbulb className="w-4 h-4" />
      case 'audio': return <Zap className="w-4 h-4" />
      case 'visual': return <Star className="w-4 h-4" />
      case 'enhancement': return <TrendingUp className="w-4 h-4" />
      default: return <Info className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00E5FF]" />
            Pulsar AI Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-white/20 rounded"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
            <div className="h-4 bg-white/20 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!skillLevel) {
    return (
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Pulsar AI Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-300">Unable to load AI insights. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-panel border-white/20 bg-gradient-to-r from-[#FF006F]/10 to-[#00E5FF]/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#00E5FF]" />
            Pulsar AI Dashboard
            <Badge className="ml-auto bg-[#FF006F] text-white">
              {skillLevel.level.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger value="overview" className="text-white data-[state=active]:bg-[#FF006F]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="text-white data-[state=active]:bg-[#00E5FF]">
            AI Suggestions
          </TabsTrigger>
          <TabsTrigger value="growth" className="text-white data-[state=active]:bg-purple-500">
            Growth Path
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Skill Level Overview */}
          <Card className="glass-panel border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {getSkillLevelIcon(skillLevel.level)}
                Creator Skill Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Current Level</span>
                <Badge className={cn('text-white', getSkillLevelColor(skillLevel.level))}>
                  {skillLevel.level.charAt(0).toUpperCase() + skillLevel.level.slice(1)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">Confidence</span>
                  <span className="text-white">{Math.round(skillLevel.confidence * 100)}%</span>
                </div>
                <Progress value={skillLevel.confidence * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00E5FF]">
                    {skillLevel.metrics.submissionCount}
                  </div>
                  <div className="text-sm text-gray-300">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#FF006F]">
                    {Math.round(skillLevel.metrics.averageVotes)}
                  </div>
                  <div className="text-sm text-gray-300">Avg Votes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-panel border-white/20">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">
                  {Math.round(skillLevel.metrics.completionRate * 100)}%
                </div>
                <div className="text-sm text-gray-300">Completion Rate</div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/20">
              <CardContent className="p-4 text-center">
                <Zap className="w-8 h-8 text-[#00E5FF] mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">
                  {skillLevel.metrics.toolsUsed.length}
                </div>
                <div className="text-sm text-gray-300">Tools Mastered</div>
              </CardContent>
            </Card>

            <Card className="glass-panel border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-[#FF006F] mx-auto mb-2" />
                <div className="text-lg font-semibold text-white">Rising</div>
                <div className="text-sm text-gray-300">Trend</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <Card key={index} className="glass-panel border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-white/30 text-white">
                          {suggestion.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs border-white/30',
                            suggestion.difficulty === 'easy' ? 'text-green-400' :
                            suggestion.difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400'
                          )}
                        >
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                      <h4 className="text-white font-semibold mb-1">
                        {suggestion.suggestion}
                      </h4>
                      <p className="text-gray-300 text-sm mb-3">
                        {suggestion.reasoning}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">Confidence:</span>
                          <Progress 
                            value={suggestion.confidence * 100} 
                            className="w-16 h-1" 
                          />
                          <span className="text-xs text-gray-400">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        </div>
                        {onSuggestionApply && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10"
                            onClick={() => onSuggestionApply(suggestion)}
                          >
                            Apply
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="glass-panel border-white/20">
              <CardContent className="p-8 text-center">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No Suggestions Yet</h3>
                <p className="text-gray-300">
                  Start creating content to receive personalized AI suggestions!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          {/* Next Tools */}
          <Card className="glass-panel border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#00E5FF]" />
                Recommended Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {skillLevel.recommendations.nextTools.map((tool, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded bg-white/5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-white">{tool}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skill Building */}
          <Card className="glass-panel border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#FF006F]" />
                Skill Building
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {skillLevel.recommendations.skillBuilding.map((skill, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded bg-white/5">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-white">{skill}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Challenges */}
          <Card className="glass-panel border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                Recommended Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {skillLevel.recommendations.challenges.map((challenge, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded bg-white/5">
                    <Award className="w-4 h-4 text-purple-500" />
                    <span className="text-white">{challenge}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
