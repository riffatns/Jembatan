import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { formatCompactRupiah } from '../../../lib/budgetFormat'

// Aset dengan nilai perolehan tertinggi. Delapan baris teratas saja: daftar
// lengkapnya ada di menu Aset, yang di sini hanya menunjukkan ke mana sebagian
// besar nilai BMN bidang ini tertanam.

const HEAD_CELL =
  'border-r border-white/15 px-3 py-[9px] text-center text-[13.5px] font-semibold text-white last:border-r-0 fit:px-2 fit:py-1.5 fit:text-[13px]'
const BODY_CELL =
  'border-r border-t border-[#e1e8f4] px-3 py-2 text-center text-sm text-[#12305f] last:border-r-0 fit:px-1.5 fit:py-1 fit:text-[13px] fitwide:px-2 tall:py-1.5 tall:text-sm'

export function ItTopAssetsTable({ rows }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-3 shrink-0 fit:mb-1.5`}>Aset Bernilai Tertinggi</h2>

      {rows.length ? (
        <div className="overflow-x-auto rounded-[10px] border border-[#e1e8f4] fit:min-h-0 fit:overflow-y-auto">
          <table className="w-full min-w-[640px] border-collapse fit:min-w-0">
            <thead className="bg-[#1e4f8f]">
              <tr>
                <th className={`${HEAD_CELL} w-[42%] !text-left`}>Nama Barang</th>
                <th className={HEAD_CELL}>Kondisi</th>
                <th className={`${HEAD_CELL} !text-right`}>Nilai Perolehan</th>
                <th className={`${HEAD_CELL} !text-right`}>Nilai Buku</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#f7faff]">
                  <td className={`${BODY_CELL} max-w-0 !text-left`}>
                    <span className="block truncate font-medium" title={row.namaBarang}>{row.namaBarang}</span>
                    <span className="block truncate text-xs text-[#7a8aa8]" title={row.jenisBmn}>
                      {row.jenisBmn}
                      {row.berPsp ? '' : ' · belum ber-PSP'}
                    </span>
                  </td>
                  <td className={`${BODY_CELL} whitespace-nowrap`}>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                      style={{ backgroundColor: row.kondisiColor }}
                    >
                      {row.kondisiLabel}
                    </span>
                  </td>
                  <td className={`${BODY_CELL} whitespace-nowrap tabular-nums !text-right`}>
                    {formatCompactRupiah(row.nilaiPerolehan)}
                  </td>
                  <td className={`${BODY_CELL} whitespace-nowrap tabular-nums !text-right font-semibold`}>
                    {formatCompactRupiah(row.nilaiBuku)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="flex min-h-0 flex-1 items-center justify-center text-center text-sm text-[#7a8aa8]">
          Belum ada daftar BMN yang diunggah pada layanan Aset.
        </p>
      )}
    </div>
  )
}
