// Chaves devem casar com as chaves em premissas (tabela `premissas`).
export const FORMAS_OPTS = [
  { v: 'pix',            l: 'PIX' },
  { v: 'dinheiro',       l: 'Dinheiro' },
  { v: 'transferencia',  l: 'Transferência' },
  { v: 'debito',         l: 'Cartão débito' },
  { v: 'credito_vista',  l: 'Cartão crédito à vista' },
  { v: 'credito_par',    l: 'Cartão crédito parcelado' },
  { v: 'boleto',         l: 'Boleto' },
]

export const FORMAS_L = FORMAS_OPTS.reduce((m, o) => (m[o.v] = o.l, m), {})
