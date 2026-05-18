'use client'
import { WHITE, BDR, SUB, TXT } from '../../constants/colors.js'

export default function Kpi({ label, value, sub, color = TXT, style = {} }) {
  return (
    <div style={{
      background: WHITE,
      border: `1px solid ${BDR}`,
      borderRadius: 16,
      padding: 22,
      ...style,
    }}>
      <div style={{
        fontSize: 11, color: SUB, fontWeight: 500,
        letterSpacing: '.05em', textTransform: 'uppercase',
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, color, lineHeight: 1.1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: SUB, marginTop: 8 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
