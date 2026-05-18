import { OK, RED, WARN, SUB, TEAL, BDR } from '../../constants/colors.js'

const palette = {
  green:  { bg: '#E1F5EE', color: OK },
  red:    { bg: '#FAECE7', color: RED },
  yellow: { bg: '#FAEEDA', color: WARN },
  gray:   { bg: '#EEEEEC', color: SUB },
  blue:   { bg: '#DDEAFB', color: '#1F5FB4' },
  teal:   { bg: '#E1F5EE', color: TEAL },
}

export default function Badge({ children, color = 'gray', style = {} }) {
  const p = palette[color] || palette.gray
  return (
    <span
      style={{
        display: 'inline-block',
        background: p.bg,
        color: p.color,
        border: `1px solid ${BDR}`,
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
