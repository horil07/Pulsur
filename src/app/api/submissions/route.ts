import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, title, caption, contentUrl, prompt } = await request.json()

    if (!type || !title || !contentUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, title, contentUrl' 
      }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: session.user.email },
          { id: session.user.id }
        ]
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || '',
          image: session.user.image || '',
          provider: 'google', // Default, would be determined by auth provider
          providerId: session.user.email, // Use email as fallback for provider ID
        }
      })
    }

    // If challengeId is provided, we'll handle challenge validation later
    // For now, focusing on R37 implementation

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        type,
        title,
        caption: caption || '',
        contentUrl,
        prompt: prompt || '',
        status: 'PENDING', // All submissions require approval
      }
    })

    return NextResponse.json({ 
      success: true, 
      submissionId: submission.id 
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const filter = searchParams.get('filter') || 'all'
    const sort = searchParams.get('sort') || 'recent'
    const status = searchParams.get('status') || 'APPROVED' // Default to approved for public gallery
    const search = searchParams.get('search') || '' // R37.2: Search functionality
    const mediaType = searchParams.get('mediaType') || 'all' // R37.1: Media type filtering

    const skip = (page - 1) * limit

    const whereClause: any = { 
      status: status.toUpperCase() as 'PENDING' | 'APPROVED' | 'REJECTED'
    }
    
    // R37.1: Enhanced content type filtering with media type distinction
    if (filter !== 'all') {
      if (filter === 'audio') {
        whereClause.type = 'AI_SONG' // Audio content
      } else if (filter === 'video') {
        whereClause.type = 'UPLOAD_REEL' // Video content
      } else if (filter === 'image') {
        whereClause.type = { in: ['AI_ARTWORK', 'UPLOAD_ARTWORK'] } // Image content
      } else {
        whereClause.type = filter.toUpperCase()
      }
    }

    // Additional media type filtering
    if (mediaType !== 'all') {
      if (mediaType === 'audio') {
        whereClause.type = 'AI_SONG'
      } else if (mediaType === 'video') {
        whereClause.type = 'UPLOAD_REEL'
      } else if (mediaType === 'image') {
        whereClause.type = { in: ['AI_ARTWORK', 'UPLOAD_ARTWORK'] }
      }
    }

    // R37.2: Search functionality across multiple fields
    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search } },
        { caption: { contains: search } },
        { prompt: { contains: search } }
      ]
    }

    // R37.3: Enhanced sorting options
    let orderByClause: any
    switch (sort) {
      case 'popular':
        orderByClause = { voteCount: 'desc' }
        break
      case 'oldest':
        orderByClause = { createdAt: 'asc' }
        break
      case 'trending':
        // Trending = high votes in recent time (last 7 days weighted)
        // For simplicity, we'll use a combination of recent + popular
        orderByClause = [
          { voteCount: 'desc' },
          { createdAt: 'desc' }
        ]
        break
      case 'random':
        // PostgreSQL/SQLite doesn't have native random in Prisma
        // We'll handle this differently by shuffling results
        orderByClause = { createdAt: 'desc' }
        break
      case 'recent':
      default:
        orderByClause = { createdAt: 'desc' }
        break
    }

    // Get current user for vote status
    let currentUser = null
    if (session?.user?.email) {
      currentUser = await prisma.user.findFirst({
        where: { 
          OR: [
            { email: session.user.email },
            { id: session.user.id }
          ]
        }
      })
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            votes: true
          }
        },
        votes: currentUser ? {
          where: { userId: currentUser.id },
          select: { id: true }
        } : false
      }
    })

    // R37.3: Handle random sorting by shuffling results
    let finalSubmissions = submissions
    if (sort === 'random') {
      finalSubmissions = [...submissions].sort(() => Math.random() - 0.5)
    }

    // Transform the response to include voteCount and hasVoted status
    const transformedSubmissions = finalSubmissions.map(submission => ({
      ...submission,
      voteCount: submission._count.votes,
      hasVoted: currentUser ? submission.votes.length > 0 : false,
      _count: undefined,
      votes: undefined
    }))

    const total = await prisma.submission.count({ where: whereClause })

    return NextResponse.json({
      submissions: transformedSubmissions,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      // R37: Include filter and search metadata
      filters: {
        applied: {
          filter,
          sort,
          search: search || null,
          mediaType
        },
        available: {
          filters: ['all', 'ai_artwork', 'ai_song', 'upload_artwork', 'upload_reel', 'audio', 'video', 'image'],
          sorts: ['recent', 'popular', 'oldest', 'trending', 'random'],
          mediaTypes: ['all', 'audio', 'video', 'image']
        }
      }
    })
  } catch (error) {
    console.error('Submissions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
