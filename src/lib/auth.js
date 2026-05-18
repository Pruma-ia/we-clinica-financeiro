import { supabase } from './supabase.js'

export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const waitForGIS = (attempts = 0) => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            const { error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: credential,
            })
            if (error) reject(error)
            else resolve()
          },
        })
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            reject(new Error('Pop-up bloqueado. Permita pop-ups para este site e tente novamente.'))
          } else if (notification.isSkippedMoment()) {
            reject(new Error('Login cancelado.'))
          }
        })
      } else if (attempts < 10) {
        setTimeout(() => waitForGIS(attempts + 1), 300)
      } else {
        reject(new Error('Google Identity Services não carregou. Recarregue a página.'))
      }
    }
    waitForGIS()
  })
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
