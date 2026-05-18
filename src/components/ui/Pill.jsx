import { TEAL, WHITE, BDR, SUB } from '../../constants/colors.js'

export default function Pill({ label, active = false, onClick, style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? TEAL : WHITE,
        color: active ? WHITE : SUB,
        border: `1px solid ${active ? TEAL : BDR}`,
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        ...style,
      }}
    >
      {label}
    </button>
  )
}
