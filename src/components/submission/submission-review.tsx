"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Edit3,
  Eye,
  Send,
  ArrowLeft,
  Sparkles,
  Clock,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Star,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'content' | 'technical' | 'guidelines' | 'quality';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
  suggestion?: string;
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
  readinessLevel: 'not-ready' | 'needs-improvement' | 'good' | 'excellent';
}

interface SubmissionData {
  id?: string;
  title: string;
  description: string;
  content: string | File;
  type: 'image' | 'video' | 'audio' | 'text';
  challengeId: string;
  metadata: {
    duration?: number;
    resolution?: string;
    fileSize?: number;
    format?: string;
  };
}

interface SubmissionReviewProps {
  submission: SubmissionData;
  onEdit: (field: string, value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export default function SubmissionReview({
  submission,
  onEdit,
  onSubmit,
  onBack,
  isSubmitting = false
}: SubmissionReviewProps) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [showEditMode, setShowEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(submission.title);
  const [editedDescription, setEditedDescription] = useState(submission.description);

  const validateSubmission = useCallback(async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/submissions/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          userId: 'current-user' // This would come from session in real app
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setValidation(result.validation);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  }, [submission]);

  useEffect(() => {
    validateSubmission();
  }, [validateSubmission]);

  const handleEdit = (field: string, value: string) => {
    if (field === 'title') {
      setEditedTitle(value);
    } else if (field === 'description') {
      setEditedDescription(value);
    }
  };

  const saveEdits = () => {
    onEdit('title', editedTitle);
    onEdit('description', editedDescription);
    setShowEditMode(false);
    validateSubmission();
  };

  const cancelEdits = () => {
    setEditedTitle(submission.title);
    setEditedDescription(submission.description);
    setShowEditMode(false);
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'not-ready': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getReadinessIcon = (level: string) => {
    switch (level) {
      case 'excellent': return <Star className="h-5 w-5 text-green-600" />;
      case 'good': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'needs-improvement': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'not-ready': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {getContentIcon(submission.type)}
            <h1 className="text-2xl font-bold">Submission Review</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditMode(!showEditMode)}
            className="flex items-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {showEditMode ? 'Cancel Edit' : 'Edit Details'}
          </Button>
        </div>
      </div>

      {/* Validation Status */}
      {validation && (
        <Card className={`border-2 ${getReadinessColor(validation.readinessLevel)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getReadinessIcon(validation.readinessLevel)}
                <div>
                  <h3 className="font-semibold capitalize">
                    {validation.readinessLevel.replace('-', ' ')}
                  </h3>
                  <p className="text-sm opacity-75">
                    Quality Score: {validation.score}/100
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{validation.score}</div>
                <Progress value={validation.score} className="w-20 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Preview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Content Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Title
                </label>
                {showEditMode ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => handleEdit('title', e.target.value)}
                    placeholder="Enter submission title"
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{submission.title || 'No title provided'}</h3>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                {showEditMode ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => handleEdit('description', e.target.value)}
                    placeholder="Describe your submission"
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg min-h-[100px]">
                    <p className="text-gray-700">
                      {submission.description || 'No description provided'}
                    </p>
                  </div>
                )}
              </div>

              {/* Edit Actions */}
              {showEditMode && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={saveEdits} size="sm">
                    Save Changes
                  </Button>
                  <Button onClick={cancelEdits} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}

              {/* Content Display */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Content
                </label>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  {submission.type === 'image' && typeof submission.content === 'string' ? (
                    <img 
                      src={submission.content} 
                      alt="Submission content" 
                      className="max-w-full max-h-full rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      {getContentIcon(submission.type)}
                      <p className="mt-2 text-gray-500">
                        {submission.type.charAt(0).toUpperCase() + submission.type.slice(1)} Content
                      </p>
                      {submission.metadata.fileSize && (
                        <p className="text-sm text-gray-400">
                          {Math.round(submission.metadata.fileSize / (1024 * 1024) * 100) / 100} MB
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              {Object.keys(submission.metadata).length > 0 && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Technical Details
                  </label>
                  <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                    {submission.metadata.format && (
                      <div>
                        <span className="text-sm text-gray-600">Format:</span>
                        <span className="ml-2 font-medium">{submission.metadata.format.toUpperCase()}</span>
                      </div>
                    )}
                    {submission.metadata.duration && (
                      <div>
                        <span className="text-sm text-gray-600">Duration:</span>
                        <span className="ml-2 font-medium">{Math.round(submission.metadata.duration)}s</span>
                      </div>
                    )}
                    {submission.metadata.resolution && (
                      <div>
                        <span className="text-sm text-gray-600">Resolution:</span>
                        <span className="ml-2 font-medium">{submission.metadata.resolution}</span>
                      </div>
                    )}
                    {submission.metadata.fileSize && (
                      <div>
                        <span className="text-sm text-gray-600">File Size:</span>
                        <span className="ml-2 font-medium">
                          {Math.round(submission.metadata.fileSize / (1024 * 1024) * 100) / 100} MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Validation Results Sidebar */}
        <div className="space-y-6">
          {/* Validation Loading */}
          {isValidating && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  <span className="text-sm">Validating submission...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {validation && (
            <>
              {/* Issues */}
              {validation.issues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Issues Found</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {validation.issues.map((issue, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{issue.message}</p>
                          {issue.suggestion && (
                            <p className="text-xs text-gray-600 mt-1">{issue.suggestion}</p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {issue.category}
                            </Badge>
                            <Badge 
                              variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {issue.severity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {validation.suggestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {validation.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                        <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">{suggestion}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Submit Button */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Button
                  onClick={onSubmit}
                  disabled={
                    isSubmitting || 
                    (validation !== null && !validation.isValid) ||
                    (validation !== null && validation.readinessLevel === 'not-ready')
                  }
                  className="w-full flex items-center gap-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit Entry
                    </>
                  )}
                </Button>

                {validation && validation.readinessLevel === 'not-ready' && (
                  <p className="text-xs text-red-600 text-center">
                    Please fix all errors before submitting
                  </p>
                )}

                {validation && validation.readinessLevel === 'needs-improvement' && (
                  <p className="text-xs text-yellow-600 text-center">
                    Consider addressing warnings for better quality
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
