import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface AssessmentRequest {
  prompt: string
  category: string
  previousWork?: Array<{
    title: string
    description?: string
    url?: string
    rating?: number
  }>
}

interface CreatorLevel {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  confidence: number
  suggestions: string[]
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, category, previousWork = [] }: AssessmentRequest = await request.json()

    if (!prompt || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: prompt, category' 
      }, { status: 400 })
    }

    // Mock AI skill assessment - in real implementation, this would use an AI service
    const assessment = await assessCreatorSkill(prompt, category, previousWork)

    return NextResponse.json({
      success: true,
      creatorLevel: assessment
    })
  } catch (error) {
    console.error('Creator assessment error:', error)
    return NextResponse.json({ 
      error: 'Assessment failed' 
    }, { status: 500 })
  }
}

async function assessCreatorSkill(
  prompt: string, 
  category: string, 
  previousWork: Array<{
    title: string
    description?: string
    url?: string
    rating?: number
  }>
): Promise<CreatorLevel> {
  // Mock assessment logic - in real implementation, this would:
  // 1. Analyze prompt complexity and specificity
  // 2. Consider user's previous submissions
  // 3. Use AI to evaluate technical understanding
  // 4. Provide personalized suggestions

  const promptLength = prompt.length
  const promptComplexity = countComplexWords(prompt)
  const hasSpecificDetails = /\b(style|color|mood|technique|format)\b/i.test(prompt)
  const workHistory = previousWork.length

  let level: CreatorLevel['level'] = 'beginner'
  let confidence = 60
  let suggestions: string[] = []

  // Basic scoring algorithm
  let score = 0
  
  // Prompt analysis
  if (promptLength > 100) score += 20
  if (promptComplexity > 3) score += 20
  if (hasSpecificDetails) score += 25
  if (workHistory > 5) score += 20
  if (workHistory > 15) score += 15

  // Determine level based on score
  if (score >= 80) {
    level = 'expert'
    confidence = 95
    suggestions = [
      'Your prompts show excellent technical understanding',
      'Consider experimenting with advanced composition techniques',
      'Try combining multiple artistic styles for unique results'
    ]
  } else if (score >= 60) {
    level = 'advanced'
    confidence = 85
    suggestions = [
      'Great attention to detail in your prompts',
      'Consider adding lighting and atmosphere details',
      'Try specifying camera angles or artistic perspectives'
    ]
  } else if (score >= 40) {
    level = 'intermediate'
    confidence = 75
    suggestions = [
      'Try adding more descriptive adjectives',
      'Consider specifying colors, mood, or style',
      'Break complex ideas into clearer components'
    ]
  } else {
    level = 'beginner'
    confidence = 65
    suggestions = [
      'Start with simple, clear descriptions',
      'Use our prompt examples as inspiration',
      'Focus on one main subject or theme'
    ]
  }

  // Category-specific suggestions
  const categoryTips = {
    image: [
      'Mention artistic style (realistic, abstract, cartoon, etc.)',
      'Describe lighting (bright, moody, dramatic)',
      'Include color palette preferences'
    ],
    video: [
      'Specify camera movement (static, panning, zooming)',
      'Describe the desired duration and pacing',
      'Mention transition styles or effects'
    ],
    audio: [
      'Specify tempo and rhythm style',
      'Mention instruments or sound types',
      'Describe the intended mood or energy'
    ],
    text: [
      'Specify the target audience',
      'Mention the desired tone and style',
      'Include any specific formatting requirements'
    ]
  }

  if (level === 'beginner' || level === 'intermediate') {
    suggestions.push(...(categoryTips[category as keyof typeof categoryTips] || []))
  }

  return {
    level,
    confidence,
    suggestions: suggestions.slice(0, 4) // Limit to most relevant suggestions
  }
}

function countComplexWords(text: string): number {
  const complexWords = [
    'aesthetic', 'composition', 'juxtaposition', 'perspective', 'atmospheric',
    'cinematic', 'abstract', 'minimalist', 'baroque', 'renaissance',
    'chiaroscuro', 'sfumato', 'impasto', 'tenebrism', 'photorealistic'
  ]
  
  const lowerText = text.toLowerCase()
  return complexWords.filter(word => lowerText.includes(word)).length
}
