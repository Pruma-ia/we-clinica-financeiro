import ModuloStub from '../_stub/ModuloStub.jsx'

export default function FluxoCaixa() {
  return (
    <ModuloStub
      titulo="Fluxo de caixa"
      descricao="DFC — base caixa (data_pagamento)"
      todo={[
        'Tabela multi-coluna por mês',
        'Entradas operacionais (recebido)',
        'Saídas operacionais (pago)',
        'Saldo Inicial → Geração → Saldo Final acumulado',
        'Gráfico SVG de evolução do saldo',
      ]}
    />
  )
}
