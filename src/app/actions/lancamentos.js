'use server'
import { auth } from '../../lib/auth.ts'
import { createClient } from '@supabase/supabase-js'
import { getPaymentFriday } from '../../utils/datas.js'
import { buildComissaoLanc } from '../../utils/calcComissao.js'

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

async function requireSession() {
  const session = await auth()
  if (!session) throw new Error('Não autenticado')
  return session
}

async function _getContaComissaoId(db) {
  const { data } = await db.from('plano_contas').select('id').eq('cod', '2.3').maybeSingle()
  return data?.id || null
}

export async function lancamentosSelect() {
  await requireSession()
  const { data, error } = await adminClient()
    .from('lancamentos')
    .select('*')
    .order('data', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function lancamentosCreate(payload, prestadores = []) {
  await requireSession()
  const db = adminClient()
  const insertPayload = { ...payload, updated_at: new Date().toISOString() }
  const { data: created, error } = await db.from('lancamentos').insert(insertPayload).select().single()
  if (error) throw new Error(error.message)

  if (created.tipo === 'receita' && created.prestador_id) {
    const prest = prestadores.find((p) => p.id === created.prestador_id)
    if (prest) {
      const sexta = created.status === 'recebido'
        ? getPaymentFriday(created.data_pagamento || created.data)
        : null
      const contaCom = await _getContaComissaoId(db)
      const com = buildComissaoLanc(created, prest, sexta, contaCom)
      if (com) await db.from('lancamentos').insert(com)
    }
  }
  return created
}

export async function lancamentosUpdate(id, payload, prestadores = []) {
  await requireSession()
  const db = adminClient()
  const updatePayload = { ...payload, updated_at: new Date().toISOString() }
  const { data: updated, error } = await db.from('lancamentos').update(updatePayload).eq('id', id).select().single()
  if (error) throw new Error(error.message)

  if (updated.tipo === 'receita') {
    const { data: existente } = await db
      .from('lancamentos').select('*').eq('ref_lanc_id', updated.id).eq('auto_comissao', true).maybeSingle()
    const prest = prestadores.find((p) => p.id === updated.prestador_id)

    if (!prest) {
      if (existente) await db.from('lancamentos').delete().eq('id', existente.id)
    } else {
      const sexta = updated.status === 'recebido'
        ? getPaymentFriday(updated.data_pagamento || updated.data)
        : null
      const contaCom = await _getContaComissaoId(db)
      const novoCom = buildComissaoLanc(updated, prest, sexta, contaCom)
      if (!novoCom) {
        if (existente) await db.from('lancamentos').delete().eq('id', existente.id)
      } else if (existente) {
        const preservaStatus = ['pago', 'cancelado'].includes(existente.status)
          ? existente.status : novoCom.status
        await db.from('lancamentos').update({
          ...novoCom, status: preservaStatus, updated_at: new Date().toISOString(),
        }).eq('id', existente.id)
      } else {
        await db.from('lancamentos').insert(novoCom)
      }
    }
  }
  return updated
}

export async function lancamentosDelete(id) {
  await requireSession()
  const { error } = await adminClient().from('lancamentos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function lancamentosPagarComissao(comId, dataPgto) {
  await requireSession()
  const { error } = await adminClient().from('lancamentos').update({
    status: 'pago', data_pagamento: dataPgto, updated_at: new Date().toISOString(),
  }).eq('id', comId)
  if (error) throw new Error(error.message)
}

export async function lancamentosEstornarComissao(comId) {
  await requireSession()
  const { error } = await adminClient().from('lancamentos').update({
    status: 'pendente', data_pagamento: null, updated_at: new Date().toISOString(),
  }).eq('id', comId)
  if (error) throw new Error(error.message)
}
