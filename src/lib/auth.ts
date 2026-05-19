import NextAuth, { type DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import { db } from '@/lib/db'

declare module 'next-auth' {
  interface Session {
    user: {
      perfilId?: string
      perfilNome?: string
      perfilRole?: 'admin' | 'operacional'
    } & DefaultSession['user']
  }

  interface JWT {
    perfilId?: string
    perfilNome?: string
    perfilRole?: 'admin' | 'operacional'
  }
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
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      const allowed = await db.query.usuariosPermitidos.findFirst({
        where: (u, { and, eq }) => and(eq(u.email, user.email!), eq(u.ativo, true)),
      })
      if (!allowed) {
        return `/acesso-negado?email=${encodeURIComponent(user.email)}`
      }
      return true
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const row = await db.query.usuariosPermitidos.findFirst({
          where: (u, { eq }) => eq(u.email, user.email!),
        })
        if (row) {
          token.perfilId = row.id
          token.perfilNome = row.nome
          token.perfilRole = row.role as 'admin' | 'operacional'
        }
      }
      return token
    },
    async session({ session, token }) {
      session.user.perfilId = token.perfilId as string | undefined
      session.user.perfilNome = token.perfilNome as string | undefined
      session.user.perfilRole = token.perfilRole as 'admin' | 'operacional' | undefined
      return session
    },
  },
})
