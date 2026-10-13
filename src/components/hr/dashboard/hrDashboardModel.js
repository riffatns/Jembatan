// Angka Dashboard SDM. Murni, tanpa impor React, supaya bisa diuji dengan Node
// terhadap berkas bezetting sungguhan.
//
// Sumbernya sama dengan menu Bezetting dan Kalender Diklat - summarizeAbk,
// summarizeEmployees, dan buildKpis - bukan hitungan baru. Yang dikerjakan di
// sini hanya menyusunnya jadi bentuk yang dipakai kartu, grafik, dan tabel,
// supaya dashboard dan menunya tidak mungkin menyebut angka yang berbeda.

export const HR_SERIES = {
  need: '#2f7fe8',
  actual: '#1fae7a',
  gap: '#eda100'
}

export const GOLONGAN_COLORS = ['#1e5fd6', '#1fae7a', '#eda100', '#8b7cf6', '#14a0b0', '#e8770c']

const ROMAN_ORDER = ['I', 'II', 'III', 'IV']

function romanRank(roman) {
  const index = ROMAN_ORDER.indexOf(roman)
  return index === -1 ? ROMAN_ORDER.length : index
}

// gap pada summarizeAbk bernilai actual - need, jadi kekurangan muncul sebagai
// angka negatif. Di tampilan yang dipakai besarannya, dengan arah dijelaskan
// lewat kata, bukan tanda minus.
function shortageOf(gap) {
  return gap < 0 ? -gap : 0
}

export function buildHrModel({ abk, people, diklat }) {
  const total = abk?.total || { need: 0, actual: 0, gap: 0 }
  const need = total.need || 0
  const actual = total.actual || 0
  const shortage = shortageOf(total.gap || 0)

  const rows = (abk?.categories || [])
    .map((category) => ({
      key: category.name,
      name: category.name,
      need: category.need || 0,
      actual: category.actual || 0,
      shortage: shortageOf(category.gap || 0),
      fulfillment: category.need ? (category.actual / category.need) * 100 : 0,
      status: category.status
    }))
    .sort((a, b) => b.need - a.need || a.name.localeCompare(b.name))

  // Golongan dikelompokkan menurut angka Romawinya: II, III, IV.
  //
  // Memisah tiap pangkat (III/a, III/b, III/c, ...) menghasilkan belasan
  // irisan - legendanya tidak muat pada layar laptop, dan irisan satu-dua
  // orang tidak terbaca juga. Pengelompokan ini pula yang biasa dipakai orang
  // menyebut golongan pegawai, jadi bukan sekadar penyederhanaan tampilan.
  const kelompok = new Map()
  ;(people?.golongan || []).forEach((item) => {
    const roman = String(item.label || item.key).split('/')[0].trim() || 'Lainnya'
    kelompok.set(roman, (kelompok.get(roman) || 0) + item.value)
  })
  const golongan = [...kelompok.entries()]
    .sort((a, b) => romanRank(a[0]) - romanRank(b[0]))
    .map(([label, value], index) => ({
      key: label,
      label: `Golongan ${label}`,
      value,
      color: GOLONGAN_COLORS[index % GOLONGAN_COLORS.length]
    }))

  // Unit yang kekurangannya terbesar: tempat penambahan pegawai paling terasa.
  const largestShortage = rows.reduce(
    (largest, row) => (row.shortage > 0 && (!largest || row.shortage > largest.shortage) ? row : largest),
    null
  )
  const unitsShort = rows.filter((row) => row.shortage > 0).length

  return {
    hasData: rows.length > 0 || actual > 0,
    total: { need, actual, shortage },
    fulfillment: need ? (actual / need) * 100 : 0,
    shortageShare: need ? (shortage / need) * 100 : 0,
    rows,
    golongan,
    people: {
      total: people?.total || 0,
      male: people?.male || 0,
      female: people?.female || 0,
      education: people?.education || []
    },
    diklat: {
      total: diklat?.total || 0,
      ongoing: diklat?.ongoing || 0,
      thisMonth: diklat?.thisMonth || 0
    },
    largestShortage,
    unitsShort
  }
}
