import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// eslint-disable-next-line no-console
if (!url || !key) console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes em .env')

export const supabase = createClient(url || 'http://localhost', key || 'anon')
