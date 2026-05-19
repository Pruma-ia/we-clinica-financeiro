'use server'
import { auth } from '../../lib/auth.ts'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  )
}

async function getSession() {
  const session = await auth()
  if (!session) throw new Error('Não autenticado')
  return session
}

async function requireAdmin() {
  const session = await getSession()
  if (session.user?.perfilRole !== 'admin') throw new Error('Acesso negado')
  return session
}

// ── usuarios_permitidos ────────────────────────────────────────────────────────

export async function dbListUsuarios() {
  await requireAdmin()
  const { data, error } = await adminClient()
    .from('usuarios_permitidos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function dbInsertUsuario(payload) {
  await requireAdmin()
  const { error } = await adminClient().from('usuarios_permitidos').insert(payload)
  if (error) throw new Error(error.message)
}

export async function dbUpdateUsuario(id, payload) {
  await requireAdmin()
  const { error } = await adminClient().from('usuarios_permitidos').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function dbDeleteUsuario(id) {
  await requireAdmin()
  const { error } = await adminClient().from('usuarios_permitidos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── generic (qualquer tabela, qualquer usuário permitido) ──────────────────────

export async function dbSelect(table, query = {}) {
  await getSession()
  let q = adminClient().from(table).select(query.select || '*')
  if (query.order) q = q.order(query.order, { ascending: query.ascending ?? false })
  if (query.eq) {
    for (const [col, val] of Object.entries(query.eq)) q = q.eq(col, val)
  }
  if (query.gte) q = q.gte(query.gte[0], query.gte[1])
  if (query.lte) q = q.lte(query.lte[0], query.lte[1])
  if (query.limit) q = q.limit(query.limit)
  const { data, error } = await q
  if (error) throw new Error(error.message)
  return data
}

export async function dbInsert(table, payload) {
  await getSession()
  const { data, error } = await adminClient().from(table).insert(payload).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function dbUpdate(table, id, payload) {
  await getSession()
  const { data, error } = await adminClient().from(table).update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function dbDelete(table, id) {
  await getSession()
  const { error } = await adminClient().from(table).delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function dbUpsertPremissas(entries) {
  await getSession()
  const rows = Object.entries(entries).map(([chave, valor]) => ({
    chave, valor: +valor, updated_at: new Date().toISOString(),
  }))
  const { error } = await adminClient().from('premissas').upsert(rows, { onConflict: 'chave' })
  if (error) throw new Error(error.message)
}
