'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function PulsarFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black border-t border-white/10 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent"></div>
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Newsletter Section Only */}
        <div className="bg-gradient-to-r from-red-500/10 via-black/50 to-blue-500/10 rounded-2xl p-8 mb-12 border border-white/10 backdrop-blur-sm relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
          <div className="text-center md:text-left md:flex md:items-center md:justify-between relative z-10">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-white mb-2">Stay in the Fast Lane</h3>
              <p className="text-white/70">Get the latest challenges, tips, and community highlights delivered to your inbox.</p>
            </div>
            <div className="flex gap-3 max-w-sm md:max-w-none">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-black/50 border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-white/60 text-sm">
              © {currentYear} Pulsar Playgrounds. All rights reserved. 
              <span className="text-transparent bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text font-semibold"> Definitely Daring.</span>
            </div>
            <div className="flex gap-6 text-sm">
              {[
                { label: 'Accessibility', href: '#accessibility' },
                { label: 'Cookies', href: '#cookies' },
                { label: 'Sitemap', href: '#sitemap' }
              ].map((link) => (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="text-white/60 hover:text-red-400 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
