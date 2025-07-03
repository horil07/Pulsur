import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Admin check helper
const isAdmin = (email: string) => {
  return email === 'testuser@example.com' || email.includes('admin')
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
  order: number
}

interface TutorialProgress {
  userId: string
  challengeId: string
  currentStep: number
  completedSteps: string[]
  startedAt: string
  lastActivityAt: string
  completedAt?: string
  totalTimeSpent: number // in seconds
  skipCount: number
}

interface InteractiveTutorial {
  challengeId: string
  title: string
  description: string
  estimatedTime: number
  steps: TutorialStep[]
  settings: {
    skipAllowed: boolean
    completionRequired: boolean
    showProgress: boolean
    allowRestart: boolean
  }
  createdBy: string
  updatedBy: string
  version: number
  createdAt: string
  updatedAt: string
}

// Mock storage - in production, this would be in a database
const tutorials: Record<string, InteractiveTutorial> = {
  '1': {
    challengeId: '1',
    title: 'Night Rider Challenge Tutorial',
    description: 'Learn everything you need to know to create winning night riding content',
    estimatedTime: 300, // 5 minutes
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Night Rider Challenge',
        description: 'Get introduced to the challenge and its objectives',
        type: 'video',
        content: `<div class="tutorial-welcome">
          <h2>🌙 Welcome to the Night Rider Challenge!</h2>
          <p>Ready to showcase your night riding adventures? This challenge is all about capturing the thrill, beauty, and unique atmosphere of riding in darkness.</p>
          <p><strong>What we're looking for:</strong></p>
          <ul>
            <li>Authentic night riding experiences</li>
            <li>Creative photography or videography</li>
            <li>Safety-conscious content</li>
            <li>Unique perspectives on night riding</li>
          </ul>
        </div>`,
        mediaUrl: '/videos/tutorials/night-rider-intro.mp4',
        actionRequired: false,
        completionTime: 60,
        order: 1
      },
      {
        id: 'brand-guidelines',
        title: 'Brand Guidelines Review',
        description: 'Understanding Pulsar brand requirements and visual identity',
        type: 'interactive',
        content: `<div class="tutorial-interactive">
          <h2>📋 Brand Guidelines</h2>
          <p>Before creating your content, review our brand guidelines to ensure your submission aligns with Pulsar's visual identity.</p>
          <div class="action-required">
            <h3>Required Action:</h3>
            <p>Download and review the brand guidelines document. Click the download button below:</p>
            <button class="download-btn" data-asset="brand-guidelines">Download Brand Guidelines (PDF)</button>
            <p class="note">You must download this document to proceed to the next step.</p>
          </div>
        </div>`,
        actionRequired: true,
        completionTime: 120,
        order: 2
      },
      {
        id: 'content-requirements',
        title: 'Content Requirements',
        description: 'What makes a winning submission',
        type: 'text',
        content: `<div class="tutorial-content">
          <h2>🎯 Content Requirements</h2>
          <div class="requirement-section">
            <h3>Photography Requirements:</h3>
            <ul>
              <li>Minimum resolution: 1920x1080px</li>
              <li>File formats: JPG, PNG, WebP</li>
              <li>Maximum file size: 50MB</li>
              <li>Focus on night riding scenarios</li>
            </ul>
          </div>
          <div class="requirement-section">
            <h3>Video Requirements:</h3>
            <ul>
              <li>Format: MP4, MOV, WebM</li>
              <li>Maximum duration: 2 minutes</li>
              <li>Maximum file size: 100MB</li>
              <li>Include audio if relevant</li>
            </ul>
          </div>
          <div class="tips-section">
            <h3>💡 Pro Tips:</h3>
            <ul>
              <li>Show proper safety gear usage</li>
              <li>Capture the atmosphere of night riding</li>
              <li>Include interesting lighting effects</li>
              <li>Tell a story with your content</li>
            </ul>
          </div>
        </div>`,
        actionRequired: false,
        completionTime: 90,
        order: 3
      },
      {
        id: 'safety-first',
        title: 'Safety First',
        description: 'Important safety considerations for night riding content',
        type: 'text',
        content: `<div class="tutorial-safety">
          <h2>🛡️ Safety First</h2>
          <div class="safety-warning">
            <h3>⚠️ Important Safety Reminders:</h3>
            <ul>
              <li>Always wear appropriate safety gear (helmet, reflective clothing)</li>
              <li>Ensure proper bike lighting is visible in your content</li>
              <li>Never compromise safety for a good shot</li>
              <li>Follow all traffic laws during filming</li>
              <li>Avoid dangerous locations or stunts</li>
            </ul>
          </div>
          <div class="gear-checklist">
            <h3>Essential Night Riding Gear Checklist:</h3>
            <ul>
              <li>✅ DOT/ECE approved helmet</li>
              <li>✅ Reflective/high-visibility jacket</li>
              <li>✅ Proper headlight and taillight</li>
              <li>✅ Reflective strips or accessories</li>
              <li>✅ Appropriate footwear</li>
            </ul>
          </div>
        </div>`,
        actionRequired: false,
        completionTime: 60,
        order: 4
      },
      {
        id: 'submission-process',
        title: 'Submission Process',
        description: 'How to submit your content and what happens next',
        type: 'text',
        content: `<div class="tutorial-submission">
          <h2>📤 Submission Process</h2>
          <div class="process-steps">
            <h3>Step-by-Step Submission:</h3>
            <ol>
              <li><strong>Complete this tutorial</strong> - You're almost done!</li>
              <li><strong>Create your content</strong> - Use AI generation or upload your own files</li>
              <li><strong>Add metadata</strong> - Include title, description, and tags</li>
              <li><strong>Preview and review</strong> - Check everything looks perfect</li>
              <li><strong>Submit for review</strong> - Our team will review within 24-48 hours</li>
              <li><strong>Go live</strong> - Approved submissions appear in the gallery</li>
            </ol>
          </div>
          <div class="submission-tips">
            <h3>🌟 Submission Tips:</h3>
            <ul>
              <li>Use descriptive titles and detailed descriptions</li>
              <li>Include relevant tags (#nightrider, #pulsar, #nightride)</li>
              <li>Share your riding experience and location context</li>
              <li>Engage with the community after submission</li>
            </ul>
          </div>
        </div>`,
        actionRequired: false,
        completionTime: 45,
        order: 5
      }
    ],
    settings: {
      skipAllowed: false,
      completionRequired: true,
      showProgress: true,
      allowRestart: true
    },
    createdBy: 'admin@pulsar.com',
    updatedBy: 'admin@pulsar.com',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

const tutorialProgress: Record<string, TutorialProgress> = {}

// GET - Retrieve tutorial for a challenge
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get('challengeId')
    const userId = searchParams.get('userId')
    
    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    const tutorial = tutorials[challengeId]
    if (!tutorial) {
      return NextResponse.json(
        { success: false, error: 'Tutorial not found' },
        { status: 404 }
      )
    }
    
    let progress = null
    if (userId) {
      const progressKey = `${userId}-${challengeId}`
      progress = tutorialProgress[progressKey]
    }
    
    return NextResponse.json({
      success: true,
      tutorial,
      progress
    })
  } catch (error) {
    console.error('Failed to fetch tutorial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tutorial' },
      { status: 500 }
    )
  }
}

// POST - Create or update tutorial (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const tutorialData: Partial<InteractiveTutorial> = await request.json()
    
    if (!tutorialData.challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    const existingTutorial = tutorials[tutorialData.challengeId]
    
    const newTutorial: InteractiveTutorial = {
      ...existingTutorial,
      ...tutorialData,
      challengeId: tutorialData.challengeId,
      updatedBy: session.user.email,
      version: existingTutorial ? existingTutorial.version + 1 : 1,
      updatedAt: new Date().toISOString(),
      createdAt: existingTutorial?.createdAt || new Date().toISOString(),
      createdBy: existingTutorial?.createdBy || session.user.email
    }
    
    tutorials[tutorialData.challengeId] = newTutorial
    
    return NextResponse.json({
      success: true,
      tutorial: newTutorial
    })
  } catch (error) {
    console.error('Failed to save tutorial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save tutorial' },
      { status: 500 }
    )
  }
}
