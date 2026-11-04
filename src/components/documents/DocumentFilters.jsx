import { Search, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import { Input } from '../ui/input'

export function DocumentFilters({
  search,
  onSearchChange,
  year,
  onYearChange,
  categoryId,
  onCategoryChange,
  categories = [],
  years = []
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_140px_240px_auto]">
      <div className="relative min-w-0 sm:col-span-2 xl:col-span-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari judul, nomor, deskripsi, atau berkas..."
          className="pl-9"
        />
      </div>

      <Select value={year} onChange={(event) => onYearChange(event.target.value)} aria-label="Filter tahun">
        <option value="all">Semua Tahun</option>
        {years.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>

      <Select value={categoryId} onChange={(event) => onCategoryChange(event.target.value)} aria-label="Filter layanan">
        <option value="all">Semua Layanan</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      <Button type="button" variant="outline" onClick={() => onSearchChange('')} className="justify-center sm:col-span-2 xl:col-span-1">
        <X className="h-4 w-4" /> Bersihkan
      </Button>
    </div>
  )
}
