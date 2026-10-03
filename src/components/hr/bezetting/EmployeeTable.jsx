import { DataTable } from '../../data-table/DataTable'
import { IconUsers } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

const BASE_COLUMNS = [
  { key: 'rowId', label: 'No', align: 'center', width: 'w-[6%]' },
  { key: 'fullName', label: 'Nama', align: 'left', className: 'font-semibold' },
  { key: 'unitKerja', label: 'Unit Kerja', align: 'left' },
  { key: 'jabatan', label: 'Jabatan', align: 'left', text: (row) => row.jabatanFungsional && row.jabatanFungsional !== 'Struktural' ? row.jabatanFungsional : row.jabatan || '-' },
  { key: 'golongan', label: 'Gol', align: 'center', width: 'w-[7%]' },
  { key: 'pendidikan', label: 'Pendidikan', align: 'center', width: 'w-[9%]' },
  { key: 'jenisKelamin', label: 'L/P', align: 'center', width: 'w-[6%]', text: (row) => (row.jenisKelamin === 'Perempuan' ? 'P' : row.jenisKelamin ? 'L' : '-') }
]

// Daftar pegawai hasil filter di atas (pencarian dilakukan di baris filter,
// jadi tabel ini tanpa kotak cari). Kolom NIP hanya muncul untuk admin dan
// pegawai SDM, yang berhak membaca data rinci.
export function EmployeeTable({ employees, details }) {
  const nipByRow = details ? Object.fromEntries(details.map((item) => [item.rowId, item.detail?.['NIP Baru']])) : null
  const columns = nipByRow
    ? [...BASE_COLUMNS.slice(0, 2), { key: 'nip', label: 'NIP', align: 'left', text: (row) => String(nipByRow[row.rowId] ?? '-') }, ...BASE_COLUMNS.slice(2)]
    : BASE_COLUMNS

  return (
    <div className={CARD_CLASS}>
      <DataTable
        rows={employees}
        columns={columns}
        getRowKey={(row) => row.rowId}
        initialSort={{ key: 'rowId', direction: 'asc' }}
        searchable={false}
        itemLabel="pegawai"
        minWidth="min-w-[860px]"
        title={<h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}><IconUsers className="h-5 w-5 text-[#2f7fe8]" />Daftar Pegawai</h2>}
      />
    </div>
  )
}
