import { ColumnChart } from '../../charts/ColumnChart'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

// Sebaran agenda sepanjang tahun berjalan. Kolom, bukan batang mendatar:
// bulan punya urutan alami yang hanya terbaca kalau sumbunya mendatar.
export function PrMonthlyChart({ items, tahun }) {
  const adaIsi = items.some((item) => item.value > 0)

  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 shrink-0 fit:mb-1`}>Agenda per Bulan {tahun}</h2>
      {adaIsi ? (
        <ColumnChart
          items={items}
          formatValue={(value) => value.toLocaleString('id-ID')}
          ariaLabel={`Jumlah agenda tiap bulan tahun ${tahun}`}
        />
      ) : (
        <p className="my-auto text-center text-sm text-[#7a8aa8]">Belum ada agenda yang dicatat pada tahun {tahun}.</p>
      )}
    </div>
  )
}
