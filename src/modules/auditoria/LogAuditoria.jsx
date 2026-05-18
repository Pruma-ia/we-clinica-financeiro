import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Empty from '../../components/ui/Empty.jsx'
import { TXT, SUB, BDR } from '../../constants/colors.js'

export default function LogAuditoria() {
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setLista(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: 32 }}>
      <PageHeader title="Log de auditoria" sub={`${lista.length} registros`} />
      <Card style={{ padding: 0 }}>
        {loading ? <Empty msg="Carregando…" /> :
         lista.length === 0 ? <Empty msg="Nenhum registro" /> :
         lista.map((r) => (
          <div key={r.id} style={{
            display: 'grid',
            gridTemplateColumns: '180px 16px 1fr 100px 130px 1fr',
            padding: '12px 22px', borderBottom: `1px solid ${BDR}`,
            fontSize: 13, alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: SUB, fontFamily: 'monospace', fontSize: 12 }}>
              {new Date(r.created_at).toLocaleString('pt-BR')}
            </span>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#1D9E75' }} />
            <Badge color="blue">{r.user_nome || r.user_email}</Badge>
            <span style={{ color: SUB }}>{r.acao}</span>
            <strong style={{ color: TXT }}>{r.entidade}</strong>
            <span style={{ color: SUB, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {r.detalhes ? `· ${r.detalhes}` : ''}
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
