import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Simple admin check - in production, you'd want proper role-based auth
const isAdmin = (email: string) => {
  return email === 'testuser@example.com' || email.includes('admin')
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    
    const statusFilter = status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED'

    const submissions = await prisma.submission.findMany({
      where: { status: statusFilter },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error('Admin submissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || !isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const submission = await prisma.submission.update({
      where: { id },
      data: { 
        status
      }
    })

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error('Admin submission update error:', error)
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 })
  }
}
