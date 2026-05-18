'use client'
import ModuloStub from '../_stub/ModuloStub.jsx'

export default function DRE() {
  return (
    <ModuloStub
      titulo="DRE"
      descricao="Demonstração do Resultado do Exercício · agrupado por data_competencia"
      todo={[
        'Tabela multi-coluna por mês (período global)',
        'Receita bruta por plano de contas',
        'Deduções: impostos LP, comissões, taxas',
        'Receita líquida + margem %',
        'Despesas operacionais por conta',
        'Resultado líquido + margem %',
      ]}
    />
  )
}
