/**
 * OTP Utilities and Security Functions
 */

import crypto from 'crypto'
import { prisma } from './prisma'
import { otpService } from './otp-service'

export interface OtpGenerationResult {
  success: boolean
  otpId?: string
  expiresAt?: Date
  error?: string
  rateLimited?: boolean
  cost?: number
}

export interface OtpVerificationResult {
  success: boolean
  userId?: string
  error?: string
  attemptsRemaining?: number
  lockedUntil?: Date
}

/**
 * Generate a secure OTP code
 */
export function generateOtpCode(length: number = 6): string {
  const digits = '0123456789'
  let otp = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(digits.length)
    otp += digits[randomIndex]
  }
  
  return otp
}

/**
 * Hash OTP for secure storage
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

/**
 * Validate mobile number format
 */
export function validateMobileNumber(mobile: string): { valid: boolean; formatted?: string; error?: string } {
  // Remove all non-digit characters
  const cleaned = mobile.replace(/\D/g, '')
  
  // Check length (10-15 digits is typical range)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return {
      valid: false,
      error: 'Mobile number must be between 10-15 digits'
    }
  }
  
  // Add + prefix if not present and format
  const formatted = cleaned.startsWith('91') ? `+${cleaned}` : `+91${cleaned}`
  
  return {
    valid: true,
    formatted
  }
}

/**
 * Check rate limiting for OTP requests
 */
export async function checkOtpRateLimit(mobile: string): Promise<{ allowed: boolean; remainingTime?: number }> {
  const config = otpService.getConfig()
  const windowStart = new Date(Date.now() - config.rateLimitWindow * 60 * 1000)
  
  const recentAttempts = await prisma.otpVerification.count({
    where: {
      mobile,
      createdAt: {
        gte: windowStart
      }
    }
  })
  
  if (recentAttempts >= config.rateLimitMaxAttempts) {
    const oldestAttempt = await prisma.otpVerification.findFirst({
      where: {
        mobile,
        createdAt: {
          gte: windowStart
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    if (oldestAttempt) {
      const remainingTime = Math.ceil(
        (oldestAttempt.createdAt.getTime() + config.rateLimitWindow * 60 * 1000 - Date.now()) / 1000
      )
      
      return {
        allowed: false,
        remainingTime: Math.max(0, remainingTime)
      }
    }
  }
  
  return { allowed: true }
}

/**
 * Generate and send OTP
 */
export async function generateAndSendOtp(
  mobile: string, 
  purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET' | 'MOBILE_VERIFICATION',
  userId?: string
): Promise<OtpGenerationResult> {
  try {
    // Validate mobile number
    const mobileValidation = validateMobileNumber(mobile)
    if (!mobileValidation.valid) {
      return {
        success: false,
        error: mobileValidation.error
      }
    }
    
    const formattedMobile = mobileValidation.formatted!
    
    // Check rate limiting
    const rateLimit = await checkOtpRateLimit(formattedMobile)
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Too many OTP requests. Try again in ${Math.ceil((rateLimit.remainingTime || 0) / 60)} minutes.`,
        rateLimited: true
      }
    }
    
    // Generate OTP
    const otpCode = generateOtpCode()
    const hashedOtp = hashOtp(otpCode)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    // Send OTP via service
    const sendResult = await otpService.sendOtp(formattedMobile, otpCode, purpose)
    if (!sendResult.success) {
      return {
        success: false,
        error: sendResult.error || 'Failed to send OTP'
      }
    }
    
    // Store OTP in database
    const otpRecord = await prisma.otpVerification.create({
      data: {
        userId,
        mobile: formattedMobile,
        otp: hashedOtp,
        purpose,
        expiresAt,
        maxAttempts: 3
      }
    })
    
    return {
      success: true,
      otpId: otpRecord.id,
      expiresAt,
      cost: sendResult.cost
    }
  } catch (error) {
    console.error('OTP generation error:', error)
    return {
      success: false,
      error: 'Failed to generate OTP'
    }
  }
}

/**
 * Verify OTP code
 */
export async function verifyOtp(
  otpId: string,
  otpCode: string
): Promise<OtpVerificationResult> {
  try {
    // Find OTP record
    const otpRecord = await prisma.otpVerification.findUnique({
      where: { id: otpId },
      include: { user: true }
    })
    
    if (!otpRecord) {
      return {
        success: false,
        error: 'Invalid OTP request'
      }
    }
    
    // Check if already verified
    if (otpRecord.verifiedAt) {
      return {
        success: false,
        error: 'OTP already used'
      }
    }
    
    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return {
        success: false,
        error: 'OTP expired'
      }
    }
    
    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return {
        success: false,
        error: 'Maximum attempts exceeded'
      }
    }
    
    // Master OTP bypass: Accept 000000 as valid OTP in all environments
    const isMasterOtpBypass = otpCode === '000000'
    
    // Verify OTP
    const hashedInput = hashOtp(otpCode)
    const isValid = hashedInput === otpRecord.otp || isMasterOtpBypass
    
    // Update attempts (but don't count master OTP bypass as an attempt)
    await prisma.otpVerification.update({
      where: { id: otpId },
      data: {
        attempts: isMasterOtpBypass ? otpRecord.attempts : otpRecord.attempts + 1,
        verifiedAt: isValid ? new Date() : undefined
      }
    })
    
    if (!isValid) {
      const attemptsRemaining = otpRecord.maxAttempts - (otpRecord.attempts + 1)
      return {
        success: false,
        error: 'Invalid OTP',
        attemptsRemaining: Math.max(0, attemptsRemaining)
      }
    }
    
    // Log when master OTP bypass is used
    if (isMasterOtpBypass) {
      console.log('🔓 Master OTP bypass used (000000)')
    }
    
    return {
      success: true,
      userId: otpRecord.userId || undefined
    }
  } catch (error) {
    console.error('OTP verification error:', error)
    return {
      success: false,
      error: 'Failed to verify OTP'
    }
  }
}

/**
 * Clean up expired OTP records
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const result = await prisma.otpVerification.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  
  return result.count
}
