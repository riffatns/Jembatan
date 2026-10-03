import { IconChevronDown, IconSearch } from '../../icons/DuotoneIcons'

const SELECT = 'w-full min-w-0 cursor-pointer appearance-none rounded-xl border border-[#d6dfec] bg-white pl-3 pr-8 text-[#12305f] outline-none focus:border-[#2f7fe8]'

// options: teks, atau { value, label }. inset = label kecil di dalam kotak
// (lebih pendek satu baris). Dipakai juga Kalender Diklat.
export function FilterSelect({ id, label, value, options, onChange, allLabel = 'Semua', inset = false }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={inset ? 'pointer-events-none absolute z-10 ml-3 mt-1 whitespace-nowrap text-[10.5px] font-semibold text-[#5a6f93]' : 'mb-1 block whitespace-nowrap text-xs font-semibold text-[#3f557d]'}>{label}</label>
      <div className="relative">
        <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${SELECT} ${inset ? 'h-11 pt-3.5 text-[13px] font-semibold' : 'h-10 text-sm'}`}>
          <option value="">{allLabel}</option>
          {options.map((option) => {
            const { value: optionValue, label: optionLabel } = typeof option === 'object' ? option : { value: option, label: option }
            return <option key={optionValue} value={optionValue}>{optionLabel}</option>
          })}
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
