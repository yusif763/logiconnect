import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      companyId: string
      companyName: string
      companyType: string
      isVerified: boolean
      isActive: boolean
      isCompanyAdmin: boolean
    } & DefaultSession['user']
  }

  interface User {
    role: string
    companyId: string
    companyName: string
    companyType: string
    isVerified: boolean
    isActive: boolean
    isCompanyAdmin: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    companyId: string
    companyName: string
    companyType: string
    isVerified: boolean
    isActive: boolean
    isCompanyAdmin: boolean
  }
}
