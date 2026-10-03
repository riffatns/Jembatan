import { formatPercent, formatRupiah, formatTableBillion } from '../../../lib/budgetFormat'
import { IconTableList } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DataTable } from '../../data-table/DataTable'
import { STATUS_STYLES } from './accountModel'

function AbsorptionChip({ account }) {
  const style = STATUS_STYLES[account.status]
  return (
    <span className="inline-block min-w-[72px] rounded-md px-2 py-0.5 font-bold" style={{ backgroundColor: style.chipBg, color: style.chipText }}>
      {formatPercent(account.absorption, 2)}
    </span>
  )
}

const COLUMNS = [
  { key: 'code', label: 'Kode Akun', align: 'center', width: 'w-[11%]', className: 'font-bold' },
  { key: 'name', label: 'Uraian', align: 'left' },
  { key: 'pagu', label: 'Pagu', align: 'center', width: 'w-[13%]', text: (row) => formatTableBillion(row.pagu), title: (row) => formatRupiah(row.pagu) },
  { key: 'realisasi', label: 'Realisasi', align: 'center', width: 'w-[13%]', text: (row) => formatTableBillion(row.realisasi), title: (row) => formatRupiah(row.realisasi) },
  { key: 'absorption', label: '%', align: 'center', width: 'w-[11%]', text: (row) => formatPercent(row.absorption, 2), render: (row) => <AbsorptionChip account={row} /> },
  { key: 'sisa', label: 'Sisa', align: 'center', width: 'w-[13%]', text: (row) => formatTableBillion(row.sisa), title: (row) => formatRupiah(row.sisa) }
]

// Semua akun kelompok ini lewat DataTable global: pencarian realtime,
// urut per kolom (bawaan pagu terbesar), maksimal 20 baris per halaman.
export function AccountDetailTable({ accounts }) {
  return (
    <div className={CARD_CLASS}>
      <DataTable
        rows={accounts}
        columns={COLUMNS}
        getRowKey={(row) => row.code}
        initialSort={{ key: 'pagu', direction: 'desc' }}
        itemLabel="akun"
        searchPlaceholder="Cari kode akun, uraian, atau angka..."
        title={(
          <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
            <IconTableList className="h-5 w-5 text-[#2f7fe8]" />
            Rincian Akun Utama
          </h2>
        )}
      />
    </div>
  )
}
