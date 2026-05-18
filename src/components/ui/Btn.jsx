'use client'
import { TEAL, RED, WHITE, BDR, TXT, SUB } from '../../constants/colors.js'

const variants = {
  primary: { bg: TEAL, color: WHITE, border: TEAL },
  ghost:   { bg: 'transparent', color: TXT, border: BDR },
  danger:  { bg: '#FEE9E2', color: RED, border: '#F5D1C4' },
  outline: { bg: WHITE, color: TEAL, border: TEAL },
}

export default function Btn({
  children, onClick, variant = 'primary', sm = false, disabled = false,
  type = 'button', style = {},
}) {
  const v = variants[variant] || variants.primary
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#EEE' : v.bg,
        color: disabled ? SUB : v.color,
        border: `1px solid ${disabled ? BDR : v.border}`,
        padding: sm ? '6px 12px' : '10px 18px',
        borderRadius: 999,
        fontSize: sm ? 13 : 14,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all .15s ease',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
