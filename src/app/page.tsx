'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play } from 'lucide-react'
import { pulsarTheme, brandMessages } from '@/lib/theme'
import { OngoingChallenge } from '@/components/challenge/ongoing-challenge'
import { RewardsComponent } from '@/components/rewards/rewards-component'
import { FeaturedMasterclass } from '@/components/masterclass/featured-masterclass'
import { CreatorSpotlight } from '@/components/creator/creator-spotlight'
import { FAQComponent } from '@/components/faq/faq-component'
import { CatchTheLatest } from '@/components/community/catch-the-latest'
import { JoinTheMovement } from '@/components/community/join-the-movement'
import { Footer } from '@/components/ui/footer'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const heroWords = ["UPLOAD", "INSPIRE", "CREATE"];
  // For infinite scroll effect, duplicate the first word at the end
  const heroWordsLoop = [...heroWords, heroWords[0]];
  const [currentHeroWord, setCurrentHeroWord] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const slides = [
    {
      id: 1,
      title: "Create What Follows You",
      subtitle: brandMessages.subtitles[0],
      image: pulsarTheme.images.heroes[0].url, // <-- Updated to your image path
      ctaPrimary: "Let's Change",
      ctaSecondary: ""
    },
    {
      id: 2,
      title: brandMessages.taglines[1],
      subtitle: brandMessages.subtitles[1],
      image: pulsarTheme.images.heroes[1].url,
      ctaPrimary: "Start Creating",
      ctaSecondary: ""
    },
    {
      id: 3,
      title: brandMessages.taglines[2],
      subtitle: brandMessages.subtitles[2],
      image: pulsarTheme.images.heroes[2].url,
      ctaPrimary: "start creating",
      ctaSecondary: ""
    }
  ]

  useEffect(() => {
    setMounted(true)
    // Auto-slide carousel disabled
    // const interval = setInterval(() => {
    //   setCurrentSlide((prev) => (prev + 1) % slides.length)
    // }, 5000)
    // return () => clearInterval(interval)
  }, [slides.length])

  // Infinite scroll effect for hero words
  useEffect(() => {
    if (!mounted) return;
    const wordInterval = setInterval(() => {
      setCurrentHeroWord((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(wordInterval);
  }, [mounted]);

  // Reset to start instantly when reaching the duplicate
  useEffect(() => {
    if (currentHeroWord === heroWordsLoop.length - 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentHeroWord(0);
      }, 500); // match transition duration
    } else {
      setIsTransitioning(true);
    }
  }, [currentHeroWord, heroWordsLoop.length])

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Responsive Layout: Single structure, responsive classes */}
      <section className="relative min-h-screen flex flex-col lg:flex-row">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1591216105236-5ba45970702a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGJpa2VyfGVufDB8fDB8fHww"
            alt="Pulsar bike background"
            fill
            className="object-cover object-center transition-opacity duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-16 py-24 lg:py-0 min-h-screen">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-8 h-1 bg-gradient-to-r from-red-500 to-blue-500" />
              <span className="text-white/80 text-base lg:text-lg font-medium tracking-wider uppercase">
                Pulsar Platform
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-none h-[36px] sm:h-[48px] md:h-[56px] overflow-hidden">
              <span className="block relative w-full h-full overflow-hidden">
                <span
                  className={`flex flex-col transition-transform duration-500 ease-in-out${isTransitioning ? '' : ' !transition-none'}`}
                  style={{ transform: `translateY(-${currentHeroWord * 36}px)` }}
                >
                  {heroWordsLoop.map((word, idx) => (
                    <span
                      key={word + idx}
                      className="h-[36px] sm:h-[48px] md:h-[56px] leading-[36px] sm:leading-[48px] md:leading-[56px] w-full text-left bg-gradient-to-r from-red-600 via-blue-500 to-blue-700 bg-clip-text text-transparent font-caveat"
                      aria-hidden={currentHeroWord !== idx}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-5xl xl:text-6xl font-bold text-white leading-tight whitespace-nowrap font-caveat">
              {slides[currentSlide].title}
            </h2>
            <p className="text-white/90 text-base sm:text-lg md:text-2xl leading-relaxed max-w-2xl">
              {slides[currentSlide].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Link href="/challenge">
                <Button className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg sm:text-xl rounded-full shadow-2xl shadow-red-500/25 transform hover:scale-105 transition-all duration-300">
                  Start Creating
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Content Sections - Responsive */}
      <div className="space-y-0">
        <section className="bg-black">
          <OngoingChallenge
            title="Show Off Your Wild Side"
            subtitle="Current Challenge"
            description="Express your ride, your style, your vision."
            videoThumbnail="https://videos.pexels.com/video-files/5198954/5198954-uhd_1440_2732_25fps.mp4"
            challengeTitle="This Is Not A Bike Ad"
            challengeDescription="Create a 4-6 second video capturing speed, thrill, or freedom — using AI tools or your own clips."
            tags={["Speed", "Creativity", "Video", "AI"]}
            prizeAmount="$2,000"
            participantCount="12k"
            timeRemaining="5 days"
            onJoinChallenge={() => window.location.href = '/challenge'}
          />
        </section>
        <section className="bg-black">
          <div className="container mx-auto px-4 sm:px-8 py-8 sm:py-16">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16">
              <div>
                <RewardsComponent onViewFullRewards={() => window.location.href = '/rewards'} />
              </div>
              <div>
                <FeaturedMasterclass
                  title="This is Not a Bike Ad Workshop"
                  description="Learn how to break creative boundaries and craft submissions that stand out from the crowd."
                  thumbnail={pulsarTheme.images.gallery[1]}
                  instructor={{
                    name: "Raj Patel",
                    title: "Creative Director",
                    avatar: pulsarTheme.images.avatars[0]
                  }}
                  duration="45 min"
                  videoUrl="https://videos.pexels.com/video-files/5206883/5206883-uhd_2560_1440_25fps.mp4"
                  onPlayClick={() => console.log('Play masterclass video')}
                />
              </div>
            </div>
          </div>
        </section>
        <section className="bg-black">
          <CreatorSpotlight
            creator={{
              name: "Alex Rivera",
              username: "alexrivera",
              quote: "Every ride tells a story. I just help people tell theirs better.",
              instagramHandle: "alexrivera",
              portfolioUrl: "https://alexrivera.com",
              profileImage: pulsarTheme.images.avatars[1]
            }}
            featuredArtwork={{
              id: "1",
              imageUrl: pulsarTheme.images.gallery[2],
              title: "Night Rider"
            }}
            artworkGallery={[
              { id: "2", imageUrl: pulsarTheme.images.gallery[3] },
              { id: "3", imageUrl: pulsarTheme.images.gallery[0] },
              { id: "4", imageUrl: pulsarTheme.images.gallery[1] }
            ]}
            onInstagramClick={() => window.open('https://instagram.com/alexrivera', '_blank')}
            onPortfolioClick={() => window.open('https://alexrivera.com', '_blank')}
            onArtworkClick={(artwork) => console.log('View artwork:', artwork)}
          />
        </section>
        <section className="bg-black">
          <FAQComponent onViewAllClick={() => window.location.href = '/faq'} />
        </section>
        <section className="bg-black mt-8 sm:mt-16">
          <CatchTheLatest
            onJoinMovement={() => window.location.href = '/community'}
            onArtworkClick={(artwork) => console.log('View artwork:', artwork)}
          />
        </section>
        <section className="bg-black mt-8 sm:mt-16">
          <JoinTheMovement
            onInstagramClick={() => window.open('https://instagram.com/pulsarai', '_blank')}
            onYoutubeClick={() => window.open('https://youtube.com/@pulsarai', '_blank')}
          />
        </section>
      </div>
      <Footer />
    </div>
  )
}