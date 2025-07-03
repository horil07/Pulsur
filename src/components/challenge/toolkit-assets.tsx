'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Archive, Image, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolkitAsset {
  id: string
  title: string
  description: string
  fileUrl: string
  fileSize: string
  fileType: string
}

interface ToolkitAssetsProps {
  challengeId: string
  challengeTitle: string
  assets: ToolkitAsset[]
  onComplete: () => void
  className?: string
}

export function ToolkitAssets({
  challengeId,
  challengeTitle,
  assets,
  onComplete,
  className
}: ToolkitAssetsProps) {
  const [downloadedAssets, setDownloadedAssets] = useState<Set<string>>(new Set())
  const [downloadingAssets, setDownloadingAssets] = useState<Set<string>>(new Set())

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6" />
      case 'zip':
      case 'rar':
        return <Archive className="w-6 h-6" />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="w-6 h-6" />
      default:
        return <FileText className="w-6 h-6" />
    }
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'bg-red-600'
      case 'zip':
      case 'rar':
        return 'bg-purple-600'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bg-green-600'
      default:
        return 'bg-gray-600'
    }
  }

  const handleDownload = async (asset: ToolkitAsset) => {
    if (downloadingAssets.has(asset.id)) return

    setDownloadingAssets(prev => new Set([...prev, asset.id]))

    try {
      // In a real implementation, this would handle the actual file download
      // For now, we'll simulate the download
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create a temporary link to trigger download
      const link = document.createElement('a')
      link.href = asset.fileUrl
      link.download = `${asset.title}.${asset.fileType.toLowerCase()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setDownloadedAssets(prev => new Set([...prev, asset.id]))
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloadingAssets(prev => {
        const updated = new Set(prev)
        updated.delete(asset.id)
        return updated
      })
    }
  }

  const handleDownloadAll = async () => {
    for (const asset of assets) {
      if (!downloadedAssets.has(asset.id) && !downloadingAssets.has(asset.id)) {
        await handleDownload(asset)
      }
    }
  }

  const allDownloaded = assets.every(asset => downloadedAssets.has(asset.id))

  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A]', className)}>
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Challenge Toolkit
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            {challengeTitle}
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Download essential assets and resources to help you create your best submission. 
            These tools will give you everything you need to understand the challenge requirements and brand guidelines.
          </p>
        </div>

        {/* Download All Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleDownloadAll}
            disabled={allDownloaded || downloadingAssets.size > 0}
            className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            {allDownloaded ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                All Downloaded
              </>
            ) : downloadingAssets.size > 0 ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download All Assets
              </>
            )}
          </Button>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.isArray(assets) && assets.map((asset) => {
            const isDownloaded = downloadedAssets.has(asset.id)
            const isDownloading = downloadingAssets.has(asset.id)

            return (
              <Card 
                key={asset.id} 
                className={cn(
                  'bg-gray-900 border-gray-800 transition-all duration-300',
                  isDownloaded && 'border-green-600 bg-green-900/20'
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg text-white',
                        getFileTypeColor(asset.fileType)
                      )}>
                        {getFileIcon(asset.fileType)}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {asset.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {asset.fileType.toUpperCase()}
                          </Badge>
                          <span className="text-gray-400 text-xs">
                            {asset.fileSize}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isDownloaded && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <CardDescription className="text-gray-400 mb-4">
                    {asset.description}
                  </CardDescription>

                  <Button
                    onClick={() => handleDownload(asset)}
                    disabled={isDownloading || isDownloaded}
                    className={cn(
                      'w-full font-semibold rounded-full transition-all duration-300',
                      isDownloaded
                        ? 'bg-green-600 hover:bg-green-600 text-white'
                        : 'bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white transform hover:scale-105'
                    )}
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Important Note */}
        <Card className="bg-amber-900/20 border-amber-600 mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <h3 className="text-amber-400 font-medium mb-2">
                  Important Guidelines
                </h3>
                <p className="text-amber-200 text-sm">
                  Please review all downloaded assets before creating your submission. 
                  Following the brand guidelines and technical requirements will increase 
                  your chances of success in the challenge.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
          >
            Continue to Challenge
          </Button>
        </div>
      </div>
    </div>
  )
}
