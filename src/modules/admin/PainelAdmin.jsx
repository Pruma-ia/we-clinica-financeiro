'use client'
import { useState, useEffect, useCallback } from 'react'
import { dbListUsuarios, dbInsertUsuario, dbUpdateUsuario, dbDeleteUsuario } from '../../app/actions/db.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { logAcao } from '../../lib/audit.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Btn from '../../components/ui/Btn.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Drawer from '../../components/ui/Drawer.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { Inp, Sel } from '../../components/ui/Field.jsx'
import { TXT, SUB, BDR, RED } from '../../constants/colors.js'

export default function PainelAdmin() {
  const { perfil } = useAuth()
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dbListUsuarios()
      setLista(data || [])
    } catch (e) {
      console.error('[admin]', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const novo = () => setDrawer({ email: '', nome: '', role: 'operacional', ativo: true })
  const editar = (u) => setDrawer({ ...u })

  const salvar = async () => {
    if (!drawer.email || !drawer.nome) return alert('Email e nome são obrigatórios.')
    const payload = {
      email: drawer.email.trim().toLowerCase(),
      nome: drawer.nome.trim(),
      role: drawer.role,
      ativo: !!drawer.ativo,
    }
    try {
      if (drawer.id) {
        await dbUpdateUsuario(drawer.id, payload)
        await logAcao(perfil, 'Editar', 'Usuário permitido', payload.email)
      } else {
        await dbInsertUsuario(payload)
        await logAcao(perfil, 'Criar', 'Usuário permitido', payload.email)
      }
    } catch (e) {
      return alert(e.message)
    }
    setDrawer(null)
    await fetchAll()
  }

  const toggleAtivo = async (u) => {
    try {
      await dbUpdateUsuario(u.id, { ativo: !u.ativo })
      await logAcao(perfil, u.ativo ? 'Desativar' : 'Ativar', 'Usuário permitido', u.email)
    } catch (e) {
      return alert(e.message)
    }
    await fetchAll()
  }

  const excluir = async (u) => {
    if (u.email === perfil?.email) return alert('Você não pode remover a si mesmo.')
    if (!confirm(`Remover ${u.email} dos usuários autorizados?`)) return
    try {
      await dbDeleteUsuario(u.id)
      await logAcao(perfil, 'Excluir', 'Usuário permitido', u.email)
    } catch (e) {
      return alert(e.message)
    }
    await fetchAll()
  }

  return (
    <div style={{ padding: 32 }}>
      <PageHeader
        title="Painel Administrativo"
        sub="Controle de usuários autorizados a acessar o sistema"
        actions={<Btn onClick={novo}>+ Novo usuário</Btn>}
      />

      <Card style={{ padding: 0 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
          padding: '14px 22px', borderBottom: `1px solid ${BDR}`,
          fontSize: 11, color: SUB, textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
          <div>Email</div><div>Nome</div><div>Role</div><div>Status</div><div>Ações</div>
        </div>
        {loading ? <Empty msg="Carregando…" /> :
         lista.length === 0 ? <Empty msg="Nenhum usuário cadastrado" /> :
         lista.map((u) => (
          <div key={u.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
            padding: '14px 22px', borderBottom: `1px solid ${BDR}`,
            alignItems: 'center', fontSize: 14,
          }}>
            <div style={{ color: TXT, overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
            <div style={{ color: TXT }}>{u.nome}</div>
            <div>
              <Badge color={u.role === 'admin' ? 'teal' : 'gray'}>{u.role}</Badge>
            </div>
            <div>
              <Badge color={u.ativo ? 'green' : 'red'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Btn sm variant="ghost" onClick={() => editar(u)}>Editar</Btn>
              <Btn sm variant="ghost" onClick={() => toggleAtivo(u)}>
                {u.ativo ? 'Desativar' : 'Ativar'}
              </Btn>
              <Btn sm variant="danger" onClick={() => excluir(u)}>Excluir</Btn>
            </div>
          </div>
        ))}
      </Card>

      <Drawer
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawer?.id ? 'Editar usuário' : 'Novo usuário autorizado'}
      >
        <Inp
          label="Email Google"
          value={drawer?.email}
          onChange={(v) => setDrawer({ ...drawer, email: v })}
          placeholder="usuario@dominio.com"
          required
          hint="Precisa ser exatamente o email da conta Google que fará login."
        />
        <Inp
          label="Nome"
          value={drawer?.nome}
          onChange={(v) => setDrawer({ ...drawer, nome: v })}
          required
        />
        <Sel
          label="Permissão"
          value={drawer?.role}
          onChange={(v) => setDrawer({ ...drawer, role: v })}
          options={[
            { v: 'operacional', l: 'Operacional (sem painel admin)' },
            { v: 'admin', l: 'Admin (acesso total)' },
          ]}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: TXT, marginBottom: 18 }}>
          <input
            type="checkbox"
            checked={!!drawer?.ativo}
            onChange={(e) => setDrawer({ ...drawer, ativo: e.target.checked })}
          />
          Usuário ativo
        </label>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={() => setDrawer(null)}>Cancelar</Btn>
          <Btn onClick={salvar}>Salvar</Btn>
        </div>
        {drawer?.id && (
          <div style={{ marginTop: 24, fontSize: 11, color: SUB }}>
            ID: {drawer.id}
          </div>
        )}
      </Drawer>
    </div>
  )
}
