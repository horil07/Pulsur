'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lightbulb, RotateCcw, Sparkles, Copy, ExternalLink } from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'
import { useState } from 'react'

interface InspirationPanelProps {
  inspirationData: any
  onUsePrompt?: (prompt: string) => void
  onUseStyle?: (style: string) => void
}

export function InspirationPanel({ inspirationData, onUsePrompt, onUseStyle }: InspirationPanelProps) {
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([])

  if (!inspirationData) return null

  const { submission, inspiration, inspirationType = 'similar' } = inspirationData

  const getInspirationIcon = (type: string) => {
    switch (type) {
      case 'remix': return RotateCcw
      case 'inspired': return Sparkles
      default: return Lightbulb
    }
  }

  const Icon = getInspirationIcon(inspirationType)

  const handlePromptSelect = (prompt: string) => {
    if (selectedPrompts.includes(prompt)) {
      setSelectedPrompts(prev => prev.filter(p => p !== prompt))
    } else {
      setSelectedPrompts(prev => [...prev, prompt])
    }
  }

  const handleUseSelectedPrompts = () => {
    const combinedPrompt = selectedPrompts.join('. ')
    onUsePrompt?.(combinedPrompt)
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
  }

  return (
    <Card className="glass-panel border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-white">
          <Icon className="w-5 h-5 text-blue-400" />
          Inspiration: {inspirationType} content
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          {submission.contentUrl && (
            <SafeImage
              src={submission.contentUrl}
              alt={submission.title}
              width={48}
              height={48}
              className="w-12 h-12 rounded-lg object-cover"
              fallback={
                <div className="w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center">
                  🎨
                </div>
              }
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium truncate">"{submission.title}"</h4>
            <p className="text-gray-300 text-sm">by {submission.user.name}</p>
          </div>
          <Badge variant="outline" className="text-blue-400 border-blue-400/50">
            {submission.type.replace('_', ' ').toLowerCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Inspiration Prompts */}
        {inspiration.prompts[inspirationType] && inspiration.prompts[inspirationType].length > 0 && (
          <div>
            <h5 className="text-white font-medium mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {inspirationType === 'similar' ? 'Similar Ideas' : 
               inspirationType === 'remix' ? 'Remix Ideas' : 'Style Ideas'}
            </h5>
            <div className="space-y-2">
              {inspiration.prompts[inspirationType].map((prompt: string, index: number) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPrompts.includes(prompt)
                      ? 'bg-blue-500/20 border-blue-400/50'
                      : 'bg-white/5 border-white/20 hover:bg-white/10'
                  }`}
                  onClick={() => handlePromptSelect(prompt)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-300 text-sm flex-1">{prompt}</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyPrompt(prompt)
                        }}
                        className="h-6 w-6 p-0 hover:bg-white/10"
                        title="Copy prompt"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      {onUsePrompt && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onUsePrompt(prompt)
                          }}
                          className="h-6 w-6 p-0 hover:bg-blue-500/20 text-blue-400"
                          title="Use this prompt"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Style Prompts */}
        {inspiration.prompts.style && inspiration.prompts.style.length > 0 && (
          <div>
            <h5 className="text-white font-medium mb-2">Style Variations</h5>
            <div className="flex flex-wrap gap-2">
              {inspiration.prompts.style.map((style: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-500/20 text-purple-300 border-purple-400/50"
                  onClick={() => onUseStyle?.(style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {selectedPrompts.length > 0 && (
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <p className="text-gray-400 text-sm">
              {selectedPrompts.length} prompt{selectedPrompts.length !== 1 ? 's' : ''} selected
            </p>
            <Button
              onClick={handleUseSelectedPrompts}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Use Selected Prompts
            </Button>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Suggested content types:</span>
            <div className="flex gap-1">
              {inspiration.metadata.suggestedTypes.map((type: string) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type.replace('_', ' ').toLowerCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
