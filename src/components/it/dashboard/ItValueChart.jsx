import { BarList } from '../../charts/BarList'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { formatCompactRupiah } from '../../../lib/budgetFormat'

// Nilai perolehan BMN per jenis barang. Batang mendatar, bukan donat: yang
// dibandingkan besarannya, dan nama jenis BMN terlalu panjang untuk legenda.
export function ItValueChart({ items }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 shrink-0 fit:mb-1`}>Nilai BMN per Jenis</h2>
      {items.length ? (
        <BarList items={items} formatValue={formatCompactRupiah} />
      ) : (
        <p className="my-auto text-center text-sm text-[#7a8aa8]">Belum ada daftar BMN yang diunggah.</p>
      )}
    </div>
  )
}
