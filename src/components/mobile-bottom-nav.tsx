'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, Zap, BookOpen, BarChart3, Plus } from 'lucide-react'

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleCreateClick = () => {
    // Navigate to challenge creation or show modal
    router.push('/challenge/create')
  }

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      isActive: pathname === '/'
    },
    {
      href: '/challenges',
      label: 'Challenges',
      icon: Zap,
      isActive: pathname.startsWith('/challenge')
    },
    {
      href: '/gallery',
      label: 'Learn',
      icon: BookOpen,
      isActive: pathname.startsWith('/learn') || pathname.startsWith('/gallery')
    },
    {
      href: '/leaderboard',
      label: 'Leaderboard',
      icon: BarChart3,
      isActive: pathname === '/leaderboard'
    }
  ]

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 mobile-nav-blur border-t border-white/10 z-[60] md:hidden">
        <div className="flex items-end justify-around px-4 py-2 pb-4 relative">
          {/* First two nav items */}
          {navItems.slice(0, 2).map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] py-2 transition-colors duration-200 ${
                  item.isActive 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IconComponent 
                  className={`w-6 h-6 mb-1 ${item.isActive ? 'text-blue-400' : 'text-gray-400'}`}
                  strokeWidth={item.isActive ? 2.5 : 2}
                />
                <span className={`text-xs font-medium ${item.isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Center Add Button */}
          <div className="flex flex-col items-center relative -top-2">
            <button 
              onClick={handleCreateClick}
              className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105 transition-all duration-200 active:scale-95 mb-2"
              aria-label="Create new content"
            >
              <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </button>
          </div>

          {/* Last two nav items */}
          {navItems.slice(2, 4).map((item) => {
            const IconComponent = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center min-w-[60px] py-2 transition-colors duration-200 ${
                  item.isActive 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IconComponent 
                  className={`w-6 h-6 mb-1 ${item.isActive ? 'text-blue-400' : 'text-gray-400'}`}
                  strokeWidth={item.isActive ? 2.5 : 2}
                />
                <span className={`text-xs font-medium ${item.isActive ? 'text-blue-400' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
        
        {/* Safe area padding for devices with home indicator */}
        <div className="pb-safe h-2" />
      </div>

      {/* Bottom padding to prevent content from being hidden behind the nav */}
      <div className="h-20 md:hidden" />
    </>
  )
}
