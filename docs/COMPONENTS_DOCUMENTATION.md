# Pulsar Components Documentation

This document provides a comprehensive overview of all custom components created for the Pulsar project. Each component is production-ready, fully responsive, and follows the project's design system.

## Table of Contents

### Challenge Components (1-6)
1. [ChallengeCard](#1-challengecard)
2. [ComingSoonChallenge](#2-comingsoonchallenge)
3. [OngoingChallenge](#3-ongoingchallenge)
4. [ChallengeOnboarding](#4-challengeonboarding)
5. [ChallengeTutorial](#5-challengetutorial)
6. [ToolkitAssets](#6-toolkitassets)

### Masterclass Components (7)
7. [FeaturedMasterclass](#7-featuredmasterclass)

### Toolkit Components (8)
8. [ToolkitResources](#8-toolkitresources)

### FAQ Components (9)
9. [FAQComponent](#9-faqcomponent)

### Rewards Components (10)
10. [RewardsComponent](#10-rewardscomponent)

### Creator Components (11)
11. [CreatorSpotlight](#11-creatorspotlight)

### Community Components (12-13)
12. [CatchTheLatest](#12-catchthelatest)
13. [JoinTheMovement](#13-jointheMovement)

### Gallery Components (14-16)
14. [GalleryLandingHero](#14-gallerylandinghero)
15. [ContentPreviewModal](#15-contentpreviewmodal)
16. [AdvancedSearch](#16-advancedsearch)

### AI Components (17-20)
17. [PulsarAIDashboard](#17-pulsaraidashboard)
18. [AdvancedAIGenerator](#18-advancedaigenerator)
19. [IntelligentSuggestionsPanel](#19-intelligentsuggestionspanel)
20. [ContentQualityScorer](#20-contentqualityscorer)

### Submission Components (21-23)
21. [SubmissionSuccess](#21-submissionsuccess)
22. [SubmissionReview](#22-submissionreview)
23. [PublicationReadiness](#23-publicationreadiness)

### Layout Components (24-28)
24. [PulsarHeader](#24-pulsarheader)
25. [PulsarFooter](#25-pulsarfooter)
26. [MobileBottomNav](#26-mobilebottomnav)
27. [MobileAuth](#27-mobileauth)
28. [ProgressiveRegistration](#28-progressiveregistration)

### Admin Components (29-32)
29. [DynamicChallengeConfig](#29-dynamicchallengeconfig)
30. [TutorialBuilder](#30-tutorialbuilder)
31. [WinnerManagement](#31-winnermanagement)
32. [AssetUpload](#32-assetupload)

### Additional Sections
- [Test Pages](#test-pages)
- [Design System Patterns](#design-system-patterns)
- [Integration Guidelines](#integration-guidelines)
- [Component Categories Summary](#component-categories-summary)
- [Future Enhancements](#future-enhancements)

---

## Challenge Components

### 1. ChallengeCard
**Location**: `/src/components/challenge/challenge-card.tsx`

**Purpose**: Unified challenge card component with featured badge support

**Key Features**:
- Responsive design with mobile-first approach
- Featured badge for highlighted challenges
- Image with overlay and play button for video content
- Challenge details (title, description, tags, prize, participants)
- Time remaining indicator
- Join/Submit buttons with hover animations

**Props**:
```typescript
interface ChallengeCardProps {
  challenge: Challenge
  onJoinClick?: (challenge: Challenge) => void
  onPlayVideo?: (challenge: Challenge) => void
  className?: string
}
```

**Usage Example**:
```tsx
<ChallengeCard
  challenge={challengeData}
  onJoinClick={handleJoin}
  onPlayVideo={handlePlay}
/>
```

### 2. ComingSoonChallenge
**Location**: `/src/components/challenge/coming-soon-challenge.tsx`

**Purpose**: Display upcoming challenges with notification signup

**Key Features**:
- Dynamic background image with motion effects
- Stylized "COMING SOON" overlay text
- Launch date and notification signup
- Hover effects and glass morphism design
- Status badge with animated indicator

**Props**:
```typescript
interface ComingSoonChallengeProps {
  title: string
  description: string
  backgroundImage: string
  launchDate: string
  onNotifyClick?: () => void
  className?: string
}
```

### 3. OngoingChallenge
**Location**: `/src/components/challenge/ongoing-challenge.tsx`

**Purpose**: Hero section for active challenges with detailed information

**Key Features**:
- Two-column responsive layout
- Gradient hero text with color coding
- Video thumbnail with play functionality
- Challenge details, tags, and statistics
- "Join Challenge" call-to-action
- Live status indicators

**Props**:
```typescript
interface OngoingChallengeProps {
  title: string
  subtitle: string
  description: string
  videoThumbnail: string
  challengeTitle: string
  challengeDescription: string
  tags: string[]
  prizeAmount: string
  participantCount: string
  timeRemaining: string
  onPlayVideo?: () => void
  onJoinChallenge?: () => void
  className?: string
}
```

**Usage Example**:
```tsx
<OngoingChallenge
  title="Speed Meets Creativity"
  subtitle="Current Challenge"
  description="Express your ride, style, and vision"
  videoThumbnail="/images/challenge-video.jpg"
  challengeTitle="6SecondThrill"
  challengeDescription="Create a 4-6 second video capturing speed, thrill, or freedom"
  tags={["Speed", "Creativity", "Video"]}
  prizeAmount="$2,000"
  participantCount="12k"
  timeRemaining="5 days"
  onPlayVideo={() => console.log('Play video')}
  onJoinChallenge={() => console.log('Join challenge')}
/>
```

### 4. ChallengeOnboarding
**Location**: `/src/components/challenge/challenge-onboarding.tsx`

**Purpose**: Interactive onboarding flow for new challenge participants

**Key Features**:
- Step-by-step guided workflow
- Progress indicators and navigation
- Tutorial integration
- Toolkit asset presentation
- Mobile-responsive design
- Dynamic content loading

**Props**:
```typescript
interface ChallengeOnboardingProps {
  challenge: Challenge
  onComplete: () => void
  className?: string
}
```

### 5. ChallengeTutorial
**Location**: `/src/components/challenge/challenge-tutorial.tsx`

**Purpose**: Interactive tutorial system for challenge guidance

**Key Features**:
- Step-by-step tutorial progression
- Interactive media support
- Progress tracking
- Skip and replay functionality
- Mobile-optimized interface

### 6. ToolkitAssets
**Location**: `/src/components/challenge/toolkit-assets.tsx`

**Purpose**: Display and manage challenge-specific assets and resources

**Key Features**:
- Asset grid display
- Download functionality
- File type and size information
- Search and filter capabilities
- Usage guidelines integration

---

## Masterclass Components

### 7. FeaturedMasterclass
**Location**: `/src/components/masterclass/featured-masterclass.tsx`

**Purpose**: Showcase featured video masterclasses with instructor information

**Key Features**:
- Video thumbnail with play button overlay
- Instructor profile with avatar and credentials
- Duration badge and progress indicator
- Responsive aspect-video container
- Glass morphism card design

**Props**:
```typescript
interface FeaturedMasterclassProps {
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  instructor: Instructor
  duration?: string
  onPlayClick?: () => void
  className?: string
}

interface Instructor {
  name: string
  title: string
  avatar: string
}
```

---

## Toolkit Components

### 8. ToolkitResources
**Location**: `/src/components/toolkit/toolkit-resources.tsx`

**Purpose**: Display available resources and tools for creators

**Key Features**:
- Grid layout for resource cards
- Icon-based resource representation
- "Explore All Resources" call-to-action
- Hover effects and interactive cards
- Responsive design with proper breakpoints

**Props**:
```typescript
interface ToolkitResourcesProps {
  onExploreClick?: () => void
  className?: string
}

interface ResourceCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: string
}
```

---

## FAQ Components

### 9. FAQComponent
**Location**: `/src/components/faq/faq-component.tsx`

**Purpose**: Display frequently asked questions with pagination

**Key Features**:
- Paginated FAQ display (2 per page)
- Navigation arrows and page indicators
- "View All" link for complete FAQ page
- Glass morphism cards with hover effects
- Responsive grid layout

**Props**:
```typescript
interface FAQComponentProps {
  faqs?: FAQ[]
  onViewAllClick?: () => void
  className?: string
}

interface FAQ {
  id: string
  question: string
  answer: string
}
```

---

## Rewards Components

### 10. RewardsComponent
**Location**: `/src/components/rewards/rewards-component.tsx`

**Purpose**: Showcase available rewards and prizes

**Key Features**:
- Gradient reward cards with unique styling
- Trophy illustrations with animations
- "Win Big. Get Seen. #BeFollowed" messaging
- "View Full Rewards" call-to-action
- Hover effects with scale and rotation

**Props**:
```typescript
interface RewardsComponentProps {
  rewards?: Reward[]
  onViewFullRewards?: () => void
  className?: string
}

interface Reward {
  id: string
  title: string
  description: string
  gradient: string
  icon: React.ComponentType<any>
  iconColor: string
}
```

---

## Creator Components

### 11. CreatorSpotlight
**Location**: `/src/components/creator/creator-spotlight.tsx`

**Purpose**: Feature individual creators and their artwork

**Key Features**:
- Rotated typography for dynamic headers
- Featured artwork with gallery grid
- Creator profile with quote and social links
- Challenge badge integration
- Interactive artwork viewing

**Props**:
```typescript
interface CreatorSpotlightProps {
  creator: Creator
  featuredArtwork: Artwork
  artworkGallery: Artwork[]
  onInstagramClick?: () => void
  onPortfolioClick?: () => void
  onArtworkClick?: (artwork: Artwork) => void
  className?: string
}

interface Creator {
  name: string
  username: string
  quote: string
  instagramHandle: string
  portfolioUrl?: string
  profileImage?: string
}
```

---

## Community Components

### 12. CatchTheLatest
**Location**: `/src/components/community/catch-the-latest.tsx`

**Purpose**: Display latest community artworks and encourage participation

**Key Features**:
- 2x2 grid of featured artworks
- "Join the Movement" call-to-action
- Community statistics display
- Hover effects with content overlays
- Category and trending badges

**Props**:
```typescript
interface CatchTheLatestProps {
  artworks?: LatestArtwork[]
  onJoinMovement?: () => void
  onArtworkClick?: (artwork: LatestArtwork) => void
  className?: string
}

interface LatestArtwork {
  id: string
  imageUrl: string
  title?: string
  creator?: string
  category?: string
}
```

### 13. JoinTheMovement
**Location**: `/src/components/community/join-the-movement.tsx`

**Purpose**: Encourage users to connect with the Pulsar community on social media platforms

**Key Features**:
- Eye-catching design with heart icon and neon styling
- Social media integration (Instagram and YouTube)
- Glassmorphism card design with cyber styling
- Responsive layout for mobile and desktop
- Gradient button effects with hover animations
- Call-to-action for community engagement

**Props**:
```typescript
interface JoinTheMovementProps {
  onInstagramClick?: () => void
  onYoutubeClick?: () => void
  className?: string
}
```

**Usage Example**:
```tsx
<JoinTheMovement
  onInstagramClick={() => window.open('https://instagram.com/yourhandle', '_blank')}
  onYoutubeClick={() => window.open('https://youtube.com/@yourchannel', '_blank')}
/>
```

**Design Features**:
- Glassmorphism card with cyber shadow effects
- Animated heart icon with pulse effect
- Instagram gradient button (orange to purple)
- YouTube red branded button
- Neon pink text styling for the main heading
- Responsive button layout (stacked on mobile, side-by-side on desktop)

---

## Gallery Components

### 14. GalleryLandingHero
**Location**: `/src/components/gallery/gallery-landing-hero.tsx`

**Purpose**: Hero section for the gallery page with featured submissions and statistics

**Key Features**:
- Dynamic statistics display (submissions, votes, users)
- Featured submissions carousel
- Trending and popular content sections
- Search and filter integration
- Real-time data updates
- Interactive submission cards

**Props**:
```typescript
interface GalleryLandingHeroProps {
  stats?: GalleryStats
  onSearchClick?: () => void
  onFilterClick?: () => void
  className?: string
}

interface GalleryStats {
  totalSubmissions: number
  totalVotes: number
  activeUsers: number
  featuredSubmissions: Array<{
    id: string
    title: string
    type: string
    contentUrl: string
    voteCount: number
    user: { name: string }
  }>
}
```

**Usage Example**:
```tsx
<GalleryLandingHero
  stats={galleryStats}
  onSearchClick={() => setShowSearch(true)}
  onFilterClick={() => setShowFilters(true)}
/>
```

### 15. ContentPreviewModal
**Location**: `/src/components/gallery/content-preview-modal.tsx`

**Purpose**: Modal for previewing gallery content with voting and sharing

**Key Features**:
- Full-screen content preview
- Voting interface with heart animations
- Creator information display
- Social sharing capabilities
- Navigation between submissions
- Mobile-optimized controls

### 16. AdvancedSearch
**Location**: `/src/components/gallery/advanced-search.tsx`

**Purpose**: Advanced search and filtering for gallery content

**Key Features**:
- Multi-criteria search filters
- Content type filtering
- Date range selection
- Creator-based filtering
- Sort options and result previews

---

## AI Components

### 17. PulsarAIDashboard
**Location**: `/src/components/ai/pulsar-ai-dashboard.tsx`

**Purpose**: Comprehensive AI-powered creator dashboard with insights and suggestions

**Key Features**:
- Creator skill level assessment
- Content quality scoring
- Personalized suggestions
- Performance analytics
- Learning path recommendations
- Achievement tracking

**Props**:
```typescript
interface PulsarAIDashboardProps {
  userId?: string
  onSuggestionApply?: (suggestion: ContentSuggestion) => void
}
```

### 18. AdvancedAIGenerator
**Location**: `/src/components/ai/advanced-ai-generator.tsx`

**Purpose**: AI-powered content generation tools

**Key Features**:
- Multiple AI generation modes
- Content type selection
- Style and parameter controls
- Preview and refinement options
- Integration with submission flow

### 19. IntelligentSuggestionsPanel
**Location**: `/src/components/ai/intelligent-suggestions-panel.tsx`

**Purpose**: Real-time content improvement suggestions

**Key Features**:
- Live content analysis
- Improvement recommendations
- Trend-based suggestions
- Quality score feedback
- One-click optimizations

### 20. ContentQualityScorer
**Location**: `/src/components/ai/content-quality-scorer.tsx`

**Purpose**: Analyze and score content quality using AI

**Key Features**:
- Real-time quality assessment
- Detailed scoring breakdown
- Improvement recommendations
- Comparison with top submissions
- Visual quality indicators

---

## Submission Components

### 21. SubmissionSuccess
**Location**: `/src/components/submission/submission-success.tsx`

**Purpose**: Success confirmation after challenge submission

**Key Features**:
- Celebration animation
- Submission details confirmation
- Social sharing options
- Next steps guidance
- Return to challenges CTA

### 22. SubmissionReview
**Location**: `/src/components/submission/submission-review.tsx`

**Purpose**: Review and edit submissions before final publication

**Key Features**:
- Content preview with full controls
- Metadata editing interface
- Quality check indicators
- Submission guidelines compliance
- Final approval workflow

### 23. PublicationReadiness
**Location**: `/src/components/submission/publication-readiness.tsx`

**Purpose**: Assess and prepare submissions for publication

**Key Features**:
- Publication checklist
- Content optimization suggestions
- Compliance verification
- Final quality assurance
- Automated publication workflow

---

## Layout Components

### 24. PulsarHeader
**Location**: `/src/components/pulsar-header.tsx`

**Purpose**: Main navigation header with authentication and menu controls

**Key Features**:
- Responsive navigation menu
- User authentication status display
- Mobile hamburger menu
- Logo and brand integration
- Dynamic user profile access

### 25. PulsarFooter
**Location**: `/src/components/pulsar-footer.tsx`

**Purpose**: Site footer with links, social media, and legal information

**Key Features**:
- Multi-column link organization
- Social media integration
- Newsletter signup
- Legal and policy links
- Brand consistency

### 26. MobileBottomNav
**Location**: `/src/components/mobile-bottom-nav.tsx`

**Purpose**: Mobile-specific bottom navigation bar

**Key Features**:
- Fixed bottom positioning
- Icon-based navigation
- Active state indicators
- Mobile-optimized touch targets
- Quick access to main sections

### 27. MobileAuth
**Location**: `/src/components/mobile-auth.tsx`

**Purpose**: Mobile-optimized authentication components

**Key Features**:
- Touch-friendly interface
- SMS/OTP verification
- Social login integration
- Progressive registration flow
- Responsive form validation

### 28. ProgressiveRegistration
**Location**: `/src/components/progressive-registration.tsx`

**Purpose**: Multi-step user registration process

**Key Features**:
- Step-by-step user onboarding
- Progress tracking
- Form validation
- Mobile-responsive design
- Skip and resume functionality

---

## Admin Components

### 29. DynamicChallengeConfig
**Location**: `/src/components/admin/dynamic-challenge-config.tsx`

**Purpose**: Administrative interface for challenge configuration

**Key Features**:
- Dynamic form generation
- Real-time configuration preview
- Validation and error handling
- Template management
- Bulk operations support

### 30. TutorialBuilder
**Location**: `/src/components/admin/tutorial-builder.tsx`

**Purpose**: Content management system for creating tutorials

**Key Features**:
- Drag-and-drop interface
- Media upload integration
- Step sequencing
- Preview functionality
- Version control

### 31. WinnerManagement
**Location**: `/src/components/admin/winner-management.tsx`

**Purpose**: Administrative tools for managing challenge winners

**Key Features**:
- Winner selection interface
- Announcement scheduling
- Prize distribution tracking
- Communication tools
- Reporting capabilities

### 32. AssetUpload
**Location**: `/src/components/admin/asset-upload.tsx`

**Purpose**: File and media upload management for administrators

**Key Features**:
- Bulk file upload
- Asset organization
- File type validation
- Storage management
- Usage tracking

---

## Test Pages

All components include dedicated test pages for development and preview:

1. **Challenge Card Test**: `/src/app/challenges/page.tsx` (integrated)
2. **Coming Soon Test**: `/src/app/test-coming-soon/page.tsx`
3. **Ongoing Challenge Test**: `/src/app/test-ongoing-challenge/page.tsx`
4. **Featured Masterclass Test**: `/src/app/test-masterclass/page.tsx`
5. **FAQ Test**: `/src/app/test-faq/page.tsx`
6. **Rewards Test**: `/src/app/test-rewards/page.tsx`
7. **Creator Spotlight Test**: `/src/app/test-creator-spotlight/page.tsx`
8. **Catch the Latest Test**: `/src/app/test-catch-latest/page.tsx`
9. **Join the Movement Test**: `/src/app/test-join-movement/page.tsx`
10. **Gallery Landing Hero Test**: `/src/app/gallery/page.tsx` (integrated)
11. **Pulsar AI Dashboard Test**: `/src/app/pulsar-ai/page.tsx` (integrated)

**Additional Component Test Pages** (can be created as needed):
- Advanced AI Generator
- Content Quality Scorer
- Submission Success Flow
- Publication Readiness Check

---

## Design System Patterns

### Common Features Across Components:

1. **Responsive Design**:
   - Mobile-first approach
   - Consistent breakpoints: `sm:`, `md:`, `lg:`, `xl:`
   - Fluid typography scaling

2. **Glass Morphism**:
   - `bg-white/5` backgrounds
   - `border-white/20` borders
   - `backdrop-blur-sm` effects

3. **Gradient Text**:
   - `bg-gradient-to-r from-red-500 to-purple-500`
   - `bg-clip-text text-transparent`

4. **Hover Effects**:
   - Scale transformations (`hover:scale-105`)
   - Border color changes (`hover:border-red-500/50`)
   - Smooth transitions (`transition-all duration-300`)

5. **Button Styling**:
   - Gradient backgrounds
   - Rounded corners (`rounded-full`)
   - Shadow effects with color matching
   - Icon animations on hover

6. **Typography**:
   - Bold headings with proper line-height
   - White text with opacity variations
   - Break-word handling for long content

---

## Integration Guidelines

### Adding Components to Pages:

1. **Import the component**:
   ```tsx
   import { ComponentName } from '@/components/path/component-name'
   ```

2. **Provide required props**:
   - Always include required props
   - Use optional callbacks for interactivity
   - Add className for additional styling

3. **Handle interactions**:
   - Implement callback functions for user actions
   - Navigate to appropriate pages/modals
   - Update application state as needed

### Styling Considerations:

- All components use Tailwind CSS
- Dark theme optimized (`bg-black` backgrounds)
- Consistent spacing with the design system
- Mobile-responsive by default

### Dependencies:

- **React 18+** with Next.js
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **UI Components**: Card, Button, Badge from shadcn/ui
- **AI Integration**: Custom Pulsar AI library
- **Image Processing**: Next.js Image optimization
- **State Management**: React hooks and context

---

## Component Categories Summary

### **Challenge Components (6)**
Core challenge functionality including cards, ongoing challenges, onboarding, tutorials, and asset management.
- Components 1-6: ChallengeCard, ComingSoonChallenge, OngoingChallenge, ChallengeOnboarding, ChallengeTutorial, ToolkitAssets

### **Content Components (4)**
Masterclass, toolkit resources, FAQ, and rewards display components.
- Components 7-10: FeaturedMasterclass, ToolkitResources, FAQComponent, RewardsComponent

### **Community Components (2)** 
Social engagement and community building components.
- Components 12-13: CatchTheLatest, JoinTheMovement

### **Creator Components (1)**
Creator spotlight and portfolio features.
- Component 11: CreatorSpotlight

### **Gallery Components (3)**
Content discovery, preview, and search functionality.
- Components 14-16: GalleryLandingHero, ContentPreviewModal, AdvancedSearch

### **AI Components (4)**
AI-powered creation tools, suggestions, and quality assessment.
- Components 17-20: PulsarAIDashboard, AdvancedAIGenerator, IntelligentSuggestionsPanel, ContentQualityScorer

### **Submission Components (3)**
End-to-end submission workflow from creation to publication.
- Components 21-23: SubmissionSuccess, SubmissionReview, PublicationReadiness

### **Layout Components (5)**
Header, footer, navigation, and authentication components.
- Components 24-28: PulsarHeader, PulsarFooter, MobileBottomNav, MobileAuth, ProgressiveRegistration

### **Admin Components (4)**
Administrative tools for content management and configuration.
- Components 29-32: DynamicChallengeConfig, TutorialBuilder, WinnerManagement, AssetUpload

### **Total Components: 32**
All components follow consistent design patterns and are production-ready.

---

## Future Enhancements

Potential improvements for each component:

1. **Loading States**: Skeleton loaders for dynamic content
2. **Error Handling**: Fallback UI for failed image loads
3. **Accessibility**: Enhanced ARIA labels and keyboard navigation
4. **Animations**: More sophisticated micro-interactions
5. **Theming**: Support for multiple color schemes
6. **Internationalization**: Multi-language support
7. **Performance**: Lazy loading and image optimization

This documentation should be updated as components evolve or new ones are added to the system.
