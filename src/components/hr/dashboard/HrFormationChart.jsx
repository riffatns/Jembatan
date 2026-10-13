import { IconChartBars } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { BarList } from '../../charts/BarList'
import { HR_SERIES } from './hrDashboardModel'

// Keterisian formasi per unit kerja.
//
// Batang pucat di belakang adalah kebutuhan ABK, batang pekat yang terisi.
// Dipasang bertumpuk, bukan berdampingan, karena yang ingin dibaca adalah
// seberapa jauh jaraknya - dua batang terpisah memaksa mata mengukur selisih
// sendiri. Skalanya satu untuk seluruh daftar, jadi unit besar dan unit kecil
// tetap bisa dibandingkan.
export function HrFormationChart({ rows }) {
  const items = rows.map((row) => ({
    key: row.key,
    label: row.name,
    value: row.actual,
    track: row.need
  }))

  return (
    <div className={CARD_CLASS}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className={`${CARD_TITLE_CLASS} flex items-center gap-2`}>
          <IconChartBars className="h-5 w-5 text-[#2f7fe8]" />
          Keterisian Formasi per Unit
        </h2>
        <span className="flex shrink-0 items-center gap-3 text-xs text-[#7a8aa8]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: HR_SERIES.actual }} /> Terisi
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#dbe7f8]" /> Kebutuhan
          </span>
        </span>
      </div>

      {/* Tinggi baris batang punya batas bawah - ada teks di dalamnya - jadi
          pada layar pendek daftarnya tidak bisa dimampatkan terus. Diberi
          gulir di dalam kartunya, perlakuan yang sama dengan tabel rincian,
          supaya halaman tetap muat satu layar berapa pun jumlah unitnya. */}
      <div className="flex min-h-[180px] flex-1 flex-col fit:min-h-0 fit:overflow-y-auto">
        <BarList
          items={items}
          color={HR_SERIES.actual}
          formatValue={(value) => `${value.toLocaleString('id-ID')} orang`}
          labelWidth="minmax(110px,38%)"
        />
      </div>
    </div>
  )
}
