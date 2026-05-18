'use client'
import { useState, useMemo } from 'react'
import { useLancamentos } from '../../hooks/useLancamentos.js'
import { usePrestadores } from '../../hooks/usePrestadores.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'

import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Pill from '../../components/ui/Pill.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Kpi from '../../components/ui/Kpi.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { Sel } from '../../components/ui/Field.jsx'

import { fmtR, fmtDataBR, fmtDataExtenso, today } from '../../utils/formatters.js'
import { getPaymentFriday } from '../../utils/datas.js'
import { TEAL, TEALL, RED, WARN, OK, SUB, BDR, TXT, WHITE } from '../../constants/colors.js'

export default function Comissoes() {
  const { perfil } = useAuth()
  const { data: lancs, pagarComissao, estornarComissao } = useLancamentos()
  const { data: prestadores } = usePrestadores()

  const [aba, setAba] = useState('a_pagar')   // projecoes | a_pagar | historico
  const [filtroSexta, setFiltroSexta] = useState('')

  const comissoes = useMemo(
    () => lancs.filter((l) => l.auto_comissao === true),
    [lancs]
  )
  const receitasMap = useMemo(() => {
    const m = {}
    lancs.filter((l) => l.tipo === 'receita').forEach((r) => { m[r.id] = r })
    return m
  }, [lancs])

  // Agrupa por status
  const projecoes = comissoes.filter((c) => c.status === 'projecao')
  const aPagar    = comissoes.filter((c) => c.status === 'pendente')
  const historico = comissoes.filter((c) => c.status === 'pago')

  const proxSexta = getPaymentFriday(today())
  const totalProxSexta = aPagar.filter((c) => c.sexta === proxSexta)
    .reduce((s, c) => s + +c.valor, 0)
  const totalProjecao = projecoes.reduce((s, c) => s + +c.valor, 0)
  const totalAPagar   = aPagar.reduce((s, c) => s + +c.valor, 0)
  const totalHist     = historico.reduce((s, c) => s + +c.valor, 0)

  // Sextas únicas em a_pagar (pra filtro)
  const sextas = useMemo(() => {
    const set = new Set(aPagar.map((c) => c.sexta).filter(Boolean))
    return Array.from(set).sort()
  }, [aPagar])

  const listaAba = aba === 'projecoes' ? projecoes
                 : aba === 'historico' ? historico
                 : (filtroSexta ? aPagar.filter((c) => c.sexta === filtroSexta) : aPagar)

  // Agrupa por sexta → prestador
  const grupos = useMemo(() => {
    const out = {}
    listaAba.forEach((c) => {
      const chaveSexta = c.sexta || (aba === 'projecoes' ? 'Sem sexta' : '—')
      out[chaveSexta] = out[chaveSexta] || {}
      const pid = c.prestador_id || 'sem-prestador'
      out[chaveSexta][pid] = out[chaveSexta][pid] || []
      out[chaveSexta][pid].push(c)
    })
    return out
  }, [listaAba, aba])

  const handlePagar = async (c) => {
    const d = prompt('Data de pagamento (YYYY-MM-DD):', today())
    if (!d) return
    try {
      await pagarComissao(c.id, d)
      await logAcao(perfil, 'Pagar comissão', 'Lançamento', `${c.descricao} em ${d}`)
    } catch (e) {
      alert(e?.message || 'Falha')
    }
  }

  const handlePagarTodos = async (lista) => {
    if (!confirm(`Pagar ${lista.length} comissão(ões) desta sexta?`)) return
    const d = today()
    try {
      for (const c of lista) await pagarComissao(c.id, d)
      await logAcao(perfil, 'Pagar comissões em lote', 'Lançamento', `${lista.length} itens em ${d}`)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  const handleEstornar = async (c) => {
    if (!confirm('Estornar pagamento desta comissão?')) return
    try {
      await estornarComissao(c.id)
      await logAcao(perfil, 'Estornar comissão', 'Lançamento', c.descricao)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Comissões"
        sub="Gestão completa de comissionamento de prestadores"
      />

      <Card style={{ background: '#FAF9F4', marginBottom: 22 }}>
        <div style={{ fontSize: 13, color: TXT, lineHeight: 1.6 }}>
          <strong style={{ color: TEAL }}>Fluxo:</strong> Ao lançar receita com profissional → comissão aparece
          como <strong>Projeção</strong>. Ao dar baixa no recebimento → vira <strong>A pagar</strong> com
          sexta calculada automaticamente (corte quinta a quinta). Aqui você paga as comissões e tudo
          sincroniza com Lançamentos.
        </div>
      </Card>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22,
      }}>
        <Kpi label="Projeção (não recebido)" value={fmtR(totalProjecao)} sub={`${projecoes.length} comissões`} color={SUB} />
        <Kpi label="A pagar (recebido)" value={fmtR(totalAPagar)} sub={`${aPagar.length} comissões`} color={WARN} />
        <Kpi label="Próxima sexta" value={fmtR(totalProxSexta)} sub={fmtDataBR(proxSexta)} color={RED} />
        <Kpi label="Total histórico pago" value={fmtR(totalHist)} sub={`${historico.length} comissões`} color={OK} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 18, flexWrap: 'wrap' }}>
        <Pill label={`Projeções (${projecoes.length})`} active={aba === 'projecoes'} onClick={() => setAba('projecoes')} />
        <Pill label={`A pagar (${aPagar.length})`} active={aba === 'a_pagar'} onClick={() => setAba('a_pagar')} />
        <Pill label={`Histórico (${historico.length})`} active={aba === 'historico'} onClick={() => setAba('historico')} />
        {aba === 'a_pagar' && sextas.length > 0 && (
          <div style={{ marginLeft: 'auto', minWidth: 260 }}>
            <Sel
              label=""
              value={filtroSexta}
              onChange={setFiltroSexta}
              placeholder={`Todas as sextas (${sextas.length})`}
              options={sextas.map((s) => ({ v: s, l: fmtDataBR(s) }))}
              style={{ marginBottom: 0 }}
            />
          </div>
        )}
      </div>

      {Object.keys(grupos).length === 0 ? (
        <Card><Empty msg="Nenhuma comissão nesta aba" /></Card>
      ) : Object.entries(grupos).map(([sexta, porPrest]) => {
        const todasDoGrupo = Object.values(porPrest).flat()
        const totalGrupo = todasDoGrupo.reduce((s, c) => s + +c.valor, 0)
        const atrasada = sexta !== 'Sem sexta' && sexta !== '—' && new Date(sexta) < new Date(today()) && aba === 'a_pagar'
        const proxima = sexta === proxSexta && aba === 'a_pagar'

        return (
          <Card key={sexta} style={{
            marginBottom: 16,
            border: `1px solid ${atrasada ? '#F5C4B6' : proxima ? TEAL : BDR}`,
            padding: 0,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 22px', borderBottom: `1px solid ${BDR}`,
              background: atrasada ? '#FEF6F2' : proxima ? '#F5FBF7' : WHITE,
              borderTopLeftRadius: 16, borderTopRightRadius: 16,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: TXT, display: 'flex', alignItems: 'center', gap: 10 }}>
                  📅 {sexta === 'Sem sexta' ? 'Aguardando recebimento' :
                       sexta === '—' ? 'Sem data' :
                       `Pagar em: ${fmtDataExtenso(sexta)}`}
                  {atrasada && <Badge color="yellow">Atrasado</Badge>}
                  {proxima && <Badge color="teal">Próxima sexta</Badge>}
                </div>
                <div style={{ fontSize: 12, color: SUB, marginTop: 4 }}>
                  {todasDoGrupo.length} comissão{todasDoGrupo.length !== 1 ? 'ões' : ''} ·
                  {' '}{Object.keys(porPrest).length} profissional{Object.keys(porPrest).length !== 1 ? 'is' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  background: '#FAEEDA', color: WARN, padding: '10px 18px', borderRadius: 12,
                  fontWeight: 600, fontSize: 16, minWidth: 140, textAlign: 'right',
                }}>
                  <div style={{ fontSize: 10, color: SUB, textTransform: 'uppercase', letterSpacing: '.06em' }}>Total</div>
                  {fmtR(totalGrupo)}
                </div>
                {aba === 'a_pagar' && (
                  <Btn variant="outline" onClick={() => handlePagarTodos(todasDoGrupo)}>
                    ✓ Pagar todos
                  </Btn>
                )}
              </div>
            </div>

            {Object.entries(porPrest).map(([pid, lista]) => {
              const p = prestadores.find((x) => x.id === pid)
              const total = lista.reduce((s, c) => s + +c.valor, 0)
              return (
                <div key={pid} style={{ padding: '16px 22px', borderTop: `1px solid ${BDR}` }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Badge color={p?.tipo === 'psicologo' ? 'blue' : 'yellow'}>
                        {p?.tipo === 'psicologo' ? 'Psicólogo(a)' : 'AT'}
                      </Badge>
                      <span style={{ fontWeight: 600, color: TXT }}>{p?.nome || 'Sem prestador'}</span>
                      <span style={{ color: SUB, fontSize: 12 }}>
                        {p?.tipo === 'psicologo' ? `${p?.com}%` : `${fmtR(p?.com)}/h`}
                      </span>
                    </div>
                    <div style={{ color: WARN, fontWeight: 600 }}>{fmtR(total)}</div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 130px 130px 130px',
                    fontSize: 11, color: SUB, textTransform: 'uppercase', letterSpacing: '.05em',
                    padding: '8px 0', borderBottom: `1px solid ${BDR}`,
                  }}>
                    <div>Recebimento</div>
                    <div>Descrição atendimento</div>
                    <div style={{ textAlign: 'right' }}>Valor recebido</div>
                    <div style={{ textAlign: 'right' }}>Comissão</div>
                    <div style={{ textAlign: 'center' }}>Ação</div>
                  </div>

                  {lista.map((c) => {
                    const r = receitasMap[c.ref_lanc_id]
                    return (
                      <div key={c.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 1fr 130px 130px 130px',
                        fontSize: 13, color: TXT,
                        padding: '12px 0', borderBottom: `1px solid ${BDR}`,
                        alignItems: 'center',
                      }}>
                        <div>{fmtDataBR(r?.data_pagamento || r?.data || c.data)}</div>
                        <div>{r?.descricao || c.descricao}</div>
                        <div style={{ textAlign: 'right' }}>{r ? fmtR(r.valor) : '—'}</div>
                        <div style={{ textAlign: 'right', color: WARN, fontWeight: 500 }}>
                          {fmtR(c.valor)}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          {aba === 'a_pagar' && (
                            <Btn sm variant="outline" onClick={() => handlePagar(c)}>✓ Pagar</Btn>
                          )}
                          {aba === 'historico' && (
                            <Btn sm variant="ghost" onClick={() => handleEstornar(c)}>Estornar</Btn>
                          )}
                          {aba === 'projecoes' && (
                            <span style={{ color: SUB, fontSize: 11 }}>Aguardando baixa</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </Card>
        )
      })}
    </div>
  )
}
