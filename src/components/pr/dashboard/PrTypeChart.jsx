import { DonutChart } from '../../charts/DonutChart'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'

// Komposisi jenis kegiatan. Jenis yang belum pernah dipakai tidak digambar,
// supaya jumlah irisan selalu sama dengan angka tengahnya.
export function PrTypeChart({ segments, total }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 shrink-0 fit:mb-1`}>Jenis Kegiatan</h2>
      {segments.length ? (
        <DonutChart
          segments={segments}
          centerValue={total}
          centerLabel="Agenda Tercatat"
          formatValue={(value) => `${value.toLocaleString('id-ID')} kegiatan`}
          ariaLabel="Komposisi jenis kegiatan"
        />
      ) : (
        <p className="my-auto text-center text-sm text-[#7a8aa8]">Belum ada agenda yang dicatat.</p>
      )}
    </div>
  )
}
