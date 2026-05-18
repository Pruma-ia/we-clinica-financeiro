'use client'
import { useState, useEffect, useCallback } from 'react'
import { dbSelect } from '../app/actions/db.js'
import { dbUpsertPremissas } from '../app/actions/db.js'

// Retorna premissas como objeto { chave: numero }.
export function usePremissas() {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await dbSelect('premissas', { select: 'chave,valor' })
      const map = (rows || []).reduce((m, r) => (m[r.chave] = +r.valor, m), {})
      setData(map)
    } catch (e) { console.error('[premissas]', e) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const upsertMany = async (entries) => {
    await dbUpsertPremissas(entries)
    await fetchAll()
  }

  return { data, loading, refresh: fetchAll, upsertMany }
}
