// Aturan versi Master Data Anggaran (murni, tanpa Supabase).
// Versi = baris riwayat unggah (action 'upload'). Versi aktif sebuah TA adalah
// unggahan terbarunya, selama TA itu masih punya data aktif.

function isUploadRow(row) {
  return (row.action || 'upload') === 'upload'
}

function newestFirst(a, b) {
  return new Date(b.createdAt) - new Date(a.createdAt)
}

// id baris riwayat yang sedang menjadi data aktif, per TA.
export function activeUploadIds(uploads, reports) {
  const ids = new Set()
  const seen = new Set()
  ;[...uploads].filter(isUploadRow).sort(newestFirst).forEach((row) => {
    if (seen.has(row.fiscalYear)) return
    seen.add(row.fiscalYear)
    if (reports[row.fiscalYear]) ids.add(row.id)
  })
  return ids
}

// Unggahan sebelumnya (yang menyimpan isi laporan) untuk TA yang sama.
export function previousVersion(uploads, upload) {
  return [...uploads]
    .filter((row) => isUploadRow(row) && row.id !== upload.id && row.fiscalYear === upload.fiscalYear && row.report)
    .filter((row) => new Date(row.createdAt) <= new Date(upload.createdAt))
    .sort(newestFirst)[0] || null
}

// Laporan aktif yang dibentuk kembali dari isi baris riwayat.
export function reportFromVersion(version) {
  return { ...version.report, updatedAt: version.createdAt }
}
