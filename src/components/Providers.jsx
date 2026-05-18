'use client'
import { SessionProvider } from 'next-auth/react'
import SupabaseAuthSync from './SupabaseAuthSync.jsx'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SupabaseAuthSync />
      {children}
    </SessionProvider>
  )
}
