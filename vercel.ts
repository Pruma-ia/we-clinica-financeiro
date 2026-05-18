import type { VercelConfig } from '@vercel/config/v1'

// Vite SPA — framework preset cobre fallback de rota client-side (react-router).
// Variáveis de ambiente (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) são
// injetadas automaticamente pela integration Supabase do Vercel Marketplace.
export const config: VercelConfig = {
  framework: 'vite',
  buildCommand: 'npm run build',
  outputDirectory: 'dist',
  installCommand: 'npm install',
}
