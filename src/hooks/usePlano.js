'use client'
import { useState, useEffect, useCallback } from 'react'
import { dbSelect, dbInsert, dbDelete } from '../app/actions/db.js'

export function usePlano() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await dbSelect('plano_contas', { order: 'cod', ascending: true })
      setData(rows || [])
    } catch (e) { console.error('[plano]', e) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = async (payload) => { const row = await dbInsert('plano_contas', payload); await fetchAll(); return row }
  const remove = async (id) => { await dbDelete('plano_contas', id); await fetchAll() }

  return { data, loading, refresh: fetchAll, create, remove }
}
