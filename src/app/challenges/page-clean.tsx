'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Filter, Trophy, Calendar, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
}

export default function ChallengesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)

  // Load challenges from API
  useEffect(() => {
    const loadChallenges = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeTab !== 'ALL') params.append('status', activeTab)
        if (searchTerm) params.append('search', searchTerm)
        
        const response = await fetch(`/api/challenges?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setFilteredChallenges(data.challenges)
        }
      } catch (error) {
        console.error('Failed to load challenges:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadChallenges()
  }, [searchTerm, activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'CLOSED':
        return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'ANNOUNCED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const handleChallengeClick = (challengeId: string) => {
    router.push(`/challenges/${challengeId}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Creative Challenges
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Join our exciting challenges and showcase your creativity. Win amazing prizes and get recognized in our community.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="ALL" className="data-[state=active]:bg-purple-600">
              All Challenges
            </TabsTrigger>
            <TabsTrigger value="OPEN" className="data-[state=active]:bg-green-600">
              Open
            </TabsTrigger>
            <TabsTrigger value="CLOSED" className="data-[state=active]:bg-red-600">
              Closed
            </TabsTrigger>
            <TabsTrigger value="ANNOUNCED" className="data-[state=active]:bg-blue-600">
              Winners Announced
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="bg-gray-800 border-gray-700 animate-pulse">
                    <div className="h-48 bg-gray-700 rounded-t-lg"></div>
                    <CardHeader>
                      <div className="h-6 bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-700 rounded mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredChallenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No challenges found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms or filters.' : 'Check back later for new challenges.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge) => (
                  <Card 
                    key={challenge.id} 
                    className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleChallengeClick(challenge.id)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={challenge.image}
                        alt={challenge.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getStatusColor(challenge.status)} border`}>
                          {challenge.status}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-sm font-semibold text-green-400">
                          {challenge.topPrize}
                        </span>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg text-white group-hover:text-purple-400 transition-colors">
                            {challenge.title}
                          </CardTitle>
                          <CardDescription className="text-gray-400 mt-1">
                            {challenge.category}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {challenge.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{challenge.participants} participants</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Ends {formatDate(challenge.endDate)}</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleChallengeClick(challenge.id)
                        }}
                      >
                        View Challenge
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
