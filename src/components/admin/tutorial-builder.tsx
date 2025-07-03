'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  PlayCircle, 
  FileText, 
  MousePointer,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface TutorialStep {
  id: string
  title: string
  description: string
  type: 'text' | 'video' | 'interactive' | 'media'
  content: string
  mediaUrl?: string
  actionRequired?: boolean
  completionTime?: number
  order: number
}

interface TutorialBuilderProps {
  challengeId: string
  initialSteps: TutorialStep[]
  settings: {
    enabled: boolean
    skipAllowed: boolean
    completionRequired: boolean
    estimatedTime: number
  }
  onSave: (steps: TutorialStep[], settings: any) => void
}

export function TutorialBuilder({ challengeId, initialSteps, settings, onSave }: TutorialBuilderProps) {
  const [steps, setSteps] = useState<TutorialStep[]>(initialSteps)
  const [tutorialSettings, setTutorialSettings] = useState(settings)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [currentPreviewStep, setCurrentPreviewStep] = useState(0)

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="w-4 h-4" />
      case 'video': return <PlayCircle className="w-4 h-4" />
      case 'interactive': return <MousePointer className="w-4 h-4" />
      case 'media': return <ImageIcon className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-100 text-blue-800'
      case 'video': return 'bg-red-100 text-red-800'
      case 'interactive': return 'bg-green-100 text-green-800'
      case 'media': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const addStep = () => {
    const newStep: TutorialStep = {
      id: `step-${Date.now()}`,
      title: 'New Tutorial Step',
      description: 'Add a description for this step',
      type: 'text',
      content: 'Enter your tutorial content here...',
      actionRequired: false,
      completionTime: 60,
      order: steps.length + 1
    }
    
    setSteps(prev => [...prev, newStep])
    setEditingStep(newStep.id)
  }

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId))
    if (editingStep === stepId) {
      setEditingStep(null)
    }
  }

  const updateStep = (stepId: string, field: keyof TutorialStep, value: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ))
  }

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const stepIndex = steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) return
    
    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1
    if (newIndex < 0 || newIndex >= steps.length) return
    
    const newSteps = [...steps]
    const [movedStep] = newSteps.splice(stepIndex, 1)
    newSteps.splice(newIndex, 0, movedStep)
    
    // Update order numbers
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }))
    
    setSteps(updatedSteps)
  }

  const calculateTotalTime = () => {
    return steps.reduce((total, step) => total + (step.completionTime || 0), 0)
  }

  const handleSave = () => {
    onSave(steps, tutorialSettings)
  }

  const renderStepEditor = (step: TutorialStep) => (
    <Card key={step.id} className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={getStepTypeColor(step.type)} variant="secondary">
              {getStepIcon(step.type)}
              {step.type}
            </Badge>
            <span className="font-medium">Step {step.order}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveStep(step.id, 'up')}
              disabled={step.order === 1}
            >
              <ArrowUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => moveStep(step.id, 'down')}
              disabled={step.order === steps.length}
            >
              <ArrowDown className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingStep(editingStep === step.id ? null : step.id)}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeStep(step.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={step.title}
              onChange={(e) => updateStep(step.id, 'title', e.target.value)}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={step.type}
              onValueChange={(value) => updateStep(step.id, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text Content</SelectItem>
                <SelectItem value="video">Video Tutorial</SelectItem>
                <SelectItem value="interactive">Interactive Element</SelectItem>
                <SelectItem value="media">Media Gallery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label>Description</Label>
          <Input
            value={step.description}
            onChange={(e) => updateStep(step.id, 'description', e.target.value)}
          />
        </div>
        
        <div>
          <Label>Content</Label>
          <Textarea
            value={step.content}
            onChange={(e) => updateStep(step.id, 'content', e.target.value)}
            rows={6}
            placeholder="Enter your tutorial content here. You can use HTML for formatting..."
          />
        </div>
        
        {step.type === 'video' || step.type === 'media' ? (
          <div>
            <Label>Media URL</Label>
            <Input
              value={step.mediaUrl || ''}
              onChange={(e) => updateStep(step.id, 'mediaUrl', e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
          </div>
        ) : null}
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={step.actionRequired || false}
              onCheckedChange={(checked: boolean) => updateStep(step.id, 'actionRequired', checked)}
            />
            <Label>Action Required</Label>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <Label>Est. Time (seconds)</Label>
            <Input
              type="number"
              value={step.completionTime || 60}
              onChange={(e) => updateStep(step.id, 'completionTime', parseInt(e.target.value) || 60)}
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderStepPreview = (step: TutorialStep, index: number) => (
    <Card key={step.id} className={`border ${index === currentPreviewStep ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStepIcon(step.type)}
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </div>
          <Badge variant="outline">
            Step {step.order} of {steps.length}
          </Badge>
        </div>
        <CardDescription>{step.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: step.content }} />
        </div>
        
        {step.mediaUrl && (
          <div className="mt-4">
            {step.type === 'video' ? (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-gray-400" />
                <span className="ml-2 text-gray-600">Video: {step.mediaUrl}</span>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
                <span className="ml-2 text-gray-600">Media: {step.mediaUrl}</span>
              </div>
            )}
          </div>
        )}
        
        {step.actionRequired && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Action Required</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              You must complete an action before proceeding to the next step.
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Est. {step.completionTime}s
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPreviewStep(index - 1)}
              >
                Previous
              </Button>
            )}
            {index < steps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentPreviewStep(index + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Tutorial
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tutorial Builder</h3>
          <p className="text-sm text-gray-600">Create interactive tutorials to guide users through the challenge</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button onClick={handleSave}>
            Save Tutorial
          </Button>
        </div>
      </div>

      {/* Tutorial Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Tutorial Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={tutorialSettings.enabled}
                onCheckedChange={(checked: boolean) => 
                  setTutorialSettings(prev => ({ ...prev, enabled: checked }))
                }
              />
              <Label>Enable Tutorial</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={tutorialSettings.skipAllowed}
                onCheckedChange={(checked: boolean) => 
                  setTutorialSettings(prev => ({ ...prev, skipAllowed: checked }))
                }
              />
              <Label>Allow Skipping</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={tutorialSettings.completionRequired}
                onCheckedChange={(checked: boolean) => 
                  setTutorialSettings(prev => ({ ...prev, completionRequired: checked }))
                }
              />
              <Label>Completion Required</Label>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>Total estimated time:</strong> {Math.round(calculateTotalTime() / 60)} minutes ({calculateTotalTime()} seconds)
          </div>
        </CardContent>
      </Card>

      {previewMode ? (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Tutorial Preview</h3>
            <p className="text-gray-600">This is how users will experience the tutorial</p>
          </div>
          
          {steps.length > 0 ? (
            renderStepPreview(steps[currentPreviewStep], currentPreviewStep)
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No tutorial steps created yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Tutorial Steps ({steps.length})</h4>
            <Button onClick={addStep}>
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </div>

          {steps.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No tutorial steps yet</h3>
                <p className="text-gray-600 mb-4">
                  Create interactive tutorial steps to help users understand the challenge
                </p>
                <Button onClick={addStep}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Step
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {steps
                .sort((a, b) => a.order - b.order)
                .map(step => renderStepEditor(step))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
