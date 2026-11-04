import { Download, Eye, Pencil, Trash2 } from 'lucide-react'
import { formatDate, formatFileSize } from '../../lib/utils'
import { StatusBadge } from './StatusBadge'
import { Badge } from '../ui/badge'
import { DEFAULT_ARCHIVE_STATUS, getArchiveStatusMeta, isArchiveCategory } from '../../data/archiveStatus'
import { Button } from '../ui/button'

// Kolom hanya berjajar mulai xl: di bawah itu ruang sesudah sidebar tidak cukup
// untuk lima kolom, dan isinya saling menimpa. Nomor dokumen lebih panjang dari
// perkiraan (mis. 01/SP/SRG.PPK.2/10/2026), jadi selnya wajib bisa dilipat.
const ROW_GRID = 'xl:grid-cols-[minmax(0,1fr)_200px_56px_72px_156px]'

function MetaCell({ label, children }) {
  return (
    <div className="min-w-0 break-words text-sm text-slate-600">
      <span className="font-semibold xl:hidden">{label}: </span>
      {children}
    </div>
  )
}

function ActionButton({ label, icon: Icon, onClick, className }) {
  return (
    <Button size="icon" variant="ghost" title={label} aria-label={label} onClick={onClick} className={className}>
      <Icon className="h-4 w-4" />
    </Button>
  )
}

export function DocumentTable({
  documents,
  categoryName,
  onView,
  onEdit,
  onDelete,
  onDownload,
  canEditDocument = false,
  canDeleteDocument = false,
  canDownload = false
}) {
  if (!documents.length) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
        <p className="font-medium text-slate-500">Belum ada dokumen</p>
        <p className="mt-1 text-sm text-slate-400">{categoryName || 'Kategori ini'} masih kosong.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className={`hidden gap-4 border-b border-slate-100 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 xl:grid ${ROW_GRID}`}>
        <div>Dokumen</div>
        <div>Nomor</div>
        <div>Tahun</div>
        <div>Ukuran</div>
        <div className="text-right">Aksi</div>
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((document) => {
          const editAllowed = typeof canEditDocument === 'function' ? canEditDocument(document) : canEditDocument
          const deleteAllowed = typeof canDeleteDocument === 'function' ? canDeleteDocument(document) : canDeleteDocument
          const archiveMeta = isArchiveCategory(document.categoryId)
            ? getArchiveStatusMeta(document.archiveStatus || DEFAULT_ARCHIVE_STATUS)
            : null

          return (
            <div key={document.id} className={`grid gap-3 px-5 py-4 xl:items-center xl:gap-4 ${ROW_GRID}`}>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="min-w-0 break-words font-semibold text-navy">{document.title}</p>
                  <StatusBadge status={document.status} />
                  {archiveMeta && (
                    <Badge variant={archiveMeta.badge} className="gap-1">
                      <archiveMeta.icon className="h-3 w-3" /> Arsip {archiveMeta.label}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500">{document.description}</p>
                <p className="mt-1 flex min-w-0 gap-1 text-xs text-slate-400">
                  <span className="truncate" title={document.fileName}>{document.fileName}</span>
                  <span className="shrink-0">· {formatDate(document.documentDate || document.uploadedAt)}</span>
                </p>
              </div>

              <MetaCell label="Nomor">{document.documentNumber || '-'}</MetaCell>
              <MetaCell label="Tahun">{document.year || '-'}</MetaCell>
              <MetaCell label="Ukuran">{formatFileSize(document.fileSize)}</MetaCell>

              {/* Ikon saja, supaya empat aksi muat satu baris dan tidak menumpuk
                  tiga tingkat. Namanya tetap ada di tooltip dan pembaca layar. */}
              <div className="flex items-center justify-start gap-1 xl:justify-end">
                <ActionButton label="Lihat dokumen" icon={Eye} onClick={() => onView(document)} />
                {canDownload && <ActionButton label="Unduh dokumen" icon={Download} onClick={() => onDownload(document)} />}
                {editAllowed && <ActionButton label="Ubah dokumen" icon={Pencil} onClick={() => onEdit(document)} />}
                {deleteAllowed && (
                  <ActionButton label="Hapus dokumen" icon={Trash2} onClick={() => onDelete(document)} className="text-red-600 hover:text-red-700" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
