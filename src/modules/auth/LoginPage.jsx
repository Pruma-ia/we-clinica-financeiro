import { useState } from 'react'
import { signInWithGoogle } from '../../lib/auth.js'
import { COAL, TEAL, TEALL, WHITE, SUB, RED, BDR } from '../../constants/colors.js'

export default function LoginPage() {
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async () => {
    setErro(''); setCarregando(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      setErro(e?.message || 'Falha ao iniciar login')
      setCarregando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#F3F2ED',
    }}>
      <div style={{
        width: 420, background: WHITE, border: `1px solid ${BDR}`, borderRadius: 20,
        padding: 40,
      }}>
        <div style={{ color: TEAL, fontSize: 22, fontWeight: 700, letterSpacing: '.04em' }}>
          WE CLÍNICA
        </div>
        <div style={{ color: SUB, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 4 }}>
          Sistema Financeiro
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 600, color: COAL, marginTop: 28, marginBottom: 6 }}>
          Acessar plataforma
        </h1>
        <p style={{ color: SUB, fontSize: 14, marginTop: 0, marginBottom: 28 }}>
          Entre com sua conta Google autorizada pelo administrador.
        </p>

        <button
          onClick={handleLogin}
          disabled={carregando}
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 12,
            border: `1px solid ${BDR}`, background: WHITE, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            fontSize: 15, fontWeight: 500, color: COAL,
          }}
        >
          <GoogleIcon />
          {carregando ? 'Abrindo Google…' : 'Continuar com Google'}
        </button>

        {erro && (
          <div style={{
            marginTop: 16, padding: 12, borderRadius: 10,
            background: '#FAECE7', color: RED, fontSize: 13,
          }}>{erro}</div>
        )}

        <div style={{
          marginTop: 24, padding: 14, background: TEALL, color: TEAL,
          borderRadius: 10, fontSize: 12, lineHeight: 1.5,
        }}>
          Apenas usuários previamente cadastrados pelo administrador conseguem acessar o sistema.
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 5.5 29.6 3.5 24 3.5 12.7 3.5 3.5 12.7 3.5 24S12.7 44.5 24 44.5 44.5 35.3 44.5 24c0-1.2-.1-2.4-.3-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16.1 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 7.5 29.6 5.5 24 5.5c-7.7 0-14.3 4.3-17.7 10.7z"/>
      <path fill="#4CAF50" d="M24 44.5c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.4c-2 1.5-4.6 2.4-7.7 2.4-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 40.1 16.2 44.5 24 44.5z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.6 5.4c-.5.5 7.7-5.6 7.7-15.1 0-1.2-.1-2.4-.3-3.5z"/>
    </svg>
  )
}
