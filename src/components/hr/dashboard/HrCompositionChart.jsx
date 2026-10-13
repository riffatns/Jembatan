import { IconPieChart } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DonutChart } from '../../charts/DonutChart'

// Komposisi pegawai menurut golongan. DonutChart sudah membawa legendanya
// sendiri, jadi di sini cukup judul dan grafiknya - menambah daftar sendiri di
// sampingnya pernah dicoba dan hasilnya dua legenda yang saling menimpa.
export function HrCompositionChart({ segments, total }) {
  return (
    <div className={CARD_CLASS}>
      <h2 className={`${CARD_TITLE_CLASS} mb-2 flex shrink-0 items-center gap-2 fit:mb-1`}>
        <IconPieChart className="h-5 w-5 text-[#2f7fe8]" />
        Komposisi Pegawai
      </h2>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <DonutChart
          segments={segments}
          centerValue={total}
          centerLabel="Pegawai"
          formatValue={(value) => value.toLocaleString('id-ID')}
          ariaLabel="Komposisi pegawai menurut golongan"
        />
      </div>
    </div>
  )
}
