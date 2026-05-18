// Composição financeira de um lançamento de receita.
// Retorna { com, imp, taxa, marg }.
export const calcM = (lanc, prestadores = [], premissas = {}) => {
  const v = +(lanc?.valor || 0)
  if (!lanc || lanc.tipo !== 'receita') {
    return { com: 0, imp: 0, taxa: 0, marg: v }
  }
  const prest = prestadores.find((p) => p.id === lanc.prestador_id)
  const com = !prest
    ? 0
    : prest.tipo === 'psicologo'
      ? v * (+(prest.com || 0) / 100)
      : (+(lanc.horas || 0)) * (+(prest.com || 0))
  const imp = v * ((+(premissas.imposto || 0)) / 100)
  const taxa = lanc.forma_pagamento && premissas[lanc.forma_pagamento] != null
    ? v * ((+(premissas[lanc.forma_pagamento] || 0)) / 100)
    : 0
  return { com, imp, taxa, marg: v - imp - com - taxa }
}

// Cria payload de despesa-comissão derivada de uma receita.
export const buildComissaoLanc = (receita, prestador, sexta, contaComissaoId) => {
  if (!prestador) return null
  const v = +(receita.valor || 0)
  const valorCom = prestador.tipo === 'psicologo'
    ? v * (+(prestador.com || 0) / 100)
    : (+(receita.horas || 0)) * (+(prestador.com || 0))
  if (valorCom <= 0) return null
  return {
    tipo: 'despesa',
    descricao: `Comissão — ${prestador.nome}`,
    valor: valorCom,
    data: sexta || receita.data,
    data_competencia: receita.data_competencia || receita.data,
    data_vencimento: sexta || null,
    data_pagamento: null,
    conta_id: contaComissaoId || null,
    prestador_id: prestador.id,
    forma_pagamento: 'transferencia',
    status: receita.status === 'recebido' ? 'pendente' : 'projecao',
    sexta: sexta || null,
    auto_comissao: true,
    ref_lanc_id: receita.id || null,
  }
}
