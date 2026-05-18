import { SUB } from '../../constants/colors.js'

export default function Empty({ msg = 'Nenhum registro' }) {
  return (
    <div style={{
      padding: '60px 20px',
      textAlign: 'center',
      color: SUB,
      fontSize: 14,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        border: `2px solid ${SUB}`, margin: '0 auto 14px',
        opacity: .4,
      }} />
      {msg}
    </div>
  )
}
