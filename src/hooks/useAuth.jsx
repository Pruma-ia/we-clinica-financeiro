'use client'
import { createContext, useContext } from 'react'
import { useSession } from 'next-auth/react'

const AuthCtx = createContext({ loading: true, user: null, perfil: null })

export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children, perfil: perfilProp }) {
  const { data: session, status } = useSession()

  const perfil = perfilProp || (session?.user ? {
    id: session.user.perfilId,
    email: session.user.email,
    nome: session.user.perfilNome || session.user.name,
    role: session.user.perfilRole,
    ativo: true,
  } : null)

  const value = {
    loading: status === 'loading',
    user: session?.user || null,
    perfil,
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
