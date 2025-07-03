"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Star, 
  Share2, 
  Eye, 
  Clock, 
  Trophy,
  Users,
  Heart,
  MessageCircle,
  Calendar,
  ArrowRight,
  Download,
  Gift,
  TrendingUp,
  Bell,
  Home
} from 'lucide-react';

interface SubmissionSuccessData {
  submissionId: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'text';
  challengeId: string;
  challengeTitle: string;
  status: 'pending' | 'under-review' | 'approved' | 'featured';
  submittedAt: string;
  estimatedReviewTime: number;
  qualityScore: number;
  projectedViews: number;
  entryNumber: number;
  totalEntries: number;
  nextSteps: NextStep[];
  achievements?: Achievement[];
  similarSubmissions?: SimilarSubmission[];
}

interface NextStep {
  id: string;
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  completed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}

interface SimilarSubmission {
  id: string;
  title: string;
  author: string;
  votes: number;
  views: number;
}

interface SubmissionSuccessProps {
  submissionData: SubmissionSuccessData;
  onViewSubmission: () => void;
  onShareSubmission: () => void;
  onBackToChallenge: () => void;
  onBackToHome: () => void;
}

export default function SubmissionSuccess({
  submissionData,
  onViewSubmission,
  onShareSubmission,
  onBackToChallenge,
  onBackToHome
}: SubmissionSuccessProps) {
  const [celebrationVisible, setCelebrationVisible] = useState(true);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    // Hide celebration animation after 3 seconds
    const timer = setTimeout(() => {
      setCelebrationVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'featured': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'under-review': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'featured': return <Star className="h-5 w-5 text-purple-600" />;
      case 'under-review': return <Eye className="h-5 w-5 text-blue-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-50 border-yellow-300';
      case 'epic': return 'text-purple-600 bg-purple-50 border-purple-300';
      case 'rare': return 'text-blue-600 bg-blue-50 border-blue-300';
      case 'common': return 'text-gray-600 bg-gray-50 border-gray-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header with Animation */}
      <div className="text-center relative">
        {celebrationVisible && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-bounce">
              🎉
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white p-8 rounded-xl">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Submission Successful!</h1>
          <p className="text-lg opacity-90">
            Your entry "{submissionData.title}" has been submitted to {submissionData.challengeTitle}
          </p>
        </div>
      </div>

      {/* Submission Status */}
      <Card className={`border-2 ${getStatusColor(submissionData.status)}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(submissionData.status)}
              <div>
                <h3 className="text-xl font-bold capitalize">
                  {submissionData.status.replace('-', ' ')}
                </h3>
                <p className="text-sm opacity-75">Current Status</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">#{submissionData.entryNumber}</div>
              <div className="text-sm opacity-75">of {submissionData.totalEntries} entries</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <div className="text-sm text-gray-600">Est. Review Time</div>
              <div className="font-semibold">{submissionData.estimatedReviewTime}h</div>
            </div>
            <div className="text-center">
              <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
              <div className="text-sm text-gray-600">Quality Score</div>
              <div className="font-semibold">{submissionData.qualityScore}/100</div>
            </div>
            <div className="text-center">
              <Eye className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <div className="text-sm text-gray-600">Projected Views</div>
              <div className="font-semibold">{submissionData.projectedViews}</div>
            </div>
            <div className="text-center">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <div className="text-sm text-gray-600">Submitted</div>
              <div className="font-semibold text-xs">
                {new Date(submissionData.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submissionData.nextSteps.map((step) => (
                <div
                  key={step.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    step.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExpandedStep(
                    expandedStep === step.id ? null : step.id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          step.priority === 'high' 
                            ? 'border-red-500' 
                            : step.priority === 'medium' 
                            ? 'border-yellow-500' 
                            : 'border-gray-300'
                        }`} />
                      )}
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          step.priority === 'high' 
                            ? 'destructive' 
                            : step.priority === 'medium' 
                            ? 'default' 
                            : 'secondary'
                        }
                        className="text-xs mb-1"
                      >
                        {step.priority}
                      </Badge>
                      <div className="text-xs text-gray-500">{step.estimatedTime}</div>
                    </div>
                  </div>
                  
                  {expandedStep === step.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Button size="sm" className="w-full">
                        {step.action}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={onViewSubmission} className="w-full flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Submission
              </Button>
              <Button onClick={onShareSubmission} variant="outline" className="w-full flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Entry
              </Button>
              <Button onClick={onBackToChallenge} variant="outline" className="w-full flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Back to Challenge
              </Button>
              <Button onClick={onBackToHome} variant="ghost" className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </CardContent>
          </Card>

          {/* Achievements */}
          {submissionData.achievements && submissionData.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-500" />
                  New Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissionData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border-2 ${getRarityColor(achievement.rarity)}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-xs">{achievement.description}</p>
                        <Badge className="text-xs mt-1" variant="outline">
                          {achievement.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Expected Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Quality Score</span>
                  <span>{submissionData.qualityScore}/100</span>
                </div>
                <Progress value={submissionData.qualityScore} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-center">
                <div>
                  <Heart className="h-4 w-4 mx-auto mb-1 text-red-500" />
                  <div className="text-xs text-gray-600">Est. Likes</div>
                  <div className="font-semibold text-sm">
                    {Math.round(submissionData.projectedViews * 0.15)}
                  </div>
                </div>
                <div>
                  <MessageCircle className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-xs text-gray-600">Est. Comments</div>
                  <div className="font-semibold text-sm">
                    {Math.round(submissionData.projectedViews * 0.05)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Stay Updated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Notify me when reviewed</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Send voting updates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Weekly challenge digest</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Submissions */}
      {submissionData.similarSubmissions && submissionData.similarSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Similar Submissions in This Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {submissionData.similarSubmissions.map((submission) => (
                <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium line-clamp-1">{submission.title}</h4>
                  <p className="text-sm text-gray-600">by {submission.author}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {submission.votes}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {submission.views}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
