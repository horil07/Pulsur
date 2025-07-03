'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { VoteHistoryButton } from '@/components/ui/vote-history'
import { Menu, X, Sparkles, User, LogOut, Home, Info, Trophy } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignIn = () => {
    signIn()
  }


  const navigationLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/learn', label: 'Learn', icon: Info },
  { href: '/gallery', label: 'Gallery', icon: Sparkles },
  { href: '/leaderboard', label: 'Leaderboard', icon: User },
  { href: '/community', label: 'Community', icon: Sparkles },
  { href: '/faq', label: 'FAQ', icon: Info }
]

  return (
    <header className="bg-black/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50 glass-panel">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center justify-center text-white hover:text-[#FF006F] transition-colors group"
          >
            <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="Pulsar Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-1 text-white hover:text-[#00E5FF] transition-colors text-sm hover:neon-glow-blue"
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-3">
                {/* User Profile Info */}
                <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF006F] to-[#00E5FF] flex items-center justify-center neon-glow-pink">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">{session.user?.name || 'User'}</span>
                </div>
                
                {/* R39.3: Vote History Access */}
                <VoteHistoryButton />
                
                {/* Admin Access for authorized users */}
                {(session.user?.email === 'testuser@example.com' || session.user?.email?.includes('admin')) && (
                  <Link href="/admin">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/10 text-xs hover:neon-glow-blue"
                    >
                      🛡️ Admin
                    </Button>
                  </Link>
                )}
                
                <Link href="/challenge">
                  <Button 
                    size="sm" 
                    className="cyber-button"
                  >
                    Create Entry
                  </Button>
                </Link>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => signOut()}
                  className="text-white hover:text-white border-white/20 hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-white hover:text-white hover:bg-white/10"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button 
                    size="sm" 
                    className="cyber-button"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 py-4 glass-panel">
            <nav className="flex flex-col space-y-3">
              {navigationLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-2 text-white hover:text-[#00E5FF] transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Auth */}
              <div className="border-t border-white/10 pt-3 mt-3">
                {session ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-white">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#FF006F] to-[#00E5FF] flex items-center justify-center neon-glow-pink">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">{session.user?.name}</span>
                    </div>
                    
                    {/* Mobile Admin Access */}
                    {(session.user?.email === 'testuser@example.com' || session.user?.email?.includes('admin')) && (
                      <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full border-[#00E5FF]/50 text-[#00E5FF] hover:bg-[#00E5FF]/10"
                        >
                          🛡️ Admin Panel
                        </Button>
                      </Link>
                    )}
                    
                    <Link href="/challenge" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        size="sm" 
                        className="w-full cyber-button"
                      >
                        Create Entry
                      </Button>
                    </Link>
                    
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        signOut()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full text-white hover:text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="w-full text-white hover:text-white hover:bg-white/10"
                      >
                        Log In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        size="sm" 
                        className="w-full cyber-button"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
