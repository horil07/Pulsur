/**
 * Mobile Authentication API
 * Handles mobile number registration and OTP verification
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateAndSendOtp, validateMobileNumber } from '@/lib/otp-utils'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/mobile/send-otp
 * Send OTP to mobile number for registration/login
 */
export async function POST(request: NextRequest) {
  try {
    const { mobile, purpose = 'LOGIN' } = await request.json()
    
    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 })
    }
    
    // Validate mobile number
    const validation = validateMobileNumber(mobile)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
    
    const formattedMobile = validation.formatted!
    
    // Check if user exists for LOGIN purpose
    let existingUser = null
    if (purpose === 'LOGIN') {
      existingUser = await prisma.user.findUnique({
        where: { mobile: formattedMobile }
      })
      
      if (!existingUser) {
        return NextResponse.json({ 
          error: 'Mobile number not registered. Please sign up first.',
          action: 'REGISTRATION_REQUIRED'
        }, { status: 404 })
      }
    }
    
    // Check if user already exists for REGISTRATION purpose
    if (purpose === 'REGISTRATION') {
      existingUser = await prisma.user.findUnique({
        where: { mobile: formattedMobile }
      })
      
      if (existingUser) {
        return NextResponse.json({ 
          error: 'Mobile number already registered. Please login instead.',
          action: 'LOGIN_REQUIRED'
        }, { status: 409 })
      }
    }
    
    // Generate and send OTP
    const result = await generateAndSendOtp(
      formattedMobile, 
      purpose as 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET' | 'MOBILE_VERIFICATION', 
      existingUser?.id
    )
    
    if (!result.success) {
      return NextResponse.json({ 
        error: result.error,
        rateLimited: result.rateLimited 
      }, { status: result.rateLimited ? 429 : 500 })
    }
    
    // Track analytics (simplified for now)
    console.log('📊 OTP Analytics:', { mobile: formattedMobile, purpose, cost: result.cost })
    
    return NextResponse.json({
      success: true,
      otpId: result.otpId,
      expiresAt: result.expiresAt,
      message: `OTP sent to ${formattedMobile}`,
      cost: result.cost
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
