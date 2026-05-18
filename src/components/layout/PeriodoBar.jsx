import { useState, useEffect, createContext, useContext } from 'react'
import { WHITE, BDR, SUB, TEAL, TXT } from '../../constants/colors.js'
import { mesAtras, mesAtual } from '../../utils/datas.js'
import Pill from '../ui/Pill.jsx'

const Ctx = createContext({ ini: '', fim: '', setIni: () => {}, setFim: () => {} })

export const usePeriodo = () => useContext(Ctx)

export function PeriodoProvider({ children }) {
  const [ini, setIni] = useState(mesAtras(10))
  const [fim, setFim] = useState(mesAtual())
  return <Ctx.Provider value={{ ini, fim, setIni, setFim }}>{children}</Ctx.Provider>
}

export default function PeriodoBar() {
  const { ini, fim, setIni, setFim } = usePeriodo()

  const applyShortcut = (n) => {
    setIni(mesAtras(n))
    setFim(mesAtual())
  }

  const applyAno = () => {
    const ano = new Date().getFullYear()
    setIni(`${ano}-01`)
    setFim(`${ano}-12`)
  }

  return (
    <div style={{
      background: WHITE, borderBottom: `1px solid ${BDR}`,
      padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 14,
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <label style={{ fontSize: 11, color: SUB, letterSpacing: '.08em', textTransform: 'uppercase' }}>
        Período
      </label>
      <input
        type="month"
        value={ini}
        onChange={(e) => setIni(e.target.value)}
        style={inputStyle}
      />
      <span style={{ color: SUB, fontSize: 13 }}>até</span>
      <input
        type="month"
        value={fim}
        onChange={(e) => setFim(e.target.value)}
        style={inputStyle}
      />
      <div style={{ width: 1, height: 24, background: BDR, margin: '0 6px' }} />
      <Pill label="3M" onClick={() => applyShortcut(2)} />
      <Pill label="6M" onClick={() => applyShortcut(5)} />
      <Pill label="12M" onClick={() => applyShortcut(11)} />
      <Pill label="Ano" onClick={applyAno} />
    </div>
  )
}

const inputStyle = {
  padding: '8px 12px',
  border: `1px solid ${BDR}`,
  borderRadius: 8,
  fontSize: 13,
  color: TXT,
  background: WHITE,
}
