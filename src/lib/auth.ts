import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'



// Extend the default session to include user id
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'placeholder',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'placeholder',
    }),
    CredentialsProvider({
      id: 'mobile',
      name: 'Mobile',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
        mobile: { label: 'Mobile', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.userId) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { id: credentials.userId }
          })

          if (user) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              mobile: user.mobile
            }
          }
        } catch (error) {
          console.error('Mobile auth error:', error)
        }

        return null
      }
    }),
    ...(process.env.NODE_ENV === 'production' 
      ? [EmailProvider({
          server: {
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          },
          from: process.env.EMAIL_FROM,
        })]
      : [] // No email provider in development
    ),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub!
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
      }
      return token
    },
    signIn: async ({ user, account }) => {
      // For OAuth providers, ensure user exists in database
      if (account && user?.email) {
        try {
          // Check if user already exists
          const existingUser = await prisma.user.findFirst({
            where: { 
              OR: [
                { email: user.email },
                { providerId: account.providerAccountId }
              ]
            }
          })

          if (!existingUser) {
            // Create new user
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account.provider,
                providerId: account.providerAccountId
              }
            })
          }
        } catch (error) {
          console.error('Error handling user sign in:', error)
          return false
        }
      }
      
      return true
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  }
}
