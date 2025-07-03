/**
 * Mobile OTP Authentication Component
 * Handles mobile number input and OTP verification flow
 */

'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, MessageSquare, Shield, CheckCircle } from 'lucide-react'

interface MobileAuthProps {
  onSuccess: (user: { id: string; mobile: string; name?: string; profileComplete: boolean }) => void
  onError: (error: string) => void
  mode: 'registration' | 'login'
  className?: string
}

interface OtpState {
  otpId: string
  expiresAt: Date
  mobile: string
}

export default function MobileAuth({ onSuccess, onError, mode, className = '' }: MobileAuthProps) {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [otpState, setOtpState] = useState<OtpState | null>(null)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false) // Prevent double submissions

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Format mobile number for display
  const formatMobileDisplay = (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, '')
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`
    }
    return mobile
  }

  // Validate mobile number
  const validateMobile = (mobile: string) => {
    const cleaned = mobile.replace(/\D/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15
  }

  // Send OTP
  const sendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!validateMobile(mobile)) {
      setError('Please enter a valid mobile number')
      return
    }

    if (loading) return // Prevent double submissions

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/mobile/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          purpose: mode === 'registration' ? 'REGISTRATION' : 'LOGIN'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.action === 'REGISTRATION_REQUIRED') {
          setError('Mobile number not registered. Please sign up first.')
        } else if (data.action === 'LOGIN_REQUIRED') {
          setError('Mobile number already registered. Please login instead.')
        } else {
          setError(data.error || 'Failed to send OTP')
        }
        return
      }

      setOtpState({
        otpId: data.otpId,
        expiresAt: new Date(data.expiresAt),
        mobile: mobile
      })
      
      setStep('otp')
      setCountdown(600) // 10 minutes
      
      console.log('📱 OTP sent successfully')
    } catch (error) {
      console.error('Send OTP error:', error)
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP
  const verifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!otpState || !otp) {
      setError('Please enter the OTP')
      return
    }

    if (isVerifying || loading) return // Prevent double submissions

    setLoading(true)
    setIsVerifying(true)
    setError('')

    try {
      console.log('🔄 Verifying OTP...', { otpId: otpState.otpId, purpose: mode === 'registration' ? 'REGISTRATION' : 'LOGIN' })
      
      const response = await fetch('/api/auth/mobile/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otpId: otpState.otpId,
          otpCode: otp,
          purpose: mode === 'registration' ? 'REGISTRATION' : 'LOGIN'
        })
      })

      const data = await response.json()
      console.log('📱 OTP verification response:', { status: response.status, data })

      if (!response.ok) {
        // Handle case where OTP was already used/expired
        if (response.status === 400 && data.error?.includes('Invalid OTP')) {
          setError('OTP has expired or already been used. Please request a new one.')
          // Reset to mobile step to get fresh OTP
          setTimeout(() => {
            goBack()
          }, 2000)
        } else {
          setError(data.error || 'Invalid OTP')
        }
        return
      }

      // Trigger NextAuth sign-in with mobile credentials
      if (data.authCredentials) {
        console.log('🔄 Creating NextAuth session...', data.authCredentials)
        
        const result = await signIn('mobile', {
          userId: data.authCredentials.userId,
          mobile: data.authCredentials.mobile,
          redirect: false
        })

        console.log('🔐 NextAuth sign-in result:', result)

        if (result?.ok) {
          console.log('✅ Mobile authentication successful with session')
          // Clear OTP state immediately to prevent reuse
          setOtpState(null)
          setOtp('')
          onSuccess(data.user)
        } else {
          console.error('❌ NextAuth sign-in failed:', result?.error)
          setError('Failed to create session. Please try again.')
        }
      } else {
        // Fallback to direct success callback
        console.log('✅ Mobile authentication successful (fallback)')
        // Clear OTP state immediately to prevent reuse
        setOtpState(null)
        setOtp('')
        onSuccess(data.user)
      }
    } catch (error) {
      console.error('❌ Verify OTP error:', error)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
      setIsVerifying(false)
    }
  }

  // Resend OTP
  const resendOtp = async () => {
    if (countdown > 0) return
    await sendOtp()
  }

  // Go back to mobile input
  const goBack = () => {
    setStep('mobile')
    setOtp('')
    setOtpState(null)
    setError('')
    setIsVerifying(false)
    setLoading(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {step === 'mobile' ? (
            <MessageSquare className="w-12 h-12 text-blue-600" />
          ) : (
            <Shield className="w-12 h-12 text-green-600" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {step === 'mobile' ? 'Enter Mobile Number' : 'Verify OTP'}
        </CardTitle>
        <CardDescription>
          {step === 'mobile' 
            ? `Enter your mobile number to ${mode === 'registration' ? 'sign up' : 'login'}`
            : `Enter the 6-digit code sent to ${formatMobileDisplay(otpState?.mobile || '')}`
          }
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'mobile' ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="mobile" className="text-sm font-medium">
                Mobile Number
              </label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onKeyDown={(e) => {
                  // Submit on Enter if mobile is valid
                  if (e.key === 'Enter' && validateMobile(mobile) && !loading) {
                    e.preventDefault()
                    sendOtp(e)
                  }
                }}
                className="text-lg"
                disabled={loading}
                autoComplete="tel"
              />
              <p className="text-xs text-gray-500">
                Format: +91XXXXXXXXXX or 10-digit number
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !mobile}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Send OTP
            </Button>
          </form>
        ) : (
          <>
            <form onSubmit={verifyOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">
                  Verification Code
                </label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => {
                    // Submit on Enter if OTP is complete
                    if (e.key === 'Enter' && otp.length === 6 && !loading && !isVerifying) {
                      e.preventDefault()
                      verifyOtp(e)
                    }
                  }}
                  className="text-lg text-center tracking-widest"
                  disabled={loading || isVerifying}
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                {countdown > 0 && (
                  <p className="text-xs text-gray-500 text-center">
                    Code expires in {formatTime(countdown)}
                  </p>
                )}
                <p className="text-xs text-blue-400 text-center">
                  💡 Master OTP: Use &quot;000000&quot; to bypass verification
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || isVerifying || otp.length !== 6}
                className="w-full"
              >
                {loading || isVerifying ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>

            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={loading || isVerifying}
                className="text-sm"
              >
                ← Change Number
              </Button>

              <Button
                variant="ghost"
                onClick={resendOtp}
                disabled={loading || isVerifying || countdown > 0}
                className="text-sm"
              >
                {countdown > 0 ? `Resend in ${formatTime(countdown)}` : 'Resend OTP'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
