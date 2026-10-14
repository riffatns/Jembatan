import { DonutChart } from '../../charts/DonutChart'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

// Komposisi kondisi fisik BMN. Angka tengahnya aset yang kondisinya tercatat,
// termasuk yang kolomnya kosong - irisan "Tidak diisi" ikut digambar supaya
// jumlah irisan selalu sama dengan angka tengahnya.
export function ItConditionChart({ segments, total }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 shrink-0 fit:mb-1`}>Kondisi Aset</h2>
      {segments.length ? (
        <DonutChart
          segments={segments}
          centerValue={total}
          centerLabel="Unit Tercatat"
          formatValue={(value) => `${value.toLocaleString('id-ID')} unit`}
          ariaLabel="Komposisi kondisi aset"
        />
      ) : (
        <p className="my-auto text-center text-sm text-[#7a8aa8]">Belum ada daftar BMN yang diunggah.</p>
      )}
    </div>
  )
}
