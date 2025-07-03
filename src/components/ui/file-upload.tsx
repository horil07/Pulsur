'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Image as ImageIcon } from 'lucide-react'
import { SafeImage } from '@/components/ui/safe-image'

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  onUrlChange: (url: string) => void
  currentUrl?: string
  accept?: string
  label?: string
  placeholder?: string
  className?: string
}

export function FileUpload({
  onFileSelect,
  onUrlChange,
  currentUrl = '',
  accept = 'image/*',
  label = 'Image',
  placeholder = 'Enter image URL or upload file',
  className = ''
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl)
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadError(null)
    
    // Auto-upload the file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        // Update with the uploaded file URL
        onUrlChange(result.url)
        setPreviewUrl(result.url)
        onFileSelect(file)
      } else {
        setUploadError(result.error || 'Upload failed')
        clearSelection()
      }
    } catch {
      setUploadError('Upload failed')
      clearSelection()
    } finally {
      setUploading(false)
    }
    
    setUploadMode('file')
  }

  const handleUrlChange = (url: string) => {
    setPreviewUrl(url)
    onUrlChange(url)
    setSelectedFile(null)
    setUploadMode('url')
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl('')
    setUploadError(null)
    onFileSelect(null)
    onUrlChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Label className="text-gray-700">{label}</Label>
      
      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          size="sm"
          variant={uploadMode === 'url' ? 'default' : 'outline'}
          onClick={() => setUploadMode('url')}
          className="text-xs"
        >
          URL
        </Button>
        <Button
          type="button"
          size="sm"
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          onClick={() => setUploadMode('file')}
          className="text-xs"
        >
          Upload
        </Button>
      </div>

      {uploadMode === 'url' ? (
        <div className="space-y-3">
          <Input
            value={previewUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder={placeholder}
            className="mt-1"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={uploading}
              className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
            />
            {selectedFile && !uploading && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {uploading && (
            <p className="text-sm text-blue-600">
              Uploading... Please wait.
            </p>
          )}
          {uploadError && (
            <p className="text-sm text-red-600">
              Error: {uploadError}
            </p>
          )}
          {selectedFile && !uploading && (
            <p className="text-sm text-gray-600">
              Uploaded: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="relative">
          <Label className="text-gray-700 text-sm mb-2 block">Preview</Label>
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
            <SafeImage
              src={previewUrl}
              alt="Preview"
              fill
              className="object-cover"
              fallback={
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Preview unavailable</div>
                  </div>
                </div>
              }
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={clearSelection}
              className="absolute top-2 right-2 bg-white/90 border-red-300 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
