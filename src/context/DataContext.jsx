import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { DIVISIONS, INITIAL_CONTENT, BUDGET_SUMMARY, DOCUMENT_STRUCTURE } from '../data/seed'
import { buildUploadedDocument, loadStoredDocuments, saveStoredDocuments } from '../lib/documentStorage'
import { loadBudgetData } from '../lib/budgetStorage'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const DataContext = createContext(null)
const CONTENT_KEY = 'bpk-dashboard-content'

function loadContent() {
  const saved = localStorage.getItem(CONTENT_KEY)
  if (saved) {
    try { return JSON.parse(saved) } catch { return INITIAL_CONTENT }
  }
  return INITIAL_CONTENT
}

function mapRemoteDocument(document) {
  return {
    ...document,
    divisionId: document.division_id,
    categoryId: document.category_id,
    fileName: document.file_name,
    fileType: document.file_type,
    fileSize: document.file_size,
    documentNumber: document.document_number,
    documentDate: document.document_date,
    uploadedAt: document.created_at,
    uploadedBy: document.uploaded_by || ''
  }
}

function getUploadStatus(user, divisionId) {
  const userDivision = user?.division || user?.division_id
  return user?.role === 'employee' && userDivision === divisionId ? 'approved' : 'pending'
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [content, setContent] = useState(loadContent)
  const [documents, setDocuments] = useState(loadStoredDocuments)
  const [budgetData, setBudgetData] = useState(BUDGET_SUMMARY)
  const [remoteDivisions, setRemoteDivisions] = useState(null)
  const [remoteCategories, setRemoteCategories] = useState(null)

  useEffect(() => {
    let active = true
    loadBudgetData().then((budget) => { if (active) setBudgetData(budget) }).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return undefined
    let active = true
    const loadRemoteData = async () => {
      const [divisionResult, categoryResult, documentResult, contentResult, budgetResult] = await Promise.all([
        supabase.from('divisions').select('*').order('name'),
        supabase.from('document_categories').select('*').order('name'),
        supabase.from('documents').select('*').order('created_at', { ascending: false }),
        supabase.from('content').select('*').order('created_at', { ascending: false }),
        supabase.from('budget_snapshots').select('*').order('fiscal_year', { ascending: false }).limit(1)
      ])
      if (!active) return
      if (!divisionResult.error && divisionResult.data?.length) setRemoteDivisions(divisionResult.data.map((division) => ({ ...division, shortName: division.short_name })))
      if (!categoryResult.error && categoryResult.data?.length) {
        const grouped = categoryResult.data.reduce((result, category) => {
          const division = result[category.division_id] || { divisionId: category.division_id, title: category.division_id, categories: [] }
          division.categories.push({ id: category.id, name: category.name, description: category.description })
          result[category.division_id] = division
          return result
        }, {})
        setRemoteCategories(Object.values(grouped))
      }
      if (!documentResult.error) setDocuments((documentResult.data || []).map(mapRemoteDocument))
      if (!contentResult.error) setContent(contentResult.data || [])
      if (!budgetResult.error && budgetResult.data?.[0]) {
        const snapshot = budgetResult.data[0]
        setBudgetData((current) => ({
          ...current,
          fiscalYear: snapshot.fiscal_year,
          totalPagu: Number(snapshot.total_pagu),
          totalRealisasi: Number(snapshot.total_realisasi),
          totalSisa: Number(snapshot.total_sisa),
          realisasiPercent: Number(snapshot.realisasi_percent),
          sisaPercent: Number(snapshot.sisa_percent)
        }))
      }
    }
    loadRemoteData().catch(() => {})
    const channel = supabase
      .channel('dashboard-data-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, (event) => {
        if (event.eventType === 'INSERT') setDocuments((prev) => prev.some((document) => document.id === event.new.id) ? prev : [mapRemoteDocument(event.new), ...prev])
        if (event.eventType === 'UPDATE') setDocuments((prev) => prev.map((document) => document.id === event.new.id ? mapRemoteDocument(event.new) : document))
        if (event.eventType === 'DELETE') setDocuments((prev) => prev.filter((document) => document.id !== event.old.id))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, (event) => {
        if (event.eventType === 'INSERT') setContent((prev) => prev.some((item) => item.id === event.new.id) ? prev : [event.new, ...prev])
        if (event.eventType === 'UPDATE') setContent((prev) => prev.map((item) => item.id === event.new.id ? event.new : item))
        if (event.eventType === 'DELETE') setContent((prev) => prev.filter((item) => item.id !== event.old.id))
      })
      .subscribe()
    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => { localStorage.setItem(CONTENT_KEY, JSON.stringify(content)) }, [content])
  useEffect(() => { saveStoredDocuments(documents) }, [documents])

  const addContent = useCallback((item) => {
    const newItem = { id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`, status: 'pending', date: new Date().toISOString().slice(0, 10), ...item }
    if (isSupabaseConfigured && user?.id) {
      return supabase.from('content').insert({ division_id: item.divisionId || user.division_id || user.division, author_id: user.id, type: item.type, title: item.title, description: item.description, payload: item.payload || {}, status: 'pending' }).select().single().then(({ data, error }) => {
        if (error) throw error
        setContent((prev) => prev.some((contentItem) => contentItem.id === data.id) ? prev : [data, ...prev])
        return data
      })
    }
    setContent((prev) => [newItem, ...prev])
    return newItem
  }, [user])
  const updateStatus = useCallback(async (id, status) => {
    if (isSupabaseConfigured && user?.id) {
      const { data, error } = await supabase.from('content').update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      setContent((prev) => prev.map((item) => item.id === id ? data : item))
      return
    }
    setContent((prev) => prev.map((item) => item.id === id ? { ...item, status } : item))
  }, [user])
  const deleteContent = useCallback(async (id) => {
    if (isSupabaseConfigured && user?.id) {
      const { error } = await supabase.from('content').delete().eq('id', id)
      if (error) throw error
    }
    setContent((prev) => prev.filter((item) => item.id !== id))
  }, [user])
  const activeDivisions = remoteDivisions || DIVISIONS
  const activeDocumentStructure = remoteCategories || DOCUMENT_STRUCTURE
  const getDocumentDivision = useCallback((id) => activeDivisions.find((division) => division.id === id), [activeDivisions])
  const getDocumentCategory = useCallback((divisionId, categoryId) => activeDocumentStructure.find((item) => item.divisionId === divisionId)?.categories.find((category) => category.id === categoryId), [activeDocumentStructure])
  const getDocumentCategories = useCallback((divisionId) => activeDocumentStructure.find((item) => item.divisionId === divisionId)?.categories || [], [activeDocumentStructure])

  const addDocument = useCallback(async (item) => {
    const uploadStatus = getUploadStatus(user, item.divisionId)
    if (isSupabaseConfigured && user?.id) {
      let filePath = null
      if (item.file) {
        filePath = `${item.divisionId}/${crypto.randomUUID()}-${item.file.name}`
        const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, item.file, { upsert: false })
        if (uploadError) throw uploadError
      }
      const { data, error } = await supabase.from('documents').insert({
        division_id: item.divisionId,
        category_id: item.categoryId,
        title: item.title,
        description: item.description,
        file_name: item.file?.name || item.fileName || null,
        file_path: filePath,
        file_type: item.file?.type || item.fileType || null,
        file_size: item.file?.size || item.fileSize || 0,
        document_number: item.documentNumber || null,
        document_date: item.documentDate || null,
        year: item.year || null,
        status: uploadStatus,
        uploaded_by: user.id
      }).select().single()
      if (error) throw error
      const newDocument = { ...item, ...mapRemoteDocument(data) }
      setDocuments((prev) => [newDocument, ...prev])
      return newDocument
    }
    const newDocument = await buildUploadedDocument({ id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`, uploadedAt: new Date().toISOString(), fileDataUrl: null, ...item, status: uploadStatus })
    setDocuments((prev) => [newDocument, ...prev])
    return newDocument
  }, [user])
  const updateDocument = useCallback(async (id, updates) => {
    if (isSupabaseConfigured && user?.id) {
      const payload = {
        title: updates.title,
        description: updates.description,
        division_id: updates.divisionId,
        category_id: updates.categoryId,
        document_number: updates.documentNumber || null,
        document_date: updates.documentDate || null,
        year: updates.year || null,
        updated_at: new Date().toISOString()
      }
      const { data, error } = await supabase.from('documents').update(payload).eq('id', id).select().single()
      if (error) throw error
      const updatedDocument = mapRemoteDocument(data)
      setDocuments((prev) => prev.map((document) => document.id === id ? updatedDocument : document))
      return updatedDocument
    }
    let updatedDocument = null
    setDocuments((prev) => prev.map((document) => {
      if (document.id !== id) return document
      updatedDocument = { ...document, ...updates, updatedAt: new Date().toISOString() }
      return updatedDocument
    }))
    if (updates.file) {
      const built = await buildUploadedDocument({ ...updatedDocument, ...updates, file: updates.file, uploadedAt: updatedDocument?.uploadedAt || new Date().toISOString() })
      setDocuments((prev) => prev.map((document) => document.id === id ? built : document))
      return built
    }
    return updatedDocument
  }, [user])
  const deleteDocument = useCallback(async (id) => {
    if (isSupabaseConfigured && user?.id) {
      const { error } = await supabase.from('documents').delete().eq('id', id)
      if (error) throw error
    }
    setDocuments((prev) => prev.filter((document) => document.id !== id))
  }, [user])
  const approveDocument = useCallback(async (id) => {
    if (isSupabaseConfigured && user?.id) {
      const { data, error } = await supabase.from('documents').update({ status: 'approved', rejection_reason: null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      setDocuments((prev) => prev.map((document) => document.id === id ? mapRemoteDocument(data) : document))
      return
    }
    setDocuments((prev) => prev.map((document) => document.id === id ? { ...document, status: 'approved', rejectionReason: '', reviewedAt: new Date().toISOString() } : document))
  }, [user])
  const rejectDocument = useCallback(async (id, reason) => {
    if (isSupabaseConfigured && user?.id) {
      const { data, error } = await supabase.from('documents').update({ status: 'rejected', rejection_reason: reason, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      setDocuments((prev) => prev.map((document) => document.id === id ? mapRemoteDocument(data) : document))
      return
    }
    setDocuments((prev) => prev.map((document) => document.id === id ? { ...document, status: 'rejected', rejectionReason: reason, reviewedAt: new Date().toISOString() } : document))
  }, [user])
  const getDivision = useCallback((id) => activeDivisions.find((division) => division.id === id), [activeDivisions])

  const stats = useMemo(() => {
    const total = documents.length
    const pending = documents.filter((document) => document.status === 'pending').length
    const approved = documents.filter((document) => document.status === 'approved').length
    const rejected = documents.filter((document) => document.status === 'rejected').length
    const perDivision = activeDivisions.map((division) => {
      const items = documents.filter((document) => document.divisionId === division.id)
      return { name: division.shortName, id: division.id, total: items.length, approved: items.filter((item) => item.status === 'approved').length, pending: items.filter((item) => item.status === 'pending').length, rejected: items.filter((item) => item.status === 'rejected').length }
    })
    const totalPagu = budgetData.totalPagu
    const totalRealisasi = budgetData.totalRealisasi
    const totalSisa = Math.max(totalPagu - totalRealisasi, 0)
    const budget = { ...budgetData, totalPagu, totalRealisasi, totalSisa, realisasiPercent: totalPagu ? (totalRealisasi / totalPagu) * 100 : 0, sisaPercent: totalPagu ? (totalSisa / totalPagu) * 100 : 0 }
    const documentsByDivision = activeDivisions.map((division) => {
      const items = documents.filter((document) => document.divisionId === division.id)
      return { id: division.id, name: division.name, shortName: division.shortName, total: items.length, approved: items.filter((item) => item.status === 'approved').length, pending: items.filter((item) => item.status === 'pending').length, rejected: items.filter((item) => item.status === 'rejected').length }
    })
    const documentsByCategory = activeDocumentStructure.flatMap((division) => division.categories.map((category) => {
      const items = documents.filter((document) => document.divisionId === division.divisionId && document.categoryId === category.id)
      return { divisionId: division.divisionId, divisionName: division.title, categoryId: category.id, categoryName: category.name, total: items.length, approved: items.filter((item) => item.status === 'approved').length, pending: items.filter((item) => item.status === 'pending').length, rejected: items.filter((item) => item.status === 'rejected').length }
    }))
    const latestDocuments = [...documents].sort((a, b) => new Date(b.uploadedAt || b.documentDate) - new Date(a.uploadedAt || a.documentDate)).slice(0, 8)
    const recentActivity = latestDocuments.slice(0, 10).map((document) => ({ id: document.id, title: document.title, status: document.status, divisionId: document.divisionId, categoryId: document.categoryId, date: document.uploadedAt || document.documentDate, type: 'document' }))
    return { total, pending, approved, rejected, perDivision, statusDistribution: [{ name: 'Approved', value: approved, color: '#00A99D' }, { name: 'Pending', value: pending, color: '#F5A623' }, { name: 'Rejected', value: rejected, color: '#E15554' }], totalDivisions: activeDivisions.length, budget, documentTotal: total, documentPending: pending, documentApproved: approved, documentRejected: rejected, documentsByDivision, documentsByCategory, latestDocuments, recentActivity }
  }, [activeDivisions, activeDocumentStructure, budgetData, content, documents])

  const value = { divisions: activeDivisions, documentStructure: activeDocumentStructure, content, documents, addContent, updateStatus, deleteContent, getDivision, getDocumentDivision, getDocumentCategory, getDocumentCategories, addDocument, updateDocument, deleteDocument, approveDocument, rejectDocument, stats }
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
