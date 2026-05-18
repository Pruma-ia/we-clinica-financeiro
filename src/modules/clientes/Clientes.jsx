import { useState, useMemo } from 'react'
import { useClientes } from '../../hooks/useClientes.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Drawer from '../../components/ui/Drawer.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { Inp, TxA } from '../../components/ui/Field.jsx'
import { TXT, SUB, BDR } from '../../constants/colors.js'

export default function Clientes() {
  const { perfil } = useAuth()
  const { data, loading, create, update, remove } = useClientes()
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(null)

  const lista = useMemo(() => data.filter((c) => {
    const q = busca.toLowerCase()
    return c.nome.toLowerCase().includes(q)
        || (c.responsavel || '').toLowerCase().includes(q)
  }), [data, busca])

  const novo = () => setDrawer({ nome: '', responsavel: '', telefone: '', email: '', obs: '' })
  const editar = (c) => setDrawer({ ...c })

  const salvar = async () => {
    if (!drawer.nome) return alert('Nome obrigatório.')
    const payload = {
      nome: drawer.nome.trim(),
      responsavel: drawer.responsavel?.trim() || null,
      telefone: drawer.telefone?.trim() || null,
      email: drawer.email?.trim() || null,
      obs: drawer.obs || null,
    }
    try {
      if (drawer.id) {
        await update(drawer.id, payload)
        await logAcao(perfil, 'Editar', 'Cliente', payload.nome)
      } else {
        await create(payload)
        await logAcao(perfil, 'Criar', 'Cliente', payload.nome)
      }
      setDrawer(null)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  const excluir = async (c) => {
    if (!confirm(`Excluir cliente "${c.nome}"?`)) return
    try {
      await remove(c.id)
      await logAcao(perfil, 'Excluir', 'Cliente', c.nome)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Clientes"
        sub="Pacientes e responsáveis"
        actions={<Btn onClick={novo}>+ Novo cliente</Btn>}
      />
      <Inp placeholder="Buscar paciente ou responsável…" value={busca} onChange={setBusca}
           style={{ marginBottom: 18, maxWidth: 480 }} />
      <Card style={{ padding: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 2fr 1fr',
          padding: '14px 22px', borderBottom: `1px solid ${BDR}`,
          fontSize: 11, color: SUB, textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
          <div>Paciente</div><div>Responsável</div><div>Telefone</div><div>Email</div><div>Ações</div>
        </div>
        {loading ? <Empty msg="Carregando…" /> :
         lista.length === 0 ? <Empty msg="Nenhum cliente cadastrado" /> :
         lista.map((c) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 2fr 1fr',
            padding: '16px 22px', borderBottom: `1px solid ${BDR}`, alignItems: 'center', fontSize: 14,
          }}>
            <div style={{ fontWeight: 500, color: TXT }}>{c.nome}</div>
            <div>{c.responsavel || '—'}</div>
            <div>{c.telefone || '—'}</div>
            <div>{c.email || '—'}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn sm variant="ghost" onClick={() => editar(c)}>Editar</Btn>
              <Btn sm variant="danger" onClick={() => excluir(c)}>Excluir</Btn>
            </div>
          </div>
        ))}
      </Card>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}
              title={drawer?.id ? 'Editar cliente' : 'Novo cliente'}>
        {drawer && (
          <>
            <Inp label="Nome do paciente" required value={drawer.nome}
                 onChange={(v) => setDrawer({ ...drawer, nome: v })} />
            <Inp label="Responsável" value={drawer.responsavel}
                 onChange={(v) => setDrawer({ ...drawer, responsavel: v })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Inp label="Telefone" value={drawer.telefone}
                   onChange={(v) => setDrawer({ ...drawer, telefone: v })} />
              <Inp label="Email" type="email" value={drawer.email}
                   onChange={(v) => setDrawer({ ...drawer, email: v })} />
            </div>
            <TxA label="Observações" value={drawer.obs}
                 onChange={(v) => setDrawer({ ...drawer, obs: v })} />
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
