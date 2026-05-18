import { useMemo } from 'react'
import { useLancamentos } from '../../hooks/useLancamentos.js'
import { usePrestadores } from '../../hooks/usePrestadores.js'
import { usePremissas } from '../../hooks/usePremissas.js'
import { usePeriodo } from '../../components/layout/PeriodoBar.jsx'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Kpi from '../../components/ui/Kpi.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { fmtR, fmtP, fmtDataBR, fmtDataExtenso, today } from '../../utils/formatters.js'
import { getPaymentFriday } from '../../utils/datas.js'
import { calcM } from '../../utils/calcComissao.js'
import { TEAL, RED, WARN, OK, SUB, BDR, TXT, WHITE } from '../../constants/colors.js'

export default function Dashboard() {
  const { fim } = usePeriodo()
  const { data: lancs } = useLancamentos()
  const { data: prestadores } = usePrestadores()
  const { data: premissas } = usePremissas()

  const mesAtual = (fim || today().slice(0, 7))
  const noMes = useMemo(() => lancs.filter((l) =>
    (l.data_competencia || l.data || '').slice(0, 7) === mesAtual
  ), [lancs, mesAtual])

  const receitas = noMes.filter((l) => l.tipo === 'receita' && l.status !== 'cancelado')
  const despesasOp = noMes.filter((l) =>
    l.tipo === 'despesa' && l.status !== 'cancelado' && !l.auto_comissao
  )
  const comissoesMes = noMes.filter((l) => l.tipo === 'despesa' && l.auto_comissao)

  const totReceita = receitas.reduce((s, l) => s + +l.valor, 0)
  const totDespesa = despesasOp.reduce((s, l) => s + +l.valor, 0)
  const margem = receitas.reduce((s, l) => s + calcM(l, prestadores, premissas).marg, 0)
  const margemPct = totReceita > 0 ? (margem / totReceita) * 100 : 0

  const proxSexta = getPaymentFriday(today())
  const aPagarProxSexta = lancs.filter((l) =>
    l.auto_comissao && l.status === 'pendente' && l.sexta === proxSexta
  ).reduce((s, l) => s + +l.valor, 0)

  const aReceber = lancs
    .filter((l) => l.tipo === 'receita' && l.status === 'pendente')
    .reduce((s, l) => s + +l.valor, 0)
  const aPagar = lancs
    .filter((l) => l.tipo === 'despesa' && l.status === 'pendente')
    .reduce((s, l) => s + +l.valor, 0)
  const resultadoMes = totReceita - totDespesa - comissoesMes.reduce((s, l) => s + +l.valor, 0)

  const ultimos = lancs.slice(0, 8)

  const comissoesPorProf = useMemo(() => {
    const map = {}
    comissoesMes.forEach((c) => {
      const pid = c.prestador_id || 'sem'
      map[pid] = (map[pid] || 0) + +c.valor
    })
    return Object.entries(map).map(([pid, total]) => ({
      prest: prestadores.find((p) => p.id === pid),
      total,
    })).sort((a, b) => b.total - a.total)
  }, [comissoesMes, prestadores])

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Dashboard" sub={fmtDataExtenso(today())} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
        <Kpi label="Receita do mês" value={fmtR(totReceita)} sub={`${receitas.length} atendimentos`} color={OK} />
        <Kpi label="Despesas do mês" value={fmtR(totDespesa)} color={RED} />
        <Kpi label="Margem líquida" value={fmtR(margem)} sub={`${fmtP(margemPct)} da receita`} color={OK} />
        <Kpi label="Comissões a pagar" value={fmtR(aPagarProxSexta)} sub={`Próxima sexta: ${fmtDataBR(proxSexta)}`} color={WARN} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
        <Kpi label="A receber" value={fmtR(aReceber)} color={OK} />
        <Kpi label="A pagar" value={fmtR(aPagar)} color={WARN} />
        <Kpi label="Resultado do mês" value={fmtR(resultadoMes)} color={resultadoMes >= 0 ? OK : RED} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <Card>
          <h3 style={{ margin: 0, color: TXT, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Últimos lançamentos</h3>
          {ultimos.length === 0 ? <Empty msg="Sem lançamentos" /> :
           ultimos.map((l) => (
            <div key={l.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: `1px solid ${BDR}`, gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: TXT, fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {l.descricao}
                </div>
                <div style={{ color: SUB, fontSize: 12 }}>
                  {fmtDataBR(l.data)} · {prestadores.find((p) => p.id === l.prestador_id)?.nome || ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: l.tipo === 'receita' ? OK : RED, fontWeight: 500 }}>
                  {l.tipo === 'receita' ? '+' : '−'}{fmtR(l.valor)}
                </div>
                <Badge color={
                  l.status === 'recebido' || l.status === 'pago' ? 'green' :
                  l.status === 'cancelado' ? 'gray' :
                  l.status === 'projecao' ? 'blue' : 'yellow'
                }>{l.status}</Badge>
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <h3 style={{ margin: 0, color: TXT, fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Comissões · mês atual</h3>
          {comissoesPorProf.length === 0 ? <Empty msg="Sem comissões" /> :
           comissoesPorProf.map(({ prest, total }) => (
            <div key={prest?.id || 'sem'} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 0', borderBottom: `1px solid ${BDR}`,
            }}>
              <div>
                <div style={{ color: TXT, fontWeight: 500, fontSize: 14 }}>
                  {prest?.nome || 'Sem prestador'}
                </div>
                <div style={{ color: SUB, fontSize: 12 }}>
                  {prest?.tipo === 'psicologo' ? `${prest.com}%` : prest ? `${fmtR(prest.com)}/h` : ''}
                </div>
              </div>
              <div style={{ color: WARN, fontWeight: 600 }}>{fmtR(total)}</div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
