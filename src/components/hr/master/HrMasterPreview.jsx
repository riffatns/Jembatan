import { DataTable } from '../../data-table/DataTable'
import { IconInfo, IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { summarizeAbk, summarizeEmployees } from '../bezetting/bezettingModel'

const COLUMNS = [
  { key: 'no', label: 'No', align: 'center', width: 'w-[8%]' },
  { key: 'name', label: 'Kategori ABK', align: 'left' },
  { key: 'need', label: 'ABK', align: 'center', width: 'w-[12%]' },
  { key: 'actual', label: 'Riil', align: 'center', width: 'w-[12%]' },
  { key: 'gap', label: 'Selisih', align: 'center', width: 'w-[12%]' }
]

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#f3f7fd] px-3 py-2">
      <p className="text-[11.5px] font-semibold text-[#3f557d]">{label}</p>
      <p className="text-xl font-extrabold tabular-nums text-[#12305f]">{value}</p>
    </div>
  )
}

// Pratinjau sebelum disimpan: angka inilah yang akan tampil di menu Bezetting.
export function HrMasterPreview({ parsed, periodLabel }) {
  if (!parsed) {
    return (
      <div className={`${CARD_CLASS} items-center justify-center py-6 text-center`}>
        <IconTableList className="h-10 w-10 text-slate-300" />
        <p className="mt-2 max-w-sm text-sm text-slate-500">Pilih berkas Bezetting untuk melihat pratinjau formasi ABK dan komposisi pegawai sebelum disimpan.</p>
      </div>
    )
  }

  const abk = summarizeAbk(parsed.abk)
  const people = summarizeEmployees(parsed.employees)
  const matches = people.total === abk.total.actual

  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconTableList className="h-5 w-5 text-[#2f7fe8]" />Pratinjau {periodLabel || ''}</h2>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="rounded-full bg-[#dcf5e8] px-3 py-1 text-[#0b7a4f]" title="Jumlah setiap kategori, subbagian, dan jabatan sama dengan baris Jumlah di sheet ABK.">✓ Total ABK cocok</span>
          <span className={`rounded-full px-3 py-1 ${matches ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fff1cc] text-[#9a6400]'}`}>
            {matches ? '✓' : '!'} {people.total} pegawai {matches ? '=' : '≠'} riil ABK {abk.total.actual}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Kebutuhan ABK" value={abk.total.need} />
        <Stat label="Jumlah Riil" value={abk.total.actual} />
        <Stat label="Pegawai (L / P)" value={`${people.male} / ${people.female}`} />
        <Stat label="Unit Kerja" value={people.units.length} />
      </div>
      <DataTable rows={abk.categories} columns={COLUMNS} getRowKey={(row) => row.no} initialSort={{ key: 'no', direction: 'asc' }} searchable={false} paginated={false} minWidth="min-w-[480px]" />
      {parsed.warnings.map((warning) => (
        <p key={warning} className="flex items-start gap-2 rounded-xl bg-[#fff6ea] px-3 py-2 text-[13px] text-[#9a4d00]">
          <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />{warning}
        </p>
      ))}
    </div>
  )
}
