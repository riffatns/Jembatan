import { useEffect, useMemo, useState } from 'react'
import { Send, Upload, Paperclip } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { ACCEPTED_DOCUMENT_EXTENSIONS, getAcceptedDocumentFileHint, isDocumentFileAllowed } from '../../lib/documentStorage'
import { ARCHIVE_STATUSES, DEFAULT_ARCHIVE_STATUS, getArchiveStatusMeta, isArchiveCategory } from '../../data/archiveStatus'

const emptyForm = {
  title: '',
  description: '',
  divisionId: '',
  categoryId: '',
  documentNumber: '',
  documentDate: '',
  year: new Date().getFullYear().toString(),
  archiveStatus: DEFAULT_ARCHIVE_STATUS,
  file: null
}

export function DocumentUploadModal({
  open,
  onOpenChange,
  initialDocument = null,
  defaultDivisionId = '',
  defaultCategoryId = '',
  onSubmit
}) {
  const { user, isAdmin, canUploadToDivision } = useAuth()
  const { documentStructure, getDocumentCategories } = useData()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const divisionOptions = documentStructure
  const selectedDivisionId = form.divisionId || defaultDivisionId || user?.division || ''
  const categoryOptions = useMemo(() => getDocumentCategories(selectedDivisionId), [getDocumentCategories, selectedDivisionId])

  useEffect(() => {
    if (!open) return

    if (initialDocument) {
      setForm({
        title: initialDocument.title || '',
        description: initialDocument.description || '',
        divisionId: initialDocument.divisionId || defaultDivisionId || user?.division || '',
        categoryId: initialDocument.categoryId || defaultCategoryId || '',
        documentNumber: initialDocument.documentNumber || '',
        documentDate: initialDocument.documentDate || '',
        year: String(initialDocument.year || new Date().getFullYear()),
        archiveStatus: initialDocument.archiveStatus || DEFAULT_ARCHIVE_STATUS,
        file: null
      })
    } else {
      setForm({
        ...emptyForm,
        divisionId: defaultDivisionId || user?.division || '',
        categoryId: defaultCategoryId || ''
      })
    }
    setError('')
    setSubmitting(false)
  }, [open, initialDocument, defaultDivisionId, defaultCategoryId, user?.division])

  useEffect(() => {
    if (!form.categoryId) return
    const valid = categoryOptions.some((category) => category.id === form.categoryId)
    if (!valid) {
      setForm((current) => ({ ...current, categoryId: categoryOptions[0]?.id || '' }))
    }
  }, [categoryOptions, form.categoryId])

  const handleChange = (key) => (event) => {
    const value = event.target.type === 'file' ? event.target.files?.[0] || null : event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.description.trim() || !form.divisionId || !form.categoryId) {
      setError('Lengkapi nama dokumen, deskripsi, bidang, dan kategori.')
      return
    }

    if (!canUploadToDivision(form.divisionId)) {
      setError('Anda hanya dapat mengunggah dokumen ke divisi sendiri.')
      return
    }

    if (!initialDocument && !form.file) {
      setError('File dokumen wajib diupload.')
      return
    }

    if (form.file && !isDocumentFileAllowed(form.file)) {
      setError(`Format file tidak didukung. Gunakan ${getAcceptedDocumentFileHint()}`)
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onSubmit({
        id: initialDocument?.id,
        title: form.title.trim(),
        description: form.description.trim(),
        divisionId: form.divisionId,
        categoryId: form.categoryId,
        documentNumber: form.documentNumber.trim(),
        documentDate: form.documentDate,
        year: Number(form.year),
        archiveStatus: isArchiveCategory(form.categoryId) ? form.archiveStatus : null,
        file: form.file || undefined,
        uploadedBy: initialDocument?.uploadedBy || user?.name,
        status: initialDocument?.status || 'pending',
        rejectionReason: initialDocument?.rejectionReason || ''
      })
      onOpenChange(false)
    } catch (err) {
      setError(err?.message || 'Gagal menyimpan dokumen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader onClose={() => onOpenChange(false)}>
          <div>
            <DialogTitle>{initialDocument ? 'Edit Dokumen' : 'Upload Dokumen'}</DialogTitle>
            <DialogDescription>
              {initialDocument
                ? 'Perbarui metadata atau ganti file dokumen yang sudah ada.'
                : 'Upload dokumen baru ke bidang dan kategori yang sesuai.'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nama Dokumen</label>
              <Input value={form.title} onChange={handleChange('title')} placeholder="Judul dokumen" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Nomor Dokumen</label>
              <Input value={form.documentNumber} onChange={handleChange('documentNumber')} placeholder="Nomor dokumen" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Deskripsi</label>
            <Textarea value={form.description} onChange={handleChange('description')} placeholder="Deskripsi singkat dokumen" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Bidang</label>
              <Select
                value={form.divisionId}
                onChange={handleChange('divisionId')}
                disabled={!isAdmin && !!user?.division}
              >
                <option value="">Pilih bidang</option>
                {divisionOptions.map((division) => (
                  <option key={division.divisionId} value={division.divisionId}>
                    {division.title}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
              <Select value={form.categoryId} onChange={handleChange('categoryId')} disabled={!selectedDivisionId}>
                <option value="">Pilih kategori</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tahun</label>
              <Input type="number" value={form.year} onChange={handleChange('year')} min="2000" max="2100" />
            </div>
          </div>

          {isArchiveCategory(form.categoryId) && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status Arsip</label>
              <Select value={form.archiveStatus} onChange={handleChange('archiveStatus')}>
                {ARCHIVE_STATUSES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </Select>
              <p className="mt-1.5 text-xs text-slate-500">{getArchiveStatusMeta(form.archiveStatus).description}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal Dokumen</label>
              <Input type="date" value={form.documentDate} onChange={handleChange('documentDate')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">File</label>
              <label className="flex cursor-pointer items-center justify-between rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-teal hover:text-navy">
                <span className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-slate-400" />
                  {form.file ? form.file.name : initialDocument?.fileName || 'Pilih file dokumen'}
                </span>
                <span className="text-xs uppercase tracking-wide text-slate-400">{ACCEPTED_DOCUMENT_EXTENSIONS.join(', ')}</span>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png" onChange={handleChange('file')} />
              </label>
            </div>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="teal" disabled={submitting}>
              <Send className="h-4 w-4" /> {submitting ? 'Saving...' : initialDocument ? 'Update Dokumen' : 'Upload Dokumen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
