'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Wand2 } from 'lucide-react'
import ContentModificationPanel from './content-modification-panel'
import VersionManagement from './version-management'

interface Submission {
  id: string
  title: string
  type: string
  contentUrl: string
  caption?: string
  prompt?: string
  userId: string
  user: {
    name: string
    image?: string
  }
  version?: number
  isLatest?: boolean
}

interface ModificationButtonProps {
  submission: Submission
  currentUserId?: string
  onSubmissionUpdate?: (updatedSubmission: Submission) => void
}

export default function ModificationButton({ 
  submission, 
  currentUserId,
  onSubmissionUpdate 
}: ModificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'modify' | 'versions'>('modify')

  // Only show modification button for user's own submissions
  if (!currentUserId || submission.userId !== currentUserId) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700"
        >
          <Wand2 className="h-4 w-4 mr-1" />
          Modify
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Modify: {submission.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={activeTab === 'modify' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('modify')}
              className="flex-1"
            >
              AI Modifications
            </Button>
            <Button
              variant={activeTab === 'versions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('versions')}
              className="flex-1"
            >
              Version Management
            </Button>
          </div>

          {/* Content */}
          {activeTab === 'modify' && (
            <ContentModificationPanel
              submission={{
                id: submission.id,
                title: submission.title,
                contentUrl: submission.contentUrl,
                prompt: submission.prompt,
                userId: submission.userId,
                version: submission.version || 1,
                isLatest: submission.isLatest !== false
              }}
              onSubmissionUpdate={(updatedSubmission) => {
                // Convert the updated submission back to the gallery format
                if (onSubmissionUpdate) {
                  onSubmissionUpdate({
                    ...submission,
                    title: updatedSubmission.title,
                    contentUrl: updatedSubmission.contentUrl,
                    version: updatedSubmission.version,
                    isLatest: updatedSubmission.isLatest
                  })
                }
              }}
            />
          )}

          {activeTab === 'versions' && (
            <VersionManagement
              submissionId={submission.id}
              onVersionUpdate={(versionData) => {
                // Handle version updates if needed
                console.log('Version updated:', versionData)
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
