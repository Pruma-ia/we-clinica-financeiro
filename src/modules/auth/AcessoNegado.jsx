'use client'
import { useEffect } from 'react'
import { signOut } from '../../lib/auth.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { COAL, RED, REDL, WHITE, SUB, BDR } from '../../constants/colors.js'
import Btn from '../../components/ui/Btn.jsx'

export default function AcessoNegado() {
  const { user, refresh } = useAuth()

  // Sign out automático após exibir — usuário não fica em sessão zumbi
  useEffect(() => {
    const t = setTimeout(() => { signOut().then(refresh) }, 8000)
    return () => clearTimeout(t)
  }, [refresh])

  const handleSair = async () => {
    await signOut()
    refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#F3F2ED',
    }}>
      <div style={{
        width: 460, background: WHITE, border: `1px solid ${BDR}`, borderRadius: 20,
        padding: 40, textAlign: 'center',
      }}>
        <div style={{
          width: 60, height: 60, borderRadius: 999, background: REDL,
          color: RED, fontSize: 28, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px',
        }}>!</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: COAL, margin: 0 }}>
          Acesso não autorizado
        </h1>
        <p style={{ color: SUB, fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>
          Seu email {user?.email && <strong>{user.email}</strong>} não está cadastrado como
          usuário autorizado. Solicite acesso à administradora do sistema.
        </p>
        <div style={{ marginTop: 26 }}>
          <Btn onClick={handleSair}>Voltar para login</Btn>
        </div>
      </div>
    </div>
  )
}
