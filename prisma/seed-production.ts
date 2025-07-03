import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data
  console.log('🧹 Cleaning existing data...')
  await prisma.vote.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.challengeTutorialProgress.deleteMany()
  await prisma.submissionDraft.deleteMany()
  await prisma.submissionAnalytics.deleteMany()
  await prisma.challenge.deleteMany()
  await prisma.otpVerification.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  console.log('👥 Creating users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@pulsar.com',
        name: 'Admin User',
        provider: 'email',
        profileComplete: true,
        emailVerified: new Date(),
        bio: 'Platform Administrator',
        trafficSource: 'direct'
      }
    }),
    prisma.user.create({
      data: {
        email: 'alice.creator@example.com',
        name: 'Alice Johnson',
        provider: 'google',
        providerId: 'google_alice_123',
        profileComplete: true,
        emailVerified: new Date(),
        bio: 'Digital artist passionate about cyberpunk aesthetics and AI-generated art.',
        trafficSource: 'organic',
        trafficMedium: 'search'
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob.musician@example.com',
        name: 'Bob Williams',
        provider: 'google',
        providerId: 'google_bob_456',
        profileComplete: true,
        emailVerified: new Date(),
        bio: 'Electronic music producer specializing in synthwave and ambient soundscapes.',
        trafficSource: 'social',
        trafficMedium: 'facebook'
      }
    }),
    prisma.user.create({
      data: {
        mobile: '+1234567890',
        name: 'Charlie Brown',
        provider: 'mobile',
        profileComplete: true,
        mobileVerified: new Date(),
        bio: 'Aspiring artist exploring the intersection of technology and creativity.',
        trafficSource: 'campaign',
        trafficMedium: 'email',
        trafficCampaign: 'winter_launch'
      }
    }),
    prisma.user.create({
      data: {
        email: 'diana.designer@example.com',
        name: 'Diana Chen',
        provider: 'email',
        profileComplete: true,
        emailVerified: new Date(),
        bio: 'UX/UI designer with a passion for creating immersive digital experiences.',
        trafficSource: 'referrer',
        trafficReferrer: 'design-community.com'
      }
    })
  ])

  console.log(`✅ Created ${users.length} users`)

  // Create challenges with proper data types
  console.log('🎯 Creating challenges...')
  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        title: 'Digital Dreams: Cyberpunk Holiday',
        description: 'Create stunning digital artwork that captures the essence of cyberpunk aesthetics with a holiday twist',
        objective: 'Showcase creative AI artwork capabilities while exploring the intersection of futuristic cyberpunk themes and traditional holiday elements',
        assignment: 'Your task is to create original digital artwork that seamlessly blends cyberpunk aesthetics with holiday themes. Think neon-lit Christmas trees, holographic decorations, cyber-enhanced winter scenes, or futuristic holiday celebrations. Use AI tools to generate compelling visuals that capture the mood and atmosphere of both genres.',
        category: 'AI Artwork',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
        status: 'OPEN',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2024-12-31'),
        winnersAnnounceDate: new Date('2025-01-15'),
        maxEntriesPerUser: 3,
        currentParticipants: 0,
        prizes: JSON.stringify([
          '1st Place: $2,500 + Featured Exhibition',
          '2nd Place: $1,500 + Digital Art Course',
          '3rd Place: $750 + Premium AI Tools License',
          'People\'s Choice: $500 + Community Recognition'
        ]),
        topPrize: '$2,500',
        tutorialEnabled: true,
        tutorialSteps: JSON.stringify([
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
        ]),
        onboardingFlow: JSON.stringify({
          steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
          currentStep: 'welcome'
        }),
        hasToolkitAssets: true,
        toolkitAssets: JSON.stringify([
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
        ]),
        deliverables: JSON.stringify([
          'High-resolution digital artwork (minimum 1920x1080)',
          'Creative title and description (50-200 words)',
          'Artist statement explaining your concept (100-300 words)',
          'Original AI prompts used (if applicable)'
        ]),
        attachments: JSON.stringify([
          'Cyberpunk Style Guide.pdf',
          'Holiday Theme Reference Pack.zip',
          'Technical Requirements.pdf'
        ]),
        validationRules: JSON.stringify([
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
            value: 10485760,
            message: 'Image file size must be under 10MB',
            severity: 'error'
          }
        ]),
        contentRequirements: JSON.stringify([
          {
            type: 'image',
            formats: ['jpg', 'jpeg', 'png', 'webp'],
            maxSize: 10485760,
            minResolution: '1920x1080',
            requiredFields: ['title', 'description', 'artistStatement']
          }
        ]),
        createdBy: 'admin',
        isActive: true,
        isFeatured: true
      }
    }),
    prisma.challenge.create({
      data: {
        title: 'Neon Synthwave Soundscapes',
        description: 'Compose original synthwave music with AI assistance that captures the nostalgic feel of the 80s',
        objective: 'Produce high-quality synthwave compositions that evoke nostalgia while showcasing modern AI music generation capabilities',
        assignment: 'Create an original synthwave track that transports listeners to the neon-soaked nights of the 1980s. Your composition should feature classic synthwave elements: vintage synthesizers, driving basslines, ethereal pads, and nostalgic melodies. Use AI tools to generate, arrange, and enhance your musical ideas while maintaining the authentic synthwave aesthetic.',
        category: 'AI Music',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
        status: 'OPEN',
        startDate: new Date('2024-10-15'),
        endDate: new Date('2024-12-25'),
        winnersAnnounceDate: new Date('2025-01-10'),
        maxEntriesPerUser: 3,
        currentParticipants: 0,
        prizes: JSON.stringify([
          '1st Place: $1,800 + Professional Mastering Session',
          '2nd Place: $1,200 + Audio Equipment Package',
          '3rd Place: $600 + Music Software Bundle',
          'People\'s Choice: $400 + Community Spotlight'
        ]),
        topPrize: '$1,800',
        tutorialEnabled: true,
        tutorialSteps: JSON.stringify([
          {
            id: 1,
            title: 'Synthwave Fundamentals',
            description: 'Understanding the core elements of synthwave music',
            content: 'Synthwave draws from 80s electronic music, featuring analog synthesizer sounds, vintage drum machines, and nostalgic melodies.',
            media: 'https://example.com/tutorial-synthwave.mp4',
            duration: 300
          },
          {
            id: 2,
            title: 'AI Music Generation Tools',
            description: 'How to use AI tools for music composition',
            content: 'Learn to use AI assistants for melody generation, chord progressions, and arrangement ideas while maintaining your creative vision.',
            media: null,
            duration: 240
          }
        ]),
        onboardingFlow: JSON.stringify({
          steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
          currentStep: 'welcome'
        }),
        hasToolkitAssets: true,
        toolkitAssets: JSON.stringify([
          {
            id: 'synthwave-samples-1',
            title: 'Vintage Synth Sample Pack',
            description: 'Authentic 80s synthesizer samples and loops',
            fileUrl: 'https://example.com/synthwave-samples.zip',
            fileSize: '45.2 MB',
            fileType: 'ZIP'
          },
          {
            id: 'chord-progressions-1',
            title: 'Synthwave Chord Progressions',
            description: 'MIDI files with classic synthwave chord progressions',
            fileUrl: 'https://example.com/synthwave-chords.zip',
            fileSize: '5.1 MB',
            fileType: 'ZIP'
          }
        ]),
        deliverables: JSON.stringify([
          'Original synthwave track (3-6 minutes, high-quality audio)',
          'Track title and artist description',
          'Brief explanation of your creative process',
          'Credits for any AI tools or samples used'
        ]),
        validationRules: JSON.stringify([
          {
            field: 'title',
            type: 'required',
            message: 'Track title is required',
            severity: 'error'
          },
          {
            field: 'audioFile',
            type: 'format',
            value: ['mp3', 'wav', 'flac'],
            message: 'Audio must be MP3, WAV, or FLAC format',
            severity: 'error'
          },
          {
            field: 'audioFile',
            type: 'size',
            value: 52428800,
            message: 'Audio file size must be under 50MB',
            severity: 'error'
          }
        ]),
        contentRequirements: JSON.stringify([
          {
            type: 'audio',
            formats: ['mp3', 'wav', 'flac'],
            maxSize: 52428800,
            minDuration: 180,
            maxDuration: 360,
            requiredFields: ['title', 'description']
          }
        ]),
        createdBy: 'admin',
        isActive: true,
        isFeatured: false
      }
    }),
    prisma.challenge.create({
      data: {
        title: 'Future Fashion Reels',
        description: 'Create short-form video content showcasing futuristic fashion concepts',
        objective: 'Demonstrate creativity in video production while exploring themes of future fashion and style',
        assignment: 'Produce an engaging 15-60 second video reel that showcases futuristic fashion concepts. Whether it\'s conceptual clothing designs, styling tutorials, or fashion storytelling, create content that captures the imagination and demonstrates the future of fashion.',
        category: 'Video Content',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
        status: 'OPEN',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-11-30'),
        winnersAnnounceDate: new Date('2024-12-15'),
        maxEntriesPerUser: 5,
        currentParticipants: 0,
        prizes: JSON.stringify([
          '1st Place: $1,200 + Fashion Brand Collaboration',
          '2nd Place: $800 + Video Equipment Package',
          '3rd Place: $400 + Online Course Bundle',
          'People\'s Choice: $300 + Social Media Feature'
        ]),
        topPrize: '$1,200',
        tutorialEnabled: true,
        tutorialSteps: JSON.stringify([
          {
            id: 1,
            title: 'Video Content Planning',
            description: 'How to plan engaging short-form video content',
            content: 'Learn to structure your video for maximum impact: hook, content, and call-to-action.',
            media: 'https://example.com/tutorial-video-planning.mp4',
            duration: 180
          },
          {
            id: 2,
            title: 'Fashion Video Aesthetics',
            description: 'Creating visually appealing fashion content',
            content: 'Lighting, composition, and styling tips for fashion-focused video content.',
            media: 'https://example.com/tutorial-fashion-video.mp4',
            duration: 240
          }
        ]),
        onboardingFlow: JSON.stringify({
          steps: ['welcome', 'tutorial', 'toolkit', 'ready'],
          currentStep: 'welcome'
        }),
        hasToolkitAssets: true,
        toolkitAssets: JSON.stringify([
          {
            id: 'video-templates-1',
            title: 'Video Templates Pack',
            description: 'Ready-to-use video templates for fashion content',
            fileUrl: 'https://example.com/video-templates.zip',
            fileSize: '120.5 MB',
            fileType: 'ZIP'
          }
        ]),
        deliverables: JSON.stringify([
          'Video reel (15-60 seconds, 1080p minimum)',
          'Creative title and caption',
          'Brief description of your fashion concept'
        ]),
        validationRules: JSON.stringify([
          {
            field: 'title',
            type: 'required',
            message: 'Video title is required',
            severity: 'error'
          },
          {
            field: 'videoFile',
            type: 'format',
            value: ['mp4', 'mov', 'avi'],
            message: 'Video must be MP4, MOV, or AVI format',
            severity: 'error'
          },
          {
            field: 'videoFile',
            type: 'duration',
            min: 15,
            max: 60,
            message: 'Video must be between 15-60 seconds',
            severity: 'error'
          }
        ]),
        contentRequirements: JSON.stringify([
          {
            type: 'video',
            formats: ['mp4', 'mov', 'avi'],
            maxSize: 104857600,
            minDuration: 15,
            maxDuration: 60,
            minResolution: '1080x1920',
            requiredFields: ['title', 'caption']
          }
        ]),
        createdBy: 'admin',
        isActive: true,
        isFeatured: false
      }
    })
  ])

  console.log(`✅ Created ${challenges.length} challenges`)

  // Create submissions
  console.log('📝 Creating submissions...')
  const submissions = await Promise.all([
    prisma.submission.create({
      data: {
        userId: users[1].id, // Alice
        challengeId: challenges[0].id, // Cyberpunk Holiday
        type: 'AI_ARTWORK',
        title: 'Neon Christmas Tree in Neo-Tokyo',
        caption: 'A vibrant cyberpunk interpretation of a traditional Christmas tree, set in a futuristic Tokyo street scene with holographic ornaments and neon snow.',
        contentUrl: 'https://example.com/submissions/neon-christmas-tree.jpg',
        prompt: 'Cyberpunk Christmas tree with holographic ornaments, neon lights, Tokyo street background, futuristic holiday scene, digital art style',
        status: 'APPROVED',
        voteCount: 15
      }
    }),
    prisma.submission.create({
      data: {
        userId: users[2].id, // Bob
        challengeId: challenges[1].id, // Synthwave
        type: 'AI_SONG',
        title: 'Midnight Drive',
        caption: 'A nostalgic synthwave journey through neon-lit streets, capturing the essence of 80s electronic music with modern AI assistance.',
        contentUrl: 'https://example.com/submissions/midnight-drive.mp3',
        prompt: 'Synthwave track, nostalgic 80s vibes, driving bassline, vintage synthesizers, dreamy atmosphere',
        status: 'APPROVED',
        voteCount: 12
      }
    }),
    prisma.submission.create({
      data: {
        userId: users[3].id, // Charlie
        challengeId: challenges[2].id, // Fashion Reels
        type: 'UPLOAD_REEL',
        title: 'Holographic Fashion Show',
        caption: 'A 45-second fashion reel showcasing conceptual holographic clothing designs with futuristic styling.',
        contentUrl: 'https://example.com/submissions/holographic-fashion.mp4',
        status: 'PENDING',
        voteCount: 3
      }
    }),
    prisma.submission.create({
      data: {
        userId: users[4].id, // Diana
        challengeId: challenges[0].id, // Cyberpunk Holiday
        type: 'AI_ARTWORK',
        title: 'Cyber Santa\'s Workshop',
        caption: 'Reimagining Santa\'s workshop as a high-tech laboratory with robotic elves and holographic gift wrapping.',
        contentUrl: 'https://example.com/submissions/cyber-santa-workshop.jpg',
        prompt: 'Cyberpunk Santa workshop, robotic elves, holographic gifts, futuristic Christmas factory, neon lighting',
        status: 'APPROVED',
        voteCount: 8
      }
    })
  ])

  console.log(`✅ Created ${submissions.length} submissions`)

  // Create votes
  console.log('👍 Creating votes...')
  const votes = await Promise.all([
    // Alice's submission votes
    prisma.vote.create({
      data: {
        userId: users[2].id, // Bob votes for Alice
        submissionId: submissions[0].id
      }
    }),
    prisma.vote.create({
      data: {
        userId: users[3].id, // Charlie votes for Alice
        submissionId: submissions[0].id
      }
    }),
    prisma.vote.create({
      data: {
        userId: users[4].id, // Diana votes for Alice
        submissionId: submissions[0].id
      }
    }),
    // Bob's submission votes
    prisma.vote.create({
      data: {
        userId: users[1].id, // Alice votes for Bob
        submissionId: submissions[1].id
      }
    }),
    prisma.vote.create({
      data: {
        userId: users[4].id, // Diana votes for Bob
        submissionId: submissions[1].id
      }
    }),
    // Diana's submission votes
    prisma.vote.create({
      data: {
        userId: users[1].id, // Alice votes for Diana
        submissionId: submissions[3].id
      }
    }),
    prisma.vote.create({
      data: {
        userId: users[2].id, // Bob votes for Diana
        submissionId: submissions[3].id
      }
    })
  ])

  console.log(`✅ Created ${votes.length} votes`)

  // Create tutorial progress
  console.log('📚 Creating tutorial progress...')
  const tutorialProgress = await Promise.all([
    prisma.challengeTutorialProgress.create({
      data: {
        userId: users[1].id, // Alice
        challengeId: challenges[0].id, // Cyberpunk Holiday
        currentStep: 3,
        totalSteps: 3,
        completed: true,
        completedAt: new Date()
      }
    }),
    prisma.challengeTutorialProgress.create({
      data: {
        userId: users[2].id, // Bob
        challengeId: challenges[1].id, // Synthwave
        currentStep: 2,
        totalSteps: 2,
        completed: true,
        completedAt: new Date()
      }
    }),
    prisma.challengeTutorialProgress.create({
      data: {
        userId: users[3].id, // Charlie
        challengeId: challenges[2].id, // Fashion Reels
        currentStep: 1,
        totalSteps: 2,
        completed: false
      }
    })
  ])

  console.log(`✅ Created ${tutorialProgress.length} tutorial progress records`)

  // Create submission drafts
  console.log('📋 Creating submission drafts...')
  const drafts = await Promise.all([
    prisma.submissionDraft.create({
      data: {
        userId: users[3].id, // Charlie
        challengeId: challenges[0].id, // Cyberpunk Holiday
        draftName: 'Holiday Cyberpunk Concept',
        type: 'AI_ARTWORK',
        title: 'Digital Christmas Market',
        caption: 'A work-in-progress cyberpunk interpretation of a traditional Christmas market',
        prompt: 'Cyberpunk Christmas market, holographic vendors, digital snow, neon lights',
        step: 2,
        totalSteps: 4,
        contentMethod: 'ai-generation',
        timeSpent: 1200, // 20 minutes
        stepsCompleted: JSON.stringify(['concept', 'prompt']),
        lastStepReached: 'preview',
        isActive: true
      }
    }),
    prisma.submissionDraft.create({
      data: {
        userId: users[4].id, // Diana
        challengeId: challenges[1].id, // Synthwave
        draftName: 'Retro Future Beats',
        type: 'AI_SONG',
        title: 'Synthwave Dreams',
        contentMethod: 'ai-generation',
        step: 1,
        totalSteps: 3,
        timeSpent: 600, // 10 minutes
        stepsCompleted: JSON.stringify(['planning']),
        lastStepReached: 'generation',
        isActive: true
      }
    })
  ])

  console.log(`✅ Created ${drafts.length} submission drafts`)

  // Update challenge participant counts
  console.log('🔢 Updating challenge participant counts...')
  await Promise.all([
    prisma.challenge.update({
      where: { id: challenges[0].id },
      data: { currentParticipants: 2 } // Alice and Diana submitted
    }),
    prisma.challenge.update({
      where: { id: challenges[1].id },
      data: { currentParticipants: 1 } // Bob submitted
    }),
    prisma.challenge.update({
      where: { id: challenges[2].id },
      data: { currentParticipants: 1 } // Charlie submitted
    })
  ])

  console.log('✅ Updated participant counts')

  // Final verification
  const finalCounts = await Promise.all([
    prisma.user.count(),
    prisma.challenge.count(),
    prisma.submission.count(),
    prisma.vote.count(),
    prisma.challengeTutorialProgress.count(),
    prisma.submissionDraft.count()
  ])

  console.log('\n🎉 Seed completed successfully!')
  console.log('📊 Final counts:')
  console.log(`   Users: ${finalCounts[0]}`)
  console.log(`   Challenges: ${finalCounts[1]}`)
  console.log(`   Submissions: ${finalCounts[2]}`)
  console.log(`   Votes: ${finalCounts[3]}`)
  console.log(`   Tutorial Progress: ${finalCounts[4]}`)
  console.log(`   Drafts: ${finalCounts[5]}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
