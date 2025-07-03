import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'

// Simple admin check
const isAdmin = (email: string) => {
  return email === 'testuser@example.com' || email.includes('admin')
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create filename with timestamp to avoid conflicts
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `${timestamp}${extension}`
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await writeFile(filepath, buffer)
    } catch (error) {
      // If directory doesn't exist, create it
      const fs = await import('fs')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
        await writeFile(filepath, buffer)
      } else {
        throw error
      }
    }

    // Return the public URL
    const publicUrl = `/uploads/${filename}`
    
    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: file.name
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
