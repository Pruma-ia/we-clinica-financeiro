'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'

export function usePrestadores() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('prestadores')
      .select('*')
      .order('nome', { ascending: true })
    if (error) console.error('[prestadores]', error)
    setData(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = async (payload) => {
    const { data, error } = await supabase.from('prestadores').insert(payload).select().single()
    if (error) throw error
    await fetchAll()
    return data
  }

  const update = async (id, payload) => {
    const { error } = await supabase.from('prestadores').update(payload).eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  const remove = async (id) => {
    const { error } = await supabase.from('prestadores').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }

  return { data, loading, refresh: fetchAll, create, update, remove }
}
