'use client'
import { useState, useEffect } from 'react'
import { usePremissas } from '../../hooks/usePremissas.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { TEAL, RED, SUB, BDR, TXT, WHITE } from '../../constants/colors.js'

const TAXAS = [
  { k: 'pix',           l: 'PIX',                       hint: 'Geralmente isento' },
  { k: 'dinheiro',      l: 'Dinheiro' },
  { k: 'transferencia', l: 'Transferência bancária' },
  { k: 'debito',        l: 'Cartão débito' },
  { k: 'credito_vista', l: 'Cartão crédito à vista' },
  { k: 'credito_par',   l: 'Cartão crédito parcelado' },
  { k: 'boleto',        l: 'Boleto' },
]

export default function Premissas() {
  const { perfil } = useAuth()
  const { data, loading, upsertMany } = usePremissas()
  const [form, setForm] = useState({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => { setForm(data) }, [data])

  const set = (k, v) => setForm({ ...form, [k]: v })

  const salvar = async () => {
    setSalvando(true)
    try {
      await upsertMany(form)
      await logAcao(perfil, 'Editar', 'Premissas', JSON.stringify(form))
      alert('Premissas atualizadas.')
    } catch (e) { alert(e?.message || 'Falha') }
    finally { setSalvando(false) }
  }

  if (loading) return <div style={{ padding: 32 }}><Empty msg="Carregando…" /></div>

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Premissas"
        sub="Parâmetros globais — aplicados automaticamente em todos os lançamentos"
      />

      <Card style={{ marginBottom: 18 }}>
        <h3 style={{ margin: 0, color: TEAL, fontSize: 16 }}>Regime tributário — Lucro Presumido</h3>
        <p style={{ color: SUB, fontSize: 13, marginTop: 6 }}>
          Aplicado automaticamente sobre toda receita. Ajuste conforme orientação do contador.
        </p>
        <Linha
          label="Alíquota total de impostos"
          sub="ISS + PIS/COFINS + IRPJ/CSLL estimado"
          value={form.imposto ?? 0}
          onChange={(v) => set('imposto', v)}
        />
      </Card>

      <Card>
        <h3 style={{ margin: 0, color: TEAL, fontSize: 16 }}>Taxas por forma de pagamento</h3>
        <div style={{ marginTop: 14 }}>
          {TAXAS.map((t) => (
            <Linha
              key={t.k}
              label={t.l}
              sub={t.hint}
              value={form[t.k] ?? 0}
              onChange={(v) => set(t.k, v)}
            />
          ))}
        </div>
      </Card>

      <div style={{ marginTop: 20 }}>
        <Btn onClick={salvar} disabled={salvando} style={{ width: '100%' }}>
          {salvando ? 'Salvando…' : 'Salvar premissas'}
        </Btn>
      </div>
    </div>
  )
}

function Linha({ label, sub, value, onChange }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: `1px solid ${BDR}`, gap: 14,
    }}>
      <div>
        <div style={{ color: TXT, fontWeight: 500, fontSize: 14 }}>{label}</div>
        {sub && <div style={{ color: SUB, fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 96, padding: '10px 12px',
            border: `1px solid ${BDR}`, borderRadius: 8,
            background: WHITE, fontSize: 14, textAlign: 'right',
          }}
        />
        <span style={{ color: SUB, fontSize: 14 }}>%</span>
      </div>
    </div>
  )
}
