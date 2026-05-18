import { WHITE, BDR } from '../../constants/colors.js'

export default function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: WHITE,
        border: `1px solid ${BDR}`,
        borderRadius: 16,
        padding: 22,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
