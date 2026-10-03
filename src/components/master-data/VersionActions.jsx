import { IconDownload, IconTrash } from '../icons/DuotoneIcons'

const ICON_BUTTON = 'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-35'

// Kolom Aksi riwayat Master Data: ikon Unduh Berkas dan Hapus tanpa teks.
// Nama aksi tetap dibacakan pembaca layar (aria-label) dan muncul sebagai tooltip.
// Baris tanpa berkas (kosongkan/hapus TA) tidak punya tombol unduh.
export function VersionActions({ row, label, hasFile, downloading, onDownload, onDelete }) {
  const downloadTitle = row.sourceFilePath ? 'Unduh berkas' : 'Berkas asli tidak tersimpan (unggahan sebelum fitur ini)'
  return (
    <div className="flex items-center justify-end gap-0.5">
      {hasFile ? (
        <button
          type="button"
          onClick={() => onDownload(row)}
          disabled={!row.sourceFilePath || downloading}
          title={downloadTitle}
          aria-label={`Unduh berkas ${label}`}
          className={`${ICON_BUTTON} text-[#1d5fd0] hover:bg-[#e6eefb]`}
        >
          <IconDownload className={`h-[18px] w-[18px] ${downloading ? 'animate-pulse' : ''}`} />
        </button>
      ) : <span className="h-8 w-8" aria-hidden="true" />}
      <button
        type="button"
        onClick={() => onDelete(row)}
        title="Hapus"
        aria-label={`Hapus ${label}`}
        className={`${ICON_BUTTON} text-[#c0262d] hover:bg-[#fde2e2]`}
      >
        <IconTrash className="h-[18px] w-[18px]" />
      </button>
    </div>
  )
}
