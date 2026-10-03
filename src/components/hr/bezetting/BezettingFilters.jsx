import { IconChevronDown, IconSearch } from '../../icons/DuotoneIcons'

const SELECT = 'h-10 w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-[#d6dfec] bg-white pl-3 pr-8 text-sm text-[#12305f] outline-none focus:border-[#2f7fe8]'

function FilterSelect({ id, label, value, options, onChange }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]">{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={SELECT}>
          <option value="">Semua</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3f557d]" />
      </div>
    </div>
  )
}

// Pencarian realtime + tiga filter. Menyaring kartu Total/L-P, grafik
// komposisi, dan Daftar Pegawai; bagian formasi ABK tidak ikut tersaring.
export function BezettingFilters({ filters, options, onChange }) {
  const set = (key) => (value) => onChange({ ...filters, [key]: value })
  return (
    <section className="grid shrink-0 items-end gap-3 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] fit:gap-2.5">
      <div className="min-w-0">
        <label htmlFor="bezetting-search" className="sr-only">Cari pegawai atau unit kerja</label>
        <div className="relative">
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a8aa8]" />
          <input
            id="bezetting-search"
            type="search"
            value={filters.query}
            onChange={(event) => set('query')(event.target.value)}
            placeholder="Cari pegawai / unit kerja..."
            autoComplete="off"
            className="h-10 w-full rounded-xl border border-[#d6dfec] bg-white pl-9 pr-3 text-sm text-[#12305f] outline-none focus:border-[#2f7fe8]"
          />
        </div>
      </div>
      <FilterSelect id="bezetting-unit" label="Unit Kerja" value={filters.unit} options={options.units} onChange={set('unit')} />
      <FilterSelect id="bezetting-education" label="Pendidikan" value={filters.education} options={options.education} onChange={set('education')} />
      <FilterSelect id="bezetting-golongan" label="Golongan" value={filters.golongan} options={options.golongan} onChange={set('golongan')} />
    </section>
  )
}
