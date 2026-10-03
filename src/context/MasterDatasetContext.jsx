import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { deleteVersionRow, fetchPrivatePayload, fetchVersions, insertVersion } from '../lib/masterDatasetRemote'
import { activeVersion, deletionOutcome, sortVersions } from '../lib/masterDatasetVersions'
import { removeMasterFile, storeMasterFile } from '../lib/masterFileStorage'
import { useAuth } from './AuthContext'

// Master Data generik berversi (lihat supabase/master-dataset.sql dan CLAUDE.md).
// Data aktif sebuah dataset = versi terbarunya; versi 'clear' = dikosongkan.
// Kelompok per periode memakai nama 'awalan:periode' (mis. 'hr-diklat:2026-TW4').
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

// Hasil fetch (satu dataset atau satu awalan) dipecah per nama dataset.
function groupByDataset(key, versions) {
  const grouped = key.endsWith(':') ? {} : { [key]: [] }
  versions.forEach((version) => { (grouped[version.dataset] ||= []).push(version) })
  return grouped
}

export function MasterDatasetProvider({ children }) {
  const { user } = useAuth()
  const remote = isSupabaseConfigured && Boolean(user?.id)
  const [versions, setVersions] = useState(() => (isSupabaseConfigured ? {} : loadLocal()))
  const [privatePayloads, setPrivatePayloads] = useState({})
  const loaded = useRef(new Set())
  const versionsRef = useRef(versions)
  versionsRef.current = versions

  // Ambil ulang dari server dan kembalikan daftar terbaru dataset/awalan itu.
  const refresh = useCallback(async (key) => {
    if (!remote) return null
    const result = await fetchVersions(key)
    if (result.error) return null
    const grouped = groupByDataset(key, result.versions)
    setVersions((current) => {
      const next = { ...current }
      if (key.endsWith(':')) Object.keys(next).filter((name) => name.startsWith(key)).forEach((name) => { next[name] = [] })
      return { ...next, ...grouped }
    })
    return result.versions
  }, [remote])

  const ensureLoaded = useCallback((key) => {
    if (loaded.current.has(key)) return
    loaded.current.add(key)
    refresh(key).catch(() => {})
  }, [refresh])

  useEffect(() => {
    if (!isSupabaseConfigured) saveLocal(versions)
  }, [versions])

  useEffect(() => {
    if (!remote) return undefined
    loaded.current.forEach((key) => refresh(key).catch(() => {}))
    const channel = supabase
      .channel('master-dataset-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'master_dataset_versions' }, () => {
        loaded.current.forEach((key) => refresh(key).catch(() => {}))
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

  // sourceFile = berkas yang disimpan untuk diunduh ulang (Bezetting: salinan bersih).
  // Gagal menyimpan berkas tidak membatalkan data; gagal menyimpan data membuang berkasnya.
  // onStage('file' | 'data') memberi tahu tahap yang sedang berjalan (penanda kemajuan).
  const addVersion = useCallback(async (dataset, { action = 'upload', period, payload, privatePayload, ownerDivision, fileName, sourceFile, onStage }) => {
    if (sourceFile) onStage?.('file')
    const stored = sourceFile ? await storeMasterFile(`dataset/${dataset.replace(':', '/')}`, sourceFile, fileName) : {}
    onStage?.('data')
    const fileNote = stored.error ? 'Berkas asli belum bisa disimpan untuk diunduh ulang (jalankan supabase/jalankan-semua.sql).' : null
    if (!remote) {
      const version = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, dataset, action,
        periodMonth: period?.month || null, periodYear: period?.year || null, periodLabel: period?.label || null,
        payload: payload || {}, sourceFileName: fileName || null, sourceFilePath: stored.path || null, uploadedByName: user?.name || null, createdAt: new Date().toISOString()
      }
      setVersions((current) => ({ ...current, [dataset]: sortVersions([version, ...(current[dataset] || [])]) }))
      if (privatePayload) setPrivatePayloads((current) => ({ ...current, [version.id]: privatePayload }))
      return { ok: true, shared: false, message: fileNote }
    }
    const result = await insertVersion({ dataset, action, period, payload, privatePayload, ownerDivision, fileName, filePath: stored.path, user })
    if (result.error) {
      removeMasterFile(stored.path)
      return { ok: false, message: result.error.message }
    }
    if (privatePayload) setPrivatePayloads((current) => ({ ...current, [result.version.id]: privatePayload }))
    await refresh(dataset)
    return { ok: true, shared: true, message: fileNote }
  }, [remote, user, refresh])

  // Hasil: { ok, outcome: 'restored' | 'emptied' | 'removed', current }.
  const removeVersion = useCallback(async (dataset, version) => {
    if (!remote || String(version.id).startsWith('local-')) {
      const before = versionsRef.current[dataset] || []
      const after = before.filter((row) => row.id !== version.id)
      setVersions((current) => ({ ...current, [dataset]: after }))
      removeMasterFile(version.sourceFilePath)
      return { ok: true, ...deletionOutcome(before, version.id, after) }
    }
    // Daftar terbaru dari server, supaya "versi aktif" benar walau admin lain baru mengunggah.
    const before = (await refresh(dataset)) || versionsRef.current[dataset] || []
    const removed = await deleteVersionRow(version.id)
    if (removed.error) return { ok: false, message: removed.error.message }
    if (!removed.deleted) return { ok: false, message: 'Database menolak penghapusan. Jalankan supabase/jalankan-semua.sql di SQL Editor, lalu coba lagi.' }
    removeMasterFile(version.sourceFilePath)
    const after = (await refresh(dataset)) || before.filter((row) => row.id !== version.id)
    return { ok: true, ...deletionOutcome(before, version.id, after) }
  }, [remote, refresh])

  const value = { versions, privatePayloads, ensureLoaded, refresh, loadPrivate, addVersion, removeVersion }
  return <MasterDatasetContext.Provider value={value}>{children}</MasterDatasetContext.Provider>
}

function useMasterDatasetContext() {
  const context = useContext(MasterDatasetContext)
  if (!context) throw new Error('useMasterDataset must be used within MasterDatasetProvider')
  return context
}

// Satu dataset: versi, data aktif (null bila kosong), data rinci aktif (null
// bila tidak berhak), dan aksi unggah / kosongkan / hapus versi.
export function useMasterDataset(dataset, { ownerDivision, loadDetails = false } = {}) {
  const { versions, privatePayloads, ensureLoaded, refresh, loadPrivate, addVersion, removeVersion } = useMasterDatasetContext()

  useEffect(() => { ensureLoaded(dataset) }, [dataset, ensureLoaded])

  const list = useMemo(() => sortVersions(versions[dataset] || []), [versions, dataset])
  const active = useMemo(() => activeVersion(list), [list])

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

// Kelompok dataset per periode (mis. awalan 'hr-diklat:'): setiap periode
// punya versi aktif sendiri. partitions diurutkan dari periode terbaru.
export function useMasterDatasetGroup(prefix) {
  const { versions, ensureLoaded, refresh, addVersion, removeVersion } = useMasterDatasetContext()

  useEffect(() => { ensureLoaded(prefix) }, [prefix, ensureLoaded])

  const partitions = useMemo(() => Object.entries(versions)
    .filter(([name, list]) => name.startsWith(prefix) && list.length)
    .map(([dataset, list]) => {
      const sorted = sortVersions(list)
      return { dataset, period: dataset.slice(prefix.length), versions: sorted, active: activeVersion(sorted) }
    })
    .sort((a, b) => b.period.localeCompare(a.period)), [versions, prefix])

  return {
    partitions,
    refresh: () => refresh(prefix),
    upload: (dataset, data) => addVersion(dataset, { ...data, action: 'upload' }),
    clear: (dataset) => addVersion(dataset, { action: 'clear' }),
    deleteVersion: (dataset, version) => removeVersion(dataset, version)
  }
}
