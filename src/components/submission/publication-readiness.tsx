"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Star,
  Shield,
  Eye,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react';

interface ReadinessCheck {
  category: string;
  name: string;
  status: 'passed' | 'warning' | 'failed' | 'checking';
  score: number;
  message: string;
  details?: string;
  impact: 'low' | 'medium' | 'high';
}

interface ReadinessAssessment {
  overallScore: number;
  readinessLevel: 'not-ready' | 'needs-improvement' | 'good' | 'excellent';
  estimatedEngagement: number;
  projectedViews: number;
  qualityRating: number;
  checks: ReadinessCheck[];
  recommendations: string[];
}

interface PublicationReadinessProps {
  submissionData: {
    title: string;
    description: string;
    type: string;
    metadata: Record<string, unknown>;
    challengeId: string;
  };
  onReadinessChange?: (assessment: ReadinessAssessment) => void;
}

export default function PublicationReadiness({
  submissionData,
  onReadinessChange
}: PublicationReadinessProps) {
  const [assessment, setAssessment] = useState<ReadinessAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);

  const generateRecommendations = (checks: ReadinessCheck[], data: { title: string; description: string }): string[] => {
    const recommendations: string[] = [];

    const failedChecks = checks.filter(check => check.status === 'failed');
    const warningChecks = checks.filter(check => check.status === 'warning');

    if (failedChecks.length > 0) {
      recommendations.push('Address critical issues before publishing');
    }

    if (data.title.length < 20) {
      recommendations.push('Consider adding more descriptive keywords to your title');
    }

    if (data.description.length < 100) {
      recommendations.push('Expand your description to provide more context and improve engagement');
    }

    if (warningChecks.some(check => check.name === 'Performance Optimization')) {
      recommendations.push('Optimize file size for better loading performance');
    }

    if (warningChecks.some(check => check.name === 'Trend Alignment')) {
      recommendations.push('Consider incorporating current trending elements or themes');
    }

    // Add general recommendations
    recommendations.push('Preview your submission from a viewer perspective');
    recommendations.push('Ensure your content tells a compelling story');

    return recommendations.slice(0, 5);
  };

  const assessPublicationReadiness = useCallback(async () => {
    setIsAssessing(true);
    
    try {
      // Simulate API call for readiness assessment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const checks: ReadinessCheck[] = [
        // Content Quality Checks
        {
          category: 'Content Quality',
          name: 'Title Optimization',
          status: submissionData.title.length >= 10 ? 'passed' : 'warning',
          score: Math.min(100, (submissionData.title.length / 50) * 100),
          message: submissionData.title.length >= 10 
            ? 'Title is well-optimized for engagement'
            : 'Title could be more descriptive',
          details: `Current length: ${submissionData.title.length} characters`,
          impact: 'high'
        },
        {
          category: 'Content Quality',
          name: 'Description Depth',
          status: submissionData.description.length >= 50 ? 'passed' : 'warning',
          score: Math.min(100, (submissionData.description.length / 200) * 100),
          message: submissionData.description.length >= 50
            ? 'Description provides good context'
            : 'Description needs more detail',
          details: `Current length: ${submissionData.description.length} characters`,
          impact: 'medium'
        },
        {
          category: 'Content Quality',
          name: 'Content Originality',
          status: 'passed',
          score: 85 + Math.random() * 15,
          message: 'Content appears to be original',
          details: 'No similar content detected in recent submissions',
          impact: 'high'
        },
        
        // Technical Quality Checks
        {
          category: 'Technical Quality',
          name: 'Format Compliance',
          status: 'passed',
          score: 95,
          message: 'Content meets technical requirements',
          details: 'File format and specifications are optimal',
          impact: 'medium'
        },
        {
          category: 'Technical Quality',
          name: 'Performance Optimization',
          status: (submissionData.metadata.fileSize as number) && (submissionData.metadata.fileSize as number) > 10485760 ? 'warning' : 'passed',
          score: submissionData.metadata.fileSize ? Math.max(50, 100 - ((submissionData.metadata.fileSize as number) / 10485760) * 50) : 90,
          message: (submissionData.metadata.fileSize as number) && (submissionData.metadata.fileSize as number) > 10485760
            ? 'File size may affect loading performance'
            : 'Content is optimized for fast loading',
          details: submissionData.metadata.fileSize 
            ? `File size: ${Math.round((submissionData.metadata.fileSize as number) / 1048576 * 100) / 100} MB`
            : 'Size optimization verified',
          impact: 'medium'
        },
        
        // Engagement Potential Checks
        {
          category: 'Engagement Potential',
          name: 'Visual Appeal',
          status: 'passed',
          score: 78 + Math.random() * 20,
          message: 'Content has strong visual appeal',
          details: 'Composition and visual elements are engaging',
          impact: 'high'
        },
        {
          category: 'Engagement Potential',
          name: 'Trend Alignment',
          status: Math.random() > 0.3 ? 'passed' : 'warning',
          score: 65 + Math.random() * 30,
          message: Math.random() > 0.3 
            ? 'Content aligns with current trends'
            : 'Consider incorporating trending elements',
          details: 'Analysis based on current platform trends',
          impact: 'medium'
        },
        
        // Compliance Checks
        {
          category: 'Compliance',
          name: 'Community Guidelines',
          status: 'passed',
          score: 100,
          message: 'Fully compliant with community guidelines',
          details: 'Content meets all platform standards',
          impact: 'high'
        },
        {
          category: 'Compliance',
          name: 'Challenge Relevance',
          status: 'passed',
          score: 88 + Math.random() * 12,
          message: 'Content strongly aligns with challenge theme',
          details: 'Demonstrates clear understanding of challenge requirements',
          impact: 'high'
        }
      ];

      // Calculate overall metrics
      const overallScore = Math.round(
        checks.reduce((sum, check) => sum + check.score, 0) / checks.length
      );

      const readinessLevel = 
        overallScore >= 90 ? 'excellent' :
        overallScore >= 75 ? 'good' :
        overallScore >= 60 ? 'needs-improvement' : 'not-ready';

      const estimatedEngagement = Math.round(
        (overallScore / 100) * (50 + Math.random() * 100)
      );

      const projectedViews = Math.round(
        (overallScore / 100) * (200 + Math.random() * 500)
      );

      const qualityRating = Math.round(overallScore / 20);

      // Generate recommendations
      const recommendations = generateRecommendations(checks, submissionData);

      const newAssessment: ReadinessAssessment = {
        overallScore,
        readinessLevel,
        estimatedEngagement,
        projectedViews,
        qualityRating,
        checks,
        recommendations
      };

      setAssessment(newAssessment);
      onReadinessChange?.(newAssessment);
      
    } catch (error) {
      console.error('Assessment failed:', error);
    } finally {
      setIsAssessing(false);
    }
  }, [submissionData, onReadinessChange]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'checking': return <Clock className="h-4 w-4 text-gray-500 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReadinessLevelStyle = (level: string) => {
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
      case 'excellent': return <Star className="h-6 w-6 text-green-600" />;
      case 'good': return <CheckCircle className="h-6 w-6 text-blue-600" />;
      case 'needs-improvement': return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
      case 'not-ready': return <AlertTriangle className="h-6 w-6 text-red-600" />;
      default: return <Clock className="h-6 w-6 text-gray-600" />;
    }
  };

  useEffect(() => {
    assessPublicationReadiness();
  }, [assessPublicationReadiness]);

  if (isAssessing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-pulse" />
            <span>Assessing Publication Readiness...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assessment) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Overall Assessment */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Publication Readiness Assessment</span>
            <Badge className={`px-3 py-1 ${getReadinessLevelStyle(assessment.readinessLevel)}`}>
              {assessment.readinessLevel.replace('-', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getReadinessIcon(assessment.readinessLevel)}
              </div>
              <div className="text-2xl font-bold text-gray-900">{assessment.overallScore}%</div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{assessment.estimatedEngagement}</div>
              <div className="text-sm text-gray-600">Est. Engagement</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{assessment.projectedViews}</div>
              <div className="text-sm text-gray-600">Projected Views</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{assessment.qualityRating}/5</div>
              <div className="text-sm text-gray-600">Quality Rating</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Publication Readiness</span>
              <span>{assessment.overallScore}%</span>
            </div>
            <Progress value={assessment.overallScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detailed Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(
              assessment.checks.reduce((groups, check) => {
                if (!groups[check.category]) {
                  groups[check.category] = [];
                }
                groups[check.category].push(check);
                return groups;
              }, {} as Record<string, ReadinessCheck[]>)
            ).map(([category, checks]) => (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                  {category === 'Content Quality' && <Shield className="h-4 w-4" />}
                  {category === 'Technical Quality' && <Zap className="h-4 w-4" />}
                  {category === 'Engagement Potential' && <TrendingUp className="h-4 w-4" />}
                  {category === 'Compliance' && <CheckCircle className="h-4 w-4" />}
                  <span>{category}</span>
                </h4>
                <div className="grid gap-3">
                  {checks.map((check, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(check.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{check.name}</p>
                          <span className="text-xs text-gray-500">{Math.round(check.score)}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                        {check.details && (
                          <p className="text-xs text-gray-500 mt-2">{check.details}</p>
                        )}
                        <div className="mt-2">
                          <Progress value={check.score} className="h-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {assessment.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <Star className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
