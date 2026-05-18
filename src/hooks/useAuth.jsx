import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase.js'
import { fetchPerfilPermitido } from '../lib/auth.js'

const AuthCtx = createContext({
  loading: true, session: null, user: null, perfil: null, refresh: () => {},
})

export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [perfil, setPerfil] = useState(null)

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    const s = data?.session || null
    setSession(s)
    if (s?.user?.email) {
      const p = await fetchPerfilPermitido(s.user.email)
      setPerfil(p)
    } else {
      setPerfil(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s)
      if (s?.user?.email) {
        fetchPerfilPermitido(s.user.email).then(setPerfil)
      } else {
        setPerfil(null)
      }
    })
    return () => sub?.subscription?.unsubscribe?.()
  }, [refresh])

  const value = {
    loading,
    session,
    user: session?.user || null,
    perfil,
    refresh,
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
