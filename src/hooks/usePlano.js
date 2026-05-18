import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function usePlano() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('plano_contas')
      .select('*')
      .order('cod', { ascending: true })
    if (error) console.error('[plano]', error)
    setData(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = async (payload) => {
    const { data, error } = await supabase.from('plano_contas').insert(payload).select().single()
    if (error) throw error
    await fetchAll()
    return data
  }

  const remove = async (id) => {
    const { error } = await supabase.from('plano_contas').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  return { data, loading, refresh: fetchAll, create, remove }
}
