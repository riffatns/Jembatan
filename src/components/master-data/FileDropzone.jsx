import { useState } from 'react'
import { IconUpload } from '../icons/DuotoneIcons'

// Kotak pilih/seret berkas untuk halaman Master Data (bawaan Excel). Validasi
// jenis dan ukuran dilakukan pemanggil (validateExcelFile / validatePdfFile).
// disabled: selama berkas diproses, supaya tidak ada dua berkas berjalan bersamaan.
export function FileDropzone({ id, file, onFile, hint, accept = '.xlsx,.xls', label = 'Pilih atau seret berkas Excel', disabled = false }) {
  const [dragging, setDragging] = useState(false)

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); if (!disabled) onFile(event.dataTransfer.files?.[0]) }}
      aria-disabled={disabled}
      className={`flex flex-col ${disabled ? 'pointer-events-none cursor-wait opacity-60' : 'cursor-pointer'} items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors fit:py-4 ${dragging ? 'border-[#2f7fe8] bg-[#eef4fd]' : 'border-[#c9d6ea] bg-[#f8fbff] hover:border-[#2f7fe8]'}`}
    >
      <IconUpload className="h-9 w-9 text-[#2f7fe8]" />
      <span className="text-sm font-bold text-[#12305f]">{file ? file.name : label}</span>
      {hint && <span className="text-xs text-[#7a8aa8]">{hint}</span>}
      {/* value dikosongkan agar memilih berkas yang sama sekali lagi tetap terbaca. */}
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFile(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </label>
  )
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_FILE = /\.(xlsx|xls)$/i

// Pesan galat bila berkas bukan Excel atau lebih dari 5 MB; null bila aman.
export function validateExcelFile(file) {
  if (!ALLOWED_FILE.test(file?.name || '')) return 'Berkas harus berformat Excel (.xlsx atau .xls).'
  if (file.size > MAX_FILE_SIZE) return 'Ukuran berkas melebihi 5 MB.'
  return null
}

const PDF_TYPES = ['application/pdf', 'application/x-pdf', '']

// Pemeriksaan awal PDF: ekstensi, MIME, dan ukuran. Isi (tanda %PDF-) dicek
// dengan isPdfSignature setelah berkas dibaca.
export function validatePdfFile(file) {
  if (!/\.pdf$/i.test(file?.name || '') || !PDF_TYPES.includes(file.type || '')) return 'Berkas harus berformat PDF (.pdf) dari aplikasi sumber.'
  if (file.size > MAX_FILE_SIZE) return 'Ukuran berkas melebihi 5 MB.'
  return null
}

export function isPdfSignature(bytes) {
  return bytes?.length > 5 && String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
}
