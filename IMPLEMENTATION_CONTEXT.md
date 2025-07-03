# 🏗️ Pulsar AI Challenge Platform - Implementation Context

> **Note**: For concise GitHub Copilot instructions, see [.github/copilot-instructions.md](.github/copilot-instructions.md). This document provides comprehensive implementation context and architectural patterns.

## 📋 Project Overview

**Project Name**: Pulsar AI Challenge Platform (BeFollowed)  
**Framework**: Next.js 15 with React 19 and TypeScript  
**Styling**: Tailwind CSS 4.0 + Custom Cyberpunk Theme  
**Database**: SQLite with Prisma ORM  
**Authentication**: NextAuth.js with OAuth  
**Last Updated**: June 29, 2025

This is a fully functional AI-powered creative challenge platform with content moderation, voting system, and comprehensive admin panel. The platform features a modern cyberpunk aesthetic with responsive design, enhanced desktop layouts, and mobile-first components.

**🎯 Latest Updates:**
- ✅ **Creative Desktop Layouts**: Home, Challenge, and Challenges pages now feature professional desktop designs
- ✅ **Responsive Components**: All components are mobile-first with enhanced desktop experiences  
- ✅ **Clean Codebase**: Test pages and debugging utilities removed for production readiness
- ✅ **Component Library**: 40+ reusable components with comprehensive documentation

---

## 🏗️ Project Architecture

### **Directory Structure**
```
pulsar/
├── src/
│   ├── app/                    # Next.js 15 App Router pages (Production Ready)
│   │   ├── globals.css         # 🎨 Main CSS file (brand control center)
│   │   ├── layout.tsx          # Root layout with header/footer
│   │   ├── page.tsx            # 🏠 Homepage with creative desktop layout
│   │   ├── admin/              # Admin panel for content moderation
│   │   ├── api/                # API routes (RESTful endpoints)
│   │   ├── auth/               # Authentication pages (signin/signup)
│   │   ├── challenge/          # 🎯 Individual challenge page (desktop enhanced)
│   │   ├── challenges/         # 📋 Challenges listing page (desktop enhanced)
│   │   ├── gallery/            # Public gallery with voting
│   │   ├── leaderboard/        # Rankings and statistics
│   │   ├── profile/            # User profile management
│   │   └── [other pages]/      # Privacy, terms, etc.
│   ├── components/             # 40+ Reusable components (see COMPONENTS_DOCUMENTATION.md)
│   │   ├── ui/                 # Base UI components
│   │   ├── admin/              # Admin-specific components
│   │   ├── ai/                 # AI generation components
│   │   ├── challenge/          # Challenge workflow components
│   │   ├── community/          # Community features (CatchTheLatest, JoinTheMovement)
│   │   ├── creator/            # Creator spotlight components
│   │   ├── masterclass/        # Featured masterclass components
│   │   ├── rewards/            # Rewards system components
│   │   └── providers/          # Context providers
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utilities and configurations
├── prisma/                     # Database schema and migrations
├── docs/                       # 📚 Complete documentation (42+ documents)
└── package.json               # Dependencies and scripts
```

### **Tech Stack**
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4.0
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Auth**: NextAuth.js with Google/Facebook OAuth
- **UI Library**: Custom components with Radix UI primitives
- **Styling**: CSS variables + utility classes (cyberpunk theme)
- **Icons**: Lucide React
- **State Management**: React hooks and context

---

## 🎨 Styling Guidelines

### **CSS Architecture**
The project uses a **centralized CSS system** with brand control in `/src/app/globals.css`:

```css
/* Brand Colors - Modify these to change entire theme */
:root {
  --neon-pink: #FF006F;         /* Primary CTAs, accents */
  --electric-blue: #00E5FF;     /* Secondary highlights */
  --cyber-black: #0A0A0A;       /* Primary background */
  --dark-gray: #1A1A1A;         /* Card backgrounds */
  --glass-bg: rgba(26, 26, 26, 0.8);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### **CSS Class Patterns**
```typescript
// Preferred component styling approach:
<Component className={cn(
  "base-tailwind-classes",
  "custom-brand-classes",
  conditionalClasses && "conditional-styling",
  props.className
)} />

// Common brand classes to use:
"cyber-button"           // Primary button with neon gradient
"glass-panel"           // Glassmorphism card effect
"neon-glow-pink"        // Pink neon glow on hover
"neon-glow-blue"        // Blue neon glow effect
"neon-text-pink"        // Pink glowing text
"cyber-shadow"          // Brand shadow effect
```

### **Responsive Patterns**
```typescript
// Standard responsive patterns:
"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4"  // Grid layouts
"text-xl md:text-4xl"                             // Typography scaling
"px-4 py-16 max-w-4xl"                           // Container spacing
"hidden md:flex"                                  // Desktop only
"md:hidden"                                       // Mobile only
```

---

## � Responsive Design Philosophy

### **Mobile-First Approach**
The Pulsar platform follows a **mobile-first, desktop-enhanced** strategy:

```typescript
// All components are built mobile-first with desktop enhancements
<div className="block lg:hidden">
  {/* Mobile Layout - Always preserve existing functionality */}
</div>

<div className="hidden lg:block">
  {/* Desktop Layout - Enhanced creative layouts */}
</div>
```

### **Key Pages with Enhanced Desktop Layouts**

#### **🏠 Home Page (`/`)**
- **Mobile**: Preserved original vertical layout with carousel
- **Desktop**: Creative 12-column grid with floating stats cards, quick actions panel, and multi-column content sections

#### **🎯 Challenge Page (`/challenge`)**
- **Mobile**: Preserved original progressive journey flow
- **Desktop**: Sidebar navigation with main content area, pro tips panel, and inspiration section

#### **📋 Challenges Page (`/challenges`)**
- **Mobile**: Preserved original card list layout  
- **Desktop**: Hero grid with sidebar filters, featured challenges, and multi-section toolkit/masterclass/FAQ layout

### **Responsive Breakpoints**
```css
/* Standard breakpoints used throughout */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */ 
lg: 1024px  /* Large devices - Desktop layouts start here */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* Ultra wide displays */
```

---

## 🧩 Component Architecture

### **Component Documentation**
📚 **Primary Reference**: `/docs/COMPONENTS_DOCUMENTATION.md`

This comprehensive document contains detailed information about all 40+ reusable components including:
- **Props interfaces** with TypeScript definitions
- **Usage examples** with code snippets
- **Styling guidelines** and customization options
- **Responsive behavior** documentation
- **Integration patterns** with other components

### **Component Categories**

#### **🎯 Challenge Components (6 components)**
- `ChallengeCard`, `OngoingChallenge`, `ChallengeOnboarding`, etc.
- All responsive with enhanced desktop layouts

#### **🎨 Content Components (13 components)**  
- `CreatorSpotlight`, `FeaturedMasterclass`, `RewardsComponent`, etc.
- Used in both mobile and desktop layouts

#### **🤖 AI Components (4 components)**
- `PulsarAIDashboard`, `AdvancedAIGenerator`, `IntelligentSuggestionsPanel`, etc.
- Advanced AI integration features

#### **📱 UI Components (15+ components)**
- Base components, forms, modals, navigation, etc.
- Foundation of the design system

### **Component Usage Pattern**
```typescript
// Standard reusable component usage across mobile/desktop
<OngoingChallenge
  title="Speed Meets Creativity"
  subtitle="Current Challenge" 
  description="Express your ride, your style, your vision."
  // ... other props
  onJoinChallenge={() => window.location.href = '/challenge'}
/>

// Same component, same props, different layout contexts:
// - Mobile: Stacked in individual sections
// - Desktop: Arranged in grid layouts (2-col, 3-col, etc.)
```

---

## �🔧 Component Patterns

### **UI Component Structure**
```typescript
// Standard component pattern:
interface ComponentProps {
  className?: string
  variant?: "default" | "cyber" | "glass"
  children: React.ReactNode
}

export function Component({ 
  className, 
  variant = "default", 
  children,
  ...props 
}: ComponentProps) {
  return (
    <div 
      className={cn(
        "base-styling",
        variant === "cyber" && "cyber-button neon-glow-pink",
        variant === "glass" && "glass-panel cyber-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### **API Route Pattern**
```typescript
// Standard API route structure:
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Your logic here
    const result = await prisma.model.findMany()
    
    return Response.json({ success: true, data: result })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

### **Form Handling Pattern**
```typescript
// Standard form component with validation:
export function FormComponent() {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('Failed')
      
      // Handle success
    } catch (err) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
    </form>
  )
}
```

---

## 🗄️ Database Patterns

### **Prisma Schema Conventions**
```prisma
// Follow these naming patterns:
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations use camelCase
  submissions Submission[]
  votes      Vote[]
}

model Submission {
  id       String          @id @default(cuid())
  title    String
  status   SubmissionStatus @default(PENDING)
  
  // Foreign keys
  userId   String
  user     User            @relation(fields: [userId], references: [id])
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### **Database Query Patterns**
```typescript
// Standard database operations:
const submissions = await prisma.submission.findMany({
  where: { status: 'APPROVED' },
  include: { 
    user: { select: { name: true, email: true } },
    votes: true 
  },
  orderBy: { createdAt: 'desc' }
})

// With error handling:
try {
  const result = await prisma.model.create({
    data: { /* validated data */ }
  })
} catch (error) {
  if (error.code === 'P2002') {
    // Handle unique constraint violation
  }
  throw error
}
```

---

## 🔐 Authentication Patterns

### **Page Protection**
```typescript
// For pages requiring authentication:
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/api/auth/signin')
  }

  return <div>Protected content</div>
}
```

### **Client-side Auth Checks**
```typescript
// For client components:
import { useSession } from 'next-auth/react'

export function ClientComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Please sign in</div>

  return <div>Authenticated content</div>
}
```

### **Admin Role Checks**
```typescript
// Admin access pattern:
const isAdmin = session?.user?.email === 'testuser@example.com' || 
                session?.user?.email?.includes('admin')

if (!isAdmin) {
  return Response.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 🚀 Performance Guidelines

### **Image Optimization**
```typescript
// Always use Next.js Image component:
import Image from 'next/image'

<Image
  src="/path/to/image.jpg"
  alt="Descriptive alt text"
  width={400}
  height={300}
  className="rounded-lg"
  priority={isAboveTheFold}
/>

// For dynamic images with fallback:
<SafeImage
  src={submission.imageUrl}
  alt={submission.title}
  fill
  className="object-cover"
  fallback={<div className="fallback-content">📄</div>}
/>
```

### **Loading States**
```typescript
// Standard loading pattern:
const [loading, setLoading] = useState(false)

{loading ? (
  <Button disabled className="opacity-50">
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
    Processing...
  </Button>
) : (
  <Button onClick={handleAction}>
    Action
  </Button>
)}
```

### **Error Boundaries**
```typescript
// Wrap components that might fail:
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <RiskyComponent />
</ErrorBoundary>
```

---

## 📝 Code Quality Standards

### **TypeScript Guidelines**
```typescript
// Always use proper typing:
interface Props {
  title: string
  count?: number
  onAction: (id: string) => void
  children: React.ReactNode
}

// Use enums for constants:
enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Prefer type inference where possible:
const submissions = await getSubmissions() // Type inferred from function
```

### **Import Organization**
```typescript
// Standard import order:
import React from 'react'                    // React imports
import { useState, useEffect } from 'react'
import Link from 'next/link'                 // Next.js imports
import { useSession } from 'next-auth/react' // Third-party imports

import { Button } from '@/components/ui/button' // Internal UI components
import { prisma } from '@/lib/prisma'           // Internal utilities
import { cn } from '@/lib/utils'
```

### **Error Handling**
```typescript
// Always handle errors gracefully:
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  
  // User-friendly error message
  throw new Error('Unable to complete operation. Please try again.')
}
```

---

## 🎯 Component Naming Conventions

### **File and Component Names**
```typescript
// Components: PascalCase
AdminPanel.tsx
SubmissionCard.tsx
VotingButton.tsx

// Hooks: camelCase with 'use' prefix
useSubmissions.ts
useVoting.ts
useAuth.ts

// Utils: camelCase
formatDate.ts
validateInput.ts
apiHelpers.ts

// API routes: kebab-case
submissions.ts
vote-toggle.ts
admin-actions.ts
```

### **Props and State**
```typescript
// Props: descriptive and typed
interface SubmissionCardProps {
  submission: Submission
  onVote: (submissionId: string) => void
  isVoted?: boolean
  showActions?: boolean
}

// State: descriptive names
const [submissions, setSubmissions] = useState<Submission[]>([])
const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
const [errors, setErrors] = useState<string[]>([])
```

---

## 🔄 Common Workflows

### **Adding a New Page**
1. Create page in `/src/app/new-page/page.tsx`
2. Add route to navigation in `/src/components/ui/header.tsx`
3. Implement responsive design with cyberpunk theme
4. Add authentication if needed
5. Test mobile responsiveness

### **Creating API Endpoint**
1. Create file in `/src/app/api/endpoint/route.ts`
2. Implement GET/POST/PUT/DELETE as needed
3. Add proper authentication checks
4. Include error handling and validation
5. Test with proper status codes

### **Adding Database Model**
1. Update `/prisma/schema.prisma`
2. Run `npx prisma db push` for development
3. Generate types with `npx prisma generate`
4. Create migration for production
5. Update related API endpoints

---

## 🎨 Brand Guidelines for AI

### **Color Usage**
- **Primary Actions**: Use `cyber-button` class or `--neon-pink` 
- **Secondary Actions**: Use `--electric-blue` or outline variants
- **Backgrounds**: Use `glass-panel` for cards, `--cyber-black` for pages
- **Text**: White primary text, colored accents for highlights

### **Component Theming**
- **Buttons**: Primary actions get `cyber-button`, secondary get `variant="outline"`
- **Cards**: Use `glass-panel cyber-shadow` for elevated content
- **Headers**: Large text with `neon-text-pink` or `neon-text-blue`
- **Hover Effects**: Add `hover:neon-glow-pink` or `hover:neon-glow-blue`

### **Mobile-First Approach**
- Start with mobile layout, enhance for desktop
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Touch-friendly sizing (minimum 44px touch targets)
- Test on mobile devices regularly

---

## 📚 Documentation Standards

### **Component Documentation**
```typescript
/**
 * SubmissionCard - Displays a submission with voting functionality
 * 
 * @param submission - The submission data to display
 * @param onVote - Callback fired when user votes
 * @param isVoted - Whether current user has voted
 * @param showActions - Whether to show action buttons
 * 
 * @example
 * <SubmissionCard
 *   submission={submission}
 *   onVote={handleVote}
 *   isVoted={hasVoted}
 *   showActions={true}
 * />
 */
```

### **API Documentation**
```typescript
/**
 * GET /api/submissions
 * 
 * Returns paginated list of approved submissions
 * 
 * Query params:
 * - page?: number (default: 1)
 * - limit?: number (default: 20)
 * - type?: SubmissionType
 * 
 * Returns:
 * {
 *   submissions: Submission[]
 *   pagination: { page, limit, total, hasMore }
 * }
 */
```

---

## 🔍 Testing Guidelines

### **Component Testing**
```typescript
// Test user interactions and edge cases
describe('SubmissionCard', () => {
  it('should handle vote action', () => {
    const onVote = jest.fn()
    render(<SubmissionCard submission={mockSubmission} onVote={onVote} />)
    
    fireEvent.click(screen.getByRole('button', { name: /vote/i }))
    expect(onVote).toHaveBeenCalledWith(mockSubmission.id)
  })
})
```

### **API Testing**
```typescript
// Test API endpoints with different scenarios
describe('/api/submissions', () => {
  it('should return submissions for authenticated user', async () => {
    const response = await GET(mockRequest)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.submissions).toHaveLength(expectedLength)
  })
})
```

---

## 🚨 Common Pitfalls to Avoid

1. **Authentication**: Always check authentication before sensitive operations
2. **Database**: Use transactions for related operations
3. **Styling**: Don't inline styles, use CSS classes or Tailwind
4. **Images**: Always include alt text and proper sizing
5. **API**: Include proper error handling and status codes
6. **Mobile**: Test responsive design on actual devices
7. **Performance**: Lazy load components and images when possible
8. **Security**: Validate all inputs and sanitize user data

---

## 🎯 Project-Specific Notes

### **Development Features**
- **Test User**: Use proper OAuth providers for authentication  
- **Hot Reload**: Full TypeScript and CSS hot reloading enabled
- **Database**: SQLite for development, easy to inspect with Prisma Studio

### **Key Features Implemented**
- ✅ **Complete content moderation workflow** (PENDING → APPROVED → Public)
- ✅ **Real-time voting system** with toggle functionality
- ✅ **AI content generation** (artwork and music)
- ✅ **File upload** with multiple format support
- ✅ **Responsive gallery** with filtering and search
- ✅ **Comprehensive admin panel** with three-tab interface
- ✅ **Leaderboard** with category filtering and statistics
- ✅ **User authentication** with role-based access
- ✅ **Creative desktop layouts** for key pages (Home, Challenge, Challenges)
- ✅ **40+ reusable components** with full documentation
- ✅ **Mobile-first responsive design** with desktop enhancements
- ✅ **Production-ready codebase** (test files cleaned up)

### **Quick Commands**
```bash
npm run dev          # Start development server
npx prisma studio    # Open database browser
npx prisma db push   # Update database schema
npm run build        # Build for production
npm run lint         # Run ESLint
```

---

## 📖 Additional Resources

### **📚 Documentation Hub**
- **Component Library**: `/docs/COMPONENTS_DOCUMENTATION.md` - Complete guide to all 40+ components
- **Complete Documentation**: `/docs/` directory contains 42+ detailed implementation documents
- **Project Status**: See `/docs/PROJECT_STATUS_DASHBOARD.md` for quick overview
- **CSS Architecture**: See `/docs/CSS_ARCHITECTURE.md` for styling guide
- **Requirements**: See `/docs/prd.md` for original product requirements

### **🎨 Design References**
- **Theme System**: All brand colors and styles controlled in `/src/app/globals.css`
- **Component Patterns**: Mobile-first with desktop enhancements using `lg:` breakpoints
- **Responsive Layouts**: Grid systems for desktop (2-col, 3-col), stacked for mobile

### **🔧 Development References**
- **TypeScript**: Strict typing enforced throughout
- **Tailwind**: Utility-first with custom brand classes
- **Next.js 15**: App Router with Server Components where appropriate
- **Prisma**: Database ORM with SQLite for development

---

**🤖 GitHub Copilot Guidelines**: 

When working on the Pulsar AI Challenge Platform:

1. **🏗️ Always reference component documentation** in `/docs/COMPONENTS_DOCUMENTATION.md` before creating new components
2. **📱 Follow mobile-first approach** - preserve mobile layouts, enhance for desktop with `lg:` breakpoints  
3. **🎨 Maintain cyberpunk aesthetic** - use brand colors and glassmorphism effects
4. **🔧 Use reusable components** - leverage the existing component library before building new ones
5. **📊 Keep TypeScript strict** - proper interfaces and type safety
6. **✨ Ensure accessibility** - proper ARIA labels, semantic HTML, keyboard navigation

---

*Copilot Instructions - Version 2.0 | Updated June 29, 2025*
