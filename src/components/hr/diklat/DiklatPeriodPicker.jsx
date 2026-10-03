import { IconCalendar, IconChevronDown } from '../../icons/DuotoneIcons'
import { periodYears, quartersOfYear, quarterLabel } from './diklatModel'

const ROMAN = ['I', 'II', 'III', 'IV']
const CHIP = 'flex items-center gap-2 rounded-2xl bg-white/90 py-1.5 pl-3 pr-2 shadow-[0_10px_28px_-14px_rgba(18,48,95,0.22)]'
const SELECT = 'cursor-pointer appearance-none bg-transparent pr-6 text-sm font-bold text-[#12305f] outline-none'

function Picker({ id, label, value, onChange, children }) {
  return (
    <div className="relative">
      <label htmlFor={id} className="block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#5a6f93]">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={SELECT}>{children}</select>
      <IconChevronDown className="pointer-events-none absolute bottom-0.5 right-0 h-4 w-4 text-[#12305f]" />
    </div>
  )
}

// Pilihan Tahun (TA) dan Triwulan di kepala Kalender Diklat. Hanya tahun dan
// triwulan yang punya data aktif yang muncul; "Semua triwulan" menggabungkan
// semua triwulan aktif pada tahun itu.
export function DiklatPeriodPicker({ partitions, year, quarter, onChange }) {
  const years = periodYears(partitions)
  const quarters = quartersOfYear(partitions, year)
  if (years.length === 1 && quarters.length === 1) {
    return <span className={`${CHIP} py-2 pr-3 text-sm font-bold text-[#12305f]`}><IconCalendar className="h-5 w-5 text-[#1d5fd0]" />{quarterLabel(quarters[0], year)}</span>
  }
  return (
    <div className={CHIP}>
      <IconCalendar className="h-5 w-5 shrink-0 text-[#1d5fd0]" />
      <Picker id="diklat-year" label="Tahun" value={year} onChange={(value) => onChange({ year: Number(value), quarter: 'all' })}>
        {years.map((option) => <option key={option} value={option}>{option}</option>)}
      </Picker>
      <span className="h-8 w-px bg-[#e1e8f4]" aria-hidden="true" />
      <Picker id="diklat-quarter" label="Triwulan" value={quarter} onChange={(value) => onChange({ year, quarter: value === 'all' ? 'all' : Number(value) })}>
        <option value="all">Semua triwulan ({quarters.length})</option>
        {quarters.map((option) => <option key={option} value={option}>Triwulan {ROMAN[option - 1]}</option>)}
      </Picker>
    </div>
  )
}
