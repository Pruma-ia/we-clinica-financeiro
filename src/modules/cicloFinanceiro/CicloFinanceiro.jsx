import ModuloStub from '../_stub/ModuloStub.jsx'

export default function CicloFinanceiro() {
  return (
    <ModuloStub
      titulo="Ciclo financeiro"
      descricao="Aging de recebíveis e performance de cobrança"
      todo={[
        'Aging 6 faixas: hoje / 1-15 / 16-30 / atraso 1-30 / 31-60 / +60',
        'Taxa de pendência',
        'Recebimentos por forma de pagamento',
        'Conversão mensal (faturado → recebido)',
      ]}
    />
  )
}
