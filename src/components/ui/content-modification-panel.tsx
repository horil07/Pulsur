'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Wand2,
  Sparkles,
  History,
  RotateCcw,
  Save,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Submission {
  id: string
  title: string
  contentUrl: string
  prompt?: string
  userId: string
  version: number
  isLatest: boolean
}

interface ContentModification {
  id: string
  modificationType: string
  originalPrompt?: string
  newPrompt?: string
  aiEffects?: any
  resultUrl?: string
  previewUrl?: string
  processingStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  isApplied: boolean
  createdAt: string
  processingTime?: number
  errorMessage?: string
}

interface ContentModificationPanelProps {
  submission: Submission
  onSubmissionUpdate?: (updatedSubmission: Submission) => void
}

export default function ContentModificationPanel({ 
  submission, 
  onSubmissionUpdate 
}: ContentModificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'effects' | 'versions'>('prompt')
  const [promptText, setPromptText] = useState(submission.prompt || '')
  const [selectedEffects, setSelectedEffects] = useState<string[]>([])
  const [modifications, setModifications] = useState<ContentModification[]>([])
  const [loading, setLoading] = useState(false)
  const [availableEffects, setAvailableEffects] = useState<any[]>([])

  useEffect(() => {
    fetchModifications()
    fetchAvailableEffects()
  }, [submission.id])

  const fetchModifications = async () => {
    try {
      const response = await fetch(`/api/content/modify-prompt?submissionId=${submission.id}`)
      if (response.ok) {
        const data = await response.json()
        setModifications(data.modifications || [])
      }
    } catch (error) {
      console.error('Error fetching modifications:', error)
    }
  }

  const fetchAvailableEffects = async () => {
    try {
      const response = await fetch(`/api/content/ai-effects?submissionId=${submission.id}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableEffects(data.availableEffects || [])
      }
    } catch (error) {
      console.error('Error fetching available effects:', error)
    }
  }

  const handlePromptModification = async () => {
    if (!promptText.trim()) {
      alert('Please enter a prompt')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/content/modify-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          newPrompt: promptText,
          parameters: { preserveStyle: true }
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        await fetchModifications()
      } else {
        alert(data.error || 'Failed to modify prompt')
      }
    } catch (error) {
      alert('Error modifying prompt')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyEffects = async () => {
    if (selectedEffects.length === 0) {
      alert('Please select at least one effect')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/content/ai-effects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          effects: selectedEffects,
          parameters: { intensity: 0.7 }
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.message)
        setSelectedEffects([])
        await fetchModifications()
      } else {
        alert(data.error || 'Failed to apply effects')
      }
    } catch (error) {
      alert('Error applying effects')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyModification = async (modificationId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/content/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission.id,
          action: 'apply_modification',
          modificationId
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Modification applied successfully')
        if (onSubmissionUpdate && data.result.updatedSubmission) {
          onSubmissionUpdate(data.result.updatedSubmission)
        }
        await fetchModifications()
      } else {
        alert(data.error || 'Failed to apply modification')
      }
    } catch (error) {
      alert('Error applying modification')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'PROCESSING':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Content Modification
        </CardTitle>
        <CardDescription>
          Enhance your submission with AI-powered modifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'prompt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('prompt')}
            className="flex-1"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Modify Prompt
          </Button>
          <Button
            variant={activeTab === 'effects' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('effects')}
            className="flex-1"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Effects
          </Button>
          <Button
            variant={activeTab === 'versions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('versions')}
            className="flex-1"
          >
            <History className="h-4 w-4 mr-2" />
            Versions
          </Button>
        </div>

        {/* Prompt Modification Tab */}
        {activeTab === 'prompt' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Prompt</label>
              <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                {submission.prompt || 'No prompt available'}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">New Prompt</label>
              <Textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter your new prompt to regenerate the content..."
                className="mt-1"
                rows={4}
              />
            </div>

            <Button 
              onClick={handlePromptModification}
              disabled={loading || !promptText.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Modify Prompt
                </>
              )}
            </Button>
          </div>
        )}

        {/* AI Effects Tab */}
        {activeTab === 'effects' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">Available Effects</label>
              <div className="grid grid-cols-2 gap-2">
                {availableEffects.map((effect) => (
                  <div
                    key={effect.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEffects.includes(effect.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedEffects(prev =>
                        prev.includes(effect.id)
                          ? prev.filter(id => id !== effect.id)
                          : [...prev, effect.id]
                      )
                    }}
                  >
                    <div className="font-medium text-sm">{effect.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{effect.description}</div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {effect.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {selectedEffects.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium">Selected Effects:</div>
                <div className="mt-1 space-x-1">
                  {selectedEffects.map(effectId => {
                    const effect = availableEffects.find(e => e.id === effectId)
                    return (
                      <Badge key={effectId} variant="secondary">
                        {effect?.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            <Button 
              onClick={handleApplyEffects}
              disabled={loading || selectedEffects.length === 0}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Applying Effects...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Apply Effects ({selectedEffects.length})
                </>
              )}
            </Button>
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Current version: {submission.version} {submission.isLatest && '(Latest)'}
            </div>
            
            {modifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No modifications yet. Create some modifications to see version history.
              </div>
            ) : (
              <div className="space-y-3">
                {modifications.map((mod) => (
                  <div key={mod.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(mod.processingStatus)}
                        <span className="font-medium capitalize">
                          {mod.modificationType.replace('_', ' ').toLowerCase()}
                        </span>
                        <Badge className={getStatusColor(mod.processingStatus)}>
                          {mod.processingStatus}
                        </Badge>
                        {mod.isApplied && (
                          <Badge variant="default">Applied</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(mod.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {mod.newPrompt && (
                      <div className="text-sm bg-gray-50 p-2 rounded mb-2">
                        <strong>New Prompt:</strong> {mod.newPrompt}
                      </div>
                    )}

                    {mod.aiEffects && (
                      <div className="text-sm bg-gray-50 p-2 rounded mb-2">
                        <strong>Effects:</strong> {mod.aiEffects.appliedEffects?.join(', ')}
                      </div>
                    )}

                    {mod.processingStatus === 'COMPLETED' && !mod.isApplied && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApplyModification(mod.id)}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                        {mod.previewUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(mod.previewUrl, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                        )}
                      </div>
                    )}

                    {mod.processingStatus === 'FAILED' && mod.errorMessage && (
                      <div className="text-sm text-red-600 mt-2">
                        Error: {mod.errorMessage}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
