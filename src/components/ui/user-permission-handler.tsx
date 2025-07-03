import React from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, Lock, Eye, Crown, User, LogIn } from 'lucide-react'
import Link from 'next/link'

export type UserRole = 'guest' | 'user' | 'creator' | 'admin'
export type PermissionLevel = 'view' | 'vote' | 'create' | 'moderate' | 'admin'

interface UserPermission {
  level: PermissionLevel
  granted: boolean
  reason?: string
  action?: React.ReactNode
}

interface UserPermissionHandlerProps {
  requiredPermission: PermissionLevel
  children: React.ReactNode
  fallback?: React.ReactNode
  showPermissionInfo?: boolean
  challengeId?: string
  contentCreatorId?: string // For checking if user owns content
}

export function UserPermissionHandler({
  requiredPermission,
  children,
  fallback,
  showPermissionInfo = true,
  challengeId,
  contentCreatorId
}: UserPermissionHandlerProps) {
  const { data: session, status } = useSession()

  const getUserRole = (): UserRole => {
    if (!session?.user) return 'guest'
    
    // Check if user is admin (you may want to implement proper role checking)
    if (session.user.email?.includes('admin') || session.user.id === 'admin') {
      return 'admin'
    }
    
    // Check if user is content creator for this specific content
    if (contentCreatorId && session.user.id === contentCreatorId) {
      return 'creator'
    }
    
    return 'user'
  }

  const checkPermission = (required: PermissionLevel): UserPermission => {
    const userRole = getUserRole()
    
    switch (required) {
      case 'view':
        // Everyone can view
        return { level: 'view', granted: true }
        
      case 'vote':
        if (userRole === 'guest') {
          return {
            level: 'vote',
            granted: false,
            reason: 'Authentication required to vote',
            action: (
              <Link href="/api/auth/signin">
                <Button size="sm" className="flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Vote</span>
                </Button>
              </Link>
            )
          }
        }
        return { level: 'vote', granted: true }
        
      case 'create':
        if (userRole === 'guest') {
          return {
            level: 'create',
            granted: false,
            reason: 'Authentication required to create submissions',
            action: (
              <Link href="/api/auth/signin">
                <Button size="sm" className="flex items-center space-x-1">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In to Create</span>
                </Button>
              </Link>
            )
          }
        }
        return { level: 'create', granted: true }
        
      case 'moderate':
        if (userRole === 'guest' || userRole === 'user') {
          return {
            level: 'moderate',
            granted: false,
            reason: userRole === 'guest' ? 'Authentication required for moderation' : 'Insufficient permissions for moderation',
            action: userRole === 'guest' ? (
              <Link href="/api/auth/signin">
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </Link>
            ) : undefined
          }
        }
        return { level: 'moderate', granted: userRole === 'creator' || userRole === 'admin' }
        
      case 'admin':
        return {
          level: 'admin',
          granted: userRole === 'admin',
          reason: userRole !== 'admin' ? 'Administrator access required' : undefined
        }
        
      default:
        return { level: required, granted: false, reason: 'Unknown permission level' }
    }
  }

  const permission = checkPermission(requiredPermission)
  const userRole = getUserRole()

  // Show loading state during session loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If permission is granted, render children
  if (permission.granted) {
    return <>{children}</>
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // Default permission denied UI
  const getPermissionIcon = (level: PermissionLevel) => {
    switch (level) {
      case 'view': return <Eye className="h-5 w-5" />
      case 'vote': return <User className="h-5 w-5" />
      case 'create': return <User className="h-5 w-5" />
      case 'moderate': return <Shield className="h-5 w-5" />
      case 'admin': return <Crown className="h-5 w-5" />
      default: return <Lock className="h-5 w-5" />
    }
  }

  const getPermissionTitle = (level: PermissionLevel) => {
    switch (level) {
      case 'view': return 'View Content'
      case 'vote': return 'Vote on Content'
      case 'create': return 'Create Submissions'
      case 'moderate': return 'Moderate Content'
      case 'admin': return 'Admin Access'
      default: return 'Access Required'
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'guest': return 'secondary'
      case 'user': return 'default'
      case 'creator': return 'default'
      case 'admin': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <Card className="border-gray-200">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Lock className="h-6 w-6" />
            {getPermissionIcon(requiredPermission)}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">
              {getPermissionTitle(requiredPermission)} Required
            </h3>
            {permission.reason && (
              <p className="text-sm text-gray-600 mt-1">
                {permission.reason}
              </p>
            )}
          </div>

          {showPermissionInfo && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-500">Current role:</span>
              <Badge variant={getRoleColor(userRole)} className="capitalize">
                {userRole}
              </Badge>
            </div>
          )}

          {permission.action && (
            <div className="pt-2">
              {permission.action}
            </div>
          )}

          {challengeId && userRole === 'guest' && (
            <div className="pt-2 text-xs text-gray-500">
              <Link 
                href={`/api/auth/signin?callbackUrl=/challenge/${challengeId}`}
                className="underline hover:text-gray-700"
              >
                Sign in to participate in this challenge
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Convenience wrapper components for common use cases
export function VotePermissionGate({ children, fallback, challengeId }: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  challengeId?: string 
}) {
  return (
    <UserPermissionHandler 
      requiredPermission="vote" 
      challengeId={challengeId}
      fallback={fallback}
    >
      {children}
    </UserPermissionHandler>
  )
}

export function CreatePermissionGate({ children, fallback, challengeId }: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  challengeId?: string 
}) {
  return (
    <UserPermissionHandler 
      requiredPermission="create" 
      challengeId={challengeId}
      fallback={fallback}
    >
      {children}
    </UserPermissionHandler>
  )
}

export function ModeratePermissionGate({ children, fallback, contentCreatorId }: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  contentCreatorId?: string 
}) {
  return (
    <UserPermissionHandler 
      requiredPermission="moderate" 
      contentCreatorId={contentCreatorId}
      fallback={fallback}
    >
      {children}
    </UserPermissionHandler>
  )
}

export function AdminPermissionGate({ children, fallback }: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <UserPermissionHandler 
      requiredPermission="admin" 
      fallback={fallback}
    >
      {children}
    </UserPermissionHandler>
  )
}
