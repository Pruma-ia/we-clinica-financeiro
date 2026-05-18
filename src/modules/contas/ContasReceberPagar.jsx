import ModuloStub from '../_stub/ModuloStub.jsx'

export default function ContasReceberPagar() {
  return (
    <ModuloStub
      titulo="Contas a receber / a pagar"
      descricao="Aging e baixa de títulos"
      todo={[
        'Abas A receber / A pagar com contadores',
        'KPIs: total, nº títulos, em atraso, ticket médio',
        'Destaque visual para títulos vencidos',
        'Botão "Baixar" em cada título',
      ]}
    />
  )
}
