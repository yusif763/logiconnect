import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { company: true },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company.name,
          companyType: user.company.type,
          isVerified: user.company.isVerified,
          isActive: user.company.isActive,
          isCompanyAdmin: user.isCompanyAdmin,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Initial sign-in — populate token from credentials
        token.id = user.id
        token.role = (user as any).role
        token.companyId = (user as any).companyId
        token.companyName = (user as any).companyName
        token.companyType = (user as any).companyType
        token.isVerified = (user as any).isVerified
        token.isActive = (user as any).isActive
        token.isCompanyAdmin = (user as any).isCompanyAdmin
        token.refreshedAt = Date.now()
      } else if (token.id) {
        // Only re-fetch from DB at most once every 5 minutes to avoid
        // hammering the DB on every middleware auth() call
        const FIVE_MIN = 5 * 60 * 1000
        const lastRefresh = (token.refreshedAt as number) ?? 0
        if (Date.now() - lastRefresh > FIVE_MIN) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              include: { company: true },
            })
            if (dbUser) {
              token.role = dbUser.role
              token.companyId = dbUser.companyId
              token.companyName = dbUser.company.name
              token.companyType = dbUser.company.type
              token.isVerified = dbUser.company.isVerified
              token.isActive = dbUser.company.isActive
              token.isCompanyAdmin = dbUser.isCompanyAdmin
              token.refreshedAt = Date.now()
            } else {
              // User no longer exists (e.g., after re-seed) — invalidate token
              return {} as any
            }
          } catch {
            // DB unavailable — keep existing token data
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.companyId = token.companyId as string
        session.user.companyName = token.companyName as string
        session.user.companyType = token.companyType as string
        session.user.isVerified = token.isVerified as boolean
        session.user.isActive = token.isActive as boolean
        session.user.isCompanyAdmin = token.isCompanyAdmin as boolean
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
