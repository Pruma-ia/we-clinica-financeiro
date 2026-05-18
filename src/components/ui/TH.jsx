import { SUB, BDR } from '../../constants/colors.js'

export default function TH({ cols = [] }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: cols.map(() => '1fr').join(' '),
      padding: '14px 18px',
      borderBottom: `1px solid ${BDR}`,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '.05em',
      textTransform: 'uppercase',
      color: SUB,
    }}>
      {cols.map((c, i) => <div key={i}>{c}</div>)}
    </div>
  )
}
