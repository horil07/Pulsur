import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Admin check helper
const isAdmin = (email: string) => {
  return email === 'testuser@example.com' || email.includes('admin')
}

interface ValidationRule {
  field: string
  type: 'required' | 'format' | 'size' | 'custom'
  value?: string | number | boolean | { minLength?: number; requiredTags?: string[] }
  message?: string
  severity: 'error' | 'warning' | 'info'
}

interface ContentRequirement {
  type: 'image' | 'video' | 'audio' | 'text' | 'any'
  formats: string[]
  maxSize: number // in bytes
  minResolution?: string
  maxDuration?: number // in seconds
  requiredFields: string[]
}

interface TutorialStep {
  id: string
  title: string
  description: string
  type: 'text' | 'video' | 'interactive' | 'media'
  content: string
  mediaUrl?: string
  actionRequired?: boolean
  completionTime?: number // estimated time in seconds
}

interface AssetConfiguration {
  id: string
  name: string
  description: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive'
  url: string
  size: number
  version: string
  category: 'brand-guidelines' | 'templates' | 'inspiration' | 'technical' | 'legal'
  required: boolean
  downloadCount?: number
}

interface ChallengeConfiguration {
  challengeId: string
  
  // Asset Management (R35.1)
  assets: AssetConfiguration[]
  assetCategories: string[]
  assetVersioning: boolean
  
  // Tutorial System (R35.2)
  tutorials: {
    enabled: boolean
    steps: TutorialStep[]
    skipAllowed: boolean
    completionRequired: boolean
    estimatedTime: number
  }
  
  // Validation Rules (R35.3)
  validationRules: ValidationRule[]
  contentRequirements: ContentRequirement[]
  qualityThresholds: {
    minimumScore: number
    requirePreview: boolean
    autoReject: boolean
  }
  
  // General Configuration
  submissionLimits: {
    maxPerUser: number
    maxFileSize: number
    allowedTypes: string[]
    cooldownPeriod?: number // in seconds
  }
  
  // Advanced Configuration
  customFields: Array<{
    name: string
    type: 'text' | 'number' | 'select' | 'checkbox' | 'file'
    required: boolean
    options?: string[]
  }>
  
  // Metadata
  createdBy: string
  updatedBy: string
  version: number
  lastModified: string
}

// Mock storage - in production, this would be in a database
const challengeConfigurations: Record<string, ChallengeConfiguration> = {
  '1': {
    challengeId: '1',
    assets: [
      {
        id: 'asset-1',
        name: 'Pulsar Brand Guidelines',
        description: 'Official brand guidelines and logo usage standards',
        type: 'document',
        url: '/assets/brand-guidelines-v2.1.pdf',
        size: 2048000,
        version: '2.1',
        category: 'brand-guidelines',
        required: true,
        downloadCount: 127
      },
      {
        id: 'asset-2',
        name: 'Night Photography Tips',
        description: 'Professional tips for capturing night riding shots',
        type: 'document',
        url: '/assets/night-photography-guide.pdf',
        size: 1536000,
        version: '1.0',
        category: 'technical',
        required: false,
        downloadCount: 89
      },
      {
        id: 'asset-3',
        name: 'Video Templates',
        description: 'After Effects templates for video submissions',
        type: 'archive',
        url: '/assets/video-templates-pack.zip',
        size: 15728640,
        version: '1.2',
        category: 'templates',
        required: false,
        downloadCount: 34
      }
    ],
    assetCategories: ['brand-guidelines', 'technical', 'templates', 'inspiration'],
    assetVersioning: true,
    
    tutorials: {
      enabled: true,
      skipAllowed: false,
      completionRequired: true,
      estimatedTime: 300, // 5 minutes
      steps: [
        {
          id: 'step-1',
          title: 'Welcome to Night Rider Challenge',
          description: 'Learn about the challenge objectives and requirements',
          type: 'video',
          content: 'Get ready to showcase your night riding adventures! This challenge is all about capturing the thrill and beauty of riding in darkness.',
          mediaUrl: '/videos/night-rider-intro.mp4',
          actionRequired: false,
          completionTime: 60
        },
        {
          id: 'step-2',
          title: 'Review Brand Guidelines',
          description: 'Download and review the essential brand guidelines',
          type: 'interactive',
          content: 'Before creating your content, please review our brand guidelines to ensure your submission aligns with Pulsar\'s visual identity.',
          actionRequired: true,
          completionTime: 120
        },
        {
          id: 'step-3',
          title: 'Content Requirements',
          description: 'Understand what makes a winning submission',
          type: 'text',
          content: 'Your submission should showcase authentic night riding experiences. Focus on safety, style, and the unique atmosphere of night riding.',
          actionRequired: false,
          completionTime: 90
        },
        {
          id: 'step-4',
          title: 'Technical Specifications',
          description: 'Learn about file formats and quality requirements',
          type: 'text',
          content: 'Images: Minimum 1920x1080px, JPG/PNG format. Videos: MP4 format, max 2 minutes duration. All files must be under 50MB.',
          actionRequired: false,
          completionTime: 30
        }
      ]
    },
    
    validationRules: [
      {
        field: 'title',
        type: 'required',
        message: 'Title is required for all submissions',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'required',
        message: 'Description must be at least 50 characters',
        severity: 'error',
        value: { minLength: 50 }
      },
      {
        field: 'tags',
        type: 'custom',
        message: 'Must include at least one of: #nightrider, #pulsar, #nightride',
        severity: 'warning',
        value: { requiredTags: ['nightrider', 'pulsar', 'nightride'] }
      }
    ],
    
    contentRequirements: [
      {
        type: 'image',
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSize: 52428800, // 50MB
        minResolution: '1920x1080',
        requiredFields: ['title', 'description', 'tags']
      },
      {
        type: 'video',
        formats: ['mp4', 'mov', 'webm'],
        maxSize: 104857600, // 100MB
        maxDuration: 120, // 2 minutes
        requiredFields: ['title', 'description', 'tags']
      }
    ],
    
    qualityThresholds: {
      minimumScore: 70,
      requirePreview: true,
      autoReject: false
    },
    
    submissionLimits: {
      maxPerUser: 3,
      maxFileSize: 104857600, // 100MB
      allowedTypes: ['image', 'video'],
      cooldownPeriod: 3600 // 1 hour between submissions
    },
    
    customFields: [
      {
        name: 'ridingExperience',
        type: 'select',
        required: true,
        options: ['Beginner (< 1 year)', 'Intermediate (1-5 years)', 'Expert (5+ years)']
      },
      {
        name: 'safetyGearUsed',
        type: 'checkbox',
        required: true
      },
      {
        name: 'locationDescription',
        type: 'text',
        required: false
      }
    ],
    
    createdBy: 'admin@pulsar.com',
    updatedBy: 'admin@pulsar.com',
    version: 1,
    lastModified: new Date().toISOString()
  }
}

// GET - Retrieve challenge configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get('challengeId')
    
    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    const configuration = challengeConfigurations[challengeId]
    
    if (!configuration) {
      return NextResponse.json(
        { success: false, error: 'Challenge configuration not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      configuration
    })
  } catch (error) {
    console.error('Failed to fetch challenge configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch configuration' },
      { status: 500 }
    )
  }
}

// POST - Create or update challenge configuration (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const configurationData: Partial<ChallengeConfiguration> = await request.json()
    
    if (!configurationData.challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    const existingConfig = challengeConfigurations[configurationData.challengeId!]
    
    const newConfiguration: ChallengeConfiguration = {
      ...existingConfig,
      ...configurationData,
      challengeId: configurationData.challengeId!,
      updatedBy: session.user.email,
      version: existingConfig ? existingConfig.version + 1 : 1,
      lastModified: new Date().toISOString()
    }
    
    challengeConfigurations[configurationData.challengeId!] = newConfiguration
    
    return NextResponse.json({
      success: true,
      configuration: newConfiguration
    })
  } catch (error) {
    console.error('Failed to save challenge configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save configuration' },
      { status: 500 }
    )
  }
}
