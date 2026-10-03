import { useId } from 'react'
import { IconChevronDown } from '../icons/DuotoneIcons'
import { TablePagination } from './TablePagination'
import { columnText, useDataTable } from './useDataTable'

const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' }
const JUSTIFY = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }
const CELL = 'whitespace-nowrap border-t border-[#e8edf5] px-3 py-2 text-[13px] tabular-nums text-[#12305f]'
const DENSE_CELL = 'whitespace-nowrap border-t border-[#e8edf5] px-2 py-1 text-[12.5px] tabular-nums text-[#12305f]'
const HEAD = 'bg-[#e6eefb] px-3 py-2 text-[13px] font-bold text-[#12305f]'
const DENSE_HEAD = 'bg-[#e6eefb] px-2 py-1.5 text-[12.5px] font-bold text-[#12305f]'

function SortHeader({ column, sort, onSort, dense }) {
  const head = dense ? DENSE_HEAD : HEAD
  const align = column.align || 'left'
  const active = sort.key === column.key
  if (column.sortable === false) {
    return <th className={`${column.width || ''} ${ALIGN[align]} ${head}`}>{column.label}</th>
  }
  return (
    <th
      className={`${column.width || ''} ${head}`}
      aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" onClick={() => onSort(column.key)} className={`flex w-full cursor-pointer items-center gap-1 ${JUSTIFY[align]} hover:text-[#1f63d3]`}>
        {column.label}
        <IconChevronDown className={`h-4 w-4 shrink-0 transition-transform ${active ? 'text-[#1f63d3]' : 'text-[#a9b6cc]'} ${active && sort.direction === 'asc' ? 'rotate-180' : ''}`} />
      </button>
    </th>
  )
}

// Tabel global ala DataTables: pencarian realtime di semua kolom, klik judul
// kolom untuk mengurutkan, dan pagination. Tinggi mengikuti jumlah baris
// (tanpa scroll di dalam kartu). Lihat CLAUDE.md, bagian Modul bersama.
//
// columns: [{ key, label, align?, width?, sortable?, value?(row), text?(row),
//             render?(row), title?(row), className? }]
export function DataTable({
  rows,
  columns,
  getRowKey,
  initialSort,
  pageSize,
  title,
  itemLabel = 'baris',
  searchPlaceholder = 'Cari...',
  minWidth = 'min-w-[720px]',
  searchable = true,
  paginated = true,
  dense = false
}) {
  const cell = dense ? DENSE_CELL : CELL
  const table = useDataTable({ rows, columns, initialSort, pageSize: paginated ? pageSize : Number.MAX_SAFE_INTEGER })
  const searchId = useId()

  return (
    <div>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${title || searchable ? 'mb-3' : ''}`}>
        <div className="min-w-0">{title}</div>
        {searchable && <label htmlFor={searchId} className="sr-only">{searchPlaceholder}</label>}
        {searchable && <input
          id={searchId}
          type="search"
          value={table.query}
          onChange={(event) => table.setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          autoComplete="off"
          className="w-full max-w-xs rounded-xl border border-[#d6dfec] bg-white px-3 py-2 text-sm text-[#12305f] outline-none focus:border-[#2f7fe8]"
        />}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e1e8f4]">
        <table className={`w-full ${minWidth} border-collapse`}>
          <thead>
            <tr>{columns.map((column) => <SortHeader key={column.key} column={column} sort={table.sort} onSort={table.toggleSort} dense={dense} />)}</tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={getRowKey ? getRowKey(row) : index} className="hover:bg-[#f7faff]">
                {columns.map((column) => (
                  <td key={column.key} className={`${cell} ${ALIGN[column.align || 'left']} ${column.className || ''}`} title={column.title?.(row)}>
                    {column.render ? column.render(row) : columnText(column, row)}
                  </td>
                ))}
              </tr>
            ))}
            {!table.rows.length && (
              <tr>
                <td colSpan={columns.length} className={`${cell} text-center text-slate-500`}>
                  {table.query ? `Tidak ada ${itemLabel} yang cocok dengan "${table.query}".` : `Belum ada ${itemLabel}.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {paginated && <TablePagination
        page={table.page}
        pageCount={table.pageCount}
        onPage={table.setPage}
        firstIndex={table.firstIndex}
        lastIndex={table.lastIndex}
        total={table.total}
        totalAll={table.totalAll}
        itemLabel={itemLabel}
      />}
    </div>
  )
}
