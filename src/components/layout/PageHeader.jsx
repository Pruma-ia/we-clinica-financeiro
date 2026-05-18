'use client'
import { TXT, SUB } from '../../constants/colors.js'

export default function PageHeader({ title, sub, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 16, marginBottom: 24, flexWrap: 'wrap',
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: TXT, lineHeight: 1.2 }}>
          {title}
        </h1>
        {sub && <div style={{ color: SUB, fontSize: 14, marginTop: 4 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  )
}
