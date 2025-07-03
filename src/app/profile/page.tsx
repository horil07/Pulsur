'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Settings, 
  BarChart3, 
  Shield, 
  Save, 
  AlertCircle, 
  Check,
  Monitor,
  Smartphone,
  Tablet,
  Clock
} from 'lucide-react'
import { GuestAccessControl } from '@/components/ui/guest-access-control'
import { SafeImage } from '@/components/ui/safe-image'
import { pulsarTheme } from '@/lib/theme'

interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  profileComplete: boolean
  preferences?: {
    notifications: boolean
    publicProfile: boolean
    shareSubmissions: boolean
  }
  trafficSource?: string
  trafficMedium?: string
  trafficCampaign?: string
  createdAt: string
}

interface SessionData {
  sessionId: string
  deviceType: string
  startTime: string
  lastActivity: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
      fetchSessions()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data.recentSessions || [])
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
      console.error('Profile update error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show guest access control if not authenticated
  if (status !== 'loading' && !session?.user) {
    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 text-white p-4 pt-20">
          <div className="max-w-4xl mx-auto py-8">
            <GuestAccessControl action="view_profile" />
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 text-white flex items-center justify-center min-h-[60vh] pt-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-gradient-to-br from-red-500/10 via-black to-blue-500/10 text-white p-4 pt-20">
        <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-white/80">Manage your BeFollowed account and preferences</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {message.text}
          </div>
        )}

        {profile && (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-black/80 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                  <CardDescription className="text-white/80">
                    Update your profile information and avatar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 rounded-full overflow-hidden">
                      {session?.user?.image ? (
                        <SafeImage
                          src={session.user.image}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="h-8 w-8 text-white/60" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">{profile.name}</p>
                      <p className="text-white/60 text-sm">{profile.email}</p>
                      <Badge 
                        variant={profile.profileComplete ? "default" : "secondary"} 
                        className="mt-2"
                      >
                        {profile.profileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                      </Badge>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="name" className="text-white">Full Name</Label>
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-white/5 border-white/10 text-white/60"
                      />
                      <p className="text-xs text-white/60 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-white">Bio</Label>
                      <textarea
                        id="bio"
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell us about your riding style and interests..."
                        className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-white text-black hover:bg-white/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences">
              <Card className="bg-black/80 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Account Preferences</CardTitle>
                  <CardDescription className="text-white/80">
                    Customize your experience and notification settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-white font-medium">Email Notifications</p>
                        <p className="text-white/60 text-sm">Receive updates about new challenges and activities</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.preferences?.notifications || false}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            notifications: e.target.checked,
                            publicProfile: profile.preferences?.publicProfile || false,
                            shareSubmissions: profile.preferences?.shareSubmissions || false
                          }
                        })}
                        className="w-4 h-4 rounded border-white/20 bg-white/10"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-white font-medium">Public Profile</p>
                        <p className="text-white/60 text-sm">Make your profile visible to other users</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.preferences?.publicProfile || false}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            publicProfile: e.target.checked,
                            notifications: profile.preferences?.notifications || false,
                            shareSubmissions: profile.preferences?.shareSubmissions || false
                          }
                        })}
                        className="w-4 h-4 rounded border-white/20 bg-white/10"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <p className="text-white font-medium">Auto-share Submissions</p>
                        <p className="text-white/60 text-sm">Automatically share your submissions on social media</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={profile.preferences?.shareSubmissions || false}
                        onChange={(e) => setProfile({
                          ...profile,
                          preferences: {
                            ...profile.preferences,
                            shareSubmissions: e.target.checked,
                            notifications: profile.preferences?.notifications || false,
                            publicProfile: profile.preferences?.publicProfile || false
                          }
                        })}
                        className="w-4 h-4 rounded border-white/20 bg-white/10"
                      />
                    </label>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="w-full sm:w-auto bg-white text-black hover:bg-white/90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid gap-6">
                <Card className="bg-black/80 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Account Analytics</CardTitle>
                    <CardDescription className="text-white/80">
                      Your account statistics and traffic source information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm">Member Since</p>
                        <p className="text-white font-medium">{formatDate(profile.createdAt)}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm">Traffic Source</p>
                        <p className="text-white font-medium capitalize">{profile.trafficSource || 'Direct'}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p className="text-white/60 text-sm">Active Sessions</p>
                        <p className="text-white font-medium">{sessions.filter(s => new Date(s.lastActivity) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/80 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Sessions</CardTitle>
                    <CardDescription className="text-white/80">
                      Your recent login sessions and devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sessions.length > 0 ? sessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(session.deviceType)}
                            <div>
                              <p className="text-white text-sm font-medium capitalize">{session.deviceType || 'Desktop'}</p>
                              <p className="text-white/60 text-xs">{formatDate(session.startTime)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-white/60" />
                            <span className="text-white/60 text-xs">
                              {formatDate(session.lastActivity)}
                            </span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-white/60 text-sm text-center py-4">No recent sessions found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card className="bg-black/80 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Privacy & Data</CardTitle>
                  <CardDescription className="text-white/80">
                    Manage your privacy settings and data preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Data Collection</h4>
                      <p className="text-white/60 text-sm mb-3">
                        We collect minimal data to improve your experience. This includes your profile information, 
                        submissions, and basic analytics data.
                      </p>
                      <p className="text-white/60 text-sm">
                        Traffic Source: <span className="text-white">{profile.trafficSource || 'Direct'}</span>
                      </p>
                      {profile.trafficMedium && (
                        <p className="text-white/60 text-sm">
                          Medium: <span className="text-white">{profile.trafficMedium}</span>
                        </p>
                      )}
                      {profile.trafficCampaign && (
                        <p className="text-white/60 text-sm">
                          Campaign: <span className="text-white">{profile.trafficCampaign}</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Account Actions</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                          Download My Data
                        </Button>
                        <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        </div>
      </div>
    </div>
  )
}
