import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { deleteVersionRow, fetchPrivatePayload, fetchVersions, insertVersion } from '../lib/masterDatasetRemote'
import { useAuth } from './AuthContext'

// Master Data generik berversi (lihat supabase/master-dataset.sql dan CLAUDE.md).
// Data aktif sebuah dataset = versi terbarunya; versi 'clear' = dikosongkan.
// Mode lokal (tanpa Supabase): versi umum di localStorage, data rinci hanya
// di memori, tidak pernah ditulis ke browser.

const LOCAL_KEY = 'bpk-dashboard-master-datasets'
const MasterDatasetContext = createContext(null)

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}')
    return saved && typeof saved === 'object' ? saved : {}
  } catch {
    return {}
  }
}

function saveLocal(versionsByDataset) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(versionsByDataset))
  } catch {
    // Kuota penuh atau diblokir: data tetap ada di memori sesi ini.
  }
}

export function MasterDatasetProvider({ children }) {
  const { user } = useAuth()
  const remote = isSupabaseConfigured && Boolean(user?.id)
  const [versions, setVersions] = useState(() => (isSupabaseConfigured ? {} : loadLocal()))
  const [privatePayloads, setPrivatePayloads] = useState({})
  const loaded = useRef(new Set())

  const refresh = useCallback(async (dataset) => {
    if (!remote) return
    const result = await fetchVersions(dataset)
    if (!result.error) setVersions((current) => ({ ...current, [dataset]: result.versions }))
  }, [remote])

  const ensureLoaded = useCallback((dataset) => {
    if (loaded.current.has(dataset)) return
    loaded.current.add(dataset)
    refresh(dataset).catch(() => {})
  }, [refresh])

  useEffect(() => {
    if (!isSupabaseConfigured) saveLocal(versions)
  }, [versions])

  useEffect(() => {
    if (!remote) return undefined
    loaded.current.forEach((dataset) => refresh(dataset).catch(() => {}))
    const channel = supabase
      .channel('master-dataset-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'master_dataset_versions' }, () => {
        loaded.current.forEach((dataset) => refresh(dataset).catch(() => {}))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [remote, refresh])

  const loadPrivate = useCallback(async (versionId) => {
    if (!remote || !versionId || versionId in privatePayloads) return
    const payload = await fetchPrivatePayload(versionId)
    setPrivatePayloads((current) => ({ ...current, [versionId]: payload }))
  }, [remote, privatePayloads])

  const addVersion = useCallback(async (dataset, { action = 'upload', period, payload, privatePayload, ownerDivision, fileName }) => {
    if (!remote) {
      const version = {
        id: `local-${Date.now()}`, dataset, action, periodMonth: period?.month || null, periodYear: period?.year || null,
        periodLabel: period?.label || null, payload: payload || {}, sourceFileName: fileName || null,
        uploadedByName: user?.name || null, createdAt: new Date().toISOString()
      }
      setVersions((current) => ({ ...current, [dataset]: [version, ...(current[dataset] || [])] }))
      if (privatePayload) setPrivatePayloads((current) => ({ ...current, [version.id]: privatePayload }))
      return { ok: true, shared: false }
    }
    const result = await insertVersion({ dataset, action, period, payload, privatePayload, ownerDivision, fileName, user })
    if (result.error) return { ok: false, message: result.error.message }
    setVersions((current) => ({ ...current, [dataset]: [result.version, ...(current[dataset] || [])] }))
    if (privatePayload) setPrivatePayloads((current) => ({ ...current, [result.version.id]: privatePayload }))
    return { ok: true, shared: true, message: result.privateError ? `Tersimpan, tetapi data rinci gagal: ${result.privateError.message}` : null }
  }, [remote, user])

  // Hasil: { ok, outcome: 'restored' | 'emptied' | 'removed', current }.
  const removeVersion = useCallback(async (dataset, version) => {
    const list = versions[dataset] || []
    const wasActive = list[0]?.id === version.id
    if (remote && !String(version.id).startsWith('local-')) {
      const removed = await deleteVersionRow(version.id)
      if (removed.error) return { ok: false, message: removed.error.message }
      if (!removed.deleted) return { ok: false, message: 'Database menolak penghapusan. Jalankan supabase/jalankan-semua.sql di SQL Editor, lalu coba lagi.' }
    }
    const remaining = list.filter((row) => row.id !== version.id)
    setVersions((current) => ({ ...current, [dataset]: remaining }))
    if (!wasActive) return { ok: true, outcome: 'removed' }
    const current = remaining[0]
    return { ok: true, outcome: current?.action === 'upload' ? 'restored' : 'emptied', current }
  }, [remote, versions])

  const value = { versions, privatePayloads, ensureLoaded, refresh, loadPrivate, addVersion, removeVersion }
  return <MasterDatasetContext.Provider value={value}>{children}</MasterDatasetContext.Provider>
}

// Satu dataset: versi, data aktif (null bila kosong), data rinci aktif (null
// bila tidak berhak), dan aksi unggah / kosongkan / hapus versi.
export function useMasterDataset(dataset, { ownerDivision, loadDetails = false } = {}) {
  const context = useContext(MasterDatasetContext)
  if (!context) throw new Error('useMasterDataset must be used within MasterDatasetProvider')
  const { versions, privatePayloads, ensureLoaded, refresh, loadPrivate, addVersion, removeVersion } = context

  useEffect(() => { ensureLoaded(dataset) }, [dataset, ensureLoaded])

  const list = useMemo(() => versions[dataset] || [], [versions, dataset])
  const top = list[0]
  const active = top?.action === 'upload' ? top : null

  useEffect(() => {
    if (loadDetails && active) loadPrivate(active.id)
  }, [loadDetails, active, loadPrivate])

  return {
    versions: list,
    active,
    activeDetails: active ? privatePayloads[active.id] || null : null,
    refresh: () => refresh(dataset),
    upload: (data) => addVersion(dataset, { ...data, ownerDivision, action: 'upload' }),
    clear: () => addVersion(dataset, { action: 'clear' }),
    deleteVersion: (version) => removeVersion(dataset, version)
  }
}
