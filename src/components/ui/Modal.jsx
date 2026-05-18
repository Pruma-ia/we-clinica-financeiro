'use client'
import { WHITE, BDR, TXT, SUB } from '../../constants/colors.js'

export default function Modal({ open, onClose, title, width = 480, children }) {
  if (!open) return null
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
          zIndex: 60,
        }}
      />
      <div
        role="dialog"
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width, maxWidth: 'calc(100vw - 32px)',
          background: WHITE, borderRadius: 16,
          zIndex: 61, maxHeight: '90vh', overflowY: 'auto',
          border: `1px solid ${BDR}`,
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: `1px solid ${BDR}`,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: TXT }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: SUB, fontSize: 22, cursor: 'pointer' }}
            aria-label="Fechar"
          >×</button>
        </div>
        <div style={{ padding: 22 }}>{children}</div>
      </div>
    </>
  )
}
