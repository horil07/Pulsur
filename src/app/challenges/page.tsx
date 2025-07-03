'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChallengeCard } from '@/components/challenge/challenge-card'
import { ToolkitResources } from '@/components/toolkit/toolkit-resources'
import { FeaturedMasterclass } from '@/components/masterclass/featured-masterclass'
import { ComingSoonChallenge } from '@/components/challenge/coming-soon-challenge'
import { FAQComponent } from '@/components/faq/faq-component'
import { Calendar, Users } from 'lucide-react'

interface Challenge {
  id: string
  title: string
  description: string
  image: string
  topPrize: string
  status: 'OPEN' | 'CLOSED' | 'ANNOUNCED'
  participants: number
  endDate: string
  category: string
  isFeatured?: boolean
}

export default function ChallengesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [featuredChallenge, setFeaturedChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)

  // Load challenges from API
  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeTab !== 'ALL') params.append('status', activeTab)
        params.append('sort', sortBy)
        
        const response = await fetch(`/api/challenges?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setFilteredChallenges(data.challenges)
          // Set first open challenge as featured
          const featured = data.challenges.find((c: Challenge) => c.status === 'OPEN')
          if (featured) setFeaturedChallenge(featured)
        }
      } catch (error) {
        console.error('Failed to load challenges:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadChallenges()
  }, [activeTab, sortBy])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">      
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Hero Section - Enhanced Desktop */}
        <div className="relative bg-gradient-to-br from-red-500/20 via-black to-blue-500/20 pt-32 pb-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8 items-center min-h-[600px]">
              {/* Left Content */}
              <div className="col-span-7 space-y-8">
                <div>
                  <h1 className="text-7xl font-bold mb-8 leading-tight">
                    <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent font-bold">Start</span>{' '}
                    <span className="text-white font-bold">Creating</span>
                  </h1>
                  <p className="text-2xl text-white/80 mb-10 max-w-3xl leading-relaxed font-bold">
                    Pick your format. Submit your vision. Join the movement.
                  </p>
                  <div className="flex space-x-6">
                    <Button 
                      onClick={() => router.push('/challenge')}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-12 py-6 rounded-full text-2xl font-bold transition-all duration-300 shadow-lg shadow-red-500/25"
                    >
                      Explore All Challenges
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 px-12 py-6 rounded-full text-2xl font-bold transition-all duration-300"
                      onClick={() => router.push('/how-to-play')}
                    >
                      How to Play
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Content - Stats Cards */}
              {/* Removed stats cards as per user request */}
            </div>
          </div>
        </div>

        {/* Main Content - Desktop Grid Layout */}
        <div className="px-8 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Sidebar - Filters & Featured */}
              <div className="col-span-3 space-y-6">
                <div className="sticky top-8">
                  {/* Filter Controls */}
                  <Card className="bg-gray-900/30 border-gray-700 p-6 mb-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-purple-400" />
                      Filters
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Challenge Type</label>
                        <select 
                          value={activeTab}
                          onChange={(e) => setActiveTab(e.target.value)}
                          className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                          aria-label="Filter challenges by type"
                        >
                          <option value="ALL">All Types</option>
                          <option value="OPEN">Open</option>
                          <option value="CLOSED">Closed</option>
                          <option value="ANNOUNCED">Winners Announced</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Sort By</label>
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                          aria-label="Sort challenges by"
                        >
                          <option value="newest">Sort by Newest</option>
                          <option value="oldest">Sort by Oldest</option>
                          <option value="ending">Ending Soon</option>
                          <option value="popular">Most Popular</option>
                        </select>
                      </div>
                    </div>
                  </Card>

                  {/* Featured Challenge Preview */}
                  {featuredChallenge && (
                    <Card className="bg-gradient-to-br from-red-500/10 to-purple-500/10 border-red-500/30 p-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center">
                        <span className="text-red-400 mr-2">⭐</span>
                        Featured Challenge
                      </h3>
                      <div className="text-sm text-white/80 mb-3 line-clamp-2">
                        {featuredChallenge.title}
                      </div>
                      <div className="text-xs text-white/60 mb-3">
                        {featuredChallenge.participants?.toLocaleString()} participants
                      </div>
                      <Button 
                        size="sm"
                        className="w-full bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600"
                        onClick={() => router.push(`/challenges/${featuredChallenge.id}`)}
                      >
                        View Challenge
                      </Button>
                    </Card>
                  )}

                  {/* Quick Stats */}
                  <Card className="bg-gray-900/30 border-gray-700 p-6">
                    <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Challenges:</span>
                        <span className="text-white">{filteredChallenges.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Active Now:</span>
                        <span className="text-green-400">{filteredChallenges.filter(c => c.status === 'OPEN').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ending Soon:</span>
                        <span className="text-yellow-400">
                          {filteredChallenges.filter(c => {
                            const endDate = new Date(c.endDate);
                            const now = new Date();
                            const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                            return diffDays <= 7 && diffDays > 0;
                          }).length}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-9">
                <div className="mb-8">
                  <h2 className="text-6xl font-bold mb-6">
                    <span className="bg-gradient-to-r from-red-500 to-purple-500 bg-clip-text text-transparent font-extrabold">What&apos;s</span>{' '}
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent font-extrabold">Poppin&apos;</span>{' '}
                    <span className="text-white font-extrabold">Now</span>
                  </h2>

                  {/* Challenge Grid */}
                  {loading ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {[...Array(4)].map((_, i) => (
                        <Card key={i} className="bg-white/5 border-white/20 backdrop-blur-sm animate-pulse overflow-hidden">
                          <div className="h-48 bg-white/10"></div>
                          <div className="p-6">
                            <div className="h-6 bg-white/10 rounded mb-3"></div>
                            <div className="h-4 bg-white/10 rounded mb-2"></div>
                            <div className="h-4 bg-white/10 rounded w-2/3"></div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : filteredChallenges.length === 0 ? (
                    <div className="text-center py-16 bg-white/20 backdrop-blur-md rounded-2xl">
                      <Trophy className="w-20 h-20 text-white/40 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-white/80 mb-3"></h3>
                      <p className="text-base text-white/60 max-w-md mx-auto">
                        {/* Check back later for new exciting challenges. */}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {filteredChallenges.map((challenge) => (
                        <ChallengeCard 
                          key={challenge.id}
                          challenge={challenge}
                          showSubmitButton={true}
                          showViewEntriesButton={true}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                  {/* Toolkit Section */}
                  <div>
                    <ToolkitResources 
                      onExploreClick={() => router.push('/toolkit')}
                    />
                  </div>

                  {/* Coming Soon */}
                  <div>
                    <ComingSoonChallenge
                      title="AI Art Revolution Challenge"
                      description="Create stunning digital art using the latest AI tools and techniques."
                      backgroundImage="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop"
                      launchDate="2025-07-15"
                      onNotifyClick={() => {
                        console.log('Notify me when challenge launches')
                      }}
                    />
                  </div>
                </div>

                {/* Masterclass Section */}
                <div className="mt-12">
                  <FeaturedMasterclass
                    title="Master Adobe Photoshop: From Beginner to Pro"
                    description="Learn professional photo editing techniques and digital art creation with industry expert Sarah Chen."
                    thumbnail="https://images.unsplash.com/photo-1609343636393-2928622d6b4e?w=800&h=400&fit=crop"
                    instructor={{
                      name: "Sarah Chen",
                      title: "Digital Art Director",
                      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b098?w=100&h=100&fit=crop&crop=face"
                    }}
                    duration="2h 30m"
                    onPlayClick={() => router.push('/masterclass')}
                  />
                </div>

                {/* FAQ Section */}
                <div className="mt-12">
                  <FAQComponent 
                    onViewAllClick={() => router.push('/faq')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout (preserved as-is) */}
      <div className="block lg:hidden">
        {/* Hero Section - Compact Mobile */}
        <div className="relative min-h-[800px] flex flex-col justify-end pt-0 pb-0 px-4" style={{ backgroundImage: 'url(https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center 30%' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 via-black/70 to-blue-500/40 z-0"></div>
          <div className="relative z-10 max-w-sm mx-auto text-left sm:max-w-4xl pt-10 pb-30">
            <h1 className="text-4xl font-bold mb-5 leading-tight sm:text-5xl sm:mb-6 md:text-7xl">
              <span className="text-white">Start Creating</span>
            </h1>
            <p className="text-lg text-white/80 mb-6 px-2 sm:text-xl sm:mb-8 md:text-2xl max-w-2xl">
              Pick your format. Submit your vision. Join the movement.
            </p>
            <Button 
              onClick={() => router.push('/challenge')}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-full text-xl font-semibold transition-all duration-300 sm:px-10 sm:py-5 sm:text-2xl md:px-12 md:py-6 md:text-3xl"
            >
              All Challenges
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-2 pb-24 sm:px-4 sm:pb-8">
          <div className="max-w-sm mx-auto sm:max-w-4xl">
            {/* What's Poppin' Section */}
            <div className="mb-8 flex justify-center items-center">
              <h2 className="text-3xl mb-15 px-2 sm:text-5xl sm:mb-6 md:text-6xl text-center bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg relative font-extrabold" style={{ bottom: '-40px' }}>
                <span className="font-extrabold">What&apos;s </span>
                <span className="font-extrabold">Poppin&apos; </span>
                <span className="font-extrabold">Now</span>
              </h2>
            </div>

            {/* Filter Controls - Mobile First */}
            <div className="flex flex-row gap-3 mb-4 px-2 sm:gap-4 sm:mb-6">
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="flex-1 bg-transparent border border-white/20 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:min-w-[140px] sm:py-2 pr-8"
                aria-label="Filter challenges by type"
                style={{ backgroundPosition: 'right 1rem center' }}
              >
                <option value="ALL">All Types</option>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="ANNOUNCED">Winners Announced</option>
              </select>
              
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 bg-transparent border border-white/20 rounded-lg px-3 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 sm:min-w-[140px] sm:py-2 pr-8"
                aria-label="Sort challenges by"
                style={{ backgroundPosition: 'right 1rem center' }}
              >
                <option value="newest">Sort by Newest</option>
                <option value="oldest">Sort by Oldest</option>
                <option value="ending">Ending Soon</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            {/* Custom Card Example */}
            <div className="w-full max-w-xl mx-auto mb-8">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop"
                  alt="Challenge Preview"
                  className="w-full h-80 object-cover"
                />
                <div className="px-4 py-3 bg-black/80 text-white text-sm">
                  <h3 className="text-2xl font-bold mb-2">This Is Not A Bike Ad</h3>
                  <p className="text-sm mb-3">Create a 4-6 second video capturing speed, thrill, or freedom - using Al tools or your own clips.</p>
                  <div className="flex flex-row items-center justify-center gap-8 mb-1">
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Calendar className="w-4 h-4 mr-1 inline-block text-white/60" />
                      Ends Jun 30, 2025
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold">
                      <Users className="w-4 h-4 mr-1 inline-block text-blue-300" />
                      1,248 entries
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4 p-4 bg-black/60 justify-center">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-base border-none shadow-none">Submit Now</Button>
                  <Button className="flex-1 bg-transparent border border-white/30 text-white font-semibold py-2 rounded-full text-base hover:bg-white/10" variant="outline">View Entries</Button>
                </div>
              </div>
            </div>
              <div className="w-full max-w-xl mx-auto mb-8">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop"
                  alt="Challenge Preview"
                  className="w-full h-80 object-cover"
                />
                <div className="px-4 py-3 bg-black/80 text-white text-sm">
                  <h3 className="text-2xl font-bold mb-2">This Is Not A Bike Ad</h3>
                  <p className="text-sm mb-3">Create a 4-6 second video capturing speed, thrill, or freedom - using Al tools or your own clips.</p>
                  <div className="flex flex-row items-center justify-center gap-8 mb-1">
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Calendar className="w-4 h-4 mr-1 inline-block text-white/60" />
                      Ends Jun 30, 2025
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold">
                      <Users className="w-4 h-4 mr-1 inline-block text-blue-300" />
                      1,248 entries
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4 p-4 bg-black/60 justify-center">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-base border-none shadow-none">Submit Now</Button>
                  <Button className="flex-1 bg-transparent border border-white/30 text-white font-semibold py-2 rounded-full text-base hover:bg-white/10" variant="outline">View Entries</Button>
                </div>
              </div>
            </div>

  <div className="w-full max-w-xl mx-auto mb-8">
              <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=300&fit=crop"
                  alt="Challenge Preview"
                  className="w-full h-80 object-cover"
                />
                <div className="px-4 py-3 bg-black/80 text-white text-sm">
                  <h3 className="text-2xl font-bold mb-2">This Is Not A Bike Ad</h3>
                  <p className="text-sm mb-3">Create a 4-6 second video capturing speed, thrill, or freedom - using Al tools or your own clips.</p>
                  <div className="flex flex-row items-center justify-center gap-8 mb-1">
                    <div className="flex items-center gap-1 text-xs text-white/70">
                      <Calendar className="w-4 h-4 mr-1 inline-block text-white/60" />
                      Ends Jun 30, 2025
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-400 font-semibold">
                      <Users className="w-4 h-4 mr-1 inline-block text-blue-300" />
                      1,248 entries
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-4 p-4 bg-black/60 justify-center">
                  <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-full text-base border-none shadow-none">Submit Now</Button>
                  <Button className="flex-1 bg-transparent border border-white/30 text-white font-semibold py-2 rounded-full text-base hover:bg-white/10" variant="outline">View Entries</Button>
                </div>
              </div>
            </div>


            {/* Featured Challenge - Using ChallengeCard Component */}
            {featuredChallenge && (
              <ChallengeCard 
                challenge={featuredChallenge} 
                showSubmitButton={true}
                showViewEntriesButton={true}
              />
            )}

            {/* Challenge List */}
            {loading ? (
              <div className="space-y-3 px-2 sm:space-y-6 sm:px-0">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-white/5 border-white/20 backdrop-blur-sm animate-pulse overflow-hidden">
                    <div className="h-32 bg-white/10 sm:h-48"></div>
                    <div className="p-3 sm:p-6">
                      <div className="h-4 bg-white/10 rounded mb-2 sm:h-6"></div>
                      <div className="h-3 bg-white/10 rounded sm:h-4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-8 px-4 sm:py-12"></div>
            ) : (
              <div className="space-y-3 px-2 sm:space-y-6 sm:px-0">
                {filteredChallenges
                  .filter(challenge => challenge.id !== featuredChallenge?.id)
                  .map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id}
                    challenge={challenge}
                    showSubmitButton={true}
                    showViewEntriesButton={true}
                  />
                ))}
              </div>
            )}

            {/* Toolkit and Resources Section */}
            <div className="mt-1 sm:mt-16">
              <ToolkitResources 
                onExploreClick={() => router.push('/toolkit')}
              />
            </div>

            {/* Featured Masterclass Section */}
            <div className="mt-12 sm:mt-16">
              <FeaturedMasterclass
                title="Master Adobe Photoshop: From Beginner to Pro"
                description="Learn professional photo editing techniques and digital art creation with industry expert Sarah Chen. This comprehensive masterclass covers everything from basic tools to advanced compositing."
                thumbnail="https://images.unsplash.com/photo-1609343636393-2928622d6b4e?w=800&h=400&fit=crop"
                instructor={{
                  name: "Sarah Chen",
                  title: "Digital Art Director",
                  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b098?w=100&h=100&fit=crop&crop=face"
                }}
                duration="2h 30m"
                onPlayClick={() => router.push('/masterclass')}
              />
            </div>

            {/* Coming Soon Challenge Section */}
            <div className="mt-12 sm:mt-6">
              <ComingSoonChallenge
                title="AI Art Revolution Challenge"
                description="Create stunning digital art using the latest AI tools and techniques. Push the boundaries of creativity and showcase your vision in this groundbreaking challenge."
                backgroundImage="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop"
                launchDate="2025-07-15"
                onNotifyClick={() => {
                  // Handle notification signup
                  console.log('Notify me when challenge launches')
                }}
              />
            </div>

            {/* FAQ Section */}
            <div className="mt-12 sm:mt-16">
              <FAQComponent 
                onViewAllClick={() => router.push('/faq')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
