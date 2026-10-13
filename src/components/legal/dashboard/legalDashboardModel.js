import {
  AGREEMENT_CATEGORY_ID,
  AGREEMENT_STATUSES,
  AGREEMENT_TYPES,
  REVIEW_WINDOW_DAYS,
  butuhMasaBerlaku,
  getAgreementStatus,
  getAgreementTypeMeta,
  sisaHariBerlaku
} from '../../../data/agreementStatus'

// Angka Dashboard Hukum. Murni, tanpa impor React.
//
// Status kerja sama tidak dihitung ulang di sini: dipakai getAgreementStatus
// yang sama dengan halaman Legislasi / Review MOU, yang menurunkannya dari
// tanggal dan tidak pernah menyimpannya. Menyimpan status akan basi begitu
// tanggalnya lewat tanpa ada yang menyunting dokumennya.

export { REVIEW_WINDOW_DAYS }

// Berapa kerja sama yang ditampilkan pada tabel "paling dekat berakhir".
const MAX_EXPIRY_ROWS = 8

function statusMeta(id) {
  return AGREEMENT_STATUSES.find((status) => status.id === id)
}

export function buildLegalModel({ documents = [], categories = [], today = new Date() } = {}) {
  // Metadata kerja sama hanya melekat pada satu layanan; dokumen hukum lain
  // (JDIH, manajemen risiko) tidak punya masa berlaku dan tidak ikut dinilai.
  const agreements = documents.filter((document) => document.categoryId === AGREEMENT_CATEGORY_ID)

  const berjangka = agreements.filter((document) => getAgreementTypeMeta(document.agreementType).berjangka)
  const tanpaMasaBerlaku = agreements.filter(butuhMasaBerlaku)

  const hitungStatus = { aktif: 0, review: 0, berakhir: 0 }
  berjangka.forEach((document) => {
    const status = getAgreementStatus(document, today)
    if (status) hitungStatus[status] += 1
  })

  const dinilai = hitungStatus.aktif + hitungStatus.review + hitungStatus.berakhir

  const status = AGREEMENT_STATUSES.map((meta) => ({
    key: meta.id,
    label: meta.label,
    value: hitungStatus[meta.id],
    color: meta.color
  })).filter((item) => item.value > 0)

  const jenis = AGREEMENT_TYPES.map((meta) => ({
    key: meta.id,
    label: meta.label,
    value: agreements.filter((document) => getAgreementTypeMeta(document.agreementType).id === meta.id).length,
    color: meta.color
  })).filter((item) => item.value > 0)

  // Dokumen per layanan hukum - termasuk layanan yang belum punya dokumen,
  // supaya yang kosong terlihat kosong, bukan hilang dari daftar.
  const perLayanan = categories.map((category) => ({
    key: category.id,
    label: category.name,
    value: documents.filter((document) => document.categoryId === category.id).length
  }))

  // Paling dekat berakhir lebih dulu; yang sudah lewat ikut, karena justru itu
  // yang perlu ditindaklanjuti.
  const segeraBerakhir = berjangka
    .map((document) => ({
      id: document.id,
      title: document.title,
      counterparty: document.counterparty || null,
      typeLabel: getAgreementTypeMeta(document.agreementType).label,
      typeColor: getAgreementTypeMeta(document.agreementType).color,
      validUntil: document.validUntil || null,
      sisa: sisaHariBerlaku(document, today),
      status: getAgreementStatus(document, today)
    }))
    .filter((row) => row.sisa !== null)
    .sort((a, b) => a.sisa - b.sisa)
    .slice(0, MAX_EXPIRY_ROWS)

  const perluTindakan = hitungStatus.review + hitungStatus.berakhir

  return {
    hasData: documents.length > 0,
    total: {
      dokumen: documents.length,
      kerjaSama: berjangka.length,
      ...hitungStatus,
      tanpaMasaBerlaku: tanpaMasaBerlaku.length,
      perluTindakan
    },
    // Yang bisa dinilai statusnya saja - berkas berjangka yang masa berlakunya
    // belum diisi tidak masuk irisan mana pun, jadi tidak boleh ikut jadi angka
    // tengah donat. Donat berpusat 8 dengan irisan berjumlah 7 hanya akan
    // membuat pembaca mencari ke mana perginya satu berkas.
    dinilai,
    aktifShare: dinilai ? (hitungStatus.aktif / dinilai) * 100 : 0,
    perluTindakanShare: dinilai ? (perluTindakan / dinilai) * 100 : 0,
    status,
    jenis,
    perLayanan,
    segeraBerakhir,
    terdekat: segeraBerakhir[0] || null,
    statusMeta
  }
}
