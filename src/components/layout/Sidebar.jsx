import { NavLink, useNavigate } from 'react-router-dom'
import { COAL, TEAL, TEALL, SUB, WHITE, BDR } from '../../constants/colors.js'
import { signOut } from '../../lib/auth.js'

const ITENS = [
  { to: '/dashboard',     icon: '◈', l: 'Dashboard' },
  { to: '/lancamentos',   icon: '✦', l: 'Lançamentos' },
  { to: '/contas',        icon: '⇅', l: 'Contas a receber/pagar' },
  { to: '/comissoes',     icon: '◎', l: 'Comissões', badge: 'KEY' },
  { to: '/dre',           icon: '▤', l: 'DRE' },
  { to: '/fluxo-caixa',   icon: '⟿', l: 'Fluxo de caixa' },
  { to: '/vendas',        icon: '◉', l: 'Vendas' },
  { to: '/ciclo',         icon: '↺', l: 'Ciclo financeiro' },
  { to: '/conciliacao',   icon: '⇌', l: 'Conciliação' },
  { sep: true },
  { to: '/clientes',      icon: '◇', l: 'Clientes' },
  { to: '/prestadores',   icon: '◆', l: 'Prestadores' },
  { to: '/plano-contas',  icon: '☰', l: 'Plano de contas' },
  { to: '/premissas',     icon: '⚙', l: 'Premissas' },
  { to: '/auditoria',     icon: '◑', l: 'Log de auditoria' },
]

export default function Sidebar({ perfil }) {
  const navigate = useNavigate()
  const handleSair = async () => {
    await signOut()
    navigate('/login')
  }

  const itens = [...ITENS]
  if (perfil?.role === 'admin') {
    itens.push({ sep: true })
    itens.push({ to: '/admin', icon: '🔐', l: 'Painel Admin' })
  }

  return (
    <aside style={{
      width: 260, background: COAL, color: WHITE,
      height: '100vh', position: 'sticky', top: 0,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <div style={{ padding: '28px 22px 22px' }}>
        <div style={{ color: TEAL, fontSize: 17, fontWeight: 700, letterSpacing: '.04em' }}>
          WE CLÍNICA
        </div>
        <div style={{ color: SUB, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>
          Sistema Financeiro
        </div>
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 999,
          background: '#3B82F6', color: WHITE,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 600, fontSize: 15,
        }}>
          {(perfil?.nome || '?').slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: WHITE, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {perfil?.nome || 'Sem nome'}
          </div>
          <button
            onClick={handleSair}
            style={{
              background: 'transparent', border: 'none',
              color: SUB, fontSize: 12, cursor: 'pointer', padding: 0,
            }}
          >
            Sair
          </button>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '0 10px 24px' }}>
        {itens.map((it, i) => it.sep ? (
          <div key={`sep-${i}`} style={{ height: 1, background: '#2E2C2A', margin: '12px 12px' }} />
        ) : (
          <NavLink
            key={it.to}
            to={it.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              borderRadius: 10,
              color: isActive ? WHITE : SUB,
              background: isActive ? '#23211F' : 'transparent',
              borderLeft: isActive ? `3px solid ${TEAL}` : '3px solid transparent',
              textDecoration: 'none',
              fontSize: 14,
              marginBottom: 2,
            })}
          >
            <span style={{ fontSize: 14, opacity: .8, width: 16, display: 'inline-block' }}>{it.icon}</span>
            <span style={{ flex: 1 }}>{it.l}</span>
            {it.badge && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                background: TEALL, color: TEAL,
                padding: '2px 8px', borderRadius: 999,
              }}>{it.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '14px 22px', borderTop: '1px solid #2E2C2A', color: SUB, fontSize: 11 }}>
        v1.0 · by Pruma Consultoria
      </div>
    </aside>
  )
}
