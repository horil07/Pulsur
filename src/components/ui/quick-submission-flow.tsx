import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, Wand2, Clock, Users, Target, ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ChallengeStatus } from '@/hooks/useChallengeStatus'

interface QuickSubmissionFlowProps {
  challengeStatus: ChallengeStatus
  trigger?: React.ReactNode
  onSubmissionStart?: (challengeId: string, method: 'upload' | 'ai') => void
}

export function QuickSubmissionFlow({ 
  challengeStatus, 
  trigger,
  onSubmissionStart 
}: QuickSubmissionFlowProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmissionMethod = (method: 'upload' | 'ai') => {
    if (onSubmissionStart) {
      onSubmissionStart(challengeStatus.challengeId, method)
    } else {
      // Default navigation
      const url = `/challenge?id=${challengeStatus.challengeId}&method=${method}`
      window.location.href = url
    }
    setIsOpen(false)
  }

  // Don't render if user can't submit
  if (!session?.user || !challengeStatus.canSubmit) {
    return null
  }

  const defaultTrigger = (
    <Button size="sm" className="flex items-center space-x-1">
      <Upload className="h-4 w-4" />
      <span>Submit Entry</span>
    </Button>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Submit to {challengeStatus.title}</span>
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to create your submission for this challenge.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Challenge Status Summary */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Time remaining:</span>
              </div>
              <span className="font-medium">
                {challengeStatus.timeRemaining ? 
                  new Date(challengeStatus.timeRemaining + Date.now()).toLocaleDateString() : 
                  'N/A'
                }
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span>Your submissions:</span>
              </div>
              <span className="font-medium">
                {challengeStatus.userSubmissionCount}/{challengeStatus.maxEntriesPerUser}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>Total submissions:</span>
              </div>
              <span className="font-medium">{challengeStatus.totalSubmissions}</span>
            </div>
          </div>

          {/* Submission Method Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700">Choose Creation Method:</h4>
            
            {/* AI Generation Option */}
            <button
              onClick={() => handleSubmissionMethod('ai')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                    <Wand2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">AI Generation</div>
                    <div className="text-sm text-gray-600">
                      Create content using AI tools and prompts
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                </div>
              </div>
            </button>

            {/* Upload Option */}
            <button
              onClick={() => handleSubmissionMethod('upload')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                    <Upload className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Upload Content</div>
                    <div className="text-sm text-gray-600">
                      Upload your own pre-created content
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
              </div>
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Link 
              href={`/challenge/${challengeStatus.challengeId}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View Challenge Details
            </Link>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
