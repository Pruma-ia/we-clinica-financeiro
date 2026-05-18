'use client'
import PageHeader from '../../components/layout/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import { TEAL, SUB, TEALL } from '../../constants/colors.js'

export default function ModuloStub({ titulo, descricao, todo = [] }) {
  return (
    <div style={{ padding: 32 }}>
      <PageHeader title={titulo} sub={descricao} />
      <Card>
        <div style={{
          padding: 16, borderRadius: 12, background: TEALL, color: TEAL,
          fontSize: 13, marginBottom: 16,
        }}>
          Módulo em desenvolvimento. Backend (tabela <code>lancamentos</code>) já está pronto —
          a UI deste módulo será conectada na próxima iteração.
        </div>
        {todo.length > 0 && (
          <>
            <div style={{
              fontSize: 11, color: SUB, textTransform: 'uppercase',
              letterSpacing: '.05em', marginBottom: 8,
            }}>Pendente</div>
            <ul style={{ color: SUB, fontSize: 14, lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
              {todo.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </>
        )}
      </Card>
    </div>
  )
}
