const BUDGET_FILE_URL = '/data/anggaran.xlsx'

function parseAmount(value) {
  const digits = String(value ?? '').replace(/[^0-9-]/g, '')
  return Number(digits) || 0
}

export async function loadBudgetData() {
  const XLSX = await import('xlsx')
  const response = await fetch(BUDGET_FILE_URL)
  if (!response.ok) throw new Error(`Gagal memuat ${BUDGET_FILE_URL}`)

  const workbook = XLSX.read(await response.arrayBuffer(), { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
  const headers = rows[0].map((header) => String(header).trim())
  const totalIndex = headers.findIndex((header) => header.toLowerCase() === 'total')
  const percentageIndex = headers.findIndex((header) => header.toLowerCase() === 'persentase')
  const dataRows = new Map(rows.slice(1).map((row) => [String(row[0]).trim().toLowerCase(), row]))
  const paguRow = dataRows.get('pagu') || []
  const realisasiRow = dataRows.get('realisasi') || []
  const sisaRow = dataRows.get('sisa') || []
  const totalPagu = parseAmount(paguRow[totalIndex])
  const totalRealisasi = parseAmount(realisasiRow[totalIndex])
  const totalSisa = parseAmount(sisaRow[totalIndex]) || Math.max(totalPagu - totalRealisasi, 0)

  return {
    fiscalYear: 2026,
    totalPagu,
    totalRealisasi,
    totalSisa,
    realisasiPercent: parseAmount(realisasiRow[percentageIndex]),
    sisaPercent: parseAmount(sisaRow[percentageIndex]),
    updatedAt: new Date().toISOString().slice(0, 10),
    breakdown: headers
      .map((code, index) => ({
        code,
        pagu: parseAmount(paguRow[index]),
        realisasi: parseAmount(realisasiRow[index]),
        sisa: parseAmount(sisaRow[index])
      }))
      .filter((item) => /^\d+$/.test(item.code))
  }
}