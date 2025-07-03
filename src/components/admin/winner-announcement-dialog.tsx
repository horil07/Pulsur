'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Mail, Bell, Share2, Webhook, CheckCircle, AlertCircle, X } from 'lucide-react'

interface WinnerAnnouncementDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  challengeId: string
  challengeTitle: string
  winnersCount: number
  onComplete: () => void
}

interface AnnouncementStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'pending' | 'processing' | 'completed' | 'error'
}

export function WinnerAnnouncementDialog({
  isOpen,
  onOpenChange,
  challengeId,
  challengeTitle,
  winnersCount,
  onComplete
}: WinnerAnnouncementDialogProps) {
  const [isAnnouncing, setIsAnnouncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [announcementResults, setAnnouncementResults] = useState<{
    notificationResults?: {
      winnerEmails?: { sent: number }
      participantNotifications?: { emailsSent: number }
    }
  } | null>(null)

  const steps: AnnouncementStep[] = [
    {
      id: 'validate',
      title: 'Validating Winners',
      description: 'Checking winner data and submissions',
      icon: <CheckCircle className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'emails',
      title: 'Sending Winner Emails',
      description: 'Notifying winners about their achievements',
      icon: <Mail className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'participants',
      title: 'Notifying Participants',
      description: 'Sending notifications to all participants',
      icon: <Bell className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'social',
      title: 'Social Media Announcement',
      description: 'Publishing announcement on social platforms',
      icon: <Share2 className="w-4 h-4" />,
      status: 'pending'
    },
    {
      id: 'webhooks',
      title: 'External Notifications',
      description: 'Triggering webhooks and integrations',
      icon: <Webhook className="w-4 h-4" />,
      status: 'pending'
    }
  ]

  const [announcementSteps, setAnnouncementSteps] = useState(steps)

  const updateStepStatus = (stepId: string, status: AnnouncementStep['status']) => {
    setAnnouncementSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    )
  }

  const handleAnnounceWinners = async () => {
    setIsAnnouncing(true)
    setProgress(0)
    setCurrentStep(0)

    try {
      // Simulate step-by-step announcement process
      for (let i = 0; i < announcementSteps.length; i++) {
        const step = announcementSteps[i]
        setCurrentStep(i)
        updateStepStatus(step.id, 'processing')
        
        // Update progress
        setProgress((i / announcementSteps.length) * 80)
        
        // Simulate processing time for each step
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
        
        updateStepStatus(step.id, 'completed')
      }

      // Final API call to announce winners
      setProgress(90)
      const response = await fetch(`/api/challenges/${challengeId}/announce-winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const results = await response.json()
        setAnnouncementResults(results)
        setProgress(100)
        
        // Complete announcement after a brief delay
        setTimeout(() => {
          onComplete()
          onOpenChange(false)
        }, 2000)
      } else {
        throw new Error('Failed to announce winners')
      }
    } catch (error) {
      console.error('Failed to announce winners:', error)
      updateStepStatus(announcementSteps[currentStep]?.id, 'error')
      setIsAnnouncing(false)
    }
  }

  const resetDialog = () => {
    setIsAnnouncing(false)
    setProgress(0)
    setCurrentStep(0)
    setAnnouncementResults(null)
    setAnnouncementSteps(steps)
  }

  const getStepStatusColor = (status: AnnouncementStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Announce Winners
            </CardTitle>
            {!isAnnouncing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  resetDialog()
                  onOpenChange(false)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          <CardDescription className="text-gray-600">
            {isAnnouncing ? (
              'Announcing winners and notifying participants...'
            ) : (
              `Ready to announce ${winnersCount} winner${winnersCount > 1 ? 's' : ''} for "${challengeTitle}"?`
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isAnnouncing && !announcementResults && (
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Important Notice</h4>
                    <p className="text-sm text-yellow-700">
                      This action will notify all participants and cannot be undone. 
                      Make sure all winners are correctly selected.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Announcement Process:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Winner email notifications</li>
                  <li>• Participant notifications</li>
                  <li>• Social media announcements</li>
                  <li>• Challenge status update</li>
                </ul>
              </div>
            </>
          )}

          {isAnnouncing && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                {announcementSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getStepStatusColor(step.status)}`}
                  >
                    <div className="flex-shrink-0">
                      {step.status === 'processing' ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs opacity-75">{step.description}</p>
                    </div>
                    {step.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {announcementResults && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Winners Announced Successfully!</span>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Winner Emails:</span>
                    <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                      {announcementResults.notificationResults?.winnerEmails?.sent || winnersCount} sent
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Participant Notifications:</span>
                    <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                      {announcementResults.notificationResults?.participantNotifications?.emailsSent || 0} sent
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            {!isAnnouncing && !announcementResults && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDialog()
                    onOpenChange(false)
                  }}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAnnounceWinners}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Announce Winners
                </Button>
              </>
            )}
            
            {announcementResults && (
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Done
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
