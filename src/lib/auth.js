import { supabase } from './supabase.js'

export const signInWithGoogle = async () => {
  const redirectTo = window.location.origin
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })
  if (error) throw error
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

// Busca o perfil em usuarios_permitidos pelo email do usuário Supabase.
// Retorna null se não permitido ou inativo.
export const fetchPerfilPermitido = async (email) => {
  if (!email) return null
  const { data, error } = await supabase
    .from('usuarios_permitidos')
    .select('id,email,nome,role,ativo')
    .eq('email', email)
    .maybeSingle()
  if (error) {
    // eslint-disable-next-line no-console
    console.error('[auth] fetchPerfilPermitido', error)
    return null
  }
  if (!data || !data.ativo) return null
  return data
}
