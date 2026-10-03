import { IconSpinner } from '../icons/DuotoneIcons'

// Penanda proses unggah Master Data: tahap yang sedang berjalan, keterangan,
// dan bilah kemajuan. progress 0..1 = bilah berangka; null = bilah berjalan
// (lama proses tidak diketahui, mis. mengunggah ke server).
export function UploadProgress({ stage }) {
  if (!stage) return null
  const known = typeof stage.progress === 'number'
  const percent = known ? Math.round(Math.min(1, Math.max(0, stage.progress)) * 100) : null
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-2 rounded-xl bg-[#eef4fd] px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <IconSpinner className="h-5 w-5 shrink-0 animate-spin text-[#1d5fd0] motion-reduce:animate-none" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#12305f]">{stage.label}</p>
          {stage.detail && <p className="text-xs text-[#5a6f93]">{stage.detail}</p>}
        </div>
        {known && <span className="text-xs font-bold tabular-nums text-[#1d5fd0]">{percent}%</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#d6e4f8]">
        {known
          ? <div className="h-full rounded-full bg-[#1d5fd0] transition-[width] duration-300" style={{ width: `${percent}%` }} />
          : <div className="animate-progress-slide h-full w-2/5 rounded-full bg-[#1d5fd0]" />}
      </div>
    </div>
  )
}
