'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Heart, Eye, Calendar, User, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { pulsarTheme } from '@/lib/theme'
import { Footer } from '@/components/ui/footer'
import { cn } from '@/lib/utils'
interface LeaderboardEntry {
  id: string
  title: string
  type: string
  contentUrl: string
  voteCount: number
  user: {
    name: string
    image: string
  }
  createdAt: string
  rank: number
}

interface LeaderboardStats {
  totalSubmissions: number
  totalVotes: number
  totalParticipants: number
  campaignEndDate: string
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-gray-400">#{rank}</span>
  }
}

const getTypeDisplay = (type: string) => {
  switch (type) {
    case 'AI_ARTWORK':
      return { label: 'AI Artwork', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
    case 'AI_SONG':
      return { label: 'AI Song', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
    case 'UPLOAD_ARTWORK':
      return { label: 'Artwork', color: 'bg-green-500/20 text-green-300 border-green-500/30' }
    case 'UPLOAD_REEL':
      return { label: 'Reel', color: 'bg-red-500/20 text-red-300 border-red-500/30' }
    default:
      return { label: type, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' }
  }
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [activeFilter, setActiveFilter] = useState('Overall Score')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  

  // Responsive pagination state for All Creators Box
  const [creatorsPage, setCreatorsPage] = useState(1)
  const creatorsPerPage = 3
  const creatorsList = [
    { name: "Raj Patel", username: "@native_rider", avatar: "https://i.pravatar.cc/150?img=1" },
    { name: "Ankit Sinha", username: "@creative_Raj", avatar: "https://i.pravatar.cc/150?img=2" },
    { name: "Ashish Kumar", username: "@gen_power", avatar: "https://i.pravatar.cc/150?img=3" },
    { name: "Priya Sharma", username: "@artistic_priya", avatar: "https://i.pravatar.cc/150?img=4" },
    { name: "Vikram Singh", username: "@vikram_s", avatar: "https://i.pravatar.cc/150?img=5" },
    { name: "Sneha Rao", username: "@sneha_rao", avatar: "https://i.pravatar.cc/150?img=6" },
    { name: "Amit Joshi", username: "@amit_j", avatar: "https://i.pravatar.cc/150?img=7" },
    { name: "Neha Verma", username: "@neha_v", avatar: "https://i.pravatar.cc/150?img=8" },
    { name: "Rohit Mehra", username: "@rohit_mehra", avatar: "https://i.pravatar.cc/150?img=9" },
    { name: "Divya Kapoor", username: "@divya_kapoor", avatar: "https://i.pravatar.cc/150?img=10" },
  ]
  const totalCreatorsPages = Math.ceil(creatorsList.length / creatorsPerPage)
  const paginatedCreators = creatorsList.slice(
    (creatorsPage - 1) * creatorsPerPage,
    creatorsPage * creatorsPerPage
  )

  const fetchLeaderboardData = useCallback(async () => {
    try {
      const response = await fetch(`/api/leaderboard?category=${activeTab}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.entries)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/leaderboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboardData()
    fetchStats()
  }, [fetchLeaderboardData, fetchStats])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative flex flex-col overflow-x-hidden">
      {/* Cinematic Hero Section */}
      <div className="relative flex-1 min-h-[80vh] flex items-end">
        {/* Image Tab Above the Text */}
        <div className="absolute top-0 left-0 w-full h-full z-10 flex flex-col items-center pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1591216105236-5ba45970702a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJpa2VyfGVufDB8fDB8fHww"
            alt="Biker Decorative"
            fill
            className="object-cover object-top w-full h-full opacity-80"
            priority
            sizes="100vw"
          />
        </div>
        {/* Background Image: Dynamic biker with smoky effect */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80"
            alt="Biker in full gear riding a sport bike"
            fill
            className="object-cover object-center brightness-50"
            priority
          />
          {/* Smoky overlay for drama */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 bg-black/60 mix-blend-multiply" aria-hidden="true" />
          {/* Optional: Add a subtle smoky SVG or PNG overlay for extra effect */}
        </div>

        {/* Dramatic Lighting Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-48 bg-gradient-radial from-white/10 via-white/0 to-transparent blur-2xl opacity-60" />
        </div>

        {/* Bottom Text Overlay */}
        <div className="relative w-full z-10 flex flex-col items-center justify-end pb-70 sm:pb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg tracking-tight text-center">
            Creator Ranking
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/80 max-w-2xl text-center font-medium drop-shadow">
            Discover the top creators making waves in our community. Rankings update weekly based on engagement and creativity.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 pt-8 pb-24 md:pb-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="glass-panel bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <Eye className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalSubmissions}</div>
                <div className="text-gray-400 text-sm">Total Submissions</div>
              </CardContent>
            </Card>
            <Card className="glass-panel bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalVotes}</div>
                <div className="text-gray-400 text-sm">Total Votes</div>
              </CardContent>
            </Card>
            <Card className="glass-panel bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
                <div className="text-gray-400 text-sm">Participants</div>
              </CardContent>
            </Card>
            <Card className="glass-panel bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {new Date(stats.campaignEndDate).toLocaleDateString()}
                </div>
                <div className="text-gray-400 text-sm">Campaign Ends</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Flex Header Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          {/* Time Range Tabs */}
          <div className="flex gap-4">
            {['This Week', 'Monthly', 'All-time'].map((label, idx) => (
              <button
                key={label}
                className={`relative px-4 py-2 text-lg font-semibold rounded transition-colors
                  ${activeTab === label.toLowerCase().replace(' ', '') 
                    ? 'text-white after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-1 after:rounded-full after:bg-gradient-to-r after:from-red-500 after:to-blue-500'
                    : 'text-gray-400 hover:text-white'
                  }`}
                onClick={() => setActiveTab(label.toLowerCase().replace(' ', ''))}
              >
                {label}
              </button>
            ))}
          </div>
          {/* Filter Buttons */}
          <div className="flex gap-3">
            {['Overall Score', 'Votes', 'Remixes'].map((filter, idx) => {
              const icons = [
                <User className="w-4 h-4" key="user" />,
                <Heart className="w-4 h-4" key="heart" />,
                <Award className="w-4 h-4" key="award" />
              ]
              return (
                <button
                  key={filter}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-black border border-gray-800 text-white transition-all
                    ${activeFilter === filter ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white border-transparent shadow-lg' : 'hover:bg-gray-900/80'}
                  `}
                  onClick={() => setActiveFilter(filter)}
                >
                  {icons[idx]}
                  <span className="font-medium text-sm">{filter}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center bg-black border border-gray-800 rounded-full px-4 py-2 w-full max-w-md shadow-inner">
            <input
              type="text"
              placeholder="Search creator"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white placeholder:text-gray-400 w-full"
              aria-label="Search creator"
            />
            <button
              type="button"
              className="ml-2 p-2 rounded-full bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modern Creator Profile Cards - Horizontal Scrollable */}
        <div className="w-full overflow-x-auto py-8">
          <div
            className="flex gap-4 sm:gap-6 md:gap-8 min-w-0 px-1 sm:px-0"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#fff transparent'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                height: 1px; /* thinner scrollbar */
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: #fff;
                border-radius: 2px;
              }
            `}</style>
            {[
              {
                name: "Raj Patel",
                handle: "@street_rider",
                rank: 1,
                profile: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=facearea&w=256&q=80",
                image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
                likes: "1.2k",
                remixes: "32",
                comments: "121"
              },
              {
                name: "Alex Rivera",
                handle: "@urban_flash",
                rank: 2,
                profile: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&w=256&q=80",
                image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
                likes: "980",
                remixes: "28",
                comments: "110"
              },
              {
                name: "Maya Singh",
                handle: "@neon_queen",
                rank: 3,
                profile: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=256&q=80",
                image: "https://images.pexels.com/photos/1430931/pexels-photo-1430931.jpeg?auto=compress&w=600&q=80",
                likes: "870",
                remixes: "19",
                comments: "99"
              },
              {
                name: "Chris Lee",
                handle: "@speedster",
                rank: 4,
                profile: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&q=80",
                image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
                likes: "790",
                remixes: "15",
                comments: "87"
              },
              {
                name: "Sara Kim",
                handle: "@night_rider",
                rank: 5,
                profile: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=facearea&w=256&q=80",
                image: "https://images.unsplash.com/photo-1465101178521-c1a9136a3b43?auto=format&fit=crop&w=600&q=80",
                likes: "720",
                remixes: "12",
                comments: "75"
              },
              {
                name: "Liam Chen",
                handle: "@city_blaze",
                rank: 6,
                profile: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=facearea&w=256&q=80",
                image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
                likes: "690",
                remixes: "10",
                comments: "60"
              }
            ].map((creator) => (
              <div
                key={creator.rank}
                className="bg-gradient-to-br from-black via-gray-900 to-black rounded-2xl shadow-2xl border border-gray-800 min-w-[85vw] max-w-[95vw] sm:min-w-[320px] sm:max-w-xs md:min-w-[380px] md:max-w-md w-full flex-shrink-0 overflow-hidden"
              >
                {/* Top: Profile Info */}
                <div className="flex items-center justify-between px-3 sm:px-6 pt-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Image
                      src={creator.profile}
                      alt={creator.name}
                      width={44}
                      height={44}
                      className="rounded-full border-2 border-blue-500 shadow-lg w-11 h-11 sm:w-14 sm:h-14"
                    />
                    <div>
                      <div className="font-bold text-white text-base sm:text-lg">{creator.name}</div>
                      <div className="text-xs sm:text-sm text-gray-400">{creator.handle}</div>
                    </div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-sm sm:text-lg font-bold bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-md">
                    {creator.rank}
                  </span>
                </div>
                {/* Main Image */}
                <div className="relative mt-3 sm:mt-6">
                  <Image
                    src={creator.image}
                    alt="Biker neon city"
                    width={800}
                    height={480}
                    className="w-full h-40 xs:h-48 sm:h-56 md:h-64 object-cover object-center rounded-xl shadow-lg"
                    style={{ filter: 'blur(0.5px) brightness(1.1) saturate(1.3)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-xl pointer-events-none" />
                </div>
                {/* Engagement Stats */}
                <div className="flex justify-between items-center px-3 sm:px-8 py-3 sm:py-4 mt-2">
                  <div className="flex flex-col items-center">
                    <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-1" />
                    <span className="text-white font-semibold text-xs sm:text-sm">{creator.likes}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-1" />
                    <span className="text-white font-semibold text-xs sm:text-sm">{creator.remixes}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-1" />
                    <span className="text-white font-semibold text-xs sm:text-sm">{creator.comments}</span>
                  </div>
                </div>
                {/* View Portfolio Button */}
                <div className="px-3 sm:px-8 pb-4 sm:pb-6">
                  <button className="w-full py-2 sm:py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-lg shadow-lg transition-all">
                    View Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Cards */}
        <div className="space-y-4">
          {leaderboard.map((entry) => {
            const typeInfo = getTypeDisplay(entry.type)
            const isTopThree = entry.rank <= 3
            
            return (
              <Card 
                key={entry.id} 
                className={`glass-panel bg-gray-900/50 border-gray-800 transition-all hover:bg-gray-800/50 ${
                  isTopThree ? 'ring-2 ring-gradient-to-r ring-red-500/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center border border-gray-700">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Content Preview */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-800/50 border border-gray-700">
                      {entry.type.includes('ARTWORK') ? (
                        <Image 
                          src={entry.contentUrl} 
                          alt={entry.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Award className="h-8 w-8 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Entry Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {entry.title}
                        </h3>
                        <Badge className={`border ${typeInfo.color}`}>
                          {typeInfo.label}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={entry.user.image} />
                            <AvatarFallback>{entry.user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{entry.user.name}</span>
                        </div>
                        <span>•</span>
                        <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Vote Count */}
                    <div className="flex-shrink-0 text-center">
                      <div className="flex items-center space-x-1 text-red-500">
                        <Heart className="h-5 w-5 fill-current" />
                        <span className="text-xl font-bold text-white">{entry.voteCount}</span>
                      </div>
                      <div className="text-xs text-gray-500">votes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Winner Spotlight */}
        {leaderboard.length > 0 && leaderboard[0].rank === 1 && (
          <Card className="glass-panel bg-gradient-to-r from-red-500/20 to-blue-500/20 border-red-500/50">
            <CardHeader>
              <CardTitle className="text-center text-white flex items-center justify-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-400" />
                <span>Current Leader</span>
                <Trophy className="h-6 w-6 text-yellow-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="max-w-md mx-auto">
                {leaderboard[0].type.includes('ARTWORK') && (
                  <Image 
                    src={leaderboard[0].contentUrl}
                    alt={leaderboard[0].title}
                    width={300}
                    height={300}
                    className="rounded-lg mx-auto mb-4 border border-gray-700"
                  />
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{leaderboard[0].title}</h3>
                <p className="text-gray-400 mb-4">by {leaderboard[0].user.name}</p>
                <div className="text-3xl font-bold text-gradient bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                  {leaderboard[0].voteCount} votes
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Creators Box - Responsive, No Horizontal Scroll */}
        <div className="w-full max-w-md mx-auto mt-8 mb-8 px-2">
          <h1 className="text-3xl font-bold mb-6">
            <span className="text-white">All </span>
            <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent">Creators</span>
          </h1>
          <div className="space-y-4">
            {paginatedCreators.map((creator, index) => (
              <div
                key={creator.username}
                className="flex items-center justify-between rounded-2xl p-4 bg-gradient-to-r from-black to-purple-900 shadow w-full"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="text-white font-semibold truncate">{creator.name}</h2>
                    <p className="text-gray-400 text-sm truncate">{creator.username}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-300 mt-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <span>❤️</span>
                        <span>1.2k</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🔄</span>
                        <span>32</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💬</span>
                        <span>121</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-xl flex-shrink-0">›</div>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white"
              onClick={() => setCreatorsPage((p) => Math.max(1, p - 1))}
              disabled={creatorsPage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {[...Array(totalCreatorsPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  creatorsPage === i + 1
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
                onClick={() => setCreatorsPage(i + 1)}
                aria-label={`Page ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white"
              onClick={() => setCreatorsPage((p) => Math.min(totalCreatorsPages, p + 1))}
              disabled={creatorsPage === totalCreatorsPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>

        {/* Spotlight Rising Stars */}
        <div className="w-full flex flex-col items-center py-8">
          <h2 className="text-center mb-6">
            <span className="block text-3xl sm:text-4xl md:text-5xl font-extrabold italic bg-gradient-to-r from-red-500 via-blue-500 to-white bg-clip-text text-transparent tracking-tight">
              SPOTLIGHT
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl font-bold mt-1">
              <span className="text-red-500">Rising</span>
              <span className="text-white"> Stars</span>
            </span>
          </h2>
          <div
            className="flex gap-6 overflow-x-auto px-2 pb-2 w-full"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#fff transparent'
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                height: 1px;
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: #fff;
                border-radius: 2px;
              }
            `}</style>
            {[
              {
                name: "Raj Patel",
                handle: "@street_rider",
                change: "+24",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                image: "https://images.unsplash.com/photo-1589385552283-86f7c1b1d9fc?fit=crop&w=800&q=80",
                quote: "My creations comes from urban landscapes and the way light interacts with architecture.",
              },
              {
                name: "Raj Patel",
                handle: "@street_rider",
                change: "+24",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                image: "https://images.unsplash.com/photo-1589385552283-86f7c1b1d9fc?fit=crop&w=800&q=80",
                quote: "My creations comes from urban landscapes and the way light interacts with architecture.",
              },
              {
                name: "Raj Patel",
                handle: "@street_rider",
                change: "+24",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                image: "https://images.unsplash.com/photo-1589385552283-86f7c1b1d9fc?fit=crop&w=800&q=80",
                quote: "My creations comes from urban landscapes and the way light interacts with architecture.",
              }
            ].map((star, idx) => (
              <div key={idx} className="flex-shrink-0">
                <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 max-w-md w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={star.avatar}
                        alt={star.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-500"
                      />
                      <div>
                        <div className="text-white font-bold text-base">{star.name}</div>
                        <div className="text-gray-400 text-sm">{star.handle}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 font-bold text-lg">
                      {star.change}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </div>
                  </div>
                  <img
                    src={star.image}
                    alt={star.name}
                    className="rounded-xl w-full h-48 sm:h-56 md:h-64 object-cover object-center shadow-lg"
                  />
                  <blockquote className="text-white text-base sm:text-lg italic text-center px-2">
                    “{star.quote}”
                  </blockquote>
                  <button className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full w-full transition text-lg shadow-lg">
                    View Portfolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example: Explore Submission Section with Background Image */}
        <div className="relative w-full mb-8 rounded-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Explore Submission Background"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            aria-hidden="true"
          />
          <div className="relative z-10 p-8 sm:p-12 flex flex-col items-center justify-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4 drop-shadow-lg">
              Explore Submission
            </h2>
            <p className="text-white/90 text-lg text-center max-w-2xl mb-2 drop-shadow">
              Explore incredible creations from our community of riders and creators. From AI-generated masterpieces to stunning uploads - discover inspiration that moves you.
            </p>
            {/* ...you can add more content here... */}
          </div>
        </div>

        {/* "Ready to join the Rankings?" text */}
        <div className="w-full flex flex-col items-center mb-0">
          <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white text-center mb-4 mt-12">
            Ready to join the Rankings?
          </span>
          <div className="bg-black text-white p-6 rounded-lg max-w-md w-full space-y-6">
            <p className="text-gray-300 text-base text-center">
              Submit your creations to our challenges and climb the leaderboard. Show the world what you’re made of.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full transition duration-300">
                  Start Creating
                </button>
                <button className="border border-white hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-full transition duration-300">
                  Explore Challenges
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stay Updated */}
        {/* ...existing code... */}
      </div>
      <Footer />
    </div>
  )
}

