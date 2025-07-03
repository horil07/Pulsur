'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, User, X } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { pulsarTheme } from '@/lib/theme'

interface PulsarHeaderProps {
  transparent?: boolean
}

export function PulsarHeader({ transparent = false }: PulsarHeaderProps) {
  const { data: session } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const headerClass = transparent 
    ? "fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md"
    : "fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10"

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Challenges', href: '/challenges' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Leaderboard', href: '/leaderboard' },
    ...(session?.user?.email?.includes('admin') ? [{ label: 'Admin', href: '/admin' }] : [])
  ]

  return (
    <>
      <header className={headerClass}>
        <div className="flex items-center justify-between px-4 py-4">
          {/* Hamburger Menu */}
          <button 
            className="p-2 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/80 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center">
            <div className="relative w-14 h-14">
              <Image
                src="/logo.png"
                alt="Pulsar Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/profile" className="p-2">
                <User className="w-6 h-6 text-white" />
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/auth/signin" 
                  className="hidden lg:block px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded-full font-medium transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="hidden lg:block px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
                >
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-0 left-0 w-80 h-full bg-black border-r border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="text-lg font-bold text-white">Menu</div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
            
            <nav className="p-4">
              <div className="space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-white/80 hover:text-white transition-colors font-medium py-2"
                  >
                    {item.label}
                  </Link>
                ))}
                
                {!session && (
                  <div className="space-y-3 mt-6">
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 border border-white/20 text-white hover:bg-white/10 rounded-full font-medium text-center transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium text-center transition-colors"
                    >
                      Join Now
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
