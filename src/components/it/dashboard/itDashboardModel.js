import { kelompokkan, punyaPsp, ringkasAset } from '../../../lib/assetWorkbook'
import { kondisiMeta, warnaKategori } from '../../../data/assetPalette'

// Angka Dashboard Umum dan TI. Murni, tanpa impor React.
//
// Sumbernya dua: daftar BMN yang diunggah di layanan Aset, dan dokumen layanan
// bidang ini. Ringkasan asetnya memakai ringkasAset yang sama dengan halaman
// Aset, jadi dashboard dan menunya tidak mungkin menyebut angka yang berbeda.

export const IT_DIVISION_ID = 'it'

// Berapa aset yang ditampilkan pada tabel "nilai perolehan tertinggi".
const MAX_TOP_ROWS = 8

export function buildItModel({ assets = [], documents = [], categories = [] } = {}) {
  const ringkasan = ringkasAset(assets)
  const berPsp = assets.filter(punyaPsp).length

  const perJenis = kelompokkan(assets, (a) => a.jenisBmn)
  const nilaiJenis = perJenis
    .map((group, index) => ({
      key: group.kunci,
      label: group.kunci,
      value: group.nilaiPerolehan,
      color: warnaKategori(index)
    }))
    .sort((a, b) => b.value - a.value)

  const kondisi = kelompokkan(assets, (a) => a.kondisi).map((group) => {
    const meta = kondisiMeta(group.kunci)
    return { key: group.kunci, label: meta.label, value: group.jumlah, color: meta.color }
  })

  const teratas = [...assets]
    .sort((a, b) => b.nilaiPerolehan - a.nilaiPerolehan)
    .slice(0, MAX_TOP_ROWS)
    .map((asset) => ({
      id: asset.id,
      namaBarang: asset.namaBarang,
      jenisBmn: asset.jenisBmn,
      kondisi: asset.kondisi,
      kondisiLabel: kondisiMeta(asset.kondisi).label,
      kondisiColor: kondisiMeta(asset.kondisi).color,
      nilaiPerolehan: asset.nilaiPerolehan,
      nilaiBuku: asset.nilaiBuku,
      berPsp: punyaPsp(asset)
    }))

  // Dokumen per layanan - termasuk layanan yang belum punya dokumen, supaya
  // yang kosong terlihat kosong, bukan hilang dari daftar.
  const perLayanan = categories.map((category) => ({
    key: category.id,
    label: category.name,
    value: documents.filter((document) => document.categoryId === category.id).length
  }))

  const menunggu = documents.filter((document) => document.status === 'pending').length

  return {
    hasData: assets.length > 0 || documents.length > 0,
    adaAset: assets.length > 0,
    total: {
      aset: ringkasan.total,
      nilaiPerolehan: ringkasan.nilaiPerolehan,
      nilaiBuku: ringkasan.nilaiBuku,
      penyusutan: ringkasan.penyusutan,
      berPsp,
      belumPsp: ringkasan.belumPsp,
      dokumen: documents.length,
      menunggu
    },
    pspShare: ringkasan.total ? (berPsp / ringkasan.total) * 100 : 0,
    nilaiBukuShare: ringkasan.nilaiPerolehan ? (ringkasan.nilaiBuku / ringkasan.nilaiPerolehan) * 100 : 0,
    jenisCount: perJenis.length,
    nilaiJenis,
    kondisi,
    teratas,
    perLayanan
  }
}
