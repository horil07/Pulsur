'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Download,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle
} from 'lucide-react'

interface AssetUploadProps {
  challengeId: string
  onAssetUploaded: (asset: any) => void
  existingAssets: any[]
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function AssetUpload({ challengeId, onAssetUploaded, existingAssets }: AssetUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, UploadingFile>>({})
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [uploadForm, setUploadForm] = useState({
    category: 'brand-guidelines' as 'brand-guidelines' | 'templates' | 'inspiration' | 'technical' | 'legal',
    version: '1.0',
    description: '',
    required: false
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />
      case 'image': return <Image className="w-5 h-5" />
      case 'video': return <Video className="w-5 h-5" />
      case 'audio': return <Music className="w-5 h-5" />
      case 'archive': return <Archive className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'brand-guidelines': return 'bg-blue-100 text-blue-800'
      case 'templates': return 'bg-green-100 text-green-800'
      case 'inspiration': return 'bg-purple-100 text-purple-800'
      case 'technical': return 'bg-orange-100 text-orange-800'
      case 'legal': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const fileId = `${file.name}-${Date.now()}`
      
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: {
          file,
          progress: 0,
          status: 'uploading'
        }
      }))

      // Simulate file upload
      simulateUpload(fileId, file)
    })
  }

  const simulateUpload = async (fileId: string, file: File) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            progress
          }
        }))
      }

      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('challengeId', challengeId)
      formData.append('category', uploadForm.category)
      formData.append('version', uploadForm.version)
      formData.append('description', uploadForm.description)
      formData.append('required', uploadForm.required.toString())

      const response = await fetch('/api/challenges/assets', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setUploadingFiles(prev => ({
          ...prev,
          [fileId]: {
            ...prev[fileId],
            status: 'success'
          }
        }))
        
        onAssetUploaded(data.asset)
        
        // Remove from uploading files after a delay
        setTimeout(() => {
          setUploadingFiles(prev => {
            const { [fileId]: _, ...rest } = prev
            return rest
          })
        }, 2000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      setUploadingFiles(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'error',
          error: 'Upload failed'
        }
      }))
    }
  }

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      const response = await fetch(`/api/challenges/assets?assetId=${assetId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // In a real app, you'd refresh the assets list
        alert('Asset deleted successfully')
      } else {
        throw new Error('Delete failed')
      }
    } catch (error) {
      alert('Failed to delete asset')
    }
  }

  const handleUpdateAsset = async (assetId: string, updates: any) => {
    try {
      const response = await fetch('/api/challenges/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, updates })
      })

      if (response.ok) {
        setEditingAsset(null)
        alert('Asset updated successfully')
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      alert('Failed to update asset')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Challenge Assets</h3>
          <p className="text-sm text-gray-600">Upload and manage assets for this challenge</p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {showUploadForm && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Upload New Asset</CardTitle>
            <CardDescription>
              Upload files to help users complete this challenge
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value: any) => setUploadForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brand-guidelines">Brand Guidelines</SelectItem>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="inspiration">Inspiration</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Version</Label>
                <Input
                  value={uploadForm.version}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this asset is for..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={uploadForm.required}
                onCheckedChange={(checked: boolean) => setUploadForm(prev => ({ ...prev, required: checked }))}
              />
              <Label>Required for submission</Label>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Drop files here or click to browse</p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.mov,.mp3,.wav,.zip"
                onChange={handleFileSelect}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploading Files */}
      {Object.entries(uploadingFiles).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uploading Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(uploadingFiles).map(([fileId, upload]) => (
                <div key={fileId} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{upload.file.name}</span>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(upload.file.size)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          upload.status === 'success' ? 'bg-green-500' :
                          upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    {upload.status === 'success' && <Check className="w-5 h-5 text-green-500" />}
                    {upload.status === 'error' && <X className="w-5 h-5 text-red-500" />}
                    {upload.status === 'uploading' && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {existingAssets.map((asset) => (
          <Card key={asset.id} className="border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(asset.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                    <p className="text-xs text-gray-500">v{asset.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingAsset(asset)}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAsset(asset.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge className={getCategoryColor(asset.category)} variant="secondary">
                  {asset.category.replace('-', ' ')}
                </Badge>
                
                {asset.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">{asset.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(asset.size)}</span>
                  {asset.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-3 h-3 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {existingAssets.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">No assets uploaded yet</h3>
            <p className="text-gray-600 mb-4">
              Upload files to help users understand and complete this challenge
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload First Asset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
