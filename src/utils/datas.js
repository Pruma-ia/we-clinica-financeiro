import { today } from './formatters.js'

// Sexta de pagamento: quinta-quinta → sexta da semana vigente
export const getPaymentFriday = (dateStr) => {
  const d = dateStr ? new Date(dateStr + 'T12:00:00') : new Date()
  const dow = d.getDay()
  const daysUntilThu = (4 - dow + 7) % 7
  const thu = new Date(d); thu.setDate(d.getDate() + daysUntilThu)
  const fri = new Date(thu); fri.setDate(thu.getDate() + 1)
  return fri.toISOString().slice(0, 10)
}

export const daysDiff = (a, b) => {
  const da = new Date((a || '').slice(0, 10) + 'T12:00:00')
  const db = new Date((b || '').slice(0, 10) + 'T12:00:00')
  return Math.round((db - da) / 86400000)
}

// Lista YYYY-MM entre dois meses (inclusivo)
export const getMonths = (ini, fim) => {
  if (!ini || !fim) return []
  const out = []
  const [yi, mi] = ini.split('-').map(Number)
  const [yf, mf] = fim.split('-').map(Number)
  let y = yi, m = mi
  while (y < yf || (y === yf && m <= mf)) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return out
}

export const mesAtual = () => today().slice(0, 7)

// 1º dia do mês N meses atrás (string YYYY-MM)
export const mesAtras = (n) => {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 7)
}

export const isAtrasado = (vencimento, status) => {
  if (!vencimento) return false
  if (status === 'recebido' || status === 'pago' || status === 'cancelado') return false
  return daysDiff(vencimento, today()) > 0
}
