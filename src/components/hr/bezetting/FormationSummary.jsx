import { DataTable } from '../../data-table/DataTable'
import { IconAlert, IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

function StatusChip({ status }) {
  const fulfilled = status === 'Terpenuhi'
  return (
    <span className={`inline-block min-w-[96px] rounded-md px-2 py-0.5 text-center text-xs font-bold ${fulfilled ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>
      {status}
    </span>
  )
}

const COLUMNS = [
  { key: 'no', label: 'No', align: 'center', width: 'w-[7%]' },
  { key: 'name', label: 'Kategori', align: 'left', className: '!whitespace-normal leading-tight' },
  { key: 'need', label: 'ABK', align: 'center', width: 'w-[11%]' },
  { key: 'actual', label: 'Riil', align: 'center', width: 'w-[11%]' },
  { key: 'gap', label: 'Selisih', align: 'center', width: 'w-[12%]', render: (row) => <b className={row.gap < 0 ? 'text-[#c0262d]' : ''}>{row.gap}</b> },
  { key: 'status', label: 'Status', align: 'center', width: 'w-[26%]', render: (row) => <StatusChip status={row.status} /> }
]

// Ringkasan formasi per kategori ABK (DataTable tanpa cari dan halaman).
export function FormationSummary({ categories }) {
  return (
    <div className={CARD_CLASS}>
      <DataTable
        rows={categories}
        columns={COLUMNS}
        getRowKey={(row) => row.no}
        initialSort={{ key: 'no', direction: 'asc' }}
        searchable={false}
        paginated={false}
        dense
        minWidth="min-w-0"
        title={<h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconTableList className="h-5 w-5 text-[#2f7fe8]" />Ringkasan Formasi</h2>}
      />
    </div>
  )
}

// Catatan otomatis: kategori dengan kesenjangan terbesar.
export function KeyNote({ largestGaps }) {
  if (!largestGaps.length) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-[#cdeedd] bg-[#eefaf3] p-3 text-[13px] text-[#0b7a4f]">
        <IconAlert className="h-5 w-5 shrink-0" />
        Semua kategori formasi sudah terpenuhi.
      </div>
    )
  }
  const names = largestGaps.map((category) => `${category.name} (${category.gap})`)
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#f8cfcf] bg-[#fff1f1] p-3 text-[13px] text-[#12305f]">
      <IconAlert className="h-5 w-5 shrink-0 text-[#e5484d]" />
      <div>
        <p className="font-bold text-[#c0262d]">Catatan Utama</p>
        <p>Kesenjangan terbesar terdapat pada kategori <b className="text-[#c0262d]">{names.join(' dan ')}</b>.</p>
      </div>
    </div>
  )
}
