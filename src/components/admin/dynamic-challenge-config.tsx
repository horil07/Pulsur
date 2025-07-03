'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Trash2, 
  Save, 
  Upload, 
  FileText, 
  Settings, 
  AlertCircle,
  CheckCircle,
  PlayCircle,
  BookOpen
} from 'lucide-react'

interface ValidationRule {
  field: string
  type: 'required' | 'format' | 'size' | 'custom'
  value?: any
  message?: string
  severity: 'error' | 'warning' | 'info'
}

interface ContentRequirement {
  type: 'image' | 'video' | 'audio' | 'text' | 'any'
  formats: string[]
  maxSize: number
  minResolution?: string
  maxDuration?: number
  requiredFields: string[]
}

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

interface AssetConfiguration {
  id: string
  name: string
  description: string
  type: 'document' | 'image' | 'video' | 'audio' | 'archive'
  url: string
  size: number
  version: string
  category: 'brand-guidelines' | 'templates' | 'inspiration' | 'technical' | 'legal'
  required: boolean
}

interface ChallengeConfiguration {
  challengeId: string
  assets: AssetConfiguration[]
  tutorials: {
    enabled: boolean
    steps: TutorialStep[]
    skipAllowed: boolean
    completionRequired: boolean
    estimatedTime: number
  }
  validationRules: ValidationRule[]
  contentRequirements: ContentRequirement[]
  qualityThresholds: {
    minimumScore: number
    requirePreview: boolean
    autoReject: boolean
  }
  submissionLimits: {
    maxPerUser: number
    maxFileSize: number
    allowedTypes: string[]
  }
}

interface DynamicChallengeConfigProps {
  challengeId: string
  onSave: (config: ChallengeConfiguration) => void
  onCancel: () => void
}

export function DynamicChallengeConfig({ challengeId, onSave, onCancel }: DynamicChallengeConfigProps) {
  const [config, setConfig] = useState<ChallengeConfiguration>({
    challengeId,
    assets: [],
    tutorials: {
      enabled: true,
      steps: [],
      skipAllowed: false,
      completionRequired: true,
      estimatedTime: 300
    },
    validationRules: [],
    contentRequirements: [],
    qualityThresholds: {
      minimumScore: 70,
      requirePreview: true,
      autoReject: false
    },
    submissionLimits: {
      maxPerUser: 3,
      maxFileSize: 104857600, // 100MB
      allowedTypes: ['image', 'video']
    }
  })
  
  const [activeTab, setActiveTab] = useState('assets')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Load existing configuration
  useEffect(() => {
    const loadConfiguration = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/challenges/configuration?challengeId=${challengeId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.configuration) {
            setConfig(data.configuration)
          }
        }
      } catch (error) {
        console.error('Failed to load configuration:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadConfiguration()
  }, [challengeId])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/challenges/configuration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      
      if (response.ok) {
        const data = await response.json()
        onSave(data.configuration)
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const addValidationRule = () => {
    const newRule: ValidationRule = {
      field: 'title',
      type: 'required',
      message: 'This field is required',
      severity: 'error'
    }
    
    setConfig(prev => ({
      ...prev,
      validationRules: [...prev.validationRules, newRule]
    }))
  }

  const removeValidationRule = (index: number) => {
    setConfig(prev => ({
      ...prev,
      validationRules: prev.validationRules.filter((_, i) => i !== index)
    }))
  }

  const updateValidationRule = (index: number, field: keyof ValidationRule, value: any) => {
    setConfig(prev => ({
      ...prev,
      validationRules: prev.validationRules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }))
  }

  const addContentRequirement = () => {
    const newRequirement: ContentRequirement = {
      type: 'image',
      formats: ['jpg', 'png'],
      maxSize: 52428800, // 50MB
      requiredFields: ['title', 'description']
    }
    
    setConfig(prev => ({
      ...prev,
      contentRequirements: [...prev.contentRequirements, newRequirement]
    }))
  }

  const removeContentRequirement = (index: number) => {
    setConfig(prev => ({
      ...prev,
      contentRequirements: prev.contentRequirements.filter((_, i) => i !== index)
    }))
  }

  const addTutorialStep = () => {
    const newStep: TutorialStep = {
      id: `step-${Date.now()}`,
      title: 'New Tutorial Step',
      description: 'Step description',
      type: 'text',
      content: 'Step content goes here',
      actionRequired: false,
      completionTime: 60,
      order: config.tutorials.steps.length + 1
    }
    
    setConfig(prev => ({
      ...prev,
      tutorials: {
        ...prev.tutorials,
        steps: [...prev.tutorials.steps, newStep]
      }
    }))
  }

  const removeTutorialStep = (index: number) => {
    setConfig(prev => ({
      ...prev,
      tutorials: {
        ...prev.tutorials,
        steps: prev.tutorials.steps.filter((_, i) => i !== index)
      }
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dynamic Challenge Configuration</h2>
          <p className="text-gray-600">Configure assets, tutorials, and validation rules for this challenge</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Validation
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Challenge Assets (R35.1)
              </CardTitle>
              <CardDescription>
                Manage downloadable assets and resources for this challenge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Asset management interface would go here</p>
                  <p className="text-sm text-gray-500">Upload files, organize by category, version control</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {config.assets.map((asset, index) => (
                    <Card key={asset.id} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{asset.name}</h4>
                            <p className="text-xs text-gray-500">{asset.description}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {asset.category}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>v{asset.version}</span>
                          <span>{(asset.size / 1024 / 1024).toFixed(1)}MB</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutorials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Interactive Tutorial System (R35.2)
              </CardTitle>
              <CardDescription>
                Create step-by-step tutorials to guide users through the challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.tutorials.enabled}
                      onCheckedChange={(checked: boolean) => 
                        setConfig(prev => ({
                          ...prev,
                          tutorials: { ...prev.tutorials, enabled: checked }
                        }))
                      }
                    />
                    <Label>Enable Tutorial</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.tutorials.completionRequired}
                      onCheckedChange={(checked: boolean) => 
                        setConfig(prev => ({
                          ...prev,
                          tutorials: { ...prev.tutorials, completionRequired: checked }
                        }))
                      }
                    />
                    <Label>Completion Required</Label>
                  </div>
                </div>
                <Button onClick={addTutorialStep} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {config.tutorials.steps.map((step, index) => (
                  <Card key={step.id} className="border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Step {index + 1}: {step.title}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTutorialStep(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title</Label>
                          <Input
                            value={step.title}
                            onChange={(e) => {
                              setConfig(prev => ({
                                ...prev,
                                tutorials: {
                                  ...prev.tutorials,
                                  steps: prev.tutorials.steps.map((s, i) => 
                                    i === index ? { ...s, title: e.target.value } : s
                                  )
                                }
                              }))
                            }}
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={step.type}
                            onValueChange={(value) => {
                              setConfig(prev => ({
                                ...prev,
                                tutorials: {
                                  ...prev.tutorials,
                                  steps: prev.tutorials.steps.map((s, i) => 
                                    i === index ? { ...s, type: value as any } : s
                                  )
                                }
                              }))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="interactive">Interactive</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Content</Label>
                        <Textarea
                          value={step.content}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              tutorials: {
                                ...prev.tutorials,
                                steps: prev.tutorials.steps.map((s, i) => 
                                  i === index ? { ...s, content: e.target.value } : s
                                )
                              }
                            }))
                          }}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Submission Validation Rules (R35.3)
              </CardTitle>
              <CardDescription>
                Define validation rules and content requirements for submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Validation Rules</h4>
                  <Button onClick={addValidationRule} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {config.validationRules.map((rule, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">Field</Label>
                          <Input
                            value={rule.field}
                            onChange={(e) => updateValidationRule(index, 'field', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Type</Label>
                          <Select
                            value={rule.type}
                            onValueChange={(value) => updateValidationRule(index, 'type', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="required">Required</SelectItem>
                              <SelectItem value="format">Format</SelectItem>
                              <SelectItem value="size">Size</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Severity</Label>
                          <Select
                            value={rule.severity}
                            onValueChange={(value) => updateValidationRule(index, 'severity', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="error">Error</SelectItem>
                              <SelectItem value="warning">Warning</SelectItem>
                              <SelectItem value="info">Info</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Message</Label>
                          <Input
                            value={rule.message || ''}
                            onChange={(e) => updateValidationRule(index, 'message', e.target.value)}
                            className="h-8"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeValidationRule(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Content Requirements</h4>
                  <Button onClick={addContentRequirement} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {config.contentRequirements.map((req, index) => (
                    <Card key={index} className="border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">{req.type}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeContentRequirement(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-xs">Formats</Label>
                            <p className="text-gray-600">{req.formats.join(', ')}</p>
                          </div>
                          <div>
                            <Label className="text-xs">Max Size</Label>
                            <p className="text-gray-600">{Math.round(req.maxSize / 1024 / 1024)}MB</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general challenge settings and limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Max Submissions per User</Label>
                  <Input
                    type="number"
                    value={config.submissionLimits.maxPerUser}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        submissionLimits: {
                          ...prev.submissionLimits,
                          maxPerUser: parseInt(e.target.value) || 0
                        }
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={Math.round(config.submissionLimits.maxFileSize / 1024 / 1024)}
                    onChange={(e) => 
                      setConfig(prev => ({
                        ...prev,
                        submissionLimits: {
                          ...prev.submissionLimits,
                          maxFileSize: (parseInt(e.target.value) || 0) * 1024 * 1024
                        }
                      }))
                    }
                  />
                </div>
              </div>
              
              <div>
                <Label>Quality Threshold</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.qualityThresholds.minimumScore}
                  onChange={(e) => 
                    setConfig(prev => ({
                      ...prev,
                      qualityThresholds: {
                        ...prev.qualityThresholds,
                        minimumScore: parseInt(e.target.value) || 0
                      }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.qualityThresholds.requirePreview}
                    onCheckedChange={(checked: boolean) => 
                      setConfig(prev => ({
                        ...prev,
                        qualityThresholds: {
                          ...prev.qualityThresholds,
                          requirePreview: checked
                        }
                      }))
                    }
                  />
                  <Label>Require Preview</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.qualityThresholds.autoReject}
                    onCheckedChange={(checked: boolean) => 
                      setConfig(prev => ({
                        ...prev,
                        qualityThresholds: {
                          ...prev.qualityThresholds,
                          autoReject: checked
                        }
                      }))
                    }
                  />
                  <Label>Auto-reject Low Quality</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
