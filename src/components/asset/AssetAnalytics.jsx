import { useMemo } from 'react'
import { BarList } from '../charts/BarList'
import { DonutChart } from '../charts/DonutChart'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../ui/cardStyles'
import { formatCompactRupiah } from '../../lib/budgetFormat'
import { kelompokkan, UMUR_BUCKETS } from '../../lib/assetWorkbook'
import { kondisiMeta, warnaKategori, warnaUmur } from '../../data/assetPalette'

// Analitik BMN memakai komponen grafik bersama yang sama dengan Dashboard
// Anggaran: batang mendatar (BarList) untuk perbandingan besaran, donat
// (DonutChart) untuk komposisi kondisi. Sebelumnya berkas ini menggambar
// batangnya sendiri - bentuknya mirip, tetapi animasi, tooltip, dan ukuran
// hurufnya tidak pernah ikut berubah saat yang bersama diperbaiki.
//
// Tinggi minimum dipasang di pembungkus isinya, bukan di kartunya: BarList
// membagi ruang yang tersedia, jadi tanpa tinggi ia akan mengempis jadi satu
// baris di halaman yang bisa di-scroll seperti ini.
function Panel({ title, subtitle, children }) {
  return (
    <div className={`${CARD_CLASS} !py-4`}>
      <h3 className={CARD_TITLE_CLASS}>{title}</h3>
      <p className="mt-0.5 text-[13px] text-[#61739b]">{subtitle}</p>
      <div className="mt-2.5 flex min-h-[172px] flex-col">{children}</div>
    </div>
  )
}

const unit = (value) => `${value.toLocaleString('id-ID')} unit`

export function AssetAnalytics({ assets }) {
  const perJenis = useMemo(() => kelompokkan(assets, (a) => a.jenisBmn), [assets])
  const perKondisi = useMemo(() => kelompokkan(assets, (a) => a.kondisi), [assets])

  const perUmur = useMemo(
    () =>
      UMUR_BUCKETS.map((bucket, index) => ({
        key: bucket.id,
        label: bucket.label,
        value: assets.filter((a) => bucket.uji(a.umurAset)).length,
        color: warnaUmur(index)
      })),
    [assets]
  )

  // Warna mengikuti entitasnya, bukan peringkat pada satu panel, sehingga satu
  // jenis BMN berwarna sama di panel jumlah dan di panel nilai.
  const jumlahJenis = useMemo(
    () => perJenis.map((g, index) => ({ key: g.kunci, label: g.kunci, value: g.jumlah, color: warnaKategori(index) })),
    [perJenis]
  )

  const nilaiJenis = useMemo(
    () =>
      perJenis
        .map((g, index) => ({ key: g.kunci, label: g.kunci, value: g.nilaiPerolehan, color: warnaKategori(index) }))
        .sort((a, b) => b.value - a.value),
    [perJenis]
  )

  const kondisi = useMemo(
    () =>
      perKondisi.map((g) => {
        const meta = kondisiMeta(g.kunci)
        return { key: g.kunci, label: meta.label, value: g.jumlah, color: meta.color }
      }),
    [perKondisi]
  )

  return (
    <div className="grid gap-4 xl:grid-cols-2 fit:gap-2.5 tall:gap-3">
      <Panel title="Jumlah Aset per Jenis BMN" subtitle="Banyaknya unit pada tiap kelompok barang">
        <BarList items={jumlahJenis} formatValue={unit} />
      </Panel>

      <Panel title="Nilai BMN per Jenis" subtitle="Nilai perolehan pada tiap kelompok barang">
        <BarList items={nilaiJenis} formatValue={formatCompactRupiah} />
      </Panel>

      <Panel title="Distribusi Kondisi Aset" subtitle="Kondisi fisik menurut catatan BMN">
        <DonutChart
          segments={kondisi}
          centerValue={assets.length}
          centerLabel="Unit Tercatat"
          formatValue={unit}
          ariaLabel="Komposisi kondisi aset"
        />
      </Panel>

      <Panel title="Distribusi Umur Aset" subtitle="Sebaran umur aset dalam tahun">
        <BarList items={perUmur} formatValue={unit} labelWidth="minmax(130px,46%)" />
      </Panel>
    </div>
  )
}
