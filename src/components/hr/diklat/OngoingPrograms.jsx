import { useAnimatedProgress } from '../../../hooks/useAnimatedProgress'
import { IconChartBars } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { SECTION_COLORS, formatRange, programProgress } from './diklatModel'

function ProgressBar({ value, color }) {
  const progress = useAnimatedProgress(value)
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-[#e8eef7]" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: `${value * progress * 100}%`, backgroundColor: color }} />
    </div>
  )
}

// Kartu program yang sedang berjalan hari ini, dengan bilah kemajuan menurut tanggal.
export function OngoingPrograms({ programs, today, selectedUid, onSelect }) {
  return (
    <div className={`${CARD_CLASS} shrink-0 gap-2 2xl:!flex-row 2xl:items-center 2xl:gap-4`}>
      <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2 2xl:w-[250px] 2xl:shrink-0 2xl:leading-snug`}><IconChartBars className="h-5 w-5 text-[#2f7fe8]" />Program Diklat Sedang Berlangsung</h2>
      {programs.length ? (
        <div className="grid min-w-0 flex-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          {programs.slice(0, 4).map((program) => {
            const color = SECTION_COLORS[program.section]
            const progress = programProgress(program, today)
            return (
              <button
                key={program.uid}
                type="button"
                onClick={() => onSelect(program)}
                aria-pressed={program.uid === selectedUid}
                className="flex min-w-0 flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors hover:brightness-[0.98]"
                style={{ backgroundColor: `${color}14`, boxShadow: program.uid === selectedUid ? `inset 0 0 0 1.5px ${color}` : undefined }}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded" style={{ backgroundColor: color }} aria-hidden="true" />
                  <b className="truncate text-sm text-[#12305f]">{program.name}</b>
                  <span className="ml-auto text-xs font-bold tabular-nums text-[#3f557d]">{Math.round(progress * 100)}%</span>
                </span>
                <span className="text-xs text-[#5a6f93]">{formatRange(program.schedule.start, program.schedule.end)}</span>
                <ProgressBar value={progress} color={color} />
              </button>
            )
          })}
        </div>
      ) : <p className="text-sm text-[#7a8aa8]">Tidak ada program yang sedang berjalan hari ini.</p>}
    </div>
  )
}
