import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

// Retorna premissas como objeto { chave: numero }.
export function usePremissas() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('premissas')
      .select('chave, valor')
    if (error) console.error('[premissas]', error)
    const map = (data || []).reduce((m, r) => (m[r.chave] = +r.valor, m), {})
    setData(map)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const upsertMany = async (entries) => {
    const rows = Object.entries(entries).map(([chave, valor]) => ({
      chave, valor: +valor, updated_at: new Date().toISOString(),
    }))
    const { error } = await supabase.from('premissas').upsert(rows, { onConflict: 'chave' })
    if (error) throw error
    await fetchAll()
  }

  return { data, loading, refresh: fetchAll, upsertMany }
}
