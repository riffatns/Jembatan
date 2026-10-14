import { DataTable } from '../../data-table/DataTable'
import { IconInfo, IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { formatCompactRupiah } from '../../../lib/budgetFormat'
import { summarizeParsedAssets } from './assetMasterModel'

const COLUMNS = [
  { key: 'kunci', label: 'Jenis BMN', align: 'left' },
  { key: 'jumlah', label: 'Unit', align: 'center', width: 'w-[14%]' },
  { key: 'nilaiPerolehan', label: 'Nilai Perolehan', align: 'right', width: 'w-[24%]', text: (row) => formatCompactRupiah(row.nilaiPerolehan) },
  { key: 'nilaiBuku', label: 'Nilai Buku', align: 'right', width: 'w-[24%]', text: (row) => formatCompactRupiah(row.nilaiBuku) }
]

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f3f7fd] px-3 py-2">
      <p className="text-[11.5px] font-semibold text-[#3f557d]">{label}</p>
      <p className="truncate text-xl font-extrabold tabular-nums text-[#12305f]" title={String(value)}>{value}</p>
    </div>
  )
}

// Pratinjau sebelum disimpan: angka inilah yang akan tampil di menu Aset dan
// Dashboard Umum dan TI. Kolom yang kosong pada berkas disebut terus terang -
// kondisi dan tanggal perolehan yang kosong tidak menghalangi penyimpanan,
// tetapi membuat kartu "Perlu Perhatian" ikut terisi.
export function AssetMasterPreview({ parsed, periodLabel }) {
  if (!parsed) {
    return (
      <div className={`${CARD_CLASS} items-center justify-center py-6 text-center`}>
        <IconTableList className="h-10 w-10 text-slate-300" />
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Pilih berkas daftar BMN untuk melihat pratinjau jumlah unit dan nilainya sebelum disimpan.
        </p>
      </div>
    )
  }

  const ringkas = summarizeParsedAssets(parsed.assets)
  const seimbang = ringkas.nilaiBuku + ringkas.penyusutan === ringkas.nilaiPerolehan
  const catatan = []
  if (ringkas.tanpaKondisi) catatan.push(`${ringkas.tanpaKondisi} aset belum terisi kondisinya.`)
  if (ringkas.tanpaTanggal) catatan.push(`${ringkas.tanpaTanggal} aset belum terisi tanggal perolehannya.`)
  if (!seimbang) catatan.push('Nilai buku ditambah penyusutan tidak sama dengan nilai perolehan; angka dari berkas tetap dipakai apa adanya.')

  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconTableList className="h-5 w-5 text-[#2f7fe8]" />
          Pratinjau {periodLabel || ''}
        </h2>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-[#dcf5e8] px-3 py-1 text-[#0b7a4f]" title={`Dibaca dari sheet ${parsed.sheetName || '-'}`}>
            ✓ {ringkas.total.toLocaleString('id-ID')} aset terbaca
          </span>
          <span className={`rounded-full px-3 py-1 ${seimbang ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fff1cc] text-[#9a6400]'}`}>
            {seimbang ? '✓' : '!'} buku + penyusutan {seimbang ? '=' : '≠'} perolehan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total Aset" value={ringkas.total.toLocaleString('id-ID')} />
        <Stat label="Nilai Perolehan" value={formatCompactRupiah(ringkas.nilaiPerolehan)} />
        <Stat label="Nilai Buku" value={formatCompactRupiah(ringkas.nilaiBuku)} />
        <Stat label="Belum ber-PSP" value={(ringkas.total - ringkas.berPsp).toLocaleString('id-ID')} />
      </div>

      <DataTable
        rows={ringkas.jenis}
        columns={COLUMNS}
        getRowKey={(row) => row.kunci}
        initialSort={{ key: 'jumlah', direction: 'desc' }}
        searchable={false}
        paginated={false}
        itemLabel="jenis BMN"
        minWidth="min-w-[480px]"
      />

      {catatan.map((teks) => (
        <p key={teks} className="flex items-start gap-2 rounded-xl bg-[#fff6ea] px-3 py-2 text-[13px] text-[#9a4d00]">
          <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />{teks}
        </p>
      ))}
    </div>
  )
}
