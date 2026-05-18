import { useState, useMemo } from 'react'
import { useLancamentos } from '../../hooks/useLancamentos.js'
import { usePrestadores } from '../../hooks/usePrestadores.js'
import { useClientes } from '../../hooks/useClientes.js'
import { usePlano } from '../../hooks/usePlano.js'
import { usePremissas } from '../../hooks/usePremissas.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'

import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Pill from '../../components/ui/Pill.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Drawer from '../../components/ui/Drawer.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { Inp, Sel, TxA } from '../../components/ui/Field.jsx'
import MargemComposicao from '../../components/shared/MargemComposicao.jsx'

import { fmtR, fmtDataBR, today } from '../../utils/formatters.js'
import { calcM } from '../../utils/calcComissao.js'
import { isAtrasado } from '../../utils/datas.js'
import { FORMAS_OPTS, FORMAS_L } from '../../constants/formas.js'
import { OK, RED, WARN, SUB, BDR, TXT, WHITE, TEAL } from '../../constants/colors.js'

const novoLancVazio = (tipo = 'receita') => ({
  tipo,
  descricao: '',
  valor: '',
  data_competencia: today(),
  data_vencimento: today(),
  data_pagamento: '',
  conta_id: '',
  cliente_id: '',
  prestador_id: '',
  forma_pagamento: 'pix',
  status: 'pendente',
  horas: 0,
  obs: '',
})

const statusOpts = [
  { v: 'pendente',   l: 'Pendente' },
  { v: 'recebido',   l: 'Recebido' },
  { v: 'pago',       l: 'Pago' },
  { v: 'cancelado',  l: 'Cancelado' },
]

export default function Lancamentos() {
  const { perfil } = useAuth()
  const { data: lancs, create, update, remove } = useLancamentos()
  const { data: prestadores } = usePrestadores()
  const { data: clientes } = useClientes()
  const { data: plano } = usePlano()
  const { data: premissas } = usePremissas()

  const [filtroTipo, setFiltroTipo] = useState('todos')   // todos | receita | despesa
  const [filtroMes, setFiltroMes] = useState(today().slice(0, 7))
  const [todosMeses, setTodosMeses] = useState(false)
  const [drawer, setDrawer] = useState(null)

  const visiveis = useMemo(() => {
    let out = lancs
    if (filtroTipo !== 'todos') out = out.filter((l) => l.tipo === filtroTipo)
    if (!todosMeses && filtroMes) {
      out = out.filter((l) => (l.data_competencia || l.data || '').slice(0, 7) === filtroMes)
    }
    return out
  }, [lancs, filtroTipo, filtroMes, todosMeses])

  const abrirNovo = () => setDrawer(novoLancVazio('receita'))
  const abrirEditar = (l) => setDrawer({ ...l })

  const salvar = async () => {
    if (!drawer.valor || !drawer.descricao) return alert('Descrição e valor são obrigatórios.')
    const payload = {
      tipo: drawer.tipo,
      descricao: drawer.descricao.trim(),
      valor: +drawer.valor || 0,
      data: drawer.data_vencimento || drawer.data_competencia || today(),
      data_competencia: drawer.data_competencia || null,
      data_vencimento: drawer.data_vencimento || null,
      data_pagamento: drawer.data_pagamento || null,
      conta_id: drawer.conta_id || null,
      cliente_id: drawer.cliente_id || null,
      prestador_id: drawer.tipo === 'receita' ? (drawer.prestador_id || null) : null,
      forma_pagamento: drawer.forma_pagamento || null,
      status: drawer.data_pagamento && drawer.status === 'pendente'
        ? (drawer.tipo === 'receita' ? 'recebido' : 'pago')
        : drawer.status,
      horas: +drawer.horas || 0,
      obs: drawer.obs || null,
      created_by: perfil?.email || null,
    }
    try {
      if (drawer.id) {
        await update(drawer.id, payload, { prestadores })
        await logAcao(perfil, 'Editar', 'Lançamento', payload.descricao)
      } else {
        await create(payload, { prestadores })
        await logAcao(perfil, 'Criar', 'Lançamento', payload.descricao)
      }
      setDrawer(null)
    } catch (e) {
      alert(e?.message || 'Falha ao salvar')
    }
  }

  const excluir = async (l) => {
    if (!confirm(`Excluir lançamento "${l.descricao}"? Comissão vinculada também será removida.`)) return
    try {
      await remove(l.id)
      await logAcao(perfil, 'Excluir', 'Lançamento', l.descricao)
    } catch (e) {
      alert(e?.message || 'Falha ao excluir')
    }
  }

  const baixar = async (l) => {
    const d = prompt('Data de pagamento (YYYY-MM-DD):', today())
    if (!d) return
    try {
      const payload = {
        status: l.tipo === 'receita' ? 'recebido' : 'pago',
        data_pagamento: d,
      }
      await update(l.id, payload, { prestadores })
      await logAcao(perfil, 'Baixar', 'Lançamento', `${l.descricao} em ${d}`)
    } catch (e) {
      alert(e?.message || 'Falha ao baixar')
    }
  }

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Lançamentos"
        sub="Receitas e despesas"
        actions={<Btn onClick={abrirNovo}>+ Novo lançamento</Btn>}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <Pill label="Todos" active={filtroTipo === 'todos'} onClick={() => setFiltroTipo('todos')} />
        <Pill label="Receitas" active={filtroTipo === 'receita'} onClick={() => setFiltroTipo('receita')} />
        <Pill label="Despesas" active={filtroTipo === 'despesa'} onClick={() => setFiltroTipo('despesa')} />
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="month"
            value={filtroMes}
            onChange={(e) => { setFiltroMes(e.target.value); setTodosMeses(false) }}
            style={{
              padding: '8px 12px', border: `1px solid ${BDR}`,
              borderRadius: 8, fontSize: 13, background: WHITE,
            }}
          />
          <Pill label="Todos os meses" active={todosMeses} onClick={() => setTodosMeses(!todosMeses)} />
        </div>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
            <thead>
              <tr style={{ background: WHITE, borderBottom: `1px solid ${BDR}` }}>
                <Th>Competência</Th>
                <Th>Vencimento</Th>
                <Th>Pgto</Th>
                <Th>Descrição</Th>
                <Th>Profissional</Th>
                <Th>Forma</Th>
                <Th align="right">Valor</Th>
                <Th align="right">Comissão</Th>
                <Th align="right">Margem</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {visiveis.length === 0 ? (
                <tr><td colSpan={11}><Empty msg="Nenhum lançamento no período" /></td></tr>
              ) : visiveis.map((l) => {
                const prest = prestadores.find((p) => p.id === l.prestador_id)
                const { com, marg } = calcM(l, prestadores, premissas)
                const atrasado = isAtrasado(l.data_vencimento, l.status)
                const recebido = l.status === 'recebido' || l.status === 'pago'
                return (
                  <tr key={l.id} style={{
                    borderBottom: `1px solid ${BDR}`,
                    background: atrasado ? '#FEF6F2' : WHITE,
                  }}>
                    <Td>{fmtDataBR(l.data_competencia)}</Td>
                    <Td>
                      <span style={{ color: atrasado ? RED : TXT, fontWeight: atrasado ? 600 : 400 }}>
                        {fmtDataBR(l.data_vencimento)}{atrasado && ' ●'}
                      </span>
                    </Td>
                    <Td>
                      <span style={{ color: recebido ? OK : SUB }}>{fmtDataBR(l.data_pagamento)}</span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{l.descricao}</span>
                        {l.auto_comissao && <Badge color="teal">AUTO</Badge>}
                      </div>
                      {l.cliente_id && (
                        <div style={{ fontSize: 11, color: SUB }}>
                          {clientes.find((c) => c.id === l.cliente_id)?.nome || ''}
                        </div>
                      )}
                    </Td>
                    <Td>{prest?.nome || '—'}</Td>
                    <Td>{FORMAS_L[l.forma_pagamento] || '—'}</Td>
                    <Td align="right" style={{ color: l.tipo === 'receita' ? OK : RED, fontWeight: 500 }}>
                      {l.tipo === 'receita' ? '+' : '−'}{fmtR(l.valor)}
                    </Td>
                    <Td align="right" style={{ color: com ? WARN : SUB }}>
                      {com ? fmtR(com) : '—'}
                    </Td>
                    <Td align="right" style={{ color: marg >= 0 ? OK : RED }}>
                      {l.tipo === 'receita' ? fmtR(marg) : '—'}
                    </Td>
                    <Td>
                      <StatusBadge s={l.status} />
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {!recebido && l.status !== 'cancelado' && (
                          <Btn sm variant="outline" onClick={() => baixar(l)}>Baixar</Btn>
                        )}
                        <Btn sm variant="ghost" onClick={() => abrirEditar(l)}>Editar</Btn>
                        <Btn sm variant="danger" onClick={() => excluir(l)}>×</Btn>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Drawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer?.id ? 'Editar lançamento' : 'Novo lançamento'}
        width={560}
      >
        {drawer && (
          <FormLancamento
            v={drawer}
            setV={setDrawer}
            plano={plano}
            clientes={clientes}
            prestadores={prestadores}
            premissas={premissas}
            onSalvar={salvar}
          />
        )}
      </Drawer>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th style={{
      textAlign: align, fontSize: 11, color: SUB,
      textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 500,
      padding: '14px 18px', whiteSpace: 'nowrap',
    }}>{children}</th>
  )
}

function Td({ children, align = 'left', style = {} }) {
  return (
    <td style={{
      padding: '14px 18px', fontSize: 13, color: TXT,
      textAlign: align, verticalAlign: 'top',
      ...style,
    }}>{children}</td>
  )
}

function StatusBadge({ s }) {
  const map = {
    pendente:  { c: 'yellow', l: 'pendente' },
    recebido:  { c: 'green',  l: 'recebido' },
    pago:      { c: 'green',  l: 'pago' },
    cancelado: { c: 'gray',   l: 'cancelado' },
    projecao:  { c: 'blue',   l: 'projeção' },
  }
  const it = map[s] || { c: 'gray', l: s }
  return <Badge color={it.c}>{it.l}</Badge>
}

function FormLancamento({ v, setV, plano, clientes, prestadores, premissas, onSalvar }) {
  const set = (k, val) => setV({ ...v, [k]: val })
  const isReceita = v.tipo === 'receita'
  const planoOpts = plano
    .filter((c) => c.tipo === v.tipo)
    .map((c) => ({ v: c.id, l: `${c.cod} — ${c.nome}` }))
  const prestOpts = prestadores.map((p) => ({
    v: p.id,
    l: `${p.nome} · ${p.tipo === 'psicologo' ? `${p.com}%` : fmtR(p.com) + '/h'}`,
  }))
  const clienteOpts = clientes.map((c) => ({ v: c.id, l: c.nome }))
  const prest = prestadores.find((p) => p.id === v.prestador_id)
  const mostrarHoras = isReceita && prest?.tipo === 'at'

  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Pill label="Receita" active={isReceita} onClick={() => set('tipo', 'receita')} />
        <Pill label="Despesa" active={!isReceita} onClick={() => set('tipo', 'despesa')} />
      </div>

      <Inp label="Descrição" value={v.descricao} onChange={(x) => set('descricao', x)} required />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Inp label="Valor (R$)" type="number" min="0" step="0.01"
             value={v.valor} onChange={(x) => set('valor', x)} required />
        <Sel label="Forma de pagamento" value={v.forma_pagamento}
             onChange={(x) => set('forma_pagamento', x)}
             options={FORMAS_OPTS} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <Inp label="Competência" type="date"
             value={v.data_competencia} onChange={(x) => set('data_competencia', x)} />
        <Inp label="Vencimento" type="date"
             value={v.data_vencimento} onChange={(x) => set('data_vencimento', x)} />
        <Inp label="Pago em" type="date"
             value={v.data_pagamento} onChange={(x) => set('data_pagamento', x)}
             hint="Preencher → status muda" />
      </div>

      <Sel label="Plano de contas" value={v.conta_id}
           onChange={(x) => set('conta_id', x)} options={planoOpts} />

      {isReceita && (
        <>
          <Sel label="Cliente (paciente)" value={v.cliente_id}
               onChange={(x) => set('cliente_id', x)} options={clienteOpts} />
          <Sel label="Profissional responsável" value={v.prestador_id}
               onChange={(x) => set('prestador_id', x)} options={prestOpts}
               hint="Selecione para calcular comissão e margem automaticamente" />
          {mostrarHoras && (
            <Inp label="Horas atendidas" type="number" min="0" step="0.5"
                 value={v.horas} onChange={(x) => set('horas', x)} required
                 hint={`Comissão = ${fmtR(prest.com)}/h × horas`} />
          )}
        </>
      )}

      <MargemComposicao lanc={v} prestadores={prestadores} premissas={premissas} />

      <Sel label="Status" value={v.status} onChange={(x) => set('status', x)} options={statusOpts} />
      <TxA label="Observações" value={v.obs} onChange={(x) => set('obs', x)} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <Btn onClick={onSalvar} style={{ background: TEAL, color: WHITE, width: '100%' }}>
          {v.id ? 'Salvar alterações' : 'Registrar lançamento'}
        </Btn>
      </div>
    </>
  )
}
