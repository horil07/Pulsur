'use client'

import Link from 'next/link'
import { Sparkles, Heart, Mail, Github, Twitter, Linkedin, Home, Trophy, Users, Info, Shield, FileText, Award, Instagram, Youtube } from 'lucide-react'
import React from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const navigationSections = [
    {
      title: 'Platform',
      links: [
        { href: '/challenges', label: 'Challenges', icon: Trophy },
        { href: '/gallery', label: 'Gallery', icon: Home },
        { href: '/leaderboard', label: 'Leaderboard', icon: Award },
        { href: '/challenge', label: 'Create Entry', icon: Users },
        { href: '/how-to-play', label: 'How to Play', icon: Info },
      ]
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy', label: 'Privacy Policy', icon: Shield },
        { href: '/terms', label: 'Terms & Conditions', icon: FileText },
      ]
    },
    {
      title: 'Connect',
      links: [
        { href: 'mailto:hello@aichallenge.hub', label: 'Contact Us', icon: Mail },
        { href: 'https://github.com/befollowed', label: 'GitHub', icon: Github },
        { href: 'https://twitter.com/befollowed', label: 'Twitter', icon: Twitter },
        { href: 'https://linkedin.com/company/befollowed', label: 'LinkedIn', icon: Linkedin },
      ]
    }
  ]

  return (
    <footer className="bg-black text-gray-200 w-full border-t border-white/10 mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8 md:gap-12">
        {/* Brand and tagline */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-red-500">Pulsar</span>
            <span className="text-white"> BeFollowed</span>
          </span>
          <span className="text-sm text-gray-400 text-center max-w-xs">
            Create what follows you. Express your ride, style & vision.
          </span>
        </div>
        {/* Social icons */}
        <div className="flex justify-center gap-6">
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors duration-150 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
            <Instagram size={24} />
          </a>
          <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors duration-150 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Twitter size={24} />
          </a>
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition-colors duration-150 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-600">
            <Youtube size={24} />
          </a>
        </div>
        {/* Footer links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-semibold text-white mb-2">Quick Links</h3>
            <ul className="space-y-1">
              <li><a href="/challenges" className="hover:text-red-400 transition-colors">Challenges</a></li>
              <li><a href="/gallery" className="hover:text-red-400 transition-colors">Gallery</a></li>
              <li><a href="/toolkit" className="hover:text-red-400 transition-colors">Toolkit</a></li>
              <li><a href="/leaderboard" className="hover:text-red-400 transition-colors">Leaderboard</a></li>
              <li><a href="/community" className="hover:text-red-400 transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Resources</h3>
            <ul className="space-y-1">
              <li><a href="/templates" className="hover:text-red-400 transition-colors">Templates</a></li>
              <li><a href="/ai-prompts" className="hover:text-red-400 transition-colors">AI Prompts</a></li>
              <li><a href="/tutorials" className="hover:text-red-400 transition-colors">Tutorials</a></li>
              <li><a href="/brand-guidelines" className="hover:text-red-400 transition-colors">Brand Guidelines</a></li>
              <li><a href="/remix-packs" className="hover:text-red-400 transition-colors">Remix Packs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">Legal</h3>
            <ul className="space-y-1">
              <li><a href="/terms" className="hover:text-red-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="/privacy" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/cookies" className="hover:text-red-400 transition-colors">Cookie Policy</a></li>
              <li><a href="/copyright" className="hover:text-red-400 transition-colors">Copyright</a></li>
              <li><a href="/contact" className="hover:text-red-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        {/* Copyright */}
        <div className="">
          © {currentYear} Pulsar AI Challenge Platform
        </div>
      </div>
    </footer>
  )
}
