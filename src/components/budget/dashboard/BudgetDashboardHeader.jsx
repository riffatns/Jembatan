import { CalendarDays, ChevronDown, Database } from 'lucide-react'

// Kepala halaman bertema jembatan: foto jembatan dibuat samar di sisi kanan.
// Margin negatif menetralkan padding <main> supaya latarnya selebar konten.
export function BudgetDashboardHeader({ fiscalYear }) {
  return (
    <header className="relative -mx-4 -mt-4 overflow-hidden bg-gradient-to-b from-[#f6f9ff] to-[#eef4fb] px-4 py-5 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[30%] right-0 bg-[url('/background-jembatan.jpeg')] bg-cover bg-[center_62%] opacity-[0.16] [mask-image:linear-gradient(90deg,transparent_0%,#000_45%)]"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
          <div
            aria-hidden="true"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[#3b8cf2] to-[#1556c4] text-white shadow-[0_10px_24px_-8px_rgba(21,86,196,0.55)] sm:h-[76px] sm:w-[76px] sm:rounded-[18px]"
          >
            <Database className="h-7 w-7 sm:h-10 sm:w-10" />
          </div>
          <div className="min-w-0">
            <h1 className="text-balance text-[26px] font-black leading-[1.05] tracking-[0.01em] text-[#12305f] sm:text-[34px] xl:text-[44px]">
              REALISASI ANGGARAN
            </h1>
            <p className="mt-1.5 text-[11px] font-medium tracking-[0.14em] text-[#2f5fa8] sm:text-[13px] xl:text-[15.5px]">
              BPK PERWAKILAN PROVINSI PAPUA BARAT DAYA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-2xl border border-[#e1e8f4] bg-white/90 py-3 pl-3.5 pr-4 shadow-[0_10px_28px_-14px_rgba(18,48,95,0.22)]">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#e7f0fd] text-[#1e4f8f]">
            <CalendarDays className="h-[22px] w-[22px]" />
          </span>
          <div>
            <label htmlFor="budget-fiscal-year" className="block text-[11.5px] font-semibold tracking-[0.06em] text-[#3f557d]">
              TAHUN ANGGARAN
            </label>
            {/* Baru satu snapshot anggaran yang dimuat, jadi pilihannya satu. */}
            <div className="relative">
              <select
                id="budget-fiscal-year"
                value={fiscalYear || ''}
                onChange={() => {}}
                className="cursor-pointer appearance-none bg-transparent pr-9 text-[28px] font-extrabold leading-tight text-[#12305f] outline-none"
              >
                <option value={fiscalYear || ''}>{fiscalYear || '-'}</option>
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#12305f]" strokeWidth={2.6} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
