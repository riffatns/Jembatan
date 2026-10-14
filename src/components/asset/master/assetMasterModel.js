import { kelompokkan, punyaPsp, ringkasAset } from '../../../lib/assetWorkbook'

// Master Data Aset (Subbagian Umum dan TI). Satu unggahan daftar BMN yang
// lolos pembacaan menjadi satu-satunya data aktif menu Aset dan Dashboard
// Umum dan TI - pola yang sama dengan Bezetting di SDM dan laporan SP2D di
// Keuangan: berversi, tanpa approval, hanya administrator.
//
// Berkas BMN tidak memuat data pribadi, jadi tidak ada pemisahan data rinci
// seperti Bezetting; seluruh kolom yang dibaca parser masuk payload umum.

export const ASSET_DATASET = 'it-aset'
export const IT_DIVISION_ID = 'it'
export const ASSET_MASTER_PATH = '/dashboard/master-aset'

export const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Hasil parseAssetWorkbook jadi payload versi Master Data.
export function buildAssetPayload(parsed, { periodMonth, periodYear }) {
  const label = periodMonth && periodYear ? `${MONTH_NAMES[periodMonth - 1]} ${periodYear}` : null
  return {
    period: { month: periodMonth || null, year: periodYear || null, label },
    payload: { sheetName: parsed.sheetName || null, assets: parsed.assets }
  }
}

// Daftar aset dari versi aktif. Versi 'clear' tidak punya payload, dan versi
// lama bisa saja berbentuk lain, jadi bentuknya diperiksa di sini sekali
// supaya pemanggilnya tidak perlu menjaga diri masing-masing.
export function assetsFromPayload(payload) {
  const assets = payload?.assets
  return Array.isArray(assets) ? assets : []
}

// Angka pratinjau sebelum disimpan, memakai ringkasAset yang sama dengan
// menu Aset supaya pratinjau dan hasilnya tidak mungkin berbeda.
export function summarizeParsedAssets(assets) {
  const ringkasan = ringkasAset(assets)
  const perJenis = kelompokkan(assets, (a) => a.jenisBmn)

  return {
    ...ringkasan,
    berPsp: assets.filter(punyaPsp).length,
    jenis: perJenis.map((group) => ({
      kunci: group.kunci,
      jumlah: group.jumlah,
      nilaiPerolehan: group.nilaiPerolehan,
      nilaiBuku: group.nilaiBuku
    })),
    tanpaKondisi: assets.filter((asset) => !asset.kondisi).length,
    tanpaTanggal: assets.filter((asset) => !asset.tanggalPerolehan).length
  }
}
