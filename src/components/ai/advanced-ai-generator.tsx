'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Music, 
  Image as ImageIcon, 
  Video, 
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Play,
  Download,
  Eye,
  Wand2,
  Star,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import AudioEnhancementTools from './audio-enhancement-tools';
import BackgroundMusicLibrary from './background-music-library';
import VideoBackgroundTools from './video-background-tools';

type ContentCategory = 'image' | 'video' | 'audio' | 'text'

type GenerationStep = 'category' | 'prompt' | 'audio' | 'background' | 'effects' | 'preview' | 'complete'

interface CreatorLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  confidence: number
  suggestions: string[]
}

interface GenerationParams {
  category: ContentCategory
  prompt: string
  style?: string
  mood?: string
  duration?: number
  voice?: string
  backgroundMusic?: string
  backgroundImage?: string
  effects?: string[]
  resolution?: string
  format?: string
  audioEnhancement?: {
    file: File
    effects: Array<{
      id: string
      name: string
      enabled: boolean
    }>
  }
  enhancedEffects?: Array<{
    id: string
    name: string
    enabled: boolean
  }>
  backgroundSettings?: {
    opacity: number
    blendMode: string
    scale: number
    position: { x: number; y: number }
    blur: number
    brightness: number
    contrast: number
    saturation: number
  }
}

interface GeneratedContent {
  id: string
  contentUrl: string
  category: ContentCategory
  params: GenerationParams
  quality: number
  processingTime: number
  variations?: string[]
}

interface AdvancedAIGeneratorProps {
  onGenerated: (content: GeneratedContent) => void
  onSaveForLater: (params: GenerationParams, step: GenerationStep) => void
  initialParams?: Partial<GenerationParams>
  initialStep?: GenerationStep
  className?: string
}

export function AdvancedAIGenerator({
  onGenerated,
  onSaveForLater,
  initialParams = {},
  initialStep = 'category',
  className
}: AdvancedAIGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<GenerationStep>(initialStep)
  const [params, setParams] = useState<GenerationParams>({
    category: 'image',
    prompt: '',
    ...initialParams
  })
  const [creatorLevel, setCreatorLevel] = useState<CreatorLevel | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [variations, setVariations] = useState<string[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number>(0)

  const steps: GenerationStep[] = ['category', 'prompt', 'audio', 'background', 'effects', 'preview', 'complete']
  const currentStepIndex = steps.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  useEffect(() => {
    // Assess creator level based on params and past behavior
    assessCreatorLevel()
  }, [params.prompt, params.category])

  const assessCreatorLevel = async () => {
    // Mock AI assessment - in real implementation, this would call an AI service
    try {
      const response = await fetch('/api/ai/assess-skill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: params.prompt,
          category: params.category,
          previousWork: [] // Could include past submissions
        })
      })
      
      if (response.ok) {
        const assessment = await response.json()
        setCreatorLevel(assessment.creatorLevel)
      }
    } catch (error) {
      console.error('Creator assessment failed:', error)
      // Fallback assessment
      setCreatorLevel({
        level: 'intermediate',
        confidence: 75,
        suggestions: ['Try adding more descriptive adjectives', 'Consider specifying a particular style']
      })
    }
  }

  const generateContent = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/advanced-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      
      const result = await response.json()
      if (result.success) {
        const content: GeneratedContent = {
          id: result.id,
          contentUrl: result.contentUrl,
          category: params.category,
          params: { ...params },
          quality: result.quality || 85,
          processingTime: result.processingTime || 15,
          variations: result.variations || []
        }
        
        setGeneratedContent(content)
        setVariations(result.variations || [])
        setCurrentStep('preview')
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateVariation = async (variationParams: Partial<GenerationParams>) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, ...variationParams })
      })
      
      const result = await response.json()
      if (result.success) {
        setVariations([...variations, result.contentUrl])
      }
    } catch (error) {
      console.error('Regeneration failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
    }
  }

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
    }
  }

  const handleComplete = () => {
    if (generatedContent) {
      setCurrentStep('complete')
      onGenerated(generatedContent)
    }
  }

  const saveProgress = () => {
    onSaveForLater(params, currentStep)
  }

  const getCategoryIcon = (category: ContentCategory) => {
    switch (category) {
      case 'image': return <ImageIcon className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Music className="w-5 h-5" />
      case 'text': return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: ContentCategory) => {
    switch (category) {
      case 'image': return 'bg-purple-500/20 border-purple-500 text-purple-300'
      case 'video': return 'bg-red-500/20 border-red-500 text-red-300'
      case 'audio': return 'bg-green-500/20 border-green-500 text-green-300'
      case 'text': return 'bg-blue-500/20 border-blue-500 text-blue-300'
    }
  }

  const getStepTitle = (step: GenerationStep) => {
    switch (step) {
      case 'category': return 'Choose Content Type'
      case 'prompt': return 'Describe Your Vision'
      case 'audio': return 'Audio Settings'
      case 'background': return 'Background & Style'
      case 'effects': return 'Effects & Enhancements'
      case 'preview': return 'Preview & Refine'
      case 'complete': return 'Ready to Submit'
    }
  }

  return (
    <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
      {/* Progress Header */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-500" />
              Advanced AI Creation
            </CardTitle>
            {creatorLevel && (
              <Badge className={cn(
                'capitalize',
                creatorLevel.level === 'expert' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' :
                creatorLevel.level === 'advanced' ? 'bg-green-500/20 text-green-300 border-green-500' :
                creatorLevel.level === 'intermediate' ? 'bg-blue-500/20 text-blue-300 border-blue-500' :
                'bg-gray-500/20 text-gray-300 border-gray-500'
              )}>
                <Star className="w-3 h-3 mr-1" />
                {creatorLevel.level} Creator
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{getStepTitle(currentStep)}</span>
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Creator Suggestions */}
          {creatorLevel && creatorLevel.suggestions.length > 0 && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
              <h4 className="text-blue-300 text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Suggestions for {creatorLevel.level} creators
              </h4>
              <ul className="text-blue-200 text-sm space-y-1">
                {creatorLevel.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 'category' && (
              <CategorySelection 
                selectedCategory={params.category}
                onSelect={(category) => setParams({ ...params, category })}
              />
            )}

            {currentStep === 'prompt' && (
              <PromptInput
                category={params.category}
                prompt={params.prompt}
                onChange={(prompt) => setParams({ ...params, prompt })}
                creatorLevel={creatorLevel}
              />
            )}

            {currentStep === 'audio' && ['video', 'audio'].includes(params.category) && (
              <AudioSettings
                params={params}
                onChange={(updates) => setParams({ ...params, ...updates })}
              />
            )}

            {currentStep === 'background' && (
              <BackgroundSettings
                category={params.category}
                params={params}
                onChange={(updates) => setParams({ ...params, ...updates })}
              />
            )}

            {currentStep === 'effects' && (
              <EffectsSettings
                category={params.category}
                params={params}
                onChange={(updates) => setParams({ ...params, ...updates })}
              />
            )}

            {currentStep === 'preview' && (
              <ContentPreview
                content={generatedContent}
                variations={variations}
                selectedVariation={selectedVariation}
                onSelectVariation={setSelectedVariation}
                onRegenerate={regenerateVariation}
                isGenerating={isGenerating}
              />
            )}

            {currentStep === 'complete' && (
              <CompletionStep
                content={generatedContent}
                onFinish={handleComplete}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={saveProgress}
                className="text-gray-400 hover:text-white"
              >
                Save Progress
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              {currentStep === 'effects' && (
                <Button
                  onClick={generateContent}
                  disabled={!params.prompt || isGenerating}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generate Content
                </Button>
              )}

              {currentStep === 'preview' && generatedContent && (
                <Button
                  onClick={handleComplete}
                  className="bg-[#FF006F] text-white hover:bg-[#FF006F]/80"
                >
                  Use This Version
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {!['effects', 'preview', 'complete'].includes(currentStep) && (
                <Button
                  onClick={nextStep}
                  disabled={!params.prompt && currentStep === 'prompt'}
                  className="bg-[#FF006F] text-white hover:bg-[#FF006F]/80"
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Sub-components for each step
function CategorySelection({ 
  selectedCategory, 
  onSelect 
}: { 
  selectedCategory: ContentCategory
  onSelect: (category: ContentCategory) => void 
}) {
  const categories = [
    { id: 'image' as ContentCategory, name: 'AI Artwork', icon: ImageIcon, desc: 'Generate stunning digital art and images' },
    { id: 'video' as ContentCategory, name: 'AI Video', icon: Video, desc: 'Create dynamic video content with AI' },
    { id: 'audio' as ContentCategory, name: 'AI Music', icon: Music, desc: 'Compose original music and sounds' },
    { id: 'text' as ContentCategory, name: 'AI Content', icon: FileText, desc: 'Generate written content and scripts' }
  ]

  return (
    <div>
      <h3 className="text-white text-lg font-medium mb-4">What type of content do you want to create?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:scale-105',
              selectedCategory === category.id 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
            )}
            onClick={() => onSelect(category.id)}
          >
            <CardContent className="p-6 text-center">
              <category.icon className={cn(
                'w-12 h-12 mx-auto mb-3',
                selectedCategory === category.id ? 'text-blue-500' : 'text-gray-400'
              )} />
              <h4 className="text-white font-medium mb-2">{category.name}</h4>
              <p className="text-gray-400 text-sm">{category.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PromptInput({ 
  category, 
  prompt, 
  onChange, 
  creatorLevel 
}: { 
  category: ContentCategory
  prompt: string
  onChange: (prompt: string) => void
  creatorLevel: CreatorLevel | null
}) {
  const examplePrompts = {
    image: [
      'A futuristic cityscape at sunset with neon lights',
      'Abstract digital art with flowing geometric shapes',
      'Portrait of a cyberpunk character with glowing eyes'
    ],
    video: [
      'Time-lapse of a flower blooming in space',
      'Abstract motion graphics with particle effects',
      'Cinematic flythrough of a fantasy landscape'
    ],
    audio: [
      'Upbeat electronic music with synthesized beats',
      'Ambient soundscape with nature sounds',
      'Dramatic orchestral piece with rising tension'
    ],
    text: [
      'Write a compelling product description',
      'Create a engaging social media caption',
      'Compose a short story about time travel'
    ]
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="prompt" className="text-white text-lg">
          Describe your vision for this {category} content
        </Label>
        <p className="text-gray-400 text-sm mt-1 mb-3">
          Be specific about style, mood, colors, and any other details you want
        </p>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Describe the ${category} you want to create...`}
          className="min-h-32 bg-gray-800 border-gray-700 text-white resize-none"
        />
      </div>
      
      <div>
        <Label className="text-white text-sm">Example prompts:</Label>
        <div className="mt-2 space-y-2">
          {examplePrompts[category].map((example, index) => (
            <button
              key={index}
              onClick={() => onChange(example)}
              className="block w-full text-left p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:border-gray-600 transition-colors text-sm"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AudioSettings({ 
  params, 
  onChange 
}: { 
  params: GenerationParams
  onChange: (updates: Partial<GenerationParams>) => void 
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-medium">Audio Configuration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Voice Type</Label>
          <Select value={params.voice} onValueChange={(voice) => onChange({ voice })}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male-deep">Male (Deep)</SelectItem>
              <SelectItem value="male-warm">Male (Warm)</SelectItem>
              <SelectItem value="female-clear">Female (Clear)</SelectItem>
              <SelectItem value="female-soft">Female (Soft)</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-white">Duration (seconds)</Label>
          <Input
            type="number"
            value={params.duration || 30}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) })}
            min="10"
            max="300"
            className="bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>
    </div>
  )
}

function BackgroundSettings({ 
  category, 
  params, 
  onChange 
}: { 
  category: ContentCategory
  params: GenerationParams
  onChange: (updates: Partial<GenerationParams>) => void 
}) {
  const [showMusicLibrary, setShowMusicLibrary] = useState(false);
  const [showVideoBackground, setShowVideoBackground] = useState(false);
  const [showAudioEnhancement, setShowAudioEnhancement] = useState(false);

  const backgroundOptions = {
    image: ['Abstract', 'Nature', 'Urban', 'Space', 'Minimal'],
    video: ['Dynamic', 'Cinematic', 'Abstract', 'Particle Effects', 'Gradient'],
    audio: ['Studio Clean', 'Ambient Space', 'Concert Hall', 'Outdoor', 'Echo Chamber'],
    text: ['Clean', 'Creative', 'Professional', 'Artistic', 'Modern']
  }

  // Show enhancement tools based on content type
  if (showMusicLibrary) {
    return (
      <BackgroundMusicLibrary
        onTrackSelected={(track) => {
          onChange({ backgroundMusic: track.id });
          setShowMusicLibrary(false);
        }}
        onClose={() => setShowMusicLibrary(false)}
      />
    );
  }

  if (showVideoBackground) {
    return (
      <VideoBackgroundTools
        onBackgroundSelected={(background, settings) => {
          onChange({ 
            backgroundImage: background.id,
            backgroundSettings: settings 
          });
          setShowVideoBackground(false);
        }}
        onClose={() => setShowVideoBackground(false)}
      />
    );
  }

  if (showAudioEnhancement) {
    return (
      <AudioEnhancementTools
        onAudioProcessed={(audioData) => {
          onChange({ 
            audioEnhancement: audioData,
            enhancedEffects: audioData.effects 
          });
          setShowAudioEnhancement(false);
        }}
        onClose={() => setShowAudioEnhancement(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-white text-lg font-medium">Background & Enhancement Tools</h3>
      
      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-white">Style</Label>
          <Select value={params.style} onValueChange={(style) => onChange({ style })}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {backgroundOptions[category].map((option) => (
                <SelectItem key={option} value={option.toLowerCase()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-white">Mood</Label>
          <Select value={params.mood} onValueChange={(mood) => onChange({ mood })}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select mood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="energetic">Energetic</SelectItem>
              <SelectItem value="calm">Calm</SelectItem>
              <SelectItem value="dramatic">Dramatic</SelectItem>
              <SelectItem value="playful">Playful</SelectItem>
              <SelectItem value="mysterious">Mysterious</SelectItem>
              <SelectItem value="uplifting">Uplifting</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhancement Tools */}
      <div className="space-y-4">
        <h4 className="text-white text-md font-medium">Content Enhancement Tools</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(category === 'audio' || category === 'video') && (
            <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => setShowMusicLibrary(true)}>
              <CardContent className="p-4 text-center">
                <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h5 className="text-white font-medium">Background Music</h5>
                <p className="text-gray-400 text-sm">Browse royalty-free music library</p>
              </CardContent>
            </Card>
          )}

          {category === 'video' && (
            <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => setShowVideoBackground(true)}>
              <CardContent className="p-4 text-center">
                <Video className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h5 className="text-white font-medium">Video Backgrounds</h5>
                <p className="text-gray-400 text-sm">Select and customize backgrounds</p>
              </CardContent>
            </Card>
          )}

          {category === 'audio' && (
            <Card className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => setShowAudioEnhancement(true)}>
              <CardContent className="p-4 text-center">
                <Wand2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h5 className="text-white font-medium">Audio Enhancement</h5>
                <p className="text-gray-400 text-sm">Professional audio effects suite</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Current Selections Display */}
        {params.backgroundMusic && (
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-purple-400" />
              <span className="text-white text-sm">Background music selected</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onChange({ backgroundMusic: undefined })}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {params.backgroundImage && (
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-400" />
              <span className="text-white text-sm">Video background selected</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onChange({ backgroundImage: undefined, backgroundSettings: undefined })}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {params.audioEnhancement && (
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-green-400" />
              <span className="text-white text-sm">Audio enhancement applied</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onChange({ audioEnhancement: undefined, enhancedEffects: undefined })}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                Remove
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EffectsSettings({ 
  category, 
  params, 
  onChange 
}: { 
  category: ContentCategory
  params: GenerationParams
  onChange: (updates: Partial<GenerationParams>) => void 
}) {
  const effectOptions = {
    image: ['Glow', 'Blur', 'Sharpen', 'Vintage', 'HDR'],
    video: ['Slow Motion', 'Speed Ramp', 'Color Grade', 'Lens Flare', 'Particles'],
    audio: ['Reverb', 'Echo', 'Distortion', 'Chorus', 'Compressor'],
    text: ['Typography', 'Formatting', 'Highlighting', 'Animation', 'Styling']
  }

  const currentEffects = params.effects || []

  const toggleEffect = (effect: string) => {
    const effects = currentEffects.includes(effect)
      ? currentEffects.filter(e => e !== effect)
      : [...currentEffects, effect]
    onChange({ effects })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-medium">Effects & Enhancements</h3>
      
      <div>
        <Label className="text-white mb-3 block">Select effects to apply:</Label>
        <div className="flex flex-wrap gap-2">
          {effectOptions[category].map((effect) => (
            <button
              key={effect}
              onClick={() => toggleEffect(effect)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm transition-colors',
                currentEffects.includes(effect)
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
              )}
            >
              {effect}
            </button>
          ))}
        </div>
      </div>

      {category !== 'text' && (
        <div>
          <Label className="text-white">Quality/Resolution</Label>
          <Select value={params.resolution} onValueChange={(resolution) => onChange({ resolution })}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (Fast)</SelectItem>
              <SelectItem value="high">High Quality</SelectItem>
              <SelectItem value="ultra">Ultra HD (Slow)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

function ContentPreview({ 
  content, 
  variations, 
  selectedVariation, 
  onSelectVariation, 
  onRegenerate, 
  isGenerating 
}: { 
  content: GeneratedContent | null
  variations: string[]
  selectedVariation: number
  onSelectVariation: (index: number) => void
  onRegenerate: (params: Partial<GenerationParams>) => void
  isGenerating: boolean
}) {
  if (!content) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-white">Generating your content...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-white text-lg font-medium mb-2">Preview Your Creation</h3>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            Quality: {content.quality}%
          </div>
          <div>Processing: {content.processingTime}s</div>
        </div>
      </div>

      {/* Main preview */}
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        {content.category === 'image' && (
          <img 
            src={content.contentUrl} 
            alt="Generated content" 
            className="max-w-full max-h-96 mx-auto rounded-lg"
          />
        )}
        {content.category === 'video' && (
          <video 
            src={content.contentUrl} 
            controls 
            className="max-w-full max-h-96 mx-auto rounded-lg"
          />
        )}
        {content.category === 'audio' && (
          <div className="py-8">
            <Music className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <audio src={content.contentUrl} controls className="mx-auto" />
          </div>
        )}
        {content.category === 'text' && (
          <div className="bg-gray-900 p-6 rounded-lg text-left">
            <div className="prose prose-invert max-w-none">
              {content.contentUrl.split('\n').map((line, index) => (
                <p key={index} className="text-gray-300 mb-2">{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Variations */}
      {variations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white font-medium">Variations</h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {variations.map((variation, index) => (
              <button
                key={index}
                onClick={() => onSelectVariation(index)}
                className={cn(
                  'aspect-square rounded-lg border-2 overflow-hidden transition-all',
                  selectedVariation === index 
                    ? 'border-blue-500 ring-2 ring-blue-500/30' 
                    : 'border-gray-700 hover:border-gray-500'
                )}
              >
                <img 
                  src={variation} 
                  alt={`Variation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => onRegenerate({})}
          disabled={isGenerating}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Regenerate
        </Button>
        
        <Button
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  )
}

function CompletionStep({ 
  content, 
  onFinish 
}: { 
  content: GeneratedContent | null
  onFinish: () => void 
}) {
  if (!content) return null

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <Sparkles className="w-8 h-8 text-green-400" />
      </div>
      
      <div>
        <h3 className="text-white text-xl font-bold mb-2">Content Ready!</h3>
        <p className="text-gray-400">
          Your {content.category} content has been generated successfully. 
          You can now submit it to the challenge.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 inline-block">
        <div className="text-sm text-gray-400 space-y-1">
          <div>Quality Score: <span className="text-white font-medium">{content.quality}%</span></div>
          <div>Processing Time: <span className="text-white font-medium">{content.processingTime}s</span></div>
          <div>Content Type: <span className="text-white font-medium capitalize">{content.category}</span></div>
        </div>
      </div>

      <Button
        onClick={onFinish}
        className="bg-[#FF006F] text-white hover:bg-[#FF006F]/80 px-8 py-3 text-lg"
      >
        Submit to Challenge
      </Button>
    </div>
  )
}
