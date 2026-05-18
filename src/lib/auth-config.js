import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { createClient } from '@supabase/supabase-js'
import { SignJWT } from 'jose'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function makeSupabaseToken(email, sub) {
  if (!process.env.SUPABASE_JWT_SECRET) return null
  return new SignJWT({ role: 'authenticated', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub || email)
    .setAudience('authenticated')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET))
}

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
      const email = user?.email || token.email
      if (email) {
        token.supabaseAccessToken = await makeSupabaseToken(email, token.sub)
      }
      return token
    },
    async session({ session, token }) {
      session.user.perfilId = token.perfilId
      session.user.perfilNome = token.perfilNome
      session.user.perfilRole = token.perfilRole
      session.supabaseAccessToken = token.supabaseAccessToken
      return session
    },
  },
})
