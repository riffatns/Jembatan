import { useEffect, useState } from 'react'
import { FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { parseExcelWorkbook } from '../lib/parseExcelABK'

function cellText(value) {
  return value === null || value === undefined ? '' : value
}

function SheetTable({ sheet }) {
  const { header = [], rows: body = [] } = sheet
  const columnCount = Math.max(header.length, ...body.map((row) => row.length), 1)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_10px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-[#eff5ff] px-5 py-4">
        <FileSpreadsheet className="h-5 w-5 text-[#1f63d3]" />
        <div>
          <h2 className="font-bold text-[#233b84]">{sheet.name}</h2>
          {sheet.title && <p className="mt-0.5 text-xs text-slate-500">{sheet.title}</p>}
        </div>
      </div>
      <div className="max-h-[70vh] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#f8fbff]">
            <tr>
              {Array.from({ length: columnCount }, (_, index) => (
                <th key={index} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-xs font-bold text-[#233b84]">
                  {cellText(header[index])}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-slate-100 last:border-0 hover:bg-[#f8fbff]">
                {Array.from({ length: columnCount }, (_, columnIndex) => (
                  <td key={columnIndex} className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {cellText(row[columnIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default function ExcelWorkbookViewer({ source, className = '' }) {
  const [workbook, setWorkbook] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!source) return
    let cancelled = false
    setLoading(true)
    setError('')
    parseExcelWorkbook(source)
      .then((result) => {
        if (!cancelled) setWorkbook(result)
      })
      .catch((reason) => {
        if (!cancelled) setError(reason.message || 'Workbook Excel gagal dibaca.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [source])

  if (loading) {
    return <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-sm text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin text-[#1f63d3]" /> Membaca seluruh sheet Excel...</div>
  }
  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
  if (!workbook) return null

  return (
    <div className={`space-y-5 ${className}`}>
      {workbook.sheets.map((sheet) => <SheetTable key={sheet.name} sheet={sheet} />)}
    </div>
  )
}
