# 🚀 Pulsar Developer Quick Reference

> **Essential commands and patterns for Pulsar development**

## 📋 Quick Commands

### **Development**
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Code linting
```

### **Database**
```bash
npx prisma generate  # Generate TypeScript types
npx prisma migrate dev # Apply migrations
npx prisma db seed   # Seed sample data
npx prisma studio    # Database browser (http://localhost:5555)
npx prisma db push   # Push schema changes
npx prisma migrate reset # Reset database (dev only)
```

---

## 📁 Key Directories

```
src/
├── app/                    # Pages & API routes
│   ├── page.tsx           # Home page
│   ├── api/               # API endpoints
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin dashboard
│   ├── gallery/           # Content gallery
│   └── challenge/         # Content creation
├── components/            # Reusable components
│   ├── ui/                # Base UI components
│   └── forms/             # Form components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities & config
│   ├── auth.ts            # Authentication config
│   ├── prisma.ts          # Database client
│   └── theme.ts           # Brand theme
└── types/                 # TypeScript definitions
```

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Current session

### **Submissions**
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `PUT /api/submissions/[id]` - Update submission
- `DELETE /api/submissions/[id]` - Delete submission

### **Voting**
- `POST /api/votes` - Toggle vote
- `GET /api/votes/limits` - Vote limits tracking
- `GET /api/votes/history` - User vote history

### **Admin**
- `POST /api/admin/submissions/approve` - Approve submission
- `POST /api/admin/submissions/reject` - Reject submission

---

## 🧩 Component Patterns

### **Basic Component**
```tsx
interface Props {
  title: string
  onClick?: () => void
}

export function Component({ title, onClick }: Props) {
  return (
    <div className="component-styles" onClick={onClick}>
      {title}
    </div>
  )
}
```

### **API Hook Pattern**
```tsx
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
  
  return { data, loading, error, refetch: fetchData }
}
```

### **API Route Pattern**
```tsx
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await prisma.model.findMany()
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## 🎨 Styling Reference

### **Theme Colors**
```css
/* Primary colors */
--red-500: #ef4444        /* Primary red */
--blue-500: #3b82f6       /* Primary blue */
--black: #000000          /* Background */

/* Gradients */
bg-gradient-to-r from-red-500 to-blue-500  /* Primary gradient */
```

### **Common Classes**
```css
/* Buttons */
.btn-primary     /* Red gradient button */
.btn-secondary   /* Outline button */

/* Cards */
.card-hover      /* Hover effect */
.glass-panel     /* Glassmorphism effect */

/* Text */
.gradient-text   /* Gradient text effect */
```

---

## 🔐 Authentication

### **Client-side Session**
```tsx
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()
// status: 'loading' | 'authenticated' | 'unauthenticated'
```

### **Server-side Session**
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
```

### **Protected API Route**
```tsx
const session = await getServerSession(authOptions)
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

## 📊 Database Models

### **Key Models**
```prisma
model User {
  id          String @id @default(cuid())
  email       String? @unique
  name        String?
  submissions Submission[]
  votes       Vote[]
}

model Submission {
  id         String @id @default(cuid())
  title      String
  type       SubmissionType
  status     SubmissionStatus @default(PENDING)
  contentUrl String
  userId     String
  user       User @relation(fields: [userId], references: [id])
  votes      Vote[]
}

model Vote {
  id           String @id @default(cuid())
  userId       String
  submissionId String
  user         User @relation(fields: [userId], references: [id])
  submission   Submission @relation(fields: [submissionId], references: [id])
}
```

---

## 🔧 Environment Variables

### **Required**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/pulsar"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### **Optional**
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
OPENAI_API_KEY="..."
UPLOADTHING_SECRET="..."
```

---

## 🐛 Common Issues & Solutions

### **Database Connection**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql

# Reset database
npx prisma migrate reset
```

### **Port Issues**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Use different port
npm run dev -- -p 3001
```

### **Dependencies**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Resources

- **Main Guide**: `docs/DEVELOPER_GUIDE.md`
- **Setup**: `README.md`
- **Requirements**: `docs/REQUIREMENTS_INDEX.md`
- **Project Structure**: See main Developer Guide

---

*Quick reference for Pulsar development - see DEVELOPER_GUIDE.md for detailed information*
