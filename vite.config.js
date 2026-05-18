import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Aceita VITE_SUPABASE_* (dev local) ou SUPABASE_* (Vercel Marketplace
// Supabase integration injeta sem o prefixo VITE_).
export default defineConfig(({ mode }) => {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  return {
    plugins: [react()],
    server: { port: 5173 },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''
      ),
    },
  }
})
