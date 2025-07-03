"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Clock, 
  MousePointer, 
  Save, 
  RefreshCw,
  Eye,
  Edit,
  TrendingUp,
  Users,
  Target
} from 'lucide-react';

interface AnalyticsData {
  totalTimeSpent: number;
  saveCount: number;
  loadCount: number;
  editCount: number;
  regenerateCount: number;
  previewCount: number;
  currentStep: string;
  maxStepReached: string;
  contentMethod: string;
  deviceType: string;
  browserType: string;
  stepTransitions: Record<string, unknown>;
  conversionRate: number;
  completionRate: number;
}

interface SubmissionAnalyticsDashboardProps {
  challengeId: string;
  userId?: string;
  className?: string;
}

export default function SubmissionAnalyticsDashboard({
  challengeId,
  userId,
  className = ""
}: SubmissionAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        challengeId,
        ...(userId && { userId })
      });
      
      const response = await fetch(`/api/submissions/analytics?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [challengeId, userId]);

  // Format time duration
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Calculate engagement score
  const getEngagementScore = (data: AnalyticsData) => {
    const baseScore = Math.min(100, (data.totalTimeSpent / 300) * 20); // 5 min = 20 points
    const actionsScore = Math.min(30, (data.editCount + data.regenerateCount) * 2);
    const progressScore = Math.min(50, (parseInt(data.currentStep) || 0) * 10);
    
    return Math.round(baseScore + actionsScore + progressScore);
  };

  // Get step progress
  const getStepProgress = (current: string, max: string) => {
    const currentNum = parseInt(current) || 0;
    const maxNum = parseInt(max) || 0;
    return { current: currentNum, max: maxNum, percentage: maxNum > 0 ? (currentNum / maxNum) * 100 : 0 };
  };

  useEffect(() => {
    loadAnalytics();
  }, [challengeId, userId]);

  if (loading) {
    return (
      <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 text-blue-400 animate-spin mr-2" />
            <span className="text-gray-400">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={`bg-gray-900/50 border-gray-700 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <BarChart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Analytics Data</h3>
            <p className="text-gray-400">
              {error || "Start creating content to see analytics"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const engagementScore = getEngagementScore(analytics);
  const stepProgress = getStepProgress(analytics.currentStep, analytics.maxStepReached);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm text-gray-400">Time Spent</p>
                <p className="text-lg font-semibold text-white">
                  {formatDuration(analytics.totalTimeSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Save className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-sm text-gray-400">Saves</p>
                <p className="text-lg font-semibold text-white">
                  {analytics.saveCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-sm text-gray-400">Edits</p>
                <p className="text-lg font-semibold text-white">
                  {analytics.editCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-sm text-gray-400">Engagement</p>
                <p className="text-lg font-semibold text-white">
                  {engagementScore}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Progress Tracking */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Creation Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Current Step</span>
                <span className="text-sm text-white">
                  {stepProgress.current} of {stepProgress.max}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, stepProgress.percentage)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Content Method</span>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {analytics.contentMethod === 'ai-generation' ? 'AI Generated' : 'Manual Upload'}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Device Type</span>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {analytics.deviceType}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Browser</span>
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  {analytics.browserType}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Metrics */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Activity Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MousePointer className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Loads</span>
                </div>
                <span className="text-white font-medium">{analytics.loadCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Regenerations</span>
                </div>
                <span className="text-white font-medium">{analytics.regenerateCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Previews</span>
                </div>
                <span className="text-white font-medium">{analytics.previewCount}</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Completion Rate</span>
                  <span className="text-white font-medium">
                    {Math.round(analytics.completionRate)}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Conversion Rate</span>
                  <span className="text-white font-medium">
                    {Math.round(analytics.conversionRate)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Summary */}
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Engagement Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Overall Engagement Score</span>
                <span className="text-lg font-semibold text-white">{engagementScore}/100</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-700 ${
                    engagementScore >= 80 ? 'bg-green-500' :
                    engagementScore >= 60 ? 'bg-yellow-500' :
                    engagementScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${engagementScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
