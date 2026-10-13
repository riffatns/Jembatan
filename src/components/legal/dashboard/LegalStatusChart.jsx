import { IconPieChart } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DonutChart } from '../../charts/DonutChart'

// Status kerja sama berjangka: Aktif, Review, Berakhir. Ketiganya diturunkan
// dari tanggal oleh getAgreementStatus, bukan disimpan.
//
// DonutChart sudah membawa legendanya sendiri, jadi di sini cukup judul dan
// grafiknya.
export function LegalStatusChart({ segments, total }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 flex shrink-0 items-center gap-2 fit:mb-1`}>
        <IconPieChart className="h-5 w-5 text-[#2f7fe8]" />
        Status Kerja Sama
      </h2>

      {segments.length ? (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <DonutChart
            segments={segments}
            centerValue={total}
            centerLabel="Berkas"
            formatValue={(value) => value.toLocaleString('id-ID')}
            ariaLabel="Status kerja sama berjangka"
          />
        </div>
      ) : (
        <p className="flex min-h-0 flex-1 items-center justify-center text-center text-sm text-[#7a8aa8]">
          Belum ada kerja sama yang masa berlakunya tercatat.
        </p>
      )}
    </div>
  )
}
