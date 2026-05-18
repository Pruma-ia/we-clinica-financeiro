import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      const { data } = await supabaseAdmin
        .from('usuarios_permitidos')
        .select('id,ativo')
        .eq('email', user.email)
        .eq('ativo', true)
        .maybeSingle()
      return !!data
    },
    async jwt({ token, user }) {
      if (user) {
        const { data } = await supabaseAdmin
          .from('usuarios_permitidos')
          .select('id,nome,role')
          .eq('email', user.email)
          .maybeSingle()
        if (data) {
          token.perfilId = data.id
          token.perfilNome = data.nome
          token.perfilRole = data.role
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.perfilId = token.perfilId
      session.user.perfilNome = token.perfilNome
      session.user.perfilRole = token.perfilRole
      return session
    },
  },
})
