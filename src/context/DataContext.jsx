import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { DIVISIONS, INITIAL_CONTENT, BUDGET_SUMMARY, DOCUMENT_STRUCTURE } from '../data/seed'
import {
  buildUploadedDocument,
  loadStoredDocuments,
  saveStoredDocuments
} from '../lib/documentStorage'
import { loadBudgetData } from '../lib/budgetStorage'

const DataContext = createContext(null)
const CONTENT_KEY = 'bpk-dashboard-content'

function loadContent() {
  const saved = localStorage.getItem(CONTENT_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return INITIAL_CONTENT
    }
  }
  return INITIAL_CONTENT
}

export function DataProvider({ children }) {
  const [content, setContent] = useState(loadContent)
  const [documents, setDocuments] = useState(loadStoredDocuments)
  const [budgetData, setBudgetData] = useState(BUDGET_SUMMARY)

  useEffect(() => {
    let active = true
    loadBudgetData()
      .then((budget) => {
        if (active) setBudgetData(budget)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(CONTENT_KEY, JSON.stringify(content))
  }, [content])

  useEffect(() => {
    saveStoredDocuments(documents)
  }, [documents])

  const addContent = useCallback((item) => {
    const newItem = {
      id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      date: new Date().toISOString().slice(0, 10),
      ...item
    }
    setContent((prev) => [newItem, ...prev])
    return newItem
  }, [])

  const updateStatus = useCallback((id, status) => {
    setContent((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }, [])

  const deleteContent = useCallback((id) => {
    setContent((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const getDocumentDivision = useCallback(
    (id) => DIVISIONS.find((division) => division.id === id),
    []
  )

  const getDocumentCategory = useCallback((divisionId, categoryId) => {
    const division = DOCUMENT_STRUCTURE.find((item) => item.divisionId === divisionId)
    return division?.categories.find((category) => category.id === categoryId)
  }, [])

  const getDocumentCategories = useCallback((divisionId) => {
    return DOCUMENT_STRUCTURE.find((item) => item.divisionId === divisionId)?.categories || []
  }, [])

  const addDocument = useCallback(async (item) => {
    const newDocument = await buildUploadedDocument({
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: 'pending',
      uploadedAt: new Date().toISOString(),
      fileDataUrl: null,
      ...item
    })

    setDocuments((prev) => [newDocument, ...prev])
    return newDocument
  }, [])

  const updateDocument = useCallback(async (id, updates) => {
    let updatedDocument = null

    setDocuments((prev) =>
      prev.map((document) => {
        if (document.id !== id) return document

        updatedDocument = {
          ...document,
          ...updates,
          updatedAt: new Date().toISOString()
        }
        return updatedDocument
      })
    )

    if (updates.file) {
      const built = await buildUploadedDocument({
        ...updatedDocument,
        ...updates,
        file: updates.file,
        uploadedAt: updatedDocument?.uploadedAt || new Date().toISOString()
      })

      setDocuments((prev) => prev.map((document) => (document.id === id ? built : document)))
      return built
    }

    return updatedDocument
  }, [])

  const deleteDocument = useCallback((id) => {
    setDocuments((prev) => prev.filter((document) => document.id !== id))
  }, [])

  const approveDocument = useCallback((id) => {
    setDocuments((prev) =>
      prev.map((document) =>
        document.id === id
          ? { ...document, status: 'approved', rejectionReason: '', reviewedAt: new Date().toISOString() }
          : document
      )
    )
  }, [])

  const rejectDocument = useCallback((id, reason) => {
    setDocuments((prev) =>
      prev.map((document) =>
        document.id === id
          ? {
              ...document,
              status: 'rejected',
              rejectionReason: reason,
              reviewedAt: new Date().toISOString()
            }
          : document
      )
    )
  }, [])

  const getDivision = useCallback((id) => DIVISIONS.find((d) => d.id === id), [])

  const stats = useMemo(() => {
    const total = documents.length
    const pending = documents.filter((document) => document.status === 'pending').length
    const approved = documents.filter((document) => document.status === 'approved').length
    const rejected = documents.filter((document) => document.status === 'rejected').length

    const perDivision = DIVISIONS.map((division) => {
      const divisionDocuments = documents.filter((document) => document.divisionId === division.id)
      return {
        name: division.shortName,
        id: division.id,
        total: divisionDocuments.length,
        approved: divisionDocuments.filter((document) => document.status === 'approved').length,
        pending: divisionDocuments.filter((document) => document.status === 'pending').length,
        rejected: divisionDocuments.filter((document) => document.status === 'rejected').length
      }
    })

    const statusDistribution = [
      { name: 'Approved', value: approved, color: '#00A99D' },
      { name: 'Pending', value: pending, color: '#F5A623' },
      { name: 'Rejected', value: rejected, color: '#E15554' }
    ]

    const totalPagu = budgetData.totalPagu
    const totalRealisasi = budgetData.totalRealisasi
    const totalSisa = Math.max(totalPagu - totalRealisasi, 0)
    const realisasiPercent = totalPagu ? (totalRealisasi / totalPagu) * 100 : 0
    const sisaPercent = totalPagu ? (totalSisa / totalPagu) * 100 : 0
    const budget = {
      ...budgetData,
      totalPagu,
      totalRealisasi,
      totalSisa,
      realisasiPercent,
      sisaPercent
    }

    const documentTotal = documents.length
    const documentPending = documents.filter((document) => document.status === 'pending').length
    const documentApproved = documents.filter((document) => document.status === 'approved').length
    const documentRejected = documents.filter((document) => document.status === 'rejected').length
    const documentsByDivision = DIVISIONS.map((division) => {
      const divisionDocuments = documents.filter((document) => document.divisionId === division.id)
      return {
        id: division.id,
        name: division.name,
        shortName: division.shortName,
        total: divisionDocuments.length,
        approved: divisionDocuments.filter((document) => document.status === 'approved').length,
        pending: divisionDocuments.filter((document) => document.status === 'pending').length,
        rejected: divisionDocuments.filter((document) => document.status === 'rejected').length
      }
    })

    const documentsByCategory = DOCUMENT_STRUCTURE.flatMap((division) =>
      division.categories.map((category) => {
        const categoryDocuments = documents.filter(
          (document) => document.divisionId === division.divisionId && document.categoryId === category.id
        )

        return {
          divisionId: division.divisionId,
          divisionName: division.title,
          categoryId: category.id,
          categoryName: category.name,
          total: categoryDocuments.length,
          approved: categoryDocuments.filter((document) => document.status === 'approved').length,
          pending: categoryDocuments.filter((document) => document.status === 'pending').length,
          rejected: categoryDocuments.filter((document) => document.status === 'rejected').length
        }
      })
    )

    const latestDocuments = [...documents]
      .sort((a, b) => new Date(b.uploadedAt || b.documentDate) - new Date(a.uploadedAt || a.documentDate))
      .slice(0, 8)

    const recentActivity = [...documents]
      .sort((a, b) => new Date(b.uploadedAt || b.documentDate) - new Date(a.uploadedAt || a.documentDate))
      .slice(0, 10)
      .map((document) => ({
        id: document.id,
        title: document.title,
        status: document.status,
        divisionId: document.divisionId,
        categoryId: document.categoryId,
        date: document.uploadedAt || document.documentDate,
        type: 'document'
      }))

    return {
      total,
      pending,
      approved,
      rejected,
      perDivision,
      statusDistribution,
      totalDivisions: DIVISIONS.length,
      budget,
      documentTotal,
      documentPending,
      documentApproved,
      documentRejected,
      documentsByDivision,
      documentsByCategory,
      latestDocuments,
      recentActivity
    }
  }, [budgetData, content, documents])

  const value = {
    divisions: DIVISIONS,
    documentStructure: DOCUMENT_STRUCTURE,
    content,
    documents,
    addContent,
    updateStatus,
    deleteContent,
    getDivision,
    getDocumentDivision,
    getDocumentCategory,
    getDocumentCategories,
    addDocument,
    updateDocument,
    deleteDocument,
    approveDocument,
    rejectDocument,
    stats
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
