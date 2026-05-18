'use client'
import { SessionProvider, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { PeriodoProvider } from '../../components/layout/PeriodoBar.jsx'
import Sidebar from '../../components/layout/Sidebar.jsx'
import PeriodoBar from '../../components/layout/PeriodoBar.jsx'
import { AuthProvider } from '../../hooks/useAuth.jsx'

function Shell({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status, router])

  if (status === 'loading' || !session) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#F3F2ED', color: '#6B6A63', fontSize: 14,
      }}>
        Carregando…
      </div>
    )
  }

  const perfil = {
    id: session.user.perfilId,
    email: session.user.email,
    nome: session.user.perfilNome || session.user.name,
    role: session.user.perfilRole,
    ativo: true,
  }

  return (
    <AuthProvider perfil={perfil}>
      <PeriodoProvider>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F2ED' }}>
          <Sidebar perfil={perfil} />
          <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
            <PeriodoBar />
            {children}
          </main>
        </div>
      </PeriodoProvider>
    </AuthProvider>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  )
}
