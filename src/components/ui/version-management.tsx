'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  History,
  RotateCcw,
  Star,
  Eye,
  Copy,
  Download,
  Clock,
  Loader2
} from 'lucide-react'

interface VersionHistoryItem {
  id: string
  version: number
  contentUrl: string
  prompt?: string
  title: string
  isLatest: boolean
  isOriginal: boolean
  createdAt: string
  modifications: any[]
}

interface VersionHistoryData {
  submission: {
    id: string
    title: string
    version: number
    isLatest: boolean
  }
  versionHistory: VersionHistoryItem[]
  totalVersions: number
}

interface VersionManagementProps {
  submissionId: string
  onVersionUpdate?: (versionData: VersionHistoryData) => void
}

export default function VersionManagement({ 
  submissionId, 
  onVersionUpdate 
}: VersionManagementProps) {
  const [versionData, setVersionData] = useState<VersionHistoryData | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchVersionHistory()
  }, [submissionId])

  const fetchVersionHistory = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/content/versions?submissionId=${submissionId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setVersionData(data)
          if (onVersionUpdate) {
            onVersionUpdate(data)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching version history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVersionAction = async (action: string, versionId?: string) => {
    setActionLoading(action)
    try {
      const response = await fetch('/api/content/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: versionId || submissionId,
          action
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Action '${action.replace('_', ' ')}' completed successfully`)
        await fetchVersionHistory()
      } else {
        alert(data.error || `Failed to ${action.replace('_', ' ')}`)
      }
    } catch (error) {
      alert(`Error performing ${action.replace('_', ' ')}`)
      console.error('Error:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getTruncatedPrompt = (prompt: string, maxLength = 100) => {
    if (!prompt) return 'No prompt'
    return prompt.length > maxLength ? `${prompt.substring(0, maxLength)}...` : prompt
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading version history...
        </CardContent>
      </Card>
    )
  }

  if (!versionData) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8 text-gray-500">
          No version data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Version Management
        </CardTitle>
        <CardDescription>
          Manage and track different versions of your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Version Info */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{versionData.submission.title}</h3>
              <p className="text-sm text-gray-600">
                Current Version: {versionData.submission.version} 
                {versionData.submission.isLatest && ' (Latest)'}
              </p>
            </div>
            <Badge variant="default">
              {versionData.totalVersions} Version{versionData.totalVersions !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleVersionAction('create_version')}
            disabled={actionLoading === 'create_version'}
          >
            {actionLoading === 'create_version' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            Create New Version
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleVersionAction('revert_to_original')}
            disabled={actionLoading === 'revert_to_original'}
          >
            {actionLoading === 'revert_to_original' ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4 mr-1" />
            )}
            Revert to Original
          </Button>
        </div>

        {/* Version History */}
        <div className="space-y-3">
          <h4 className="font-medium">Version History</h4>
          {versionData.versionHistory.map((version) => (
            <div 
              key={version.id} 
              className={`border rounded-lg p-4 ${
                version.isLatest ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Version {version.version}</span>
                    {version.isLatest && (
                      <Badge variant="default">Current</Badge>
                    )}
                    {version.isOriginal && (
                      <Badge variant="outline">Original</Badge>
                    )}
                    {version.modifications.length > 0 && (
                      <Badge variant="secondary">
                        {version.modifications.length} modification{version.modifications.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  <h5 className="font-medium text-sm mb-1">{version.title}</h5>
                  {version.prompt && (
                    <p className="text-sm text-gray-600 mb-2">
                      {getTruncatedPrompt(version.prompt)}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(version.createdAt)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(version.contentUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {!version.isLatest && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleVersionAction('set_as_latest', version.id)}
                      disabled={actionLoading === 'set_as_latest'}
                    >
                      {actionLoading === 'set_as_latest' ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Star className="h-4 w-4 mr-1" />
                      )}
                      Set as Latest
                    </Button>
                  )}
                </div>
              </div>

              {/* Modifications for this version */}
              {version.modifications.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm font-medium mb-2">Applied Modifications:</div>
                  <div className="space-y-1">
                    {version.modifications.map((mod) => (
                      <div key={mod.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {mod.modificationType.replace('_', ' ').toLowerCase()}
                        </Badge>
                        <span className="text-gray-600 text-xs">
                          {formatDate(mod.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {versionData.versionHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No version history available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
