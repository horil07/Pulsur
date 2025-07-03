'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, AlertTriangle, Scale, Shield, Users, Gavel } from 'lucide-react'
import { pulsarTheme } from '@/lib/theme'

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 pt-20">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          {/* Header */}
          <header className="text-center mb-16">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Terms & Conditions
            </h1>
            <p className="text-xl text-white/70 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <div className="space-y-8">
            {/* Acceptance */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Scale className="w-6 h-6 text-blue-400" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white/70 space-y-4">
                <p>
                  By accessing and using Pulsar (&quot;the Platform&quot;), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
                <p>
                  These terms apply to all visitors, users, and others who access or use the Platform.
                </p>
              </CardContent>
            </Card>

            {/* Platform Rules */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-400" />
                  Platform Rules
                </CardTitle>
              </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Acceptable Use</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use the Platform for its intended purpose of AI-generated content challenges</li>
                  <li>Respect other users and maintain a positive community environment</li>
                  <li>Submit original content or properly attribute sources</li>
                  <li>Follow all applicable laws and regulations</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Prohibited Activities</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Submitting offensive, harmful, or inappropriate content</li>
                  <li>Attempting to manipulate voting or gaming the system</li>
                  <li>Harassing or threatening other users</li>
                  <li>Uploading malicious code or attempting to compromise security</li>
                  <li>Creating multiple accounts to gain unfair advantages</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Content */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-yellow-400" />
                User-Generated Content
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Your Content Rights</h4>
                <p>You retain ownership of any intellectual property rights in content you submit to the Platform.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">License to Platform</h4>
                <p>
                  By submitting content, you grant AI Challenge Hub a worldwide, non-exclusive, royalty-free license to use, 
                  display, and distribute your content on the Platform for the purpose of operating the service.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Content Responsibility</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>You are solely responsible for content you submit</li>
                  <li>Content must not infringe on others&apos; intellectual property rights</li>
                  <li>We reserve the right to remove content that violates these terms</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Account Responsibilities */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Account Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <ul className="list-disc list-inside space-y-2">
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>One account per person - multiple accounts are not permitted</li>
              </ul>
            </CardContent>
          </Card>

          {/* Platform Availability */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Platform Availability</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>
                We strive to provide continuous access to the Platform, but we do not guarantee uninterrupted service. 
                The Platform may be temporarily unavailable due to:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Scheduled maintenance and updates</li>
                <li>Technical difficulties or server issues</li>
                <li>Force majeure events beyond our control</li>
              </ul>
              <p>
                We will make reasonable efforts to provide advance notice of planned downtime when possible.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>
                AI Challenge Hub is provided &quot;as is&quot; without any warranties, express or implied. 
                To the fullest extent permitted by law, we disclaim all warranties and shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Any direct, indirect, incidental, or consequential damages</li>
                <li>Loss of data, profits, or business opportunities</li>
                <li>User-generated content or interactions between users</li>
                <li>Technical issues or platform unavailability</li>
              </ul>
              <p className="text-sm text-yellow-300">
                Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, 
                so some of the above limitations may not apply to you.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-3">
                <Gavel className="w-6 h-6 text-orange-400" />
                Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Your Right to Terminate</h4>
                <p>You may terminate your account at any time by contacting us or using account deletion features in the Platform.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Our Right to Terminate</h4>
                <p>
                  We may suspend or terminate your account immediately, without prior notice, for any reason, including:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Violation of these Terms & Conditions</li>
                  <li>Fraudulent or illegal activity</li>
                  <li>Harm to other users or the Platform</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70 space-y-4">
              <p>
                We reserve the right to modify these terms at any time. We will notify users of significant changes by:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Posting updates on this page</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying prominent notices on the Platform</li>
              </ul>
              <p>
                Your continued use of the Platform after changes take effect constitutes acceptance of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-white/70">
              <p>If you have questions about these Terms & Conditions, please contact us:</p>
              <div className="mt-4 space-y-1">
                <p>Email: legal@aichallenge.hub</p>
                <p>Subject: Terms & Conditions Inquiry</p>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                These terms constitute the entire agreement between you and AI Challenge Hub regarding the use of the Platform.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
