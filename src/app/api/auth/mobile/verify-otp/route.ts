/**
 * Mobile OTP Verification API
 * Verifies OTP and handles mobile authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyOtp } from '@/lib/otp-utils'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/auth/mobile/verify-otp
 * Verify OTP and create/login user
 */
export async function POST(request: NextRequest) {
  try {
    const { otpId, otpCode, purpose = 'LOGIN' } = await request.json()
    
    if (!otpId || !otpCode) {
      return NextResponse.json({ error: 'OTP ID and code are required' }, { status: 400 })
    }
    
    // Get the OTP record first to check if it exists
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { id: otpId },
      include: { user: true }
    })
    
    if (!otpRecord) {
      return NextResponse.json({ 
        error: 'Invalid OTP or OTP has already been used',
        code: 'OTP_NOT_FOUND'
      }, { status: 400 })
    }
    
    // Verify OTP
    const verificationResult = await verifyOtp(otpId, otpCode)
    
    if (!verificationResult.success) {
      return NextResponse.json({ 
        error: verificationResult.error,
        attemptsRemaining: verificationResult.attemptsRemaining,
        code: 'OTP_VERIFICATION_FAILED'
      }, { status: 400 })
    }
    
    let user = otpRecord.user
    
    // Handle different purposes
    if (purpose === 'REGISTRATION' && !user) {
      // Create new user for registration
      user = await prisma.user.create({
        data: {
          mobile: otpRecord.mobile,
          provider: 'mobile',
          mobileVerified: new Date(),
          profileComplete: false,
          trafficSource: 'direct' // Can be enhanced with actual tracking
        }
      })
      
      console.log('✅ New user created via mobile registration:', user.id)
    } else if (purpose === 'LOGIN' && user) {
      // Update last login for existing user
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          mobileVerified: new Date() // Refresh verification
        }
      })
      
      console.log('✅ User logged in via mobile:', user.id)
    } else if (purpose === 'MOBILE_VERIFICATION' && user) {
      // Update mobile verification status
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          mobileVerified: new Date()
        }
      })
      
      console.log('✅ Mobile number verified for user:', user.id)
    } else {
      return NextResponse.json({ 
        error: 'Invalid purpose or user state',
        code: 'INVALID_PURPOSE'
      }, { status: 400 })
    }
    
    // Clean up used OTP immediately to prevent reuse
    await prisma.otpVerification.delete({
      where: { id: otpId }
    })

    console.log('✅ OTP verification successful and cleaned up:', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        profileComplete: user.profileComplete,
        mobileVerified: !!user.mobileVerified
      },
      // Return credentials for NextAuth sign-in
      authCredentials: {
        userId: user.id,
        mobile: user.mobile
      },
      message: 'Mobile verification successful'
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    
    // Handle Prisma unique constraint errors (OTP already deleted)
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'OTP has already been used or expired',
        code: 'OTP_ALREADY_USED'
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to verify OTP',
      code: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}

/**
 * GET /api/auth/mobile/verify-otp
 * Get OTP verification status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        mobile: true,
        mobileVerified: true,
        profileComplete: true
      }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    return NextResponse.json({
      user: {
        id: user.id,
        mobile: user.mobile,
        mobileVerified: !!user.mobileVerified,
        profileComplete: user.profileComplete
      }
    })
  } catch (error) {
    console.error('Mobile verification status error:', error)
    return NextResponse.json({ error: 'Failed to get verification status' }, { status: 500 })
  }
}
