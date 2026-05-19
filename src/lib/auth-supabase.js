import { supabase } from './supabase.js'

// Ainda usado pelo PainelAdmin para listar/gerenciar usuários permitidos
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
