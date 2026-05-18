'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  lancamentosSelect, lancamentosCreate, lancamentosUpdate,
  lancamentosDelete, lancamentosPagarComissao, lancamentosEstornarComissao,
} from '../app/actions/lancamentos.js'

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
    try {
      const rows = await lancamentosSelect()
      setData(rows || [])
    } catch (e) {
      console.error('[lancamentos]', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = async (payload, ctx = {}) => {
    const created = await lancamentosCreate(payload, ctx.prestadores || [])
    await fetchAll()
    return created
  }

  const update = async (id, payload, ctx = {}) => {
    const updated = await lancamentosUpdate(id, payload, ctx.prestadores || [])
    await fetchAll()
    return updated
  }

  const remove = async (id) => {
    await lancamentosDelete(id)
    await fetchAll()
  }

  const baixar = async (lanc, dataPgto, ctx = {}) => {
    const novoStatus = lanc.tipo === 'receita' ? 'recebido' : 'pago'
    return update(lanc.id, { status: novoStatus, data_pagamento: dataPgto }, ctx)
  }

  const pagarComissao = async (comId, dataPgto) => {
    await lancamentosPagarComissao(comId, dataPgto)
    await fetchAll()
  }

  const estornarComissao = async (comId) => {
    await lancamentosEstornarComissao(comId)
    await fetchAll()
  }

  return {
    data, loading, refresh: fetchAll,
    create, update, remove, baixar,
    pagarComissao, estornarComissao,
  }
}
