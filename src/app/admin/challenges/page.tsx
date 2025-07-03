'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit3, Trophy, Calendar, Users, ArrowLeft, Save, Trash2, Crown, Settings } from 'lucide-react'
import { FileUpload } from '@/components/ui/file-upload'
import { WinnerManagement } from '@/components/admin/winner-management'
import { DynamicChallengeConfig } from '@/components/admin/dynamic-challenge-config'

interface Challenge {
  id: string
  title: string
  description: string
  image: string
  topPrize: string
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ANNOUNCED' | 'WINNERS_ANNOUNCED'
  participants: number
  startDate: string
  endDate: string
  winnersAnnouncedDate?: string
  category: string
  assignment: string
  prizing: string[]
  objective: string
  deliverables: string[]
  attachments: string[]
  createdAt: string
}

export default function AdminChallengesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [configuringChallenge, setConfiguringChallenge] = useState<Challenge | null>(null)

  // Form state for creating/editing challenges
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    topPrize: '',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    winnersAnnouncedDate: '',
    category: '',
    assignment: '',
    prizing: [''],
    objective: '',
    deliverables: [''],
    attachments: ['']
  })

  // State for notifications
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)

  // Show notification helper
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Simple admin check
  const isAdmin = session?.user?.email === 'testuser@example.com' || 
                  session?.user?.email?.includes('admin')

  useEffect(() => {
    if (!mounted) return
    
    if (!session) {
      router.push('/')
      return
    }

    if (!isAdmin) {
      router.push('/')
      return
    }

    fetchChallenges()
  }, [mounted, session, isAdmin, router])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      // Fetch from API
      const response = await fetch('/api/challenges')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data.challenges || [])
      } else {
        // Fallback to mock data for development
        const mockChallenges: Challenge[] = [
          {
            id: '1',
            title: 'Digital Dreams',
            description: 'Create stunning digital artwork that captures the essence of cyberpunk aesthetics',
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
            topPrize: '$2,500',
            status: 'OPEN',
            participants: 234,
            startDate: '2024-11-01',
            endDate: '2024-12-31',
            category: 'AI Artwork',
            assignment: 'Create stunning digital artwork that captures the essence of cyberpunk aesthetics with a holiday twist',
            prizing: ['1st Place: $2,500', '2nd Place: $1,000', '3rd Place: $500'],
            objective: 'Showcase creative AI artwork capabilities',
            deliverables: ['High-res digital artwork', 'Creative description'],
            attachments: ['Style Guide PDF'],
            createdAt: '2024-11-01T10:00:00Z'
          },
          {
            id: '2',
            title: 'Neon Synthwave',
            description: 'Compose original synthwave music with AI assistance',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
            topPrize: '$1,800',
            status: 'OPEN',
            participants: 156,
            startDate: '2024-10-15',
            endDate: '2024-12-25',
            category: 'AI Music',
            assignment: 'Create an original synthwave track that captures the nostalgic feel of the 80s',
            prizing: ['1st Place: $1,800', '2nd Place: $900', '3rd Place: $300'],
            objective: 'Produce high-quality synthwave compositions',
            deliverables: ['Complete track (3+ minutes)', 'Audio file (WAV/FLAC)'],
            attachments: ['Music Style Guide'],
            createdAt: '2024-10-15T14:00:00Z'
          }
        ]
        setChallenges(mockChallenges)
      }
    } catch (error) {
      console.error('Failed to fetch challenges:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }))
  }

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], '']
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      topPrize: '',
      status: 'DRAFT',
      startDate: '',
      endDate: '',
      winnersAnnouncedDate: '',
      category: '',
      assignment: '',
      prizing: [''],
      objective: '',
      deliverables: [''],
      attachments: ['']
    })
    setEditingChallenge(null)
  }

  const handleSaveChallenge = async () => {
    try {
      setSaving(true)
      // Validation
      if (!formData.title || !formData.description || !formData.topPrize) {
        alert('Please fill in all required fields')
        return
      }

      const challengeData = {
        ...formData,
        prizing: formData.prizing.filter(p => p.trim() !== ''),
        deliverables: formData.deliverables.filter(d => d.trim() !== ''),
        attachments: formData.attachments.filter(a => a.trim() !== '')
      }

      if (editingChallenge) {
        // Update existing challenge
        const response = await fetch('/api/challenges', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingChallenge.id, ...challengeData })
        })

        if (response.ok) {
          const data = await response.json()
          setChallenges(prev => prev.map(c => c.id === editingChallenge.id ? data.challenge : c))
          showNotification('success', 'Challenge updated successfully')
        } else {
          throw new Error('Failed to update challenge')
        }
      } else {
        // Create new challenge
        const response = await fetch('/api/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(challengeData)
        })

        if (response.ok) {
          const data = await response.json()
          setChallenges(prev => [data.challenge, ...prev])
          showNotification('success', 'Challenge created successfully')
        } else {
          throw new Error('Failed to create challenge')
        }
      }

      resetForm()
      setActiveTab('overview')
    } catch (error) {
      console.error('Failed to save challenge:', error)
      alert('Failed to save challenge')
    } finally {
      setSaving(false)
    }
  }

  const handleEditChallenge = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      image: challenge.image,
      topPrize: challenge.topPrize,
      status: challenge.status,
      startDate: challenge.startDate,
      endDate: challenge.endDate,
      winnersAnnouncedDate: challenge.winnersAnnouncedDate || '',
      category: challenge.category,
      assignment: challenge.assignment,
      prizing: challenge.prizing,
      objective: challenge.objective,
      deliverables: challenge.deliverables,
      attachments: challenge.attachments
    })
    setEditingChallenge(challenge)
    setActiveTab('create')
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      try {
        const response = await fetch(`/api/challenges?id=${challengeId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setChallenges(prev => prev.filter(c => c.id !== challengeId))
          showNotification('success', 'Challenge deleted successfully')
        } else {
          throw new Error('Failed to delete challenge')
        }
      } catch (error) {
        console.error('Failed to delete challenge:', error)
        alert('Failed to delete challenge')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      case 'OPEN':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'CLOSED':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'ANNOUNCED':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'WINNERS_ANNOUNCED':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  // Prevent rendering until mounted and authenticated
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/admin')}
              variant="ghost"
              className="text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Challenge Management
              </h1>
              <p className="text-gray-600">Create and manage platform challenges</p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setActiveTab('create')
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-white border">
            <TabsTrigger 
              value="overview"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="create"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              {editingChallenge ? 'Edit' : 'Create'}
            </TabsTrigger>
            <TabsTrigger 
              value="configure"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </TabsTrigger>
            <TabsTrigger 
              value="winners"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Winners
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <Card className="text-center py-16 border shadow-sm">
                <CardContent>
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-gray-900 mb-2">No challenges yet</CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Create your first challenge to get started
                  </CardDescription>
                  <Button 
                    onClick={() => {
                      resetForm()
                      setActiveTab('create')
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {challenges.map((challenge) => (
                  <Card key={challenge.id} className="border shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-gray-900 text-xl">
                              {challenge.title}
                            </CardTitle>
                            <Badge className={`${getStatusColor(challenge.status)} border`}>
                              {challenge.status}
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-600 mb-4">
                            {challenge.description}
                          </CardDescription>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                              {challenge.topPrize}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-blue-500" />
                              {challenge.participants} participants
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              Ends: {new Date(challenge.endDate).toLocaleDateString()}
                            </div>
                            <div className="text-gray-600">
                              Category: {challenge.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button
                            onClick={() => handleEditChallenge(challenge)}
                            size="sm"
                            variant="outline"
                            className="border-blue-300 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setConfiguringChallenge(challenge)
                              setActiveTab('configure')
                            }}
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedChallenge(challenge)
                              setActiveTab('winners')
                            }}
                            size="sm"
                            variant="outline"
                            className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                          >
                            <Crown className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteChallenge(challenge.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create/Edit Tab */}
          <TabsContent value="create" className="mt-8">
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900">
                  {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Fill in the details below to {editingChallenge ? 'update' : 'create'} a challenge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700">Challenge Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter challenge title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Top Prize *</Label>
                    <Input
                      value={formData.topPrize}
                      onChange={(e) => handleInputChange('topPrize', e.target.value)}
                      placeholder="e.g., $2,500"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Description *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the challenge"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-gray-700">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI Artwork">AI Artwork</SelectItem>
                        <SelectItem value="AI Music">AI Music</SelectItem>
                        <SelectItem value="AI Writing">AI Writing</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Pixel Art">Pixel Art</SelectItem>
                        <SelectItem value="Writing">Writing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="ANNOUNCED">Announced</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="WINNERS_ANNOUNCED">Winners Announced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FileUpload
                      onFileSelect={() => {}} // File is auto-uploaded, URL is set via onUrlChange
                      onUrlChange={(url) => handleInputChange('image', url)}
                      currentUrl={formData.image}
                      accept="image/*"
                      label="Challenge Image"
                      placeholder="Enter image URL or upload file"
                    />
                  </div>
                </div>

                {/* Date Fields */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-gray-700">Start Date</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">End Date</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700">Winners Announced (Optional)</Label>
                    <Input
                      type="date"
                      value={formData.winnersAnnouncedDate}
                      onChange={(e) => handleInputChange('winnersAnnouncedDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Detailed Content */}
                <div>
                  <Label className="text-gray-700">Assignment Description</Label>
                  <Textarea
                    value={formData.assignment}
                    onChange={(e) => handleInputChange('assignment', e.target.value)}
                    placeholder="Detailed assignment description for participants"
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-gray-700">Objective</Label>
                  <Textarea
                    value={formData.objective}
                    onChange={(e) => handleInputChange('objective', e.target.value)}
                    placeholder="What should participants achieve?"
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Dynamic Arrays */}
                <div>
                  <Label className="text-gray-700">Prize Structure</Label>
                  <div className="space-y-3">
                    {formData.prizing.map((prize, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={prize}
                          onChange={(e) => handleArrayInputChange('prizing', index, e.target.value)}
                          placeholder={`${index + 1}st Place: $Amount + Description`}
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                        <Button
                          onClick={() => removeArrayItem('prizing', index)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => addArrayItem('prizing')}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Prize
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Deliverables</Label>
                  <div className="space-y-3">
                    {formData.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={deliverable}
                          onChange={(e) => handleArrayInputChange('deliverables', index, e.target.value)}
                          placeholder="What participants need to submit"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                        <Button
                          onClick={() => removeArrayItem('deliverables', index)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => addArrayItem('deliverables')}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Deliverable
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700">Attachments (Optional)</Label>
                  <div className="space-y-3">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={attachment}
                          onChange={(e) => handleArrayInputChange('attachments', index, e.target.value)}
                          placeholder="Attachment name or URL"
                          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        />
                        <Button
                          onClick={() => removeArrayItem('attachments', index)}
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => addArrayItem('attachments')}
                      size="sm"
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Attachment
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    onClick={handleSaveChallenge}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : null}
                    <Save className="w-4 h-4 mr-2" />
                    {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                  </Button>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configure Tab */}
          <TabsContent value="configure" className="mt-8">
            {configuringChallenge ? (
              <DynamicChallengeConfig
                challengeId={configuringChallenge.id}
                onSave={(config) => {
                  console.log('Configuration saved:', config)
                  setConfiguringChallenge(null)
                  setActiveTab('overview')
                  showNotification('success', 'Challenge configuration saved successfully')
                }}
                onCancel={() => {
                  setConfiguringChallenge(null)
                  setActiveTab('overview')
                }}
              />
            ) : (
              <Card className="border shadow-sm">
                <CardContent className="py-16 text-center">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-gray-900 mb-2">Select a Challenge to Configure</CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Choose a challenge from the overview tab to configure its dynamic settings, assets, tutorials, and validation rules
                  </CardDescription>
                  <Button
                    onClick={() => setActiveTab('overview')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Go to Overview
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Winners Tab */}
          <TabsContent value="winners" className="mt-8">
            {selectedChallenge ? (
              <WinnerManagement
                challengeId={selectedChallenge.id}
                challenge={selectedChallenge}
                onUpdate={fetchChallenges}
              />
            ) : (
              <Card className="border shadow-sm text-center py-16">
                <CardContent>
                  <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-gray-900 mb-2">Select a Challenge</CardTitle>
                  <CardDescription className="text-gray-600 mb-6">
                    Choose a challenge from the overview tab to manage its winners
                  </CardDescription>
                  <Button
                    onClick={() => setActiveTab('overview')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Go to Overview
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success' 
              ? 'bg-green-500/90 text-white border border-green-400' 
              : 'bg-red-500/90 text-white border border-red-400'
          }`}>
            <div className="flex items-center">
              <div className="flex-1">{notification.message}</div>
              <button 
                onClick={() => setNotification(null)}
                className="ml-2 text-white/80 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
