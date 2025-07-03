// Pulsar Brand Theme Configuration
export const pulsarTheme = {
  // Brand Colors
  colors: {
    primary: {
      red: '#ef4444', // red-500
      blue: '#3b82f6', // blue-500
      gradient: 'bg-gradient-to-r from-red-500 to-blue-500'
    },
    background: {
      primary: '#000000', // black
      secondary: '#111111',
      overlay: 'bg-black/40'
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff/90',
      muted: '#ffffff/60',
      accent: '#ffffff/30'
    },
    accent: {
      green: '#22c55e', // green-500 for prizes/success
      purple: '#8b5cf6', // purple-500 for masterclass
      cyan: '#06b6d4'   // cyan-500 for highlights
    }
  },

  // Bike Rider Images
  images: {
    heroes: [
      {
        url: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800&h=1200&fit=crop&crop=center&q=80",
        alt: "Urban motorcycle rider with style",
        theme: "urban"
      },
      {
        url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&h=1200&fit=crop&crop=center&q=80",
        alt: "Speed motorcycle rider on highway",
        theme: "speed"
      },
      {
        url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop&crop=center&q=80",
        alt: "Professional motorcycle rider in motion",
        theme: "creative"
      },
      {
        url: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=800&h=1200&fit=crop&crop=center&q=80",
        alt: "Adventure motorcycle rider",
        theme: "adventure"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=600&h=600&fit=crop&crop=center&q=80",
      "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&h=600&fit=crop&crop=center&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&h=600&fit=crop&crop=center&q=80",
      "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=600&h=600&fit=crop&crop=center&q=80"
    ],
    avatars: [
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face&q=80",
      "https://images.unsplash.com/photo-1494790108755-2616b332c108?w=100&h=100&fit=crop&crop=face&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=face&q=80"
    ]
  },

  // Typography
  typography: {
    heading: {
      primary: 'text-4xl font-bold leading-tight',
      secondary: 'text-2xl font-bold',
      gradient: 'bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent'
    },
    body: {
      primary: 'text-white/90 text-base leading-relaxed',
      secondary: 'text-white/80 text-sm',
      muted: 'text-white/60 text-sm'
    }
  },

  // Components
  components: {
    button: {
      primary: 'bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full border-none shadow-lg transition-all',
      secondary: 'border-2 border-white/30 text-white bg-transparent hover:bg-white/10 font-semibold rounded-full transition-all',
      gradient: 'bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-600 hover:to-blue-600 text-white font-semibold rounded-full border-none shadow-lg transition-all'
    },
    card: {
      primary: 'bg-black/20 backdrop-blur-md rounded-3xl border border-white/10',
      gradient: 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-3xl border border-purple-500/20',
      challenge: 'gradient-border rounded-3xl overflow-hidden'
    }
  },

  // Animations
  animations: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    pulse: 'animate-pulse',
    spin: 'animate-spin'
  }
}

// Helper functions
export const getRandomHeroImage = () => {
  const images = pulsarTheme.images.heroes
  return images[Math.floor(Math.random() * images.length)]
}

export const getRandomGalleryImage = () => {
  const images = pulsarTheme.images.gallery
  return images[Math.floor(Math.random() * images.length)]
}

export const getRandomAvatar = () => {
  const images = pulsarTheme.images.avatars
  return images[Math.floor(Math.random() * images.length)]
}

// Brand messaging
export const brandMessages = {
  taglines: [
    "Where Speed Meets Creativity",
    "Unleash Your Inner Rider",
    "Born to Ride, Made to Create",
    "Definitely Daring",
    "Full Throttle Creativity"
  ],
  subtitles: [
    "Welcome to Pulsar Playgrounds — your AI-powered zone to create, vibe, and go full throttle with style.",
    "Transform your wildest motorcycle dreams into reality with cutting-edge AI tools and creative freedom.",
    "Join thousands of creators pushing boundaries and redefining what it means to ride with style.",
    "Express your ride, your style, your vision with our AI-powered creative platform."
  ]
}
