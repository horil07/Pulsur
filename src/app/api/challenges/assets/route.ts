import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Admin check helper
const isAdmin = (email: string) => {
  return email === 'testuser@example.com' || email.includes('admin')
}

interface AssetUpload {
  id: string
  challengeId: string
  originalName: string
  fileName: string
  mimeType: string
  size: number
  url: string
  category: 'brand-guidelines' | 'templates' | 'inspiration' | 'technical' | 'legal'
  version: string
  description?: string
  required: boolean
  uploadedBy: string
  uploadedAt: string
}

// Mock storage - in production, this would integrate with cloud storage
const uploadedAssets: Record<string, AssetUpload> = {}

// Simulate file upload processing
const processFileUpload = async (file: File, challengeId: string, category: string): Promise<string> => {
  // In production, this would upload to S3, Cloudinary, etc.
  // For now, simulate with a mock URL
  const fileName = `${challengeId}/${category}/${uuidv4()}-${file.name}`
  return `/uploads/${fileName}`
}

// GET - List assets for a challenge
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const challengeId = searchParams.get('challengeId')
    const category = searchParams.get('category')
    
    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'Challenge ID is required' },
        { status: 400 }
      )
    }
    
    let assets = Object.values(uploadedAssets).filter(asset => asset.challengeId === challengeId)
    
    if (category) {
      assets = assets.filter(asset => asset.category === category)
    }
    
    // Sort by upload date (newest first)
    assets.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    
    return NextResponse.json({
      success: true,
      assets,
      totalCount: assets.length
    })
  } catch (error) {
    console.error('Failed to fetch challenge assets:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

// POST - Upload new asset (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const challengeId = formData.get('challengeId') as string
    const category = formData.get('category') as string
    const version = formData.get('version') as string || '1.0'
    const description = formData.get('description') as string
    const required = formData.get('required') === 'true'
    
    if (!file || !challengeId || !category) {
      return NextResponse.json(
        { success: false, error: 'File, challenge ID, and category are required' },
        { status: 400 }
      )
    }
    
    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 100MB limit' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'application/zip',
      'application/x-zip-compressed'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type' },
        { status: 400 }
      )
    }
    
    // Process file upload
    const fileUrl = await processFileUpload(file, challengeId, category)
    
    // Create asset record
    const assetId = uuidv4()
    const asset: AssetUpload = {
      id: assetId,
      challengeId,
      originalName: file.name,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      url: fileUrl,
      category: category as any,
      version,
      description,
      required,
      uploadedBy: session.user.email,
      uploadedAt: new Date().toISOString()
    }
    
    uploadedAssets[assetId] = asset
    
    return NextResponse.json({
      success: true,
      asset
    })
  } catch (error) {
    console.error('Failed to upload asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload asset' },
      { status: 500 }
    )
  }
}

// PATCH - Update asset metadata (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { assetId, updates } = await request.json()
    
    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      )
    }
    
    const asset = uploadedAssets[assetId]
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    // Update allowed fields
    const allowedUpdates = ['description', 'category', 'version', 'required']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key]
        return obj
      }, {})
    
    uploadedAssets[assetId] = {
      ...asset,
      ...filteredUpdates
    }
    
    return NextResponse.json({
      success: true,
      asset: uploadedAssets[assetId]
    })
  } catch (error) {
    console.error('Failed to update asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update asset' },
      { status: 500 }
    )
  }
}

// DELETE - Remove asset (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    
    if (!assetId) {
      return NextResponse.json(
        { success: false, error: 'Asset ID is required' },
        { status: 400 }
      )
    }
    
    const asset = uploadedAssets[assetId]
    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    // In production, also delete the file from storage
    delete uploadedAssets[assetId]
    
    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
