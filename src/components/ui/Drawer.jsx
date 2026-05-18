'use client'
import { WHITE, BDR, TXT, SUB } from '../../constants/colors.js'

export default function Drawer({ open, onClose, title, width = 500, children }) {
  if (!open) return null
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
          zIndex: 50,
        }}
      />
      <div
        role="dialog"
        aria-label={title}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width, maxWidth: '100vw',
          background: WHITE, borderLeft: `1px solid ${BDR}`,
          zIndex: 51, overflowY: 'auto',
          boxShadow: '-8px 0 28px rgba(0,0,0,.08)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 28px', borderBottom: `1px solid ${BDR}`,
          position: 'sticky', top: 0, background: WHITE, zIndex: 1,
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: TXT }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            style={{
              background: 'transparent', border: 'none',
              color: SUB, fontSize: 22, cursor: 'pointer', padding: 4,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </>
  )
}
