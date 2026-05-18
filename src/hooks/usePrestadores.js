'use client'
import { useState, useEffect, useCallback } from 'react'
import { dbSelect, dbInsert, dbUpdate, dbDelete } from '../app/actions/db.js'

export function usePrestadores() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await dbSelect('prestadores', { order: 'nome', ascending: true })
      setData(rows || [])
    } catch (e) { console.error('[prestadores]', e) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const create = async (payload) => { const row = await dbInsert('prestadores', payload); await fetchAll(); return row }
  const update = async (id, payload) => { await dbUpdate('prestadores', id, payload); await fetchAll() }
  const remove = async (id) => { await dbDelete('prestadores', id); await fetchAll() }

  return { data, loading, refresh: fetchAll, create, update, remove }
}
