import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { formatSisaHari, getAgreementStatusMeta } from '../../../data/agreementStatus'

// Kerja sama yang paling dekat berakhir, termurut dari yang paling mendesak.
// Yang sudah lewat ikut di urutan paling atas - justru itu yang perlu
// ditindaklanjuti lebih dulu, bukan disembunyikan karena sudah telat.

const HEAD_CELL =
  'border-r border-white/15 px-3 py-[9px] text-center text-[13.5px] font-semibold text-white last:border-r-0 fit:px-2 fit:py-1.5 fit:text-[13px]'
const BODY_CELL =
  'border-r border-t border-[#e1e8f4] px-3 py-2 text-center text-sm text-[#12305f] last:border-r-0 fit:px-1.5 fit:py-1 fit:text-[13px] fitwide:px-2 tall:py-1.5 tall:text-sm'

function formatTanggal(nilai) {
  if (!nilai) return '-'
  const polos = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(nilai))
  const tanggal = polos
    ? new Date(Number(polos[1]), Number(polos[2]) - 1, Number(polos[3]))
    : new Date(nilai)
  if (Number.isNaN(tanggal.getTime())) return '-'
  return tanggal.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function LegalExpiryTable({ rows }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Paling Dekat Berakhir</h2>

      {rows.length ? (
        <div className="overflow-x-auto rounded-[10px] border border-[#e1e8f4] fit:min-h-0 fit:overflow-y-auto">
          <table className="w-full min-w-[640px] border-collapse fit:min-w-0">
            <thead className="bg-[#1e4f8f]">
              <tr>
                <th className={`${HEAD_CELL} w-[38%] !text-left`}>Dokumen</th>
                <th className={HEAD_CELL}>Jenis</th>
                <th className={HEAD_CELL}>Berakhir</th>
                <th className={HEAD_CELL}>Sisa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const meta = getAgreementStatusMeta(row.status)
                return (
                  <tr key={row.id} className="hover:bg-[#f7faff]">
                    <td className={`${BODY_CELL} max-w-0 !text-left`}>
                      <span className="block truncate font-medium" title={row.title}>{row.title}</span>
                      {row.counterparty ? (
                        <span className="block truncate text-xs text-[#7a8aa8]" title={row.counterparty}>
                          {row.counterparty}
                        </span>
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
                    <td className={`${BODY_CELL} whitespace-nowrap tabular-nums`}>{formatTanggal(row.validUntil)}</td>
                    <td className={`${BODY_CELL} whitespace-nowrap tabular-nums font-semibold`} style={{ color: meta?.color }}>
                      {formatSisaHari(row.sisa)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="flex min-h-0 flex-1 items-center justify-center text-center text-sm text-[#7a8aa8]">
          Belum ada kerja sama yang masa berlakunya dicatat.
        </p>
      )}
    </div>
  )
}
