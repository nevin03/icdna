import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      googleId: string
    }
  }

  interface User {
    googleId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId: string
  }
}

// Types for your API responses
export interface LoginResponse {
  success: boolean
  isNewUser: boolean
  accessToken?: string
  message?: string
}

export interface RegisterResponse {
  success: boolean
  accessToken: string
  message?: string
}

export interface UserProfile {
  name: string
  address: string
}
