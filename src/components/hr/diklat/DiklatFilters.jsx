import { IconCalendar, IconSearch, IconTableList } from '../../icons/DuotoneIcons'
import { FilterSelect } from '../bezetting/BezettingFilters'

const VIEWS = [
  { id: 'calendar', label: 'Kalender', icon: IconCalendar },
  { id: 'list', label: 'Daftar', icon: IconTableList }
]

// Pencarian realtime + filter Jenis, Metode, Bulan, Penyelenggara, dan pilihan
// tampilan Kalender | Daftar. Semua filter menyaring kartu, kalender, dan daftar.
export function DiklatFilters({ filters, options, view, onChange, onViewChange }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })
  return (
    <section className="grid shrink-0 items-center gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))_auto] fit:gap-2.5">
      <div className="min-w-0 sm:col-span-2 md:col-span-4 xl:col-span-1">
        <label htmlFor="diklat-search" className="sr-only">Cari nama diklat atau penyelenggara</label>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8aa8]" />
          <input
            id="diklat-search"
            type="search"
            value={filters.search}
            onChange={(event) => set('search')(event.target.value)}
            placeholder="Cari nama diklat / penyelenggara..."
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-[#d6dfec] bg-white pl-9 pr-3 text-sm text-[#12305f] outline-none focus:border-[#2f7fe8]"
          />
        </div>
      </div>
      <FilterSelect id="diklat-section" label="Jenis Diklat" value={filters.section} options={options.sections.map((section) => ({ value: section.id, label: section.label }))} onChange={set('section')} inset />
      <FilterSelect id="diklat-method" label="Metode" value={filters.method} options={options.methods} onChange={set('method')} inset />
      <FilterSelect id="diklat-month" label="Bulan" value={filters.month} options={options.months} onChange={set('month')} inset />
      <FilterSelect id="diklat-organizer" label="Penyelenggara" value={filters.organizer} options={options.organizers} onChange={set('organizer')} inset />
      <div role="group" aria-label="Tampilan" className="flex h-11 gap-1 rounded-xl bg-[#eef2f8] p-1 sm:col-span-2 md:col-span-4 xl:col-span-1">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            aria-pressed={view === id}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-bold transition-colors ${view === id ? 'bg-[#1d5fd0] text-white shadow-sm' : 'text-[#3f557d] hover:bg-white'}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}
