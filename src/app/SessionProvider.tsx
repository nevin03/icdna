"use client"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

interface Props {
  children: React.ReactNode
}

function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
        {children}
    </NextAuthSessionProvider>
    // <div>SessionProvider</div>
  )
}

export default SessionProvider
