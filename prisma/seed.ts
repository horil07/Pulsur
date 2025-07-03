import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const challenges = [
  {
    title: 'Digital Dreams: Cyberpunk Holiday',
    description: 'Create stunning digital artwork that captures the essence of cyberpunk aesthetics with a holiday twist',
    objective: 'Showcase creative AI artwork capabilities while exploring the intersection of futuristic cyberpunk themes and traditional holiday elements',
    assignment: 'Your task is to create original digital artwork that seamlessly blends cyberpunk aesthetics with holiday themes. Think neon-lit Christmas trees, holographic decorations, cyber-enhanced winter scenes, or futuristic holiday celebrations. Use AI tools to generate compelling visuals that capture the mood and atmosphere of both genres.',
    category: 'AI Artwork',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    status: 'OPEN',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-12-31'),
    winnersAnnounceDate: new Date('2026-01-15'),
    maxEntriesPerUser: 3,
    currentParticipants: 0,
    prizes: [
      '1st Place: $2,500 + Featured Exhibition',
      '2nd Place: $1,500 + Digital Art Course',
      '3rd Place: $750 + Premium AI Tools License',
      'People\'s Choice: $500 + Community Recognition'
    ],
    topPrize: '$2,500',
    tutorialEnabled: true,
    tutorialSteps: [
      {
        id: 1,
        title: 'Understanding Cyberpunk Aesthetics',
        description: 'Learn the key visual elements that define cyberpunk art',
        content: 'Cyberpunk art is characterized by neon colors, urban decay, high-tech elements, and dystopian themes. Focus on contrast between bright neon lights and dark environments.',
        media: 'https://example.com/tutorial-cyberpunk.mp4',
        duration: 180
      },
      {
        id: 2,
        title: 'Holiday Theme Integration',
        description: 'How to blend traditional holiday elements with futuristic themes',
        content: 'Consider reimagining classic holiday symbols through a cyberpunk lens: holographic snow, digital fireplaces, augmented reality Christmas trees.',
        media: null,
        duration: 120
      },
      {
        id: 3,
        title: 'AI Art Generation Best Practices',
        description: 'Tips for creating compelling AI-generated artwork',
        content: 'Use specific, detailed prompts. Experiment with different styles and lighting. Iterate on your prompts to achieve the desired aesthetic.',
        media: 'https://example.com/tutorial-ai-art.mp4',
        duration: 240
      }
    ],
    onboardingFlow: {
      steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
      currentStep: 'welcome'
    },
    hasToolkitAssets: true,
    toolkitAssets: [
      {
        id: 'style-guide-1',
        title: 'Cyberpunk Color Palette Guide',
        description: 'Professional color palette references for cyberpunk aesthetics',
        fileUrl: 'https://example.com/cyberpunk-colors.pdf',
        fileSize: '2.4 MB',
        fileType: 'PDF'
      },
      {
        id: 'reference-pack-1',
        title: 'Holiday Cyberpunk Reference Images',
        description: 'Curated collection of reference images for inspiration',
        fileUrl: 'https://example.com/holiday-cyberpunk-refs.zip',
        fileSize: '15.7 MB',
        fileType: 'ZIP'
      },
      {
        id: 'prompt-templates-1',
        title: 'AI Prompt Templates',
        description: 'Ready-to-use prompt templates for AI art generation',
        fileUrl: 'https://example.com/prompt-templates.txt',
        fileSize: '156 KB',
        fileType: 'TXT'
      }
    ],
    deliverables: [
      'High-resolution digital artwork (minimum 1920x1080)',
      'Creative title and description (50-200 words)',
      'Artist statement explaining your concept (100-300 words)',
      'Original AI prompts used (if applicable)'
    ],
    attachments: [
      'Cyberpunk Style Guide.pdf',
      'Holiday Theme Reference Pack.zip',
      'Technical Requirements.pdf'
    ],
    validationRules: [
      {
        field: 'title',
        type: 'required',
        message: 'Artwork title is required',
        severity: 'error'
      },
      {
        field: 'description',
        type: 'required',
        message: 'Artwork description is required',
        severity: 'error'
      },
      {
        field: 'imageFile',
        type: 'format',
        value: ['jpg', 'jpeg', 'png', 'webp'],
        message: 'Image must be JPG, PNG, or WEBP format',
        severity: 'error'
      },
      {
        field: 'imageFile',
        type: 'size',
        value: 10485760, // 10MB
        message: 'Image file size must be under 10MB',
        severity: 'error'
      }
    ],
    contentRequirements: [
      {
        type: 'image',
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSize: 10485760,
        minResolution: '1920x1080',
        requiredFields: ['title', 'description', 'artistStatement']
      }
    ],
    createdBy: 'admin',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'Neon Synthwave Soundscapes',
    description: 'Compose original synthwave music with AI assistance that captures the nostalgic feel of the 80s',
    objective: 'Produce high-quality synthwave compositions that evoke nostalgia while showcasing modern AI music generation capabilities',
    assignment: 'Create an original synthwave track that transports listeners to the neon-soaked nights of the 1980s. Your composition should feature classic synthwave elements: vintage synthesizers, driving basslines, ethereal pads, and nostalgic melodies. Use AI tools to generate, arrange, and enhance your musical ideas while maintaining the authentic synthwave aesthetic.',
    category: 'AI Music',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    status: 'OPEN',
    startDate: new Date('2025-06-15'),
    endDate: new Date('2025-12-25'),
    winnersAnnounceDate: new Date('2025-01-10'),
    maxEntriesPerUser: 3,
    currentParticipants: 0,
    prizes: [
      '1st Place: $1,800 + Professional Mastering Session',
      '2nd Place: $1,000 + Synthesizer Plugin Bundle',
      '3rd Place: $500 + Music Production Course',
      'Best Newcomer: $300 + Mentorship Session'
    ],
    topPrize: '$1,800',
    tutorialEnabled: true,
    tutorialSteps: [
      {
        id: 1,
        title: 'Synthwave Fundamentals',
        description: 'Understanding the core elements of synthwave music',
        content: 'Synthwave is built on vintage synthesizer sounds, typically featuring lead synths, bass synths, pad sounds, and drum machines. The genre emphasizes melody and atmosphere over complexity.',
        media: 'https://example.com/synthwave-basics.mp4',
        duration: 300
      },
      {
        id: 2,
        title: 'AI Music Generation Tools',
        description: 'Introduction to AI-powered music creation',
        content: 'Learn how to use AI tools for melody generation, chord progression suggestions, and sound design. Understand the balance between AI assistance and human creativity.',
        media: null,
        duration: 240
      },
      {
        id: 3,
        title: 'Arrangement and Structure',
        description: 'Building compelling synthwave compositions',
        content: 'Typical synthwave tracks follow intro-verse-chorus-bridge-chorus-outro structure. Focus on creating memorable melodies and driving rhythms.',
        media: 'https://example.com/arrangement-guide.mp4',
        duration: 180
      }
    ],
    onboardingFlow: {
      steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
      currentStep: 'welcome'
    },
    hasToolkitAssets: true,
    toolkitAssets: [
      {
        id: 'sample-pack-1',
        title: 'Vintage Synthesizer Samples',
        description: 'High-quality samples from classic 80s synthesizers',
        fileUrl: 'https://example.com/vintage-synth-samples.zip',
        fileSize: '45.2 MB',
        fileType: 'ZIP'
      },
      {
        id: 'midi-pack-1',
        title: 'Synthwave MIDI Patterns',
        description: 'MIDI files with classic synthwave chord progressions and melodies',
        fileUrl: 'https://example.com/synthwave-midi.zip',
        fileSize: '1.8 MB',
        fileType: 'ZIP'
      },
      {
        id: 'preset-pack-1',
        title: 'Synthwave Presets Collection',
        description: 'Ready-to-use synthesizer presets for popular DAWs',
        fileUrl: 'https://example.com/synthwave-presets.zip',
        fileSize: '8.7 MB',
        fileType: 'ZIP'
      }
    ],
    deliverables: [
      'Complete track (minimum 3 minutes duration)',
      'High-quality audio file (WAV or FLAC, 44.1kHz/16-bit minimum)',
      'Track breakdown explaining your creative process',
      'List of AI tools and techniques used'
    ],
    attachments: [
      'Synthwave Production Guide.pdf',
      'Vintage Synth Reference.pdf',
      'Audio Technical Specifications.pdf'
    ],
    validationRules: [
      {
        field: 'title',
        type: 'required',
        message: 'Track title is required',
        severity: 'error'
      },
      {
        field: 'audioFile',
        type: 'format',
        value: ['wav', 'flac', 'mp3'],
        message: 'Audio must be WAV, FLAC, or MP3 format',
        severity: 'error'
      },
      {
        field: 'audioFile',
        type: 'size',
        value: 104857600, // 100MB
        message: 'Audio file size must be under 100MB',
        severity: 'error'
      },
      {
        field: 'duration',
        type: 'custom',
        value: 180, // 3 minutes minimum
        message: 'Track must be at least 3 minutes long',
        severity: 'error'
      }
    ],
    contentRequirements: [
      {
        type: 'audio',
        formats: ['wav', 'flac', 'mp3'],
        maxSize: 104857600,
        maxDuration: 600, // 10 minutes max
        requiredFields: ['title', 'description', 'processBreakdown']
      }
    ],
    createdBy: 'admin',
    isActive: true,
    isFeatured: true
  },
  {
    title: 'AI Poetry & Prose Challenge',
    description: 'Craft compelling written content using AI assistance while maintaining your unique voice',
    objective: 'Demonstrate the collaborative potential between human creativity and AI in producing meaningful written works',
    assignment: 'Create an original piece of creative writing (poetry, short story, or prose) that showcases the synergy between human creativity and AI assistance. Your work should tell a compelling story, evoke emotions, or explore meaningful themes while demonstrating how AI can enhance rather than replace human creative expression.',
    category: 'AI Writing',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop',
    status: 'OPEN',
    startDate: new Date('2025-06-20'),
    endDate: new Date('2025-01-15'),
    winnersAnnounceDate: new Date('2025-02-01'),
    maxEntriesPerUser: 3,
    currentParticipants: 0,
    prizes: [
      '1st Place: $1,200 + Publishing Consultation',
      '2nd Place: $700 + Writing Workshop Access',
      '3rd Place: $400 + Literary Magazine Feature',
      'Most Original: $250 + AI Writing Tools License'
    ],
    topPrize: '$1,200',
    tutorialEnabled: true,
    tutorialSteps: [
      {
        id: 1,
        title: 'AI-Human Creative Collaboration',
        description: 'Understanding how to work effectively with AI writing tools',
        content: 'Learn to use AI as a creative partner rather than a replacement. AI can help with ideation, structure, and refinement while you provide the human insight, emotion, and unique perspective.',
        media: null,
        duration: 240
      },
      {
        id: 2,
        title: 'Crafting Effective Prompts',
        description: 'Writing prompts that yield meaningful AI responses',
        content: 'Effective AI prompts are specific, contextual, and iterative. Learn to guide AI responses while leaving room for unexpected creative directions.',
        media: 'https://example.com/prompt-writing.mp4',
        duration: 180
      },
      {
        id: 3,
        title: 'Editing and Refinement',
        description: 'Polishing AI-assisted content to match your voice',
        content: 'The magic happens in the editing. Learn to blend AI suggestions with your personal style, ensuring the final work authentically represents your creative vision.',
        media: null,
        duration: 200
      }
    ],
    onboardingFlow: {
      steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
      currentStep: 'welcome'
    },
    hasToolkitAssets: true,
    toolkitAssets: [
      {
        id: 'prompt-library-1',
        title: 'Creative Writing Prompt Library',
        description: 'Curated collection of effective writing prompts for AI collaboration',
        fileUrl: 'https://example.com/writing-prompts.pdf',
        fileSize: '2.1 MB',
        fileType: 'PDF'
      },
      {
        id: 'style-guide-writing',
        title: 'AI Writing Collaboration Guide',
        description: 'Best practices for human-AI creative writing partnerships',
        fileUrl: 'https://example.com/ai-writing-guide.pdf',
        fileSize: '3.4 MB',
        fileType: 'PDF'
      }
    ],
    deliverables: [
      'Original written work (500-2000 words)',
      'Author\'s note explaining your creative process',
      'Documentation of AI collaboration techniques used',
      'Final polished manuscript in standard format'
    ],
    attachments: [
      'Writing Guidelines.pdf',
      'Format Requirements.pdf',
      'AI Tools Overview.pdf'
    ],
    validationRules: [
      {
        field: 'title',
        type: 'required',
        message: 'Work title is required',
        severity: 'error'
      },
      {
        field: 'content',
        type: 'required',
        message: 'Written content is required',
        severity: 'error'
      },
      {
        field: 'wordCount',
        type: 'custom',
        value: [500, 2000],
        message: 'Content must be between 500-2000 words',
        severity: 'error'
      }
    ],
    contentRequirements: [
      {
        type: 'text',
        formats: ['txt', 'doc', 'docx', 'pdf'],
        maxSize: 5242880, // 5MB
        requiredFields: ['title', 'content', 'authorNote', 'processDocumentation']
      }
    ],
    createdBy: 'admin',
    isActive: true,
    isFeatured: false
  },
  {
    title: 'Retro Gaming Pixel Art',
    description: 'Create nostalgic pixel art that captures the essence of classic video games',
    objective: 'Showcase pixel art skills while exploring themes of gaming nostalgia and retro aesthetics',
    assignment: 'Design original pixel art that pays homage to the golden age of video games. Your artwork should capture the charm, simplicity, and creativity that defined classic gaming visuals. Whether you create character sprites, environment tiles, or complete scenes, focus on the distinctive aesthetic that made pixel art an enduring art form.',
    category: 'Design',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
    status: 'OPEN',
    startDate: new Date('2025-06-10'),
    endDate: new Date('2025-02-28'),
    winnersAnnounceDate: new Date('2025-03-15'),
    maxEntriesPerUser: 3,
    currentParticipants: 0,
    prizes: [
      '1st Place: $1,000 + Game Development Consultation',
      '2nd Place: $600 + Pixel Art Software License',
      '3rd Place: $350 + Digital Art Tablet',
      'Community Favorite: $200 + Gaming Hardware'
    ],
    topPrize: '$1,000',
    tutorialEnabled: true,
    tutorialSteps: [
      {
        id: 1,
        title: 'Pixel Art Fundamentals',
        description: 'Learn the basic principles of pixel art creation',
        content: 'Pixel art is about working within constraints. Understanding color palettes, pixel placement, and scaling is crucial for creating authentic retro aesthetics.',
        media: 'https://example.com/pixel-art-basics.mp4',
        duration: 360
      },
      {
        id: 2,
        title: 'Color Theory for Pixel Art',
        description: 'Mastering limited color palettes in pixel art',
        content: 'Learn to work with restricted color palettes, understand dithering techniques, and create visual depth with minimal colors.',
        media: null,
        duration: 240
      },
      {
        id: 3,
        title: 'Animation Basics',
        description: 'Adding life to your pixel art through simple animations',
        content: 'Create compelling animations with frame-by-frame techniques, understanding timing, and efficient sprite management.',
        media: 'https://example.com/pixel-animation.mp4',
        duration: 300
      }
    ],
    onboardingFlow: {
      steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
      currentStep: 'welcome'
    },
    hasToolkitAssets: true,
    toolkitAssets: [
      {
        id: 'palette-pack-1',
        title: 'Retro Gaming Color Palettes',
        description: 'Authentic color palettes from classic gaming consoles',
        fileUrl: 'https://example.com/retro-palettes.zip',
        fileSize: '1.2 MB',
        fileType: 'ZIP'
      },
      {
        id: 'reference-sprites',
        title: 'Classic Game Sprite References',
        description: 'Reference collection of iconic pixel art sprites for inspiration',
        fileUrl: 'https://example.com/sprite-references.zip',
        fileSize: '8.4 MB',
        fileType: 'ZIP'
      }
    ],
    deliverables: [
      'Original pixel art creation (minimum 128x128 pixels)',
      'Design concept and inspiration explanation',
      'Time-lapse creation video (optional but encouraged)',
      'High-resolution export for viewing'
    ],
    attachments: [
      'Pixel Art Style Guide.pdf',
      'Classic Gaming References.pdf',
      'Software Recommendations.pdf'
    ],
    validationRules: [
      {
        field: 'title',
        type: 'required',
        message: 'Artwork title is required',
        severity: 'error'
      },
      {
        field: 'imageFile',
        type: 'format',
        value: ['png', 'gif'],
        message: 'Pixel art must be PNG or GIF format',
        severity: 'error'
      },
      {
        field: 'imageFile',
        type: 'size',
        value: 20971520, // 20MB
        message: 'Image file size must be under 20MB',
        severity: 'error'
      }
    ],
    contentRequirements: [
      {
        type: 'image',
        formats: ['png', 'gif'],
        maxSize: 20971520,
        minResolution: '128x128',
        requiredFields: ['title', 'description', 'conceptExplanation']
      }
    ],
    createdBy: 'admin',
    isActive: true,
    isFeatured: false
  }
]

const users = [
  {
    email: 'testuser@example.com',
    name: 'Test Admin',
    provider: 'email',
    profileComplete: true,
    bio: 'System administrator for testing purposes',
    trafficSource: 'direct'
  },
  {
    email: 'creator1@example.com',
    name: 'Alex Chen',
    provider: 'google',
    profileComplete: true,
    bio: 'Digital artist passionate about cyberpunk aesthetics and AI-generated art',
    trafficSource: 'organic'
  },
  {
    email: 'musician@example.com',
    name: 'Sam Rodriguez',
    provider: 'google',
    profileComplete: true,
    bio: 'Electronic music producer specializing in synthwave and retrowave',
    trafficSource: 'campaign'
  },
  {
    mobile: '+1234567890',
    name: 'Jordan Kim',
    provider: 'mobile',
    mobileVerified: new Date(),
    profileComplete: true,
    bio: 'Indie game developer and pixel art enthusiast',
    trafficSource: 'social'
  },
  {
    email: 'writer@example.com',
    name: 'Taylor Morgan',
    provider: 'email',
    profileComplete: true,
    bio: 'Creative writer exploring the intersection of AI and human storytelling',
    trafficSource: 'self-discovery'
  }
]

async function main() {
  console.log('🌱 Starting database seeding...')
  console.log('=' .repeat(50))

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.vote.deleteMany()
    await prisma.submission.deleteMany()
    await prisma.challengeTutorialProgress.deleteMany()
    await prisma.submissionDraft.deleteMany()
    await prisma.submissionAnalytics.deleteMany()
    await prisma.challenge.deleteMany()
    await prisma.user.deleteMany()
    
    console.log('✅ Existing data cleared')

    // Create users
    console.log('👥 Creating users...')
    const createdUsers = []
    
    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData
      })
      createdUsers.push(user)
      console.log(`   ✓ Created user: ${user.name || user.email || 'Unknown'}`)
    }

    // Create challenges
    console.log('🏆 Creating challenges...')
    const createdChallenges = []
    
    for (const challengeData of challenges) {
      const challenge = await prisma.challenge.create({
        data: {
          ...challengeData,
          prizes: JSON.stringify(challengeData.prizes),
          tutorialSteps: JSON.stringify(challengeData.tutorialSteps),
          onboardingFlow: JSON.stringify(challengeData.onboardingFlow),
          toolkitAssets: JSON.stringify(challengeData.toolkitAssets),
          deliverables: JSON.stringify(challengeData.deliverables),
          attachments: JSON.stringify(challengeData.attachments),
          validationRules: JSON.stringify(challengeData.validationRules),
          contentRequirements: JSON.stringify(challengeData.contentRequirements)
        }
      })
      createdChallenges.push(challenge)
      console.log(`   ✓ Created challenge: ${challenge.title}`)
    }

    // Create sample submissions
    console.log('📝 Creating sample submissions...')
    const submissions = [
      {
        userId: createdUsers[1].id, // Alex Chen
        challengeId: createdChallenges[0].id, // Digital Dreams
        type: 'AI_ARTWORK',
        title: 'Neon Christmas in Neo-Tokyo',
        caption: 'A cyberpunk interpretation of Christmas celebration in a futuristic Tokyo setting',
        contentUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=600&fit=crop',
        prompt: 'cyberpunk christmas scene, neon lights, holographic snow, futuristic tokyo, holiday celebration, digital art',
        status: 'APPROVED',
        voteCount: 15
      },
      {
        userId: createdUsers[2].id, // Sam Rodriguez
        challengeId: createdChallenges[1].id, // Neon Synthwave
        type: 'AI_SONG',
        title: 'Midnight Drive Through Memory Lane',
        caption: 'A nostalgic synthwave journey through 80s inspired soundscapes',
        contentUrl: 'https://example.com/synthwave-track.mp3',
        prompt: 'nostalgic synthwave, 80s aesthetic, driving beat, emotional melody, vintage synthesizers',
        status: 'APPROVED',
        voteCount: 12
      },
      {
        userId: createdUsers[3].id, // Jordan Kim
        challengeId: createdChallenges[3].id, // Retro Gaming
        type: 'UPLOAD_ARTWORK',
        title: '16-bit Hero Adventure',
        caption: 'Classic RPG-style character sprite with retro gaming charm',
        contentUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop',
        status: 'APPROVED',
        voteCount: 8
      },
      {
        userId: createdUsers[4].id, // Taylor Morgan
        challengeId: createdChallenges[2].id, // AI Poetry
        type: 'UPLOAD_ARTWORK',
        title: 'The Algorithm\'s Dream',
        caption: 'A short story exploring the intersection of human consciousness and artificial intelligence',
        contentUrl: 'https://example.com/ai-story.txt',
        status: 'APPROVED',
        voteCount: 7
      }
    ]

    for (const submissionData of submissions) {
      const submission = await prisma.submission.create({
        data: submissionData
      })
      console.log(`   ✓ Created submission: ${submission.title}`)
    }

    // Create sample votes
    console.log('👍 Creating sample votes...')
    const createdSubmissions = await prisma.submission.findMany()
    
    // Create cross-voting between users
    const votes = [
      { userId: createdUsers[0].id, submissionId: createdSubmissions[0].id },
      { userId: createdUsers[2].id, submissionId: createdSubmissions[0].id },
      { userId: createdUsers[3].id, submissionId: createdSubmissions[0].id },
      { userId: createdUsers[1].id, submissionId: createdSubmissions[1].id },
      { userId: createdUsers[4].id, submissionId: createdSubmissions[1].id },
      { userId: createdUsers[0].id, submissionId: createdSubmissions[2].id },
      { userId: createdUsers[1].id, submissionId: createdSubmissions[2].id },
      { userId: createdUsers[2].id, submissionId: createdSubmissions[3].id }
    ]

    for (const voteData of votes) {
      await prisma.vote.create({
        data: voteData
      })
    }
    console.log(`   ✓ Created ${votes.length} votes`)

    // Create tutorial progress for some users
    console.log('📚 Creating tutorial progress...')
    const tutorialProgress = [
      {
        userId: createdUsers[1].id,
        challengeId: createdChallenges[0].id,
        currentStep: 3,
        totalSteps: 3,
        completed: true,
        completedAt: new Date()
      },
      {
        userId: createdUsers[2].id,
        challengeId: createdChallenges[1].id,
        currentStep: 2,
        totalSteps: 3,
        completed: false
      }
    ]

    for (const progressData of tutorialProgress) {
      await prisma.challengeTutorialProgress.create({
        data: progressData
      })
    }
    console.log(`   ✓ Created ${tutorialProgress.length} tutorial progress records`)

    // Update challenge participant counts
    console.log('📊 Updating challenge statistics...')
    for (const challenge of createdChallenges) {
      const participantCount = await prisma.submission.count({
        where: { challengeId: challenge.id }
      })
      
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { currentParticipants: participantCount }
      })
    }
    console.log('   ✓ Updated challenge participant counts')

    // Final statistics
    const stats = {
      users: await prisma.user.count(),
      challenges: await prisma.challenge.count(),
      submissions: await prisma.submission.count(),
      votes: await prisma.vote.count(),
      tutorialProgress: await prisma.challengeTutorialProgress.count()
    }

    console.log('\n' + '=' .repeat(50))
    console.log('🎉 Database seeding completed successfully!')
    console.log('=' .repeat(50))
    console.log('📊 Final Statistics:')
    console.log(`   • Users: ${stats.users}`)
    console.log(`   • Challenges: ${stats.challenges}`)
    console.log(`   • Submissions: ${stats.submissions}`)
    console.log(`   • Votes: ${stats.votes}`)
    console.log(`   • Tutorial Progress: ${stats.tutorialProgress}`)
    console.log('=' .repeat(50))
    
    console.log('\n✅ Production-ready data has been populated!')
    console.log('🚀 The application now uses real database data instead of mocks')
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
