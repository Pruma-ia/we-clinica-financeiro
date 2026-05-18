import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { getPaymentFriday } from '../utils/datas.js'
import { buildComissaoLanc } from '../utils/calcComissao.js'

// Hook central de lançamentos. Gerencia ciclo da comissão automática.
//
// Regras:
//  - Receita criada com prestador_id → cria despesa-comissão (status='projecao').
//  - Quando receita muda para status='recebido' (data_pagamento preenchida)
//    → comissão vinculada muda para 'pendente' com sexta calculada.
//  - Update da receita recalcula valor/sexta da comissão.
//  - Delete/cancel da receita remove comissão (cascade FK).
export function useLancamentos(opts = {}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lancamentos')
      .select('*')
      .order('data', { ascending: false })
    if (error) console.error('[lancamentos]', error)
    setData(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Util: acha conta "Comissões prestadores" no plano
  const _getContaComissaoId = async () => {
    const { data } = await supabase
      .from('plano_contas')
      .select('id')
      .eq('cod', '2.3')
      .maybeSingle()
    return data?.id || null
  }

  // CREATE
  const create = async (payload, ctx = {}) => {
    const { prestadores = [] } = ctx
    const insertPayload = { ...payload, updated_at: new Date().toISOString() }
    const { data: created, error } = await supabase
      .from('lancamentos')
      .insert(insertPayload)
      .select()
      .single()
    if (error) throw error

    // Cria comissão pareada se receita + prestador
    if (created.tipo === 'receita' && created.prestador_id) {
      const prest = prestadores.find((p) => p.id === created.prestador_id)
      if (prest) {
        const sexta = created.status === 'recebido'
          ? getPaymentFriday(created.data_pagamento || created.data)
          : null
        const contaCom = await _getContaComissaoId()
        const com = buildComissaoLanc(created, prest, sexta, contaCom)
        if (com) {
          await supabase.from('lancamentos').insert(com)
        }
      }
    }

    await fetchAll()
    return created
  }

  // UPDATE
  const update = async (id, payload, ctx = {}) => {
    const { prestadores = [] } = ctx
    const updatePayload = { ...payload, updated_at: new Date().toISOString() }
    const { data: updated, error } = await supabase
      .from('lancamentos')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    // Sincroniza comissão pareada quando receita
    if (updated.tipo === 'receita') {
      const { data: existente } = await supabase
        .from('lancamentos')
        .select('*')
        .eq('ref_lanc_id', updated.id)
        .eq('auto_comissao', true)
        .maybeSingle()

      const prest = prestadores.find((p) => p.id === updated.prestador_id)

      if (!prest) {
        // Removeu prestador → remove comissão se existir
        if (existente) {
          await supabase.from('lancamentos').delete().eq('id', existente.id)
        }
      } else {
        const sexta = updated.status === 'recebido'
          ? getPaymentFriday(updated.data_pagamento || updated.data)
          : null
        const contaCom = await _getContaComissaoId()
        const novoCom = buildComissaoLanc(updated, prest, sexta, contaCom)
        if (!novoCom) {
          if (existente) await supabase.from('lancamentos').delete().eq('id', existente.id)
        } else if (existente) {
          // Mantém status pago/cancelado se já fechado; senão recalcula
          const preservaStatus = ['pago', 'cancelado'].includes(existente.status)
            ? existente.status
            : novoCom.status
          await supabase.from('lancamentos').update({
            ...novoCom,
            status: preservaStatus,
            updated_at: new Date().toISOString(),
          }).eq('id', existente.id)
        } else {
          await supabase.from('lancamentos').insert(novoCom)
        }
      }
    }

    await fetchAll()
    return updated
  }

  // DELETE — cascade remove comissão pareada via FK on delete cascade
  const remove = async (id) => {
    const { error } = await supabase.from('lancamentos').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  // Baixa rápida: marca como recebido/pago + define data_pagamento
  const baixar = async (lanc, dataPgto, ctx = {}) => {
    const novoStatus = lanc.tipo === 'receita' ? 'recebido' : 'pago'
    return update(lanc.id, {
      status: novoStatus,
      data_pagamento: dataPgto,
    }, ctx)
  }

  // Pagar comissão individual
  const pagarComissao = async (comId, dataPgto) => {
    const { error } = await supabase
      .from('lancamentos')
      .update({
        status: 'pago',
        data_pagamento: dataPgto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', comId)
    if (error) throw error
    await fetchAll()
  }

  // Estornar comissão paga (volta para pendente)
  const estornarComissao = async (comId) => {
    const { error } = await supabase
      .from('lancamentos')
      .update({
        status: 'pendente',
        data_pagamento: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', comId)
    if (error) throw error
    await fetchAll()
  }

  return {
    data, loading, refresh: fetchAll,
    create, update, remove, baixar,
    pagarComissao, estornarComissao,
  }
}
