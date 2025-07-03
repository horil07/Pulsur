import { CreatorSpotlight } from '@/components/creator/creator-spotlight'
import { pulsarTheme } from '@/lib/theme'

export default function CreatorSpotlightPage() {
  return (
    <main className="min-h-screen bg-black text-white py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center">Creator Spotlight</h1>
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
      </div>
    </main>
  )
}
