'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Cookie, Lock, Database, UserCheck } from 'lucide-react'
import { pulsarTheme } from '@/lib/theme'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 pt-20">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <div className="space-y-8">
            {/* Data Collection */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Database className="w-6 h-6 text-blue-400" />
                  Data We Collect
                </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Account Information</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Name, email address, and profile picture from OAuth providers</li>
                  <li>User-generated content including AI prompts and submissions</li>
                  <li>Voting activity and participation history</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Usage Data</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Pages visited and features used</li>
                  <li>Time spent on the platform</li>
                  <li>Device and browser information</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Eye className="w-6 h-6 text-green-400" />
                How We Use Your Data
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>Provide and improve our AI challenge platform</li>
                <li>Authenticate users and maintain account security</li>
                <li>Display user-generated content and voting results</li>
                <li>Send important updates about your account or the service</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Prevent fraud and ensure platform safety</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <UserCheck className="w-6 h-6 text-yellow-400" />
                Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your data only in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect the rights and safety of our users</li>
                <li>With service providers who help us operate the platform (under strict confidentiality agreements)</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-400" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Encrypted data transmission (HTTPS)</li>
                <li>Secure database storage with access controls</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data on a need-to-know basis</li>
              </ul>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Cookie className="w-6 h-6 text-orange-400" />
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep you logged in between sessions</li>
                <li>Remember your preferences</li>
                <li>Analyze site usage and performance</li>
                <li>Provide personalized features</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                You can control cookie settings through your browser, but some features may not work properly if cookies are disabled.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and associated data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of certain data processing activities</li>
              </ul>
              <p className="text-sm text-gray-400 mt-4">
                To exercise these rights, please contact us at privacy@aichallenge.hub
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-4 space-y-1">
                <p>Email: privacy@pulsar.com</p>
                <p>Subject: Privacy Policy Inquiry</p>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
