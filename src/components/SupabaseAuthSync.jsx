'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '../lib/supabase.js'

export default function SupabaseAuthSync() {
  const { data: session } = useSession()

  useEffect(() => {
    const token = session?.supabaseAccessToken
    if (token) {
      supabase.auth.setSession({ access_token: token, refresh_token: '' })
    } else {
      supabase.auth.signOut()
    }
  }, [session?.supabaseAccessToken])

  return null
}
