import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { IconDatabase, IconInfo } from '../icons/DuotoneIcons'
import { TAMPILKAN_SUMBER_ANGKA } from '../../lib/tampilan'
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

export function AssetWorkspace({ divisionId }) {
  const { assets, isAssetRemote } = useData()
  const [detail, setDetail] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [filterTabel, setFilterTabel] = useState(null)
  const [sorotan, setSorotan] = useState(null)

  const divisionAssets = useMemo(
    () => assets.filter((a) => !a.divisionId || a.divisionId === divisionId),
    [assets, divisionId]
  )

  const ringkasan = useMemo(() => ringkasAset(divisionAssets), [divisionAssets])
  const perhatian = useMemo(() => kartuPerhatian(divisionAssets), [divisionAssets])

  const bukaDetail = (asset) => {
    setDetail(asset)
    setDetailOpen(true)
  }

  if (!divisionAssets.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#c6d4ea] bg-white p-8 text-center">
        <IconDatabase className="mx-auto h-10 w-10 text-[#c6d4ea]" />
        <h2 className="mt-3 text-lg font-bold text-[#233b84]">Data BMN belum tersedia</h2>
        <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
          Unggah berkas daftar aset berformat Excel pada bagian dokumen di bawah. Kolom yang dibaca meliputi
          Kode Barang, NUP, Nama Barang, Jenis BMN, Kondisi, Nilai Perolehan, Nilai Buku, dan PSP.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 fit:gap-2.5">
      <AssetKpiCards ringkasan={ringkasan} />

      {/* Keterangan tempat data BMN disimpan ikut saklar sumber angka yang sama
          dengan keterangan "angka ini dibaca dari berkas" di bidang lain. */}
      {TAMPILKAN_SUMBER_ANGKA && !isAssetRemote && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
          <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Data BMN ini dibaca dari berkas yang diunggah dan tersimpan di browser ini. Jalankan{' '}
            <code className="font-semibold">supabase/aset.sql</code> agar tersimpan di server dan terlihat oleh
            semua pengguna.
          </p>
        </div>
      )}

      <AssetAnalytics assets={divisionAssets} />

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
        <AssetTable assets={divisionAssets} onSelect={bukaDetail} filterAwal={filterTabel} />
      </section>

      <AssetDetail asset={detail} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  )
}
