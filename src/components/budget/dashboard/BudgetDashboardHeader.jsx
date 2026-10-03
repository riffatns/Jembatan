import { IconCalendar, IconChevronDown, IconDatabase } from '../../icons/DuotoneIcons'
import { UserAccountMenu } from '../../layout/UserAccountMenu'

// Pemilih tahun anggaran: daftar TA yang punya Master Data. Tidak ada filter
// bulan; bulan hanya keterangan periode laporan yang sedang tampil.
function FiscalYearPicker({ years, fiscalYear, periodName, onChange }) {
  const options = years.length ? years : fiscalYear ? [fiscalYear] : []

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e1e8f4] bg-white/90 py-2 pl-3 pr-4 shadow-[0_10px_28px_-14px_rgba(18,48,95,0.22)] fit:py-1.5 tall:py-2.5">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e7f0fd] text-[#1e4f8f] fit:h-9 fit:w-9 tall:h-10 tall:w-10">
        <IconCalendar className="h-5 w-5" />
      </span>
      <div>
        <label htmlFor="budget-fiscal-year" className="block text-[11px] font-semibold tracking-[0.06em] text-[#3f557d]">
          TAHUN ANGGARAN
        </label>
        <div className="flex items-baseline gap-2">
          <div className="relative">
            <select
              id="budget-fiscal-year"
              value={fiscalYear || ''}
              onChange={(event) => onChange?.(Number(event.target.value))}
              disabled={!options.length}
              className="cursor-pointer appearance-none bg-transparent pr-7 text-2xl font-extrabold leading-tight text-[#12305f] outline-none disabled:cursor-default fit:text-xl tall:text-2xl"
            >
              {options.length ? options.map((year) => <option key={year} value={year}>{year}</option>) : <option value="">-</option>}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-[#12305f]" />
          </div>
          {periodName && <span className="whitespace-nowrap text-xs font-medium text-[#7a8aa8]">s.d. {periodName}</span>}
        </div>
      </div>
    </div>
  )
}

// Kepala halaman bertema jembatan: foto jembatan dibuat samar di sisi kanan.
// Margin negatif menetralkan padding <main> supaya latarnya selebar konten.
// Tanpa overflow-hidden dan dengan z-20, supaya menu akun yang terbuka ke bawah
// tidak terpotong header dan tampil di atas kartu.
// Dipakai Dashboard Keuangan, menu akun 51/52/53, dan Master Data.
export function BudgetDashboardHeader({
  title = 'REALISASI ANGGARAN',
  subtitle = 'BPK PERWAKILAN PROVINSI PAPUA BARAT DAYA',
  icon: Icon = IconDatabase,
  years = [],
  fiscalYear,
  periodName,
  onFiscalYearChange,
  showYearPicker = true
}) {
  return (
    <header className="relative z-20 -mx-4 -mt-4 shrink-0 bg-gradient-to-b from-[#f6f9ff] to-[#eef4fb] px-4 py-4 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8 fit:py-2.5 tall:py-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[30%] right-0 bg-[url('/background-jembatan.jpeg')] bg-cover bg-[center_62%] opacity-[0.16] [mask-image:linear-gradient(90deg,transparent_0%,#000_45%)]"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4 fit:flex-nowrap">
        <div className="flex min-w-0 items-center gap-4">
          <div
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#3b8cf2] to-[#1556c4] text-white shadow-[0_10px_24px_-8px_rgba(21,86,196,0.55)] fit:h-12 fit:w-12 fit:rounded-xl tall:h-[68px] tall:w-[68px] tall:rounded-[18px]"
          >
            <Icon className="h-7 w-7 fit:h-6 fit:w-6 tall:h-9 tall:w-9" />
          </div>
          <div className="min-w-0">
            <h1 className="text-balance text-[26px] font-black leading-[1.05] tracking-[0.01em] text-[#12305f] sm:text-[32px] fit:whitespace-nowrap fit:text-[26px] fitwide:text-[28px] tall:text-[40px]">
              {title}
            </h1>
            <p className="mt-1 text-[11px] font-medium tracking-[0.14em] text-[#2f5fa8] sm:text-[13px] fit:whitespace-nowrap fit:text-[11px] tall:text-[14px]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 fit:flex-nowrap fit:gap-2.5">
          {showYearPicker && (
            <FiscalYearPicker years={years} fiscalYear={fiscalYear} periodName={periodName} onChange={onFiscalYearChange} />
          )}
          <UserAccountMenu />
        </div>
      </div>
    </header>
  )
}
