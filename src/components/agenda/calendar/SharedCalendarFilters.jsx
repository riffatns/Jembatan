import { IconCalendar, IconSearch, IconTableList } from '../../icons/DuotoneIcons'
import { FilterSelect } from '../../hr/bezetting/BezettingFilters'

const VIEWS = [
  { id: 'calendar', label: 'Kalender', icon: IconCalendar },
  { id: 'list', label: 'Daftar', icon: IconTableList }
]

// Pencarian realtime + filter Bidang, Jenis Kegiatan, Bulan, Status, dan
// pilihan tampilan Kalender | Daftar. Semua ikut menyaring kartu ringkasan,
// kalender, daftar, dan kolom kanan.
//
// Pencariannya menjangkau tempat, penyelenggara, peserta, dan keterangan -
// bukan judul saja - karena pertanyaan yang sering muncul di kalender bersama
// justru "siapa yang pakai Ruang Rapat 2 minggu ini".
export function SharedCalendarFilters({ filters, options, view, onChange, onViewChange }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })

  return (
    <section className="grid shrink-0 items-center gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,1fr))_auto] fit:gap-2.5">
      <div className="min-w-0 sm:col-span-2 md:col-span-4 xl:col-span-1">
        <label htmlFor="agenda-search" className="sr-only">Cari kegiatan, tempat, atau penyelenggara</label>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8aa8]" />
          <input
            id="agenda-search"
            type="search"
            value={filters.search}
            onChange={(event) => set('search')(event.target.value)}
            placeholder="Cari kegiatan / tempat / penyelenggara..."
            autoComplete="off"
            className="h-11 w-full rounded-xl border border-[#d6dfec] bg-white pl-9 pr-3 text-sm text-[#12305f] outline-none focus:border-[#2f7fe8]"
          />
        </div>
      </div>
      <FilterSelect id="agenda-division" label="Bidang" value={filters.division} options={options.divisions} onChange={set('division')} inset />
      <FilterSelect id="agenda-type" label="Jenis Kegiatan" value={filters.type} options={options.types} onChange={set('type')} inset />
      <FilterSelect id="agenda-month" label="Bulan" value={filters.month} options={options.months} onChange={set('month')} inset />
      <FilterSelect id="agenda-status" label="Status" value={filters.status} options={options.statuses} onChange={set('status')} inset />
      <div role="group" aria-label="Tampilan" className="flex h-11 gap-1 rounded-xl bg-[#eef2f8] p-1 sm:col-span-2 md:col-span-4 xl:col-span-1">
        {VIEWS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onViewChange(id)}
            aria-pressed={view === id}
            className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[13px] font-bold transition-colors ${
              view === id ? 'bg-white text-[#1d5fd0] shadow-sm' : 'text-[#5a6f93] hover:text-[#12305f]'
            }`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
    </section>
  )
}
