"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Upload, 
  Clock, 
  CheckCircle,
  Palette,
  Brain,
  MousePointer,
  Zap,
  Users,
  Trophy
} from 'lucide-react';

export type ContentMethod = 'ai-generation' | 'manual-upload' | null;

interface ContentMethodSelectionProps {
  onMethodSelected: (method: ContentMethod) => void;
  selectedMethod: ContentMethod;
  challengeType?: string;
}

export default function ContentMethodSelection({ 
  onMethodSelected, 
  selectedMethod,
  challengeType = 'mixed'
}: ContentMethodSelectionProps) {

  const [hoveredMethod, setHoveredMethod] = useState<ContentMethod>(null);

  const methodOptions = [
    {
      id: 'ai-generation' as ContentMethod,
      title: 'AI Generation',
      subtitle: 'Create with Artificial Intelligence',
      description: 'Let AI help you create professional-quality content with guided prompts and intelligent suggestions.',
      icon: <Sparkles className="h-8 w-8" />,
      color: 'from-purple-500 to-blue-500',
      borderColor: 'border-purple-500/50',
      glowColor: 'shadow-purple-500/20',
      features: [
        'AI-powered content creation',
        'Professional quality results',
        'Guided creation process',
        'Multiple style options',
        'Instant generation'
      ],
      stats: {
        avgTime: '5-10 min',
        successRate: '94%',
        popularityRank: '#1'
      },
      recommended: true
    },
    {
      id: 'manual-upload' as ContentMethod,
      title: 'Manual Upload',
      subtitle: 'Upload Your Own Content',
      description: 'Upload and customize your own pre-created content with professional editing tools.',
      icon: <Upload className="h-8 w-8" />,
      color: 'from-pink-500 to-red-500',
      borderColor: 'border-pink-500/50',
      glowColor: 'shadow-pink-500/20',
      features: [
        'Upload existing content',
        'Full creative control',
        'Professional editing tools',
        'Custom branding options',
        'Quick submission'
      ],
      stats: {
        avgTime: '2-5 min',
        successRate: '89%',
        popularityRank: '#2'
      },
      recommended: false
    }
  ];

  const getMethodRecommendation = (method: ContentMethod) => {
    if (method === 'ai-generation') {
      return 'Best for beginners • Highest engagement rates • Most popular choice';
    }
    return 'Best for experienced creators • Full creative control • Quick submission';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Choose Your Creative Path</h2>
        </div>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto">
          Select how you'd like to create your submission. This choice will optimize your entire workflow 
          and provide you with the best tools for your preferred method.
        </p>
        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 bg-yellow-500/10">
          <Trophy className="h-4 w-4 mr-1" />
          Required Step - Choose to Continue
        </Badge>
      </div>

      {/* Method Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methodOptions.map((method) => (
          <Card
            key={method.id}
            className={`
              relative group cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
              ${selectedMethod === method.id 
                ? `border-2 ${method.borderColor} ${method.glowColor} shadow-2xl` 
                : 'border-gray-700 hover:border-gray-600'
              }
              ${hoveredMethod === method.id ? 'shadow-xl' : ''}
              bg-gray-900/50 backdrop-blur-sm
            `}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
            onClick={() => onMethodSelected(method.id)}
          >
            {/* Recommended Badge */}
            {method.recommended && (
              <div className="absolute -top-3 -right-3 z-10">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold">
                  <Zap className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}

            {/* Selection Indicator */}
            {selectedMethod === method.id && (
              <div className="absolute top-4 right-4">
                <div className="p-1 rounded-full bg-green-500">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <CardHeader className="pb-4">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${method.color} shadow-lg`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-white text-xl mb-1">
                    {method.title}
                  </CardTitle>
                  <p className="text-gray-400 text-sm">
                    {method.subtitle}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed">
                {method.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 py-3 border-t border-b border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-xs text-gray-400">Average Time</div>
                  <div className="text-sm font-semibold text-white">{method.stats.avgTime}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="text-xs text-gray-400">Success Rate</div>
                  <div className="text-sm font-semibold text-white">{method.stats.successRate}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-xs text-gray-400">Popularity</div>
                  <div className="text-sm font-semibold text-white">{method.stats.popularityRank}</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white">Key Features:</h4>
                <ul className="space-y-1">
                  {method.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendation */}
              <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-white">Best for:</span> {getMethodRecommendation(method.id)}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => onMethodSelected(method.id)}
                className={`
                  w-full font-semibold transition-all duration-200
                  ${selectedMethod === method.id
                    ? `bg-gradient-to-r ${method.color} text-white shadow-lg`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }
                `}
                variant={selectedMethod === method.id ? "default" : "outline"}
              >
                <MousePointer className="h-4 w-4 mr-2" />
                {selectedMethod === method.id ? 'Selected' : 'Choose This Method'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-400">
          Don't worry! You can always switch methods before submitting your content.
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center">
            <Palette className="h-3 w-3 mr-1" />
            Optimized workflows
          </span>
          <span className="flex items-center">
            <Zap className="h-3 w-3 mr-1" />
            Method-specific tools
          </span>
          <span className="flex items-center">
            <Trophy className="h-3 w-3 mr-1" />
            Higher success rates
          </span>
        </div>
      </div>
    </div>
  );
}
