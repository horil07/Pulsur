'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Lightbulb, 
  Wand2, 
  CheckCircle, 
  Star,
  TrendingUp,
  Zap,
  RefreshCw,
  Copy,
  ArrowRight,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import type { ContentSuggestion, CreatorSkillLevel } from '@/lib/pulsar-ai'

interface IntelligentSuggestionsPanelProps {
  prompt: string
  contentType: 'image' | 'music' | 'video'
  onPromptUpdate?: (newPrompt: string) => void
  onSuggestionApply?: (suggestion: ContentSuggestion) => void
  className?: string
}

export default function IntelligentSuggestionsPanel({
  prompt,
  contentType,
  onPromptUpdate,
  onSuggestionApply,
  className
}: IntelligentSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([])
  const [skillLevel, setSkillLevel] = useState<CreatorSkillLevel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  
  const debouncedPrompt = useDebounce(prompt, 1000)

  useEffect(() => {
    if (debouncedPrompt && debouncedPrompt.length > 5) {
      loadSuggestions()
    }
  }, [debouncedPrompt, contentType])

  const loadSuggestions = useCallback(async () => {
    try {
      setIsLoading(true)

      // Get skill level first if not already loaded
      if (!skillLevel) {
        const skillResponse = await fetch('/api/ai/pulsar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'assess-skill' })
        })
        
        if (skillResponse.ok) {
          const { skillLevel: skill } = await skillResponse.json()
          setSkillLevel(skill)
        }
      }

      // Get suggestions based on current prompt
      const suggestionsResponse = await fetch('/api/ai/pulsar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-suggestions',
          prompt: debouncedPrompt,
          contentType,
          userLevel: skillLevel
        })
      })

      if (suggestionsResponse.ok) {
        const { suggestions: newSuggestions } = await suggestionsResponse.json()
        setSuggestions(newSuggestions)
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedPrompt, contentType, skillLevel])

  const enhancePrompt = async () => {
    try {
      setIsLoading(true)
      
      // Use top suggestions to enhance the prompt
      const topSuggestions = suggestions
        .filter(s => s.type === 'prompt')
        .slice(0, 3)
        .map(s => s.suggestion)

      let enhanced = prompt
      
      // Apply intelligent enhancements based on content type
      if (contentType === 'image') {
        if (!enhanced.includes('style') && topSuggestions.length > 0) {
          enhanced += `, ${topSuggestions[0]}`
        }
        if (!enhanced.includes('detailed') && !enhanced.includes('high quality')) {
          enhanced += ', highly detailed, high quality'
        }
      } else if (contentType === 'music') {
        if (!enhanced.includes('BPM') && !enhanced.includes('tempo')) {
          enhanced += ', medium tempo'
        }
        if (!enhanced.includes('instruments')) {
          enhanced += ', rich instrumentation'
        }
      }

      setEnhancedPrompt(enhanced)
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyEnhancedPrompt = () => {
    if (enhancedPrompt && onPromptUpdate) {
      onPromptUpdate(enhancedPrompt)
      setEnhancedPrompt('')
    }
  }

  const applySuggestion = (suggestion: ContentSuggestion) => {
    if (suggestion.type === 'prompt' && onPromptUpdate) {
      // Apply prompt suggestions by appending or modifying the prompt
      const newPrompt = prompt + (prompt.endsWith('.') ? ' ' : ', ') + suggestion.suggestion
      onPromptUpdate(newPrompt)
    }
    
    onSuggestionApply?.(suggestion)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'prompt': return <Lightbulb className="w-4 h-4" />
      case 'audio': return <Zap className="w-4 h-4" />
      case 'visual': return <Star className="w-4 h-4" />
      case 'enhancement': return <TrendingUp className="w-4 h-4" />
      default: return <Bot className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-400/30'
      case 'medium': return 'text-yellow-400 border-yellow-400/30'
      case 'hard': return 'text-red-400 border-red-400/30'
      default: return 'text-gray-400 border-gray-400/30'
    }
  }

  return (
    <Card className={cn('glass-panel border-white/20', className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#00E5FF]" />
          AI Content Suggestions
          {skillLevel && (
            <Badge className="ml-auto bg-[#FF006F] text-white text-xs">
              {skillLevel.level.toUpperCase()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prompt Enhancement */}
        {prompt && prompt.length > 5 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#FF006F]" />
              <span className="text-white font-medium text-sm">Smart Prompt Enhancement</span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={enhancePrompt}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#FF006F] to-[#00E5FF] text-white"
              >
                {isLoading ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Wand2 className="w-3 h-3 mr-1" />
                )}
                Enhance
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={loadSuggestions}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Ideas
              </Button>
            </div>

            {enhancedPrompt && (
              <div className="p-3 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                  <span className="text-[#00E5FF] font-medium text-sm">Enhanced Prompt:</span>
                </div>
                <p className="text-white text-sm mb-3">{enhancedPrompt}</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={applyEnhancedPrompt}
                    className="bg-[#00E5FF] text-black hover:bg-[#00E5FF]/90"
                  >
                    Apply
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(enhancedPrompt)}
                    className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Real-time Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#FF006F]" />
              <span className="text-white font-medium text-sm">Real-time Suggestions</span>
            </div>
            {suggestions.length > 0 && (
              <Badge variant="outline" className="text-xs border-white/30 text-white">
                {suggestions.length} ideas
              </Badge>
            )}
          </div>

          {isLoading && suggestions.length === 0 && (
            <div className="text-center py-4">
              <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin mx-auto mb-2" />
              <p className="text-gray-300 text-sm">AI is analyzing your prompt...</p>
            </div>
          )}

          {!isLoading && prompt.length <= 5 && (
            <div className="text-center py-4">
              <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">Start typing your prompt to get AI suggestions</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer"
                  onClick={() => applySuggestion(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs border-white/30 text-white"
                        >
                          {suggestion.type}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getDifficultyColor(suggestion.difficulty))}
                        >
                          {suggestion.difficulty}
                        </Badge>
                        <div className="ml-auto text-xs text-gray-400">
                          {Math.round(suggestion.confidence * 100)}%
                        </div>
                      </div>
                      
                      <p className="text-white text-sm font-medium mb-1 group-hover:text-[#00E5FF] transition-colors">
                        {suggestion.suggestion}
                      </p>
                      
                      <p className="text-gray-300 text-xs">
                        {suggestion.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && suggestions.length === 0 && prompt.length > 5 && (
            <div className="text-center py-4">
              <Bot className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-300 text-sm">No suggestions available for this prompt</p>
              <Button
                size="sm"
                variant="outline"
                onClick={loadSuggestions}
                className="mt-2 border-white/30 text-white hover:bg-white/10"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>

        {/* Content Type Specific Tips */}
        <div className="mt-4 p-3 rounded bg-gradient-to-r from-[#FF006F]/10 to-[#00E5FF]/10 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-[#FF006F]" />
            <span className="text-white font-medium text-sm">
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)} Tips
            </span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            {contentType === 'image' && (
              <>
                <p>• Include artistic style (e.g., "digital art", "watercolor", "photorealistic")</p>
                <p>• Specify mood and lighting (e.g., "dramatic lighting", "soft natural light")</p>
                <p>• Add quality keywords (e.g., "highly detailed", "4K", "professional")</p>
              </>
            )}
            {contentType === 'music' && (
              <>
                <p>• Specify genre and mood (e.g., "upbeat electronic", "melancholic piano")</p>
                <p>• Include tempo (e.g., "120 BPM", "slow tempo", "energetic")</p>
                <p>• Mention instruments (e.g., "acoustic guitar", "orchestral", "synthesizers")</p>
              </>
            )}
            {contentType === 'video' && (
              <>
                <p>• Describe camera movement (e.g., "smooth panning", "close-up shots")</p>
                <p>• Include visual style (e.g., "cinematic", "documentary style", "animated")</p>
                <p>• Specify duration and pacing (e.g., "fast-paced", "30-second clip")</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
