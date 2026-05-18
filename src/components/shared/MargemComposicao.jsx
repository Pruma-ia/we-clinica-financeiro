import { SUB, TEAL, RED, BDR, TXT, OK, WARN } from '../../constants/colors.js'
import { fmtR, fmtP } from '../../utils/formatters.js'
import { calcM } from '../../utils/calcComissao.js'
import { FORMAS_L } from '../../constants/formas.js'

// Bloco visual: receita bruta → imposto → comissão → taxa → margem.
export default function MargemComposicao({ lanc, prestadores, premissas }) {
  if (!lanc || lanc.tipo !== 'receita' || !+(lanc.valor || 0)) return null
  const { com, imp, taxa, marg } = calcM(lanc, prestadores, premissas)
  const v = +(lanc.valor || 0)
  const margPct = v > 0 ? (marg / v) * 100 : 0
  const prest = prestadores.find((p) => p.id === lanc.prestador_id)

  return (
    <div style={{
      background: '#FAF9F4',
      border: `1px solid ${BDR}`,
      borderRadius: 12,
      padding: 16,
      marginBottom: 14,
    }}>
      <div style={{
        fontSize: 11, color: SUB, textTransform: 'uppercase',
        letterSpacing: '.05em', fontWeight: 500, marginBottom: 10,
      }}>
        Composição financeira
      </div>
      <Linha l="Receita bruta" v={fmtR(v)} color={OK} />
      <Linha
        l={`Imposto (${(+(premissas.imposto || 0)).toLocaleString('pt-BR')}% LP)`}
        v={`− ${fmtR(imp)}`}
        color={RED}
      />
      {com > 0 && prest && (
        <Linha
          l={`Comissão (${prest.tipo === 'psicologo'
            ? `${prest.com}%`
            : `${fmtR(prest.com)}/h × ${lanc.horas || 0}h`})`}
          v={`− ${fmtR(com)}`}
          color={WARN}
        />
      )}
      {taxa > 0 && (
        <Linha
          l={`Taxa ${FORMAS_L[lanc.forma_pagamento] || lanc.forma_pagamento} (${premissas[lanc.forma_pagamento]}%)`}
          v={`− ${fmtR(taxa)}`}
          color={RED}
        />
      )}
      <div style={{ borderTop: `1px solid ${BDR}`, margin: '8px 0' }} />
      <Linha
        l="Margem da clínica"
        v={`${fmtR(marg)}  ·  ${fmtP(margPct)}`}
        color={TEAL}
        bold
      />
    </div>
  )
}

function Linha({ l, v, color, bold }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0', fontSize: 13,
    }}>
      <span style={{ color: bold ? TXT : SUB, fontWeight: bold ? 600 : 400 }}>{l}</span>
      <span style={{ color, fontWeight: bold ? 600 : 500 }}>{v}</span>
    </div>
  )
}
