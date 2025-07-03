# 🚀 Pulsar Developer Guide

> **Complete architectural overview and development guide for the Pulsar AI Challenge Platform**

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Technology Stack](#-technology-stack)
- [Database Architecture](#-database-architecture)
- [API Architecture](#-api-architecture)
- [Component Architecture](#-component-architecture)
- [Authentication System](#-authentication-system)
- [State Management](#-state-management)
- [File Organization](#-file-organization)
- [Development Workflow](#-development-workflow)
- [Key Features Implementation](#-key-features-implementation)
- [Performance Considerations](#-performance-considerations)
- [Security Implementation](#-security-implementation)
- [Testing Strategy](#-testing-strategy)
- [Deployment Architecture](#-deployment-architecture)

---

## 🎯 Project Overview

**Pulsar** is a modern AI-powered creative challenge platform built for motorcycle enthusiasts and creative professionals. It combines content creation, community engagement, and gamification in a sleek, cyberpunk-themed web application.

### **Core Functionality**
- **Content Creation**: AI-powered artwork and music generation, file uploads
- **Content Moderation**: Admin workflow for reviewing and approving submissions
- **Community Features**: Voting system, leaderboards, user profiles
- **Authentication**: Multi-provider auth (OAuth, Email, Mobile OTP)
- **Real-time Features**: Live voting, dynamic leaderboards, progress tracking

---

## 🏛️ Architecture Overview

### **High-Level Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ • React 19      │    │ • REST APIs     │    │ • Prisma ORM    │
│ • Tailwind CSS  │    │ • NextAuth.js   │    │ • ACID Compliance│
│ • TypeScript    │    │ • Validation    │    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   External      │    │   File Storage  │    │   AI Services   │
│   Services      │    │   (UploadThing) │    │   (OpenAI, etc) │
│                 │    │                 │    │                 │
│ • OAuth Providers│    │ • Image Upload  │    │ • Text-to-Image │
│ • Email Service │    │ • Video Upload  │    │ • Text-to-Music │
│ • SMS Service   │    │ • Audio Upload  │    │ • Content Gen   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Request Flow**

```
User Request → Next.js Router → Page Component → API Routes → Database/External Services → Response
     ↓              ↓              ↓              ↓                    ↓
1. User Action  2. Route Match  3. Component    4. Business     5. Data Layer
   (Click/Form)    (/gallery)     Render         Logic           (CRUD Operations)
```

---

## 📁 Project Structure

### **Root Level Structure**

```
pulsar/
├── 📁 src/                     # Source code
├── 📁 public/                  # Static assets
├── 📁 prisma/                  # Database schema and migrations
├── 📁 docs/                    # Documentation
├── 📄 package.json             # Dependencies and scripts
├── 📄 next.config.ts           # Next.js configuration
├── 📄 tailwind.config.js       # Tailwind CSS configuration
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 .env.example             # Environment variables template
└── 📄 README.md                # Project overview
```

### **Source Code Structure (`/src`)**

```
src/
├── 📁 app/                     # Next.js App Router (Pages & APIs)
│   ├── 📁 (pages)/            # Page routes
│   │   ├── 📄 page.tsx        # Home page (/)
│   │   ├── 📁 auth/           # Authentication pages
│   │   ├── 📁 admin/          # Admin dashboard
│   │   ├── 📁 gallery/        # Content gallery
│   │   ├── 📁 challenge/      # Content creation
│   │   ├── 📁 challenges/     # Challenge listing
│   │   └── 📁 leaderboard/    # Rankings
│   ├── 📁 api/                # API endpoints
│   │   ├── 📁 auth/           # NextAuth.js endpoints
│   │   ├── 📁 submissions/    # Content CRUD
│   │   ├── 📁 votes/          # Voting system
│   │   ├── 📁 admin/          # Admin operations
│   │   └── 📁 analytics/      # Usage tracking
│   ├── 📄 globals.css         # Global styles & theme
│   └── 📄 layout.tsx          # Root layout
├── 📁 components/             # Reusable components
│   ├── 📁 ui/                 # Base UI components
│   ├── 📁 forms/              # Form components
│   ├── 📁 admin/              # Admin-specific components
│   ├── 📁 gallery/            # Gallery-specific components
│   └── 📁 challenge/          # Challenge-specific components
├── 📁 hooks/                  # Custom React hooks
├── 📁 lib/                    # Utilities and configuration
│   ├── 📄 auth.ts             # Authentication configuration
│   ├── 📄 prisma.ts           # Database client
│   ├── 📄 theme.ts            # Brand theme configuration
│   └── 📄 utils.ts            # Common utilities
└── 📁 types/                  # TypeScript type definitions
```

---

## 🛠️ Technology Stack

### **Frontend Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.3 | React framework with App Router |
| **React** | 19.0.0 | UI library with latest features |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **Radix UI** | Latest | Accessible component primitives |
| **Lucide React** | Latest | Icon library |

### **Backend Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 15.3.3 | Serverless API endpoints |
| **NextAuth.js** | 4.24.11 | Authentication framework |
| **Prisma** | 6.9.0 | Database ORM and migrations |
| **PostgreSQL** | Latest | Production database |
| **SQLite** | Built-in | Development database |

### **Development Tools**

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and standards |
| **Prettier** | Code formatting |
| **TypeScript** | Static type checking |
| **Turbopack** | Fast development builds |
| **Prisma Studio** | Database visualization |

---

## 🗄️ Database Architecture

### **Database Schema Overview**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │ Submission  │    │    Vote     │
│             │    │             │    │             │
│ • id        │◄──┐│ • id        │◄──┐│ • id        │
│ • email     │   ││ • title     │   ││ • userId    │
│ • mobile    │   ││ • type      │   ││ • submissionId
│ • name      │   ││ • status    │   │└─────────────┘
│ • provider  │   ││ • contentUrl│   │
└─────────────┘   ││ • userId    │──┘
                  │└─────────────┘
                  │
┌─────────────┐   │ ┌─────────────┐
│   Account   │   │ │   Session   │
│             │   │ │             │
│ • userId    │──┘  │ • userId    │
│ • provider  │     │ • sessionToken
│ • type      │     │ • expires   │
└─────────────┘     └─────────────┘
```

### **Key Models**

#### **User Model**
```typescript
model User {
  id          String   @id @default(cuid())
  email       String?  @unique
  mobile      String?  @unique
  name        String?
  image       String?
  provider    String   // Authentication provider
  createdAt   DateTime @default(now())
  
  // Relations
  submissions Submission[]
  votes       Vote[]
  accounts    Account[]
  sessions    Session[]
}
```

#### **Submission Model**
```typescript
model Submission {
  id          String           @id @default(cuid())
  title       String
  type        SubmissionType   // AI_ARTWORK, AI_SONG, FILE_UPLOAD
  status      SubmissionStatus @default(PENDING) // PENDING, APPROVED, REJECTED
  contentUrl  String
  caption     String?
  prompt      String?          // AI generation prompt
  voteCount   Int             @default(0)
  userId      String
  
  // Relations
  user        User            @relation(fields: [userId], references: [id])
  votes       Vote[]
}
```

### **Database Relationships**

- **User → Submissions**: One-to-Many (User can create multiple submissions)
- **User → Votes**: One-to-Many (User can vote on multiple submissions)
- **Submission → Votes**: One-to-Many (Submission can receive multiple votes)
- **User → Accounts**: One-to-Many (OAuth provider accounts)
- **User → Sessions**: One-to-Many (Authentication sessions)

---

## 🔌 API Architecture

### **API Route Structure**

```
/api/
├── auth/                   # NextAuth.js endpoints
│   └── [...nextauth]/     
├── submissions/           # Content management
│   ├── route.ts          # GET (list), POST (create)
│   └── [id]/             # GET, PUT, DELETE (specific submission)
├── votes/                # Voting system
│   ├── route.ts          # POST (toggle vote)
│   ├── limits/           # GET (vote limits tracking)
│   └── history/          # GET (user's vote history)
├── admin/                # Admin operations
│   ├── submissions/      # Content moderation
│   └── users/            # User management
├── gallery/              # Public gallery
│   └── stats/            # Gallery statistics
├── leaderboard/          # Rankings
│   └── stats/            # Leaderboard statistics
└── analytics/            # Usage tracking
    ├── gallery/          # Gallery analytics
    └── submissions/      # Submission analytics
```

### **API Response Patterns**

#### **Success Response**
```typescript
{
  success: true,
  data: T,
  message?: string,
  meta?: {
    total?: number,
    page?: number,
    limit?: number
  }
}
```

#### **Error Response**
```typescript
{
  success: false,
  error: string,
  details?: any,
  code?: string
}
```

### **Authentication Flow**

```
Client Request → Middleware → getServerSession() → Database → Response
     ↓              ↓              ↓                 ↓         ↓
1. API Call    2. Route Guard   3. Session Check   4. User   5. Authorized
   with headers   (if required)    (NextAuth.js)     Lookup    Response
```

---

## 🧩 Component Architecture

### **Component Hierarchy**

```
App Layout (layout.tsx)
├── Header/PulsarHeader
├── Page Component
│   ├── UI Components (Button, Card, etc.)
│   ├── Feature Components (VoteButton, SubmissionCard)
│   └── Form Components (LoginForm, SubmissionForm)
└── Footer (if present)
```

### **Component Categories**

#### **1. UI Components (`/components/ui/`)**
Base, reusable components following design system:
- `Button` - Primary/secondary/outline variants
- `Card` - Content containers with shadows
- `Input` - Form input fields
- `Badge` - Status indicators
- `Modal` - Overlay dialogs

#### **2. Feature Components (`/components/`)**
Business logic components:
- `SubmissionCard` - Display content submissions
- `VoteButton` - Voting interaction
- `AdminPanel` - Content moderation
- `LeaderboardTable` - Rankings display

#### **3. Layout Components**
- `Header` - Main navigation
- `PulsarHeader` - Branded header variant
- `Navigation` - Menu systems
- `Sidebar` - Admin navigation

### **Component Pattern**

```typescript
// Standard component structure
interface ComponentProps {
  // Props definition
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks
  const [state, setState] = useState()
  const { data } = useCustomHook()
  
  // Event handlers
  const handleAction = () => {
    // Logic
  }
  
  // Render
  return (
    <div className="component-styles">
      {/* JSX */}
    </div>
  )
}
```

---

## 🔐 Authentication System

### **Authentication Providers**

| Provider | Type | Purpose |
|----------|------|---------|
| **Google OAuth** | Social | Primary social login |
| **Facebook OAuth** | Social | Alternative social login |
| **Email Magic Link** | Email | Production email auth |
| **Mobile OTP** | Credentials | SMS-based authentication |
| **Development Bypass** | Credentials | Local development |

### **Authentication Flow**

```
User Login → NextAuth.js → Provider → Database → Session Creation
     ↓            ↓           ↓          ↓            ↓
1. Click Login  2. Provider  3. OAuth   4. User     5. JWT Token
   Button         Selection    Flow       Creation    + Session
```

### **Session Management**

```typescript
// Client-side session access
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
// status: 'loading' | 'authenticated' | 'unauthenticated'

// Server-side session access
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
```

### **Protected Routes**

Routes are protected using session checks:
- **Public**: `/`, `/gallery` (read-only)
- **Authentication Required**: `/challenge`, `/profile`
- **Admin Only**: `/admin/*`

---

## 📊 State Management

### **State Management Strategy**

| Scope | Solution | Usage |
|-------|----------|--------|
| **Authentication** | NextAuth.js | Global user session |
| **Component State** | React useState | Local component data |
| **Server State** | Custom hooks + fetch | API data caching |
| **Form State** | React Hook Form | Form validation |

### **Custom Hooks**

#### **Data Fetching Hooks**
```typescript
// Vote limits tracking
const { limits, loading, error } = useVoteLimits()

// Gallery analytics
const { stats, refreshStats } = useGalleryAnalytics()

// Submission management
const { submissions, loading } = useSubmissions(filters)
```

#### **State Management Pattern**
```typescript
export function useCustomHook() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/endpoint')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])
  
  return { data, loading, error, refetch: fetchData }
}
```

---

## 📂 File Organization

### **Naming Conventions**

| Type | Convention | Example |
|------|------------|---------|
| **Components** | PascalCase | `SubmissionCard.tsx` |
| **Pages** | lowercase | `page.tsx`, `layout.tsx` |
| **Hooks** | camelCase with 'use' | `useVoteLimits.ts` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Constants** | UPPER_CASE | `API_ENDPOINTS.ts` |
| **Types** | PascalCase | `User.ts`, `Submission.ts` |

### **Import Organization**

```typescript
// 1. External libraries
import React from 'react'
import { NextRequest } from 'next/server'

// 2. Internal components/hooks
import { Button } from '@/components/ui/button'
import { useVoteLimits } from '@/hooks/useVoteLimits'

// 3. Utilities and types
import { prisma } from '@/lib/prisma'
import type { User } from '@/types/user'
```

### **Barrel Exports**

```typescript
// /components/ui/index.ts
export { Button } from './button'
export { Card, CardContent, CardHeader } from './card'
export { Input } from './input'

// Usage
import { Button, Card, Input } from '@/components/ui'
```

---

## 🔄 Development Workflow

### **Git Workflow**

```bash
# Feature development
git checkout -b feature/vote-limits-tracking
# ... make changes ...
git commit -m "feat: add vote limits tracking system"
git push origin feature/vote-limits-tracking
# Create Pull Request
```

### **Development Commands**

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Code linting

# Database
npx prisma generate  # Generate TypeScript types
npx prisma migrate dev # Apply migrations
npx prisma db seed   # Seed sample data
npx prisma studio    # Database browser
```

### **Code Quality**

- **TypeScript**: Strict mode enabled
- **ESLint**: Code standards enforcement
- **Prettier**: Consistent formatting
- **Pre-commit hooks**: Quality checks before commit

---

## ✨ Key Features Implementation

### **1. AI Content Generation**

```typescript
// AI artwork generation flow
User Input → Prompt Processing → API Call → Image Generation → Storage → Display
     ↓              ↓              ↓            ↓             ↓         ↓
1. Form Submit  2. Validation   3. OpenAI    4. Image URL   5. Upload  6. Preview
```

### **2. Real-time Voting System**

```typescript
// Vote toggle mechanism
const handleVote = async (submissionId: string) => {
  // Optimistic update
  setVotes(prev => prev + (hasVoted ? -1 : 1))
  
  // API call
  const result = await fetch('/api/votes', {
    method: 'POST',
    body: JSON.stringify({ submissionId })
  })
  
  // Revert if failed
  if (!result.ok) {
    setVotes(prev => prev + (hasVoted ? 1 : -1))
  }
}
```

### **3. Admin Content Moderation**

```typescript
// Three-tab admin interface
PENDING → Review → APPROVE/REJECT → Database Update → UI Refresh
   ↓        ↓          ↓              ↓               ↓
1. Fetch   2. Admin   3. Action      4. Status       5. Real-time
   Content   Review     Selection      Update          Update
```

### **4. Progressive Content Journey**

```typescript
// Multi-step content creation
Step 1: Type Selection → Step 2: Content Creation → Step 3: Enhancement → Step 4: Submission
   ↓                       ↓                         ↓                     ↓
AI/Upload Choice        Generate/Upload           Add Effects           Submit for Review
```

---

## ⚡ Performance Considerations

### **Optimization Strategies**

| Area | Strategy | Implementation |
|------|----------|----------------|
| **Images** | Next.js Image optimization | `next/image` component with lazy loading |
| **Code Splitting** | Dynamic imports | `dynamic()` for heavy components |
| **Database** | Query optimization | Prisma select, include, and pagination |
| **Caching** | API response caching | Next.js API route caching |
| **Bundling** | Turbopack | Fast development builds |

### **Performance Monitoring**

```typescript
// Performance metrics tracking
console.time('api-call')
const result = await fetch('/api/endpoint')
console.timeEnd('api-call')

// Database query optimization
const submissions = await prisma.submission.findMany({
  select: { id: true, title: true, voteCount: true }, // Only needed fields
  where: { status: 'APPROVED' },
  take: 20, // Pagination
  skip: page * 20
})
```

---

## 🔒 Security Implementation

### **Security Measures**

| Area | Implementation |
|------|----------------|
| **Authentication** | NextAuth.js with secure sessions |
| **Authorization** | Role-based access control |
| **Input Validation** | Server-side validation for all inputs |
| **SQL Injection** | Prisma ORM with parameterized queries |
| **CSRF Protection** | Built-in Next.js CSRF protection |
| **Environment Variables** | Secure secret management |

### **API Security Pattern**

```typescript
export async function POST(request: NextRequest) {
  // 1. Authentication check
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // 2. Input validation
  const body = await request.json()
  if (!body.submissionId) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }
  
  // 3. Authorization check
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user || !hasPermission(user, 'vote')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // 4. Business logic
  // ... secure implementation
}
```

---

## 🧪 Testing Strategy

### **Testing Pyramid**

```
     /\
    /  \     E2E Tests (Integration)
   /____\    
  /      \   Component Tests (React Testing Library)
 /________\  
/__________\ Unit Tests (Jest)
```

### **Test Files Location**

```
src/
├── __tests__/          # Unit tests
├── components/
│   └── __tests__/      # Component tests
└── app/
    └── api/
        └── __tests__/  # API tests
```

### **Testing Examples**

```typescript
// Component test
import { render, screen } from '@testing-library/react'
import { SubmissionCard } from '../submission-card'

test('renders submission card with title', () => {
  render(<SubmissionCard title="Test Submission" />)
  expect(screen.getByText('Test Submission')).toBeInTheDocument()
})

// API test
import { POST } from '../api/votes/route'

test('POST /api/votes requires authentication', async () => {
  const request = new Request('http://localhost/api/votes', {
    method: 'POST',
    body: JSON.stringify({ submissionId: '123' })
  })
  
  const response = await POST(request)
  expect(response.status).toBe(401)
})
```

---

## 🚀 Deployment Architecture

### **Deployment Options**

| Platform | Configuration | Benefits |
|----------|---------------|----------|
| **Vercel** | Zero-config | Automatic deployments, edge functions |
| **Docker** | Containerized | Consistent environments, easy scaling |
| **Traditional Server** | PM2 + Nginx | Full control, cost-effective |

### **Environment Configuration**

```bash
# Production environment variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="secure-random-string"
NEXTAUTH_URL="https://yourdomain.com"

# Optional services
GOOGLE_CLIENT_ID="..."
OPENAI_API_KEY="..."
UPLOADTHING_SECRET="..."
```

### **CI/CD Pipeline**

```yaml
# GitHub Actions example
name: Deploy
on:
  push:
    branches: [main]
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: vercel/action@v1
```

---

## 📚 Additional Resources

### **Key Documentation Files**
- `README.md` - Setup and quick start guide
- `docs/PROJECT_STATUS_DASHBOARD.md` - Feature completion status
- `docs/CSS_ARCHITECTURE.md` - Styling guidelines
- `docs/REQUIREMENTS_INDEX.md` - Feature documentation index

### **Useful Commands Reference**

```bash
# Development
npm run dev                    # Start development server
npm run build && npm start     # Production build and run

# Database
npx prisma studio             # Database browser
npx prisma migrate reset      # Reset database (dev only)
npx prisma db seed           # Add sample data

# Debugging
npm run lint                 # Check code quality
npx next info               # Next.js environment info
```

### **External Resources**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🎯 Getting Started for New Developers

### **1. Environment Setup**
```bash
git clone <repository-url>
cd pulsar
npm install
cp .env.example .env
# Edit .env with your configuration
```

### **2. Database Setup**
```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

### **3. Start Development**
```bash
npm run dev
# Open http://localhost:3000
```

### **4. Explore the Codebase**
- Start with `src/app/page.tsx` (home page)
- Check `src/app/api/` for API endpoints
- Browse `src/components/` for UI components
- Review `prisma/schema.prisma` for data models

---

*This developer guide provides a comprehensive overview of the Pulsar platform architecture. For specific implementation details, refer to the individual files and their inline documentation.*

**Last Updated**: June 23, 2025 | **Version**: 1.0 | **Status**: Production Ready 🚀
