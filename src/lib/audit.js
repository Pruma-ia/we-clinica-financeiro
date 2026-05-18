'use client'
import { supabase } from './supabase.js'

// Registra ação no audit_log. Falha silenciosa pra não bloquear UX.
export const logAcao = async (perfil, acao, entidade, detalhes = '') => {
  if (!perfil?.email) return
  try {
    await supabase.from('audit_log').insert({
      user_email: perfil.email,
      user_nome: perfil.nome || null,
      acao,
      entidade,
      detalhes: detalhes ? String(detalhes).slice(0, 1000) : null,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[audit] log falhou', e)
  }
}
