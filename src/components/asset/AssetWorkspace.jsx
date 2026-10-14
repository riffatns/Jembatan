import { useMemo, useState } from 'react'
import { IconDatabase } from '../icons/DuotoneIcons'
import { AssetAnalytics } from './AssetAnalytics'
import { AssetAttentionCards } from './AssetAttentionCards'
import { AssetKpiCards } from './AssetKpiCards'
import { AssetTable } from './AssetTable'
import { AssetDetail } from './AssetDetail'
import { dataTidakLengkap, kondisiPerluPerhatian, punyaPsp, ringkasAset } from '../../lib/assetWorkbook'

// Empat hal yang membuat catatan BMN bermasalah saat diperiksa. Tiap kartu
// menjadi pintasan filter, bukan sekadar angka - kalau tidak, pengguna harus
// mencarinya sendiri di tabel.
function kartuPerhatian(assets) {
  return [
    {
      id: 'belum-psp',
      label: 'Belum memiliki PSP',
      keterangan: 'Penetapan status penggunaan belum terbit',
      items: assets.filter((a) => !punyaPsp(a)),
      filter: { psp: 'belum' },
      warna: '#eda100'
    },
    {
      id: 'nilai-nol',
      label: 'Nilai buku Rp0',
      keterangan: 'Sudah tersusut penuh namun masih tercatat',
      items: assets.filter((a) => a.nilaiBuku === 0),
      filter: null,
      warna: '#dc2626'
    },
    {
      id: 'kondisi',
      label: 'Kondisi perlu perhatian',
      keterangan: 'Tercatat rusak ringan atau rusak berat',
      items: assets.filter(kondisiPerluPerhatian),
      filter: null,
      warna: '#e87ba4'
    },
    {
      id: 'tidak-lengkap',
      label: 'Data belum lengkap',
      keterangan: 'Ada kolom penting yang masih kosong',
      items: assets.filter((a) => dataTidakLengkap(a).length > 0),
      filter: null,
      warna: '#64748b'
    }
  ]
}

// Daftar asetnya datang dari pemanggil - menu Aset memberinya versi aktif
// Master Data, halaman layanan lama memberinya aset dari DataContext - supaya
// komponen ini tidak perlu tahu dari mana angkanya berasal.
export function AssetWorkspace({ assets = [] }) {
  const [detail, setDetail] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [filterTabel, setFilterTabel] = useState(null)
  const [sorotan, setSorotan] = useState(null)

  const ringkasan = useMemo(() => ringkasAset(assets), [assets])
  const perhatian = useMemo(() => kartuPerhatian(assets), [assets])

  const bukaDetail = (asset) => {
    setDetail(asset)
    setDetailOpen(true)
  }

  if (!assets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c6d4ea] bg-white p-8 text-center">
        <IconDatabase className="mx-auto h-10 w-10 text-[#c6d4ea]" />
        <h2 className="mt-3 text-lg font-bold text-[#233b84]">Data BMN belum tersedia</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
          Unggah berkas daftar aset berformat Excel di menu Master Data Aset. Kolom yang dibaca meliputi
          Kode Barang, NUP, Nama Barang, Jenis BMN, Kondisi, Nilai Perolehan, Nilai Buku, dan PSP.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 fit:gap-2.5">
      <AssetKpiCards ringkasan={ringkasan} />

      <AssetAnalytics assets={assets} />

      <AssetAttentionCards
        perhatian={perhatian}
        sorotan={sorotan}
        onSorot={setSorotan}
        onFilter={(kartu) => {
          setFilterTabel({ ...kartu.filter })
          setSorotan(null)
          document.getElementById('tabel-aset')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        onSelect={bukaDetail}
      />

      <section id="tabel-aset">
        <AssetTable assets={assets} onSelect={bukaDetail} filterAwal={filterTabel} />
      </section>

      <AssetDetail asset={detail} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}
