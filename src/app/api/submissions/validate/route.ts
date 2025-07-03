import { NextRequest, NextResponse } from 'next/server';

interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
  readinessLevel: 'not-ready' | 'needs-improvement' | 'good' | 'excellent';
  challengeSpecificScore?: number;
  customFieldValidation?: Record<string, any>;
}

interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'content' | 'technical' | 'guidelines' | 'quality' | 'challenge-specific';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  fixable: boolean;
  suggestion?: string;
  ruleId?: string;
}

interface ContentData {
  type: 'image' | 'video' | 'audio' | 'text';
  title: string;
  description: string;
  content: string | File;
  metadata: {
    duration?: number;
    resolution?: string;
    fileSize?: number;
    format?: string;
  };
  challengeId: string;
  userId: string;
  customFields?: Record<string, any>;
  tags?: string[];
}

interface ChallengeValidationRule {
  field: string;
  type: 'required' | 'format' | 'size' | 'custom';
  value?: any;
  message?: string;
  severity: 'error' | 'warning' | 'info';
}

interface ChallengeContentRequirement {
  type: 'image' | 'video' | 'audio' | 'text' | 'any';
  formats: string[];
  maxSize: number;
  minResolution?: string;
  maxDuration?: number;
  requiredFields: string[];
}

export async function POST(request: NextRequest) {
  try {
    const contentData: ContentData = await request.json();
    
    const validationResult = await validateContent(contentData);
    
    return NextResponse.json({
      success: true,
      validation: validationResult
    });
  } catch (error) {
    console.error('Content validation error:', error);
    return NextResponse.json(
      { error: 'Content validation failed' },
      { status: 500 }
    );
  }
}

// Mock challenge configurations - in production, fetch from database
const challengeConfigurations: Record<string, {
  validationRules: ChallengeValidationRule[];
  contentRequirements: ChallengeContentRequirement[];
  qualityThresholds: { minimumScore: number };
}> = {
  '1': {
    validationRules: [
      {
        field: 'title',
        type: 'required',
        message: 'Title is required for all submissions',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'custom',
        message: 'Description must be at least 50 characters',
        severity: 'error',
        value: { minLength: 50 }
      },
      {
        field: 'tags',
        type: 'custom',
        message: 'Must include at least one of: #nightrider, #pulsar, #nightride',
        severity: 'warning',
        value: { requiredTags: ['nightrider', 'pulsar', 'nightride'] }
      }
    ],
    contentRequirements: [
      {
        type: 'image',
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSize: 52428800, // 50MB
        minResolution: '1920x1080',
        requiredFields: ['title', 'description', 'tags']
      },
      {
        type: 'video',
        formats: ['mp4', 'mov', 'webm'],
        maxSize: 104857600, // 100MB
        maxDuration: 120, // 2 minutes
        requiredFields: ['title', 'description', 'tags']
      }
    ],
    qualityThresholds: {
      minimumScore: 70
    }
  }
}

async function validateContent(data: ContentData): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];
  let score = 100;

  // Basic content validation
  const basicIssues = validateBasicContent(data);
  issues.push(...basicIssues);
  score -= basicIssues.filter(i => i.severity === 'high').length * 15;
  score -= basicIssues.filter(i => i.severity === 'medium').length * 10;
  score -= basicIssues.filter(i => i.severity === 'low').length * 5;

  // Technical validation
  const technicalIssues = await validateTechnicalSpecs(data);
  issues.push(...technicalIssues);
  score -= technicalIssues.filter(i => i.severity === 'high').length * 20;
  score -= technicalIssues.filter(i => i.severity === 'medium').length * 15;

  // Guidelines compliance
  const guidelineIssues = await validateGuidelines(data);
  issues.push(...guidelineIssues);
  score -= guidelineIssues.filter(i => i.severity === 'critical').length * 30;
  score -= guidelineIssues.filter(i => i.severity === 'high').length * 20;

  // Quality assessment
  const qualityIssues = await assessQuality(data);
  issues.push(...qualityIssues);
  score -= qualityIssues.filter(i => i.severity === 'medium').length * 10;

  // Challenge-specific validation (R35.3)
  const challengeIssues = await validateChallengeSpecific(data);
  issues.push(...challengeIssues);
  score -= challengeIssues.filter(i => i.severity === 'critical').length * 30;
  score -= challengeIssues.filter(i => i.severity === 'high').length * 20;
  score -= challengeIssues.filter(i => i.severity === 'medium').length * 10;

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  // Calculate challenge-specific score
  const challengeSpecificScore = await calculateChallengeScore(data, challengeIssues);

  // Determine readiness level
  const readinessLevel = getReadinessLevel(score, issues);

  // Generate suggestions
  const suggestions = generateSuggestions(issues, data);

  return {
    isValid: !issues.some(issue => issue.type === 'error'),
    score,
    issues,
    suggestions,
    readinessLevel,
    challengeSpecificScore,
    customFieldValidation: await validateCustomFields(data)
  };
}

function validateBasicContent(data: ContentData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Title validation
  if (!data.title || data.title.trim().length < 3) {
    issues.push({
      type: 'error',
      category: 'content',
      message: 'Title must be at least 3 characters long',
      severity: 'high',
      fixable: true,
      suggestion: 'Provide a descriptive title for your submission'
    });
  } else if (data.title.length > 100) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Title is very long and may be truncated',
      severity: 'medium',
      fixable: true,
      suggestion: 'Consider shortening your title to under 100 characters'
    });
  }

  // Description validation
  if (!data.description || data.description.trim().length < 10) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Description should be at least 10 characters for better engagement',
      severity: 'medium',
      fixable: true,
      suggestion: 'Add a detailed description to help viewers understand your submission'
    });
  }

  // Content validation
  if (!data.content) {
    issues.push({
      type: 'error',
      category: 'content',
      message: 'No content provided',
      severity: 'critical',
      fixable: false
    });
  }

  return issues;
}

async function validateTechnicalSpecs(data: ContentData): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  // File size validation
  if (data.metadata.fileSize) {
    const maxSizes = {
      image: 10 * 1024 * 1024, // 10MB
      video: 100 * 1024 * 1024, // 100MB
      audio: 25 * 1024 * 1024, // 25MB
      text: 1 * 1024 * 1024 // 1MB
    };

    if (data.metadata.fileSize > maxSizes[data.type]) {
      issues.push({
        type: 'error',
        category: 'technical',
        message: `File size exceeds maximum allowed for ${data.type} content`,
        severity: 'high',
        fixable: true,
        suggestion: `Compress your ${data.type} to under ${Math.round(maxSizes[data.type] / (1024 * 1024))}MB`
      });
    }
  }

  // Format validation
  const supportedFormats = {
    image: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    video: ['mp4', 'webm', 'mov', 'avi'],
    audio: ['mp3', 'wav', 'ogg', 'm4a'],
    text: ['txt', 'md', 'json']
  };

  if (data.metadata.format && !supportedFormats[data.type].includes(data.metadata.format.toLowerCase())) {
    issues.push({
      type: 'error',
      category: 'technical',
      message: `Unsupported format: ${data.metadata.format}`,
      severity: 'high',
      fixable: true,
      suggestion: `Convert to a supported format: ${supportedFormats[data.type].join(', ')}`
    });
  }

  // Duration validation for media
  if ((data.type === 'video' || data.type === 'audio') && data.metadata.duration) {
    if (data.metadata.duration > 300) { // 5 minutes
      issues.push({
        type: 'warning',
        category: 'technical',
        message: 'Content duration is quite long',
        severity: 'medium',
        fixable: true,
        suggestion: 'Consider trimming to under 5 minutes for better engagement'
      });
    }
  }

  return issues;
}

async function validateGuidelines(data: ContentData): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  // Content policy checks (mock implementation)
  const contentText = `${data.title} ${data.description}`.toLowerCase();
  
  // Inappropriate content detection
  const inappropriateKeywords = ['spam', 'explicit', 'harmful', 'offensive'];
  const foundKeywords = inappropriateKeywords.filter(keyword => 
    contentText.includes(keyword)
  );

  if (foundKeywords.length > 0) {
    issues.push({
      type: 'error',
      category: 'guidelines',
      message: 'Content may violate community guidelines',
      severity: 'critical',
      fixable: true,
      suggestion: 'Please review and modify content to comply with community standards'
    });
  }

  // Copyright checks
  if (contentText.includes('copyright') || contentText.includes('trademark')) {
    issues.push({
      type: 'warning',
      category: 'guidelines',
      message: 'Potential copyright concerns detected',
      severity: 'high',
      fixable: true,
      suggestion: 'Ensure you have rights to use all content in your submission'
    });
  }

  // Challenge relevance check
  if (!data.challengeId) {
    issues.push({
      type: 'error',
      category: 'guidelines',
      message: 'Submission must be associated with a challenge',
      severity: 'critical',
      fixable: false
    });
  }

  return issues;
}

async function assessQuality(data: ContentData): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  // Title quality assessment
  if (data.title) {
    const titleWords = data.title.trim().split(/\s+/);
    if (titleWords.length < 2) {
      issues.push({
        type: 'info',
        category: 'quality',
        message: 'Title could be more descriptive',
        severity: 'low',
        fixable: true,
        suggestion: 'Consider adding more descriptive words to your title'
      });
    }

    // Check for all caps
    if (data.title === data.title.toUpperCase() && data.title.length > 5) {
      issues.push({
        type: 'warning',
        category: 'quality',
        message: 'Title is in all caps',
        severity: 'medium',
        fixable: true,
        suggestion: 'Use proper capitalization for better readability'
      });
    }
  }

  // Description quality
  if (data.description) {
    const sentences = data.description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) {
      issues.push({
        type: 'info',
        category: 'quality',
        message: 'Description could be more detailed',
        severity: 'low',
        fixable: true,
        suggestion: 'Add more context about your submission to engage viewers'
      });
    }
  }

  // Technical quality hints
  if (data.metadata.resolution && data.type === 'video') {
    const [width, height] = data.metadata.resolution.split('x').map(Number);
    if (width < 720 || height < 480) {
      issues.push({
        type: 'info',
        category: 'quality',
        message: 'Video resolution is quite low',
        severity: 'low',
        fixable: true,
        suggestion: 'Consider using higher resolution (720p or above) for better quality'
      });
    }
  }

  return issues;
}

function getReadinessLevel(score: number, issues: ValidationIssue[]): 'not-ready' | 'needs-improvement' | 'good' | 'excellent' {
  const hasErrors = issues.some(issue => issue.type === 'error');
  const hasCriticalIssues = issues.some(issue => issue.severity === 'critical');

  if (hasErrors || hasCriticalIssues) {
    return 'not-ready';
  }

  if (score >= 90) {
    return 'excellent';
  } else if (score >= 75) {
    return 'good';
  } else {
    return 'needs-improvement';
  }
}

function generateSuggestions(issues: ValidationIssue[], data: ContentData): string[] {
  const suggestions: string[] = [];

  // Add specific suggestions based on issues
  const fixableIssues = issues.filter(issue => issue.fixable && issue.suggestion);
  fixableIssues.forEach(issue => {
    if (issue.suggestion && !suggestions.includes(issue.suggestion)) {
      suggestions.push(issue.suggestion);
    }
  });

  // Add general improvement suggestions
  if (data.type === 'video' || data.type === 'audio') {
    suggestions.push('Consider adding captions or transcripts for accessibility');
  }

  if (!data.description || data.description.length < 50) {
    suggestions.push('Add a detailed description to increase engagement');
  }

  suggestions.push('Preview your submission before final submission');
  suggestions.push('Check that your content aligns with the challenge theme');

  return suggestions.slice(0, 5); // Limit to top 5 suggestions
}

// Challenge-specific validation (R35.3)
async function validateChallengeSpecific(data: ContentData): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const challengeConfig = challengeConfigurations[data.challengeId];
  
  if (!challengeConfig) {
    return issues;
  }
  
  // Apply challenge-specific validation rules
  for (const rule of challengeConfig.validationRules) {
    const issue = await applyValidationRule(rule, data);
    if (issue) {
      issues.push({
        ...issue,
        category: 'challenge-specific',
        ruleId: `${data.challengeId}-${rule.field}`
      });
    }
  }
  
  // Apply content requirements
  for (const requirement of challengeConfig.contentRequirements) {
    if (requirement.type === 'any' || requirement.type === data.type) {
      const requirementIssues = await validateContentRequirement(requirement, data);
      issues.push(...requirementIssues.map(issue => ({
        ...issue,
        category: 'challenge-specific' as const
      })));
    }
  }
  
  return issues;
}

async function applyValidationRule(rule: ChallengeValidationRule, data: ContentData): Promise<ValidationIssue | null> {
  const fieldValue = getFieldValue(data, rule.field);
  
  switch (rule.type) {
    case 'required':
      if (!fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
        return {
          type: rule.severity === 'error' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info',
          category: 'challenge-specific',
          message: rule.message || `${rule.field} is required`,
          severity: rule.severity === 'error' ? 'high' : rule.severity === 'warning' ? 'medium' : 'low',
          fixable: true,
          suggestion: `Please provide a value for ${rule.field}`
        };
      }
      break;
      
    case 'custom':
      if (rule.field === 'description' && rule.value?.minLength) {
        if (!fieldValue || fieldValue.length < rule.value.minLength) {
          return {
            type: rule.severity === 'error' ? 'error' : 'warning',
            category: 'challenge-specific',
            message: rule.message || `${rule.field} must be at least ${rule.value.minLength} characters`,
            severity: rule.severity === 'error' ? 'high' : 'medium',
            fixable: true,
            suggestion: `Please expand your ${rule.field} to at least ${rule.value.minLength} characters`
          };
        }
      }
      
      if (rule.field === 'tags' && rule.value?.requiredTags) {
        const tags = data.tags || [];
        const hasRequiredTag = rule.value.requiredTags.some((tag: string) => 
          tags.some(userTag => userTag.toLowerCase().includes(tag.toLowerCase()))
        );
        
        if (!hasRequiredTag) {
          return {
            type: 'warning',
            category: 'challenge-specific',
            message: rule.message || `Must include required tags`,
            severity: 'medium',
            fixable: true,
            suggestion: `Include at least one of these tags: ${rule.value.requiredTags.join(', ')}`
          };
        }
      }
      break;
  }
  
  return null;
}

async function validateContentRequirement(requirement: ChallengeContentRequirement, data: ContentData): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  
  // Format validation
  if (data.metadata?.format && !requirement.formats.includes(data.metadata.format.toLowerCase())) {
    issues.push({
      type: 'error',
      category: 'technical',
      message: `Format ${data.metadata.format} not allowed for this challenge`,
      severity: 'high',
      fixable: true,
      suggestion: `Please use one of these formats: ${requirement.formats.join(', ')}`
    });
  }
  
  // Size validation
  if (data.metadata?.fileSize && data.metadata.fileSize > requirement.maxSize) {
    issues.push({
      type: 'error',
      category: 'technical',
      message: `File size exceeds challenge limit of ${Math.round(requirement.maxSize / (1024 * 1024))}MB`,
      severity: 'high',
      fixable: true,
      suggestion: `Please reduce file size to under ${Math.round(requirement.maxSize / (1024 * 1024))}MB`
    });
  }
  
  // Duration validation for video/audio
  if (requirement.maxDuration && data.metadata?.duration && data.metadata.duration > requirement.maxDuration) {
    issues.push({
      type: 'warning',
      category: 'technical',
      message: `Content duration exceeds recommended ${requirement.maxDuration} seconds`,
      severity: 'medium',
      fixable: true,
      suggestion: `Consider trimming content to under ${requirement.maxDuration} seconds`
    });
  }
  
  // Resolution validation for images/videos
  if (requirement.minResolution && data.metadata?.resolution) {
    const [minWidth, minHeight] = requirement.minResolution.split('x').map(Number);
    const [actualWidth, actualHeight] = data.metadata.resolution.split('x').map(Number);
    
    if (actualWidth < minWidth || actualHeight < minHeight) {
      issues.push({
        type: 'warning',
        category: 'technical',
        message: `Resolution ${data.metadata.resolution} is below recommended ${requirement.minResolution}`,
        severity: 'medium',
        fixable: false,
        suggestion: `Use higher resolution content for better quality`
      });
    }
  }
  
  return issues;
}

async function calculateChallengeScore(data: ContentData, challengeIssues: ValidationIssue[]): Promise<number> {
  const challengeConfig = challengeConfigurations[data.challengeId];
  if (!challengeConfig) return 0;
  
  let challengeScore = 100;
  
  // Deduct based on challenge-specific issues
  challengeScore -= challengeIssues.filter(i => i.severity === 'critical').length * 40;
  challengeScore -= challengeIssues.filter(i => i.severity === 'high').length * 25;
  challengeScore -= challengeIssues.filter(i => i.severity === 'medium').length * 15;
  challengeScore -= challengeIssues.filter(i => i.severity === 'low').length * 5;
  
  return Math.max(0, challengeScore);
}

async function validateCustomFields(data: ContentData): Promise<Record<string, any>> {
  const validation: Record<string, any> = {};
  
  if (!data.customFields) {
    return validation;
  }
  
  // Mock custom field validation - in production, get from challenge config
  const customFieldRules: Record<string, {
    required: boolean;
    type: string;
    maxLength?: number;
  }> = {
    ridingExperience: { required: true, type: 'select' },
    safetyGearUsed: { required: true, type: 'boolean' },
    locationDescription: { required: false, type: 'text', maxLength: 200 }
  };
  
  for (const [fieldName, rules] of Object.entries(customFieldRules)) {
    const value = data.customFields[fieldName];
    
    if (rules.required && (!value || value === '')) {
      validation[fieldName] = {
        isValid: false,
        message: `${fieldName} is required`
      };
    } else if (rules.type === 'text' && rules.maxLength && value && value.length > rules.maxLength) {
      validation[fieldName] = {
        isValid: false,
        message: `${fieldName} must be under ${rules.maxLength} characters`
      };
    } else {
      validation[fieldName] = {
        isValid: true
      };
    }
  }
  
  return validation;
}

function getFieldValue(data: ContentData, fieldName: string): any {
  switch (fieldName) {
    case 'title': return data.title;
    case 'description': return data.description;
    case 'tags': return data.tags;
    case 'type': return data.type;
    default: return data.customFields?.[fieldName];
  }
}
