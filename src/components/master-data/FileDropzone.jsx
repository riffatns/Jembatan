import { useState } from 'react'
import { IconUpload } from '../icons/DuotoneIcons'

// Kotak pilih/seret berkas Excel untuk halaman Master Data. Validasi jenis
// dan ukuran dilakukan pemanggil (lihat validateExcelFile).
export function FileDropzone({ id, file, onFile, hint, accept = '.xlsx,.xls' }) {
  const [dragging, setDragging] = useState(false)

  return (
    <label
      htmlFor={id}
      onDragOver={(event) => { event.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); onFile(event.dataTransfer.files?.[0]) }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition-colors fit:py-4 ${dragging ? 'border-[#2f7fe8] bg-[#eef4fd]' : 'border-[#c9d6ea] bg-[#f8fbff] hover:border-[#2f7fe8]'}`}
    >
      <IconUpload className="h-9 w-9 text-[#2f7fe8]" />
      <span className="text-sm font-bold text-[#12305f]">{file ? file.name : 'Pilih atau seret berkas Excel'}</span>
      {hint && <span className="text-xs text-[#7a8aa8]">{hint}</span>}
      <input id={id} type="file" accept={accept} className="sr-only" onChange={(event) => onFile(event.target.files?.[0])} />
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
