import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

// Agenda pimpinan yang paling dekat, termurut dari yang paling cepat tiba.
// Agenda yang sudah lewat tidak ikut: yang dijawab tabel ini "apa berikutnya",
// bukan "apa saja yang pernah ada".

const HEAD_CELL =
  'border-r border-white/15 px-3 py-[9px] text-center text-[13.5px] font-semibold text-white last:border-r-0 fit:px-2 fit:py-1.5 fit:text-[13px]'
const BODY_CELL =
  'border-r border-t border-[#e1e8f4] px-3 py-2 text-center text-sm text-[#12305f] last:border-r-0 fit:px-1.5 fit:py-1 fit:text-[13px] fitwide:px-2 tall:py-1.5 tall:text-sm'

function formatTanggal(nilai) {
  const polos = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(nilai || ''))
  if (!polos) return '-'
  const tanggal = new Date(Number(polos[1]), Number(polos[2]) - 1, Number(polos[3]))
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSisa(hari) {
  if (hari === 0) return 'Hari ini'
  if (hari === 1) return 'Besok'
  return `${hari} hari lagi`
}

export function PrUpcomingTable({ rows }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Agenda Terdekat</h2>

      {rows.length ? (
        <div className="overflow-x-auto rounded-[10px] border border-[#e1e8f4] fit:min-h-0 fit:overflow-y-auto">
          <table className="w-full min-w-[640px] border-collapse fit:min-w-0">
            <thead className="bg-[#1e4f8f]">
              <tr>
                <th className={`${HEAD_CELL} w-[44%] !text-left`}>Kegiatan</th>
                <th className={HEAD_CELL}>Jenis</th>
                <th className={HEAD_CELL}>Tanggal</th>
                <th className={HEAD_CELL}>Sisa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#f7faff]">
                  <td className={`${BODY_CELL} max-w-0 !text-left`}>
                    <span className="block truncate font-medium" title={row.title}>{row.title}</span>
                    {row.location ? (
                      <span className="block truncate text-xs text-[#7a8aa8]" title={row.location}>{row.location}</span>
                    ) : null}
                  </td>
                  <td className={`${BODY_CELL} whitespace-nowrap`}>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: row.typeColor }}
                    >
                      {row.typeLabel}
                    </span>
                  </td>
                  <td className={`${BODY_CELL} whitespace-nowrap tabular-nums`}>{formatTanggal(row.eventDate)}</td>
                  <td className={`${BODY_CELL} whitespace-nowrap tabular-nums font-semibold`}>{formatSisa(row.sisa)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="flex min-h-0 flex-1 items-center justify-center text-center text-sm text-[#7a8aa8]">
          Belum ada agenda mendatang yang dicatat.
        </p>
      )}
    </div>
  )
}
