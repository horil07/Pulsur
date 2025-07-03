'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trophy, Star, Save, Plus, X } from 'lucide-react'
import { WinnerAnnouncementDialog } from './winner-announcement-dialog'

interface Winner {
  id: string
  position: number
  userId: string
  submissionId: string
  prize: string
  feedback?: string
}

interface WinnerManagementProps {
  challengeId: string
  challenge: Challenge
  onUpdate: () => void
}

interface Challenge {
  id: string
  title: string
  status: string
  participants: number
}

interface Submission {
  id: string
  title: string
  user: {
    name: string
  }
}

export function WinnerManagement({ challengeId, challenge, onUpdate }: WinnerManagementProps) {
  const [winners, setWinners] = useState<Winner[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddWinner, setShowAddWinner] = useState(false)
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false)

  // Form for adding new winner
  const [newWinner, setNewWinner] = useState({
    position: 1,
    submissionId: '',
    prize: '',
    feedback: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch winners for this challenge
      const winnersResponse = await fetch(`/api/challenges/${challengeId}/winners`)
      if (winnersResponse.ok) {
        const winnersData = await winnersResponse.json()
        setWinners(winnersData.winners || [])
      }

      // Fetch submissions for this challenge
      const submissionsResponse = await fetch(`/api/submissions?challengeId=${challengeId}`)
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json()
        setSubmissions(submissionsData.submissions || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [challengeId, fetchData])

  const addWinner = async () => {
    if (!newWinner.submissionId || !newWinner.prize) {
      alert('Please select a submission and enter a prize')
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/challenges/${challengeId}/winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWinner)
      })

      if (response.ok) {
        const data = await response.json()
        setWinners(prev => [...prev, data.winner])
        setNewWinner({
          position: Math.max(...winners.map(w => w.position), 0) + 1,
          submissionId: '',
          prize: '',
          feedback: ''
        })
        setShowAddWinner(false)
        onUpdate()
      } else {
        alert('Failed to add winner')
      }
    } catch (error) {
      console.error('Failed to add winner:', error)
      alert('Failed to add winner')
    } finally {
      setSaving(false)
    }
  }

  const removeWinner = async (winnerId: string) => {
    if (!confirm('Are you sure you want to remove this winner?')) return

    try {
      const response = await fetch(`/api/challenges/${challengeId}/winners`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerId })
      })

      if (response.ok) {
        setWinners(prev => prev.filter(w => w.id !== winnerId))
        onUpdate()
      } else {
        alert('Failed to remove winner')
      }
    } catch (error) {
      console.error('Failed to remove winner:', error)
      alert('Failed to remove winner')
    }
  }

  const announceWinners = async () => {
    if (winners.length === 0) {
      alert('No winners to announce')
      return
    }

    setShowAnnouncementDialog(true)
  }

  if (loading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading winner data...</p>
        </CardContent>
      </Card>
    )
  }

  const getSubmissionById = (id: string) => submissions.find(s => s.id === id)
  const availableSubmissions = submissions.filter(s => !winners.some(w => w.submissionId === s.id))

  return (
    <div className="space-y-6">
      {/* Challenge Status */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Winner Management
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage winners for: {challenge?.title}
              </CardDescription>
            </div>
            <Badge variant={challenge?.status === 'WINNERS_ANNOUNCED' ? 'default' : 'secondary'}>
              {challenge?.status?.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{winners.length}</div>
              <div className="text-sm text-gray-600">Winners Selected</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{challenge?.participants || 0}</div>
              <div className="text-sm text-gray-600">Participants</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Winners */}
      {winners.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Current Winners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {winners.sort((a, b) => a.position - b.position).map((winner) => {
              const submission = getSubmissionById(winner.submissionId)
              return (
                <div key={winner.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="default" className="bg-yellow-500 text-black">
                        #{winner.position}
                      </Badge>
                      <div>
                        <h4 className="text-gray-900 font-medium">{submission?.title || 'Unknown Submission'}</h4>
                        <p className="text-sm text-gray-600">by {submission?.user?.name || 'Unknown User'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        {winner.prize}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeWinner(winner.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {winner.feedback && (
                    <p className="text-sm text-gray-600 italic">{winner.feedback}</p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Add Winner */}
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-900">Add Winner</CardTitle>
            <Button
              onClick={() => setShowAddWinner(!showAddWinner)}
              variant="outline"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Winner
            </Button>
          </div>
        </CardHeader>
        {showAddWinner && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Position</Label>
                <Input
                  type="number"
                  min="1"
                  value={newWinner.position}
                  onChange={(e) => setNewWinner(prev => ({ ...prev, position: parseInt(e.target.value) || 1 }))}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label className="text-gray-700">Prize</Label>
                <Input
                  value={newWinner.prize}
                  onChange={(e) => setNewWinner(prev => ({ ...prev, prize: e.target.value }))}
                  placeholder="e.g., $1,000, Gold Medal, etc."
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Submission</Label>
              <Select 
                value={newWinner.submissionId} 
                onValueChange={(value) => setNewWinner(prev => ({ ...prev, submissionId: value }))}
              >
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Select winning submission" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubmissions.map((submission) => (
                    <SelectItem key={submission.id} value={submission.id}>
                      {submission.title} - by {submission.user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-700">Feedback (Optional)</Label>
              <Textarea
                value={newWinner.feedback}
                onChange={(e) => setNewWinner(prev => ({ ...prev, feedback: e.target.value }))}
                placeholder="Judge's feedback or comments..."
                className="bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={addWinner}
                disabled={saving || !newWinner.submissionId || !newWinner.prize}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Add Winner
              </Button>
              <Button
                onClick={() => setShowAddWinner(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Announce Winners */}
      {winners.length > 0 && challenge?.status !== 'WINNERS_ANNOUNCED' && (
        <Card className="border shadow-sm border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 font-medium mb-1">Ready to Announce Winners?</h3>
                <p className="text-gray-600 text-sm">
                  This will notify all participants and update the challenge status.
                </p>
              </div>
              <Button
                onClick={announceWinners}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Announce Winners
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Winner Announcement Dialog */}
      <WinnerAnnouncementDialog
        isOpen={showAnnouncementDialog}
        onOpenChange={setShowAnnouncementDialog}
        challengeId={challengeId}
        challengeTitle={challenge?.title || ''}
        winnersCount={winners.length}
        onComplete={onUpdate}
      />
    </div>
  )
}
