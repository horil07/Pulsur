/**
 * OTP Service Provider Interface
 * Supports multiple OTP providers with brand-specific configuration
 */

export interface OtpProvider {
  sendOtp(mobile: string, otp: string, purpose: string): Promise<OtpResult>
  getDeliveryStatus?(messageId: string): Promise<DeliveryStatus>
  getCostEstimate?(mobile: string): Promise<number>
}

export interface OtpResult {
  success: boolean
  messageId?: string
  error?: string
  cost?: number
}

export interface DeliveryStatus {
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  timestamp: Date
  error?: string
}

export interface OtpConfig {
  provider: 'twilio' | 'aws-sns' | 'brand-custom' | 'mock'
  apiKey?: string
  apiSecret?: string
  senderId?: string
  templateId?: string
  maxRetries: number
  rateLimitWindow: number // minutes
  rateLimitMaxAttempts: number
}

/**
 * Mock OTP Provider for development/testing
 */
export class MockOtpProvider implements OtpProvider {
  async sendOtp(mobile: string, otp: string, _purpose: string): Promise<OtpResult> {
    console.log(`📱 Mock OTP sent to ${mobile}: ${otp} (Purpose: ${_purpose})`)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      cost: 0.01
    }
  }
  
  async getDeliveryStatus(_messageId: string): Promise<DeliveryStatus> {
    return {
      status: 'delivered',
      timestamp: new Date()
    }
  }
  
  async getCostEstimate(_mobile: string): Promise<number> {
    return 0.01
  }
}

/**
 * Brand Custom OTP Provider
 * Placeholder for brand-specific OTP service integration
 */
export class BrandCustomOtpProvider implements OtpProvider {
  constructor(private config: OtpConfig) {}
  
  async sendOtp(mobile: string, otp: string, purpose: string): Promise<OtpResult> {
    // TODO: Implement brand-specific OTP service integration
    // This will be configured based on the brand team's preferred provider
    
    console.log(`🏢 Brand OTP service called for ${mobile}`)
    
    try {
      // Placeholder for brand API call
      const response = await fetch(process.env.BRAND_OTP_ENDPOINT || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          mobile,
          message: `Your verification code is: ${otp}`,
          senderId: this.config.senderId,
          templateId: this.config.templateId
        })
      })
      
      if (!response.ok) {
        throw new Error(`Brand OTP API error: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      return {
        success: true,
        messageId: result.messageId,
        cost: result.cost || 0.05
      }
    } catch (error) {
      console.error('Brand OTP service error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * OTP Service Factory
 */
export class OtpService {
  private provider: OtpProvider
  private config: OtpConfig
  
  constructor() {
    this.config = {
      provider: (process.env.OTP_PROVIDER as 'twilio' | 'aws-sns' | 'brand-custom' | 'mock') || 'mock',
      apiKey: process.env.OTP_API_KEY,
      apiSecret: process.env.OTP_API_SECRET,
      senderId: process.env.OTP_SENDER_ID || 'PULSAR',
      templateId: process.env.OTP_TEMPLATE_ID,
      maxRetries: parseInt(process.env.OTP_MAX_RETRIES || '3'),
      rateLimitWindow: parseInt(process.env.OTP_RATE_LIMIT_WINDOW || '60'),
      rateLimitMaxAttempts: parseInt(process.env.OTP_RATE_LIMIT_MAX_ATTEMPTS || '5')
    }
    
    this.provider = this.createProvider()
  }
  
  private createProvider(): OtpProvider {
    switch (this.config.provider) {
      case 'brand-custom':
        return new BrandCustomOtpProvider(this.config)
      case 'mock':
      default:
        return new MockOtpProvider()
    }
  }
  
  async sendOtp(mobile: string, otp: string, purpose: string): Promise<OtpResult> {
    return this.provider.sendOtp(mobile, otp, purpose)
  }
  
  getConfig(): OtpConfig {
    return { ...this.config }
  }
}

// Singleton instance
export const otpService = new OtpService()
