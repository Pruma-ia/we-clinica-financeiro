import { useState } from 'react'
import { usePlano } from '../../hooks/usePlano.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Drawer from '../../components/ui/Drawer.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { Inp, Sel } from '../../components/ui/Field.jsx'
import { TEAL, RED, SUB, BDR, TXT } from '../../constants/colors.js'

export default function PlanoContas() {
  const { perfil } = useAuth()
  const { data, loading, create, remove } = usePlano()
  const [drawer, setDrawer] = useState(null)

  const receitas = data.filter((c) => c.tipo === 'receita')
  const despesas = data.filter((c) => c.tipo === 'despesa')

  const novo = () => setDrawer({ cod: '', nome: '', tipo: 'receita', cat: '' })

  const salvar = async () => {
    if (!drawer.cod || !drawer.nome) return alert('Código e nome obrigatórios.')
    try {
      await create({
        cod: drawer.cod.trim(),
        nome: drawer.nome.trim(),
        tipo: drawer.tipo,
        cat: drawer.cat?.trim() || null,
      })
      await logAcao(perfil, 'Criar', 'Plano de contas', `${drawer.cod} — ${drawer.nome}`)
      setDrawer(null)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  const excluir = async (c) => {
    if (!confirm(`Excluir conta "${c.cod} — ${c.nome}"?`)) return
    try {
      await remove(c.id)
      await logAcao(perfil, 'Excluir', 'Plano de contas', `${c.cod} — ${c.nome}`)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  if (loading) return <div style={{ padding: 32 }}><Empty msg="Carregando…" /></div>

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Plano de contas"
        sub="Categorias de receitas e despesas"
        actions={<Btn onClick={novo}>+ Nova conta</Btn>}
      />

      <Card>
        <Secao titulo="RECEITAS" cor={TEAL} contas={receitas} onExcluir={excluir} />
        <div style={{ height: 14 }} />
        <Secao titulo="DESPESAS" cor={RED} contas={despesas} onExcluir={excluir} />
      </Card>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)} title="Nova conta">
        {drawer && (
          <>
            <Inp label="Código" required placeholder="ex: 1.5"
                 value={drawer.cod} onChange={(v) => setDrawer({ ...drawer, cod: v })} />
            <Inp label="Nome" required value={drawer.nome}
                 onChange={(v) => setDrawer({ ...drawer, nome: v })} />
            <Sel label="Tipo" value={drawer.tipo}
                 onChange={(v) => setDrawer({ ...drawer, tipo: v })}
                 options={[
                   { v: 'receita', l: 'Receita' },
                   { v: 'despesa', l: 'Despesa' },
                 ]} />
            <Inp label="Categoria"
                 value={drawer.cat}
                 onChange={(v) => setDrawer({ ...drawer, cat: v })}
                 hint="ex: Atendimento, Operacional, Pessoal…" />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Btn variant="ghost" onClick={() => setDrawer(null)}>Cancelar</Btn>
              <Btn onClick={salvar}>Salvar</Btn>
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}

function Secao({ titulo, cor, contas, onExcluir }) {
  return (
    <div>
      <div style={{
        color: cor, fontWeight: 600, fontSize: 13, letterSpacing: '.06em',
        textTransform: 'uppercase', borderBottom: `1px solid ${BDR}`,
        paddingBottom: 8, marginBottom: 8,
      }}>{titulo}</div>
      {contas.length === 0 && <Empty msg="Nenhuma conta" />}
      {contas.map((c) => (
        <div key={c.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 0', borderBottom: `1px solid ${BDR}`,
        }}>
          <span style={{ width: 50, color: SUB, fontFamily: 'monospace', fontSize: 12 }}>{c.cod}</span>
          <span style={{ flex: 1, color: TXT, fontSize: 14 }}>{c.nome}</span>
          {c.cat && <Badge color={c.tipo === 'receita' ? 'green' : 'red'}>{c.cat}</Badge>}
          <Btn sm variant="danger" onClick={() => onExcluir(c)}>×</Btn>
        </div>
      ))}
    </div>
  )
}
