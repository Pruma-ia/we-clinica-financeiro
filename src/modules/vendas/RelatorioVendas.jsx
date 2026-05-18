import ModuloStub from '../_stub/ModuloStub.jsx'

export default function RelatorioVendas() {
  return (
    <ModuloStub
      titulo="Relatório de vendas"
      descricao="Receita, custo e margem por tipo de serviço"
      todo={[
        'Filtros: Este mês / Trimestre / Ano / Todo',
        'KPIs: receita, margem, atendimentos, ticket médio',
        'Tabela por serviço com barra de participação',
        'Tabela por profissional',
      ]}
    />
  )
}
