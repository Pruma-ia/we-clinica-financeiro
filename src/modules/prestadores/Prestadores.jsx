'use client'
import { useState, useMemo } from 'react'
import { usePrestadores } from '../../hooks/usePrestadores.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Drawer from '../../components/ui/Drawer.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { Inp, Sel, TxA } from '../../components/ui/Field.jsx'
import { fmtR } from '../../utils/formatters.js'
import { TXT, SUB, BDR, OK } from '../../constants/colors.js'

export default function Prestadores() {
  const { perfil } = useAuth()
  const { data, loading, create, update, remove } = usePrestadores()
  const [busca, setBusca] = useState('')
  const [drawer, setDrawer] = useState(null)

  const lista = useMemo(
    () => data.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [data, busca]
  )

  const novo = () => setDrawer({ nome: '', tipo: 'psicologo', com: 60, obs: '', ativo: true })
  const editar = (p) => setDrawer({ ...p })

  const salvar = async () => {
    if (!drawer.nome) return alert('Nome obrigatório.')
    const payload = {
      nome: drawer.nome.trim(),
      tipo: drawer.tipo,
      com: +drawer.com || 0,
      obs: drawer.obs || null,
      ativo: !!drawer.ativo,
    }
    try {
      if (drawer.id) {
        await update(drawer.id, payload)
        await logAcao(perfil, 'Editar', 'Prestador', payload.nome)
      } else {
        await create(payload)
        await logAcao(perfil, 'Criar', 'Prestador', payload.nome)
      }
      setDrawer(null)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  const excluir = async (p) => {
    if (!confirm(`Excluir prestador "${p.nome}"?`)) return
    try {
      await remove(p.id)
      await logAcao(perfil, 'Excluir', 'Prestador', p.nome)
    } catch (e) { alert(e?.message || 'Falha') }
  }

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Prestadores de serviço"
        sub="Psicólogos e ATs — comissão configurável individualmente"
        actions={<Btn onClick={novo}>+ Novo prestador</Btn>}
      />

      <Inp
        placeholder="Buscar profissional…"
        value={busca}
        onChange={setBusca}
        style={{ marginBottom: 18, maxWidth: 480 }}
      />

      <Card style={{ padding: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr',
          padding: '14px 22px', borderBottom: `1px solid ${BDR}`,
          fontSize: 11, color: SUB, textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
          <div>Nome</div><div>Tipo</div><div>Comissão</div><div>Observações</div><div>Ações</div>
        </div>
        {loading ? <Empty msg="Carregando…" /> :
         lista.length === 0 ? <Empty msg="Nenhum prestador cadastrado" /> :
         lista.map((p) => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr',
            padding: '16px 22px', borderBottom: `1px solid ${BDR}`,
            alignItems: 'center', fontSize: 14,
          }}>
            <div style={{ fontWeight: 500, color: TXT }}>{p.nome}</div>
            <div>
              <Badge color={p.tipo === 'psicologo' ? 'blue' : 'yellow'}>
                {p.tipo === 'psicologo' ? 'Psicólogo(a)' : 'AT (estagiário/a)'}
              </Badge>
            </div>
            <div style={{ color: OK, fontWeight: 600 }}>
              {p.tipo === 'psicologo' ? `${p.com}% por sessão` : `${fmtR(p.com)} por hora`}
            </div>
            <div style={{ color: SUB, fontSize: 13 }}>{p.obs || '—'}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn sm variant="ghost" onClick={() => editar(p)}>Editar</Btn>
              <Btn sm variant="danger" onClick={() => excluir(p)}>Excluir</Btn>
            </div>
          </div>
        ))}
      </Card>

      <Drawer open={!!drawer} onClose={() => setDrawer(null)}
              title={drawer?.id ? 'Editar prestador' : 'Novo prestador'}>
        {drawer && (
          <>
            <Inp label="Nome" required value={drawer.nome}
                 onChange={(v) => setDrawer({ ...drawer, nome: v })} />
            <Sel label="Tipo" value={drawer.tipo}
                 onChange={(v) => setDrawer({ ...drawer, tipo: v })}
                 options={[
                   { v: 'psicologo', l: 'Psicólogo(a) — % por sessão' },
                   { v: 'at',        l: 'AT (estagiário/a) — R$ por hora' },
                 ]} />
            <Inp
              label={drawer.tipo === 'psicologo' ? 'Comissão (%)' : 'Valor por hora (R$)'}
              type="number" min="0" step="0.01"
              value={drawer.com}
              onChange={(v) => setDrawer({ ...drawer, com: v })}
              hint={drawer.tipo === 'psicologo' ? 'Ex: 60 = 60% do valor da sessão' : 'Ex: 30 = R$ 30,00 por hora'}
            />
            <TxA label="Observações" value={drawer.obs}
                 onChange={(v) => setDrawer({ ...drawer, obs: v })}
                 hint="Regras contratuais especiais, validade, etc." />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: TXT, marginBottom: 18 }}>
              <input type="checkbox" checked={!!drawer.ativo}
                     onChange={(e) => setDrawer({ ...drawer, ativo: e.target.checked })} />
              Prestador ativo
            </label>
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
