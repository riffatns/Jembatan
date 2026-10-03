import { useMemo, useState } from 'react'

export const DEFAULT_PAGE_SIZE = 20

// Nilai untuk mengurutkan dan teks untuk mencari, per kolom. Kolom bisa
// memberi `value(row)` dan `text(row)` sendiri; bawaannya row[column.key].
export function columnValue(column, row) {
  return column.value ? column.value(row) : row[column.key]
}

export function columnText(column, row) {
  if (column.text) return column.text(row)
  const value = columnValue(column, row)
  return value === null || value === undefined ? '' : String(value)
}

function compareValues(a, b) {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a ?? '').localeCompare(String(b ?? ''), 'id', { numeric: true, sensitivity: 'base' })
}

// Pencarian, pengurutan, dan pagination untuk tabel, meniru DataTables:
// - pencarian realtime di semua kolom yang terlihat (teks yang tampil, jadi
//   "69,95" atau "Miliar" pun ketemu); beberapa kata = semuanya harus ada;
// - klik kolom yang sama membalik arah urutan;
// - ganti kata kunci atau urutan selalu kembali ke halaman pertama.
export function useDataTable({ rows, columns, initialSort, pageSize = DEFAULT_PAGE_SIZE }) {
  const [query, setQueryState] = useState('')
  const [sort, setSort] = useState(initialSort || { key: columns[0]?.key, direction: 'asc' })
  const [page, setPage] = useState(1)

  const searchIndex = useMemo(
    () => rows.map((row) => columns.map((column) => columnText(column, row)).join(' ').toLowerCase()),
    [rows, columns]
  )

  const filtered = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matches = terms.length
      ? rows.filter((_, index) => terms.every((term) => searchIndex[index].includes(term)))
      : rows
    const column = columns.find((item) => item.key === sort.key)
    if (!column) return matches
    const sign = sort.direction === 'asc' ? 1 : -1
    return [...matches].sort((a, b) => sign * compareValues(columnValue(column, a), columnValue(column, b)))
  }, [rows, columns, searchIndex, query, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const pageRows = filtered.slice(start, start + pageSize)

  const setQuery = (value) => {
    setQueryState(value)
    setPage(1)
  }

  // Kolom baru mulai dari terbesar untuk angka, A-Z untuk teks.
  const toggleSort = (key) => {
    const column = columns.find((item) => item.key === key)
    const numeric = column && rows.length > 0 && typeof columnValue(column, rows[0]) === 'number'
    setSort((current) => (current.key === key
      ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { key, direction: numeric ? 'desc' : 'asc' }))
    setPage(1)
  }

  return {
    query,
    setQuery,
    sort,
    toggleSort,
    rows: pageRows,
    total: filtered.length,
    totalAll: rows.length,
    page: currentPage,
    pageCount,
    setPage,
    firstIndex: filtered.length ? start + 1 : 0,
    lastIndex: start + pageRows.length
  }
}
