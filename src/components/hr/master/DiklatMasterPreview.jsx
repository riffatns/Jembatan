import { KALDIK_SECTIONS } from '../../../lib/kaldikParser'
import { IconCalendar } from '../../icons/DuotoneIcons'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { DataTable } from '../../data-table/DataTable'
import { SECTION_COLORS, formatRange, quarterLabel } from '../diklat/diklatModel'

function earliest(programs) {
  return programs.map((program) => program.schedule.start).filter(Boolean).sort()[0] || null
}

function latest(programs) {
  return programs.map((program) => program.schedule.end).filter(Boolean).sort().slice(-1)[0] || null
}

function sectionRows(programs) {
  return KALDIK_SECTIONS.map((section) => {
    const items = programs.filter((program) => program.section === section.id)
    return {
      ...section,
      count: items.length,
      phases: items.reduce((sum, program) => sum + program.phases.length, 0),
      flagged: items.filter((program) => program.status).length,
      range: items.length ? formatRange(earliest(items), latest(items)) : '-'
    }
  }).filter((row) => row.count)
}

const COLUMNS = [
  {
    key: 'label',
    label: 'Jenis Diklat',
    render: (row) => (
      <span className="inline-flex items-center gap-2 font-semibold">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: SECTION_COLORS[row.id] }} aria-hidden="true" />
        {row.label}
      </span>
    )
  },
  { key: 'count', label: 'Program', align: 'right' },
  { key: 'phases', label: 'Tahap', align: 'right', text: (row) => row.phases || '-' },
  { key: 'flagged', label: 'Berlangsung/Diusulkan', align: 'right', text: (row) => row.flagged || '-' },
  { key: 'range', label: 'Rentang Jadwal' }
]

// Pratinjau hasil parsing PDF Kaldik sebelum disimpan: ringkasan per jenis
// dan daftar jadwal yang belum pasti (TBA). Tidak ada data pribadi di Kaldik.
export function DiklatMasterPreview({ parsed }) {
  if (!parsed) {
    return (
      <div className={`${CARD_CLASS} items-center justify-center gap-2 py-8 text-center`}>
        <IconCalendar className="h-10 w-10 text-[#9db6dc]" />
        <p className="text-sm font-semibold text-[#3f557d]">Pratinjau muncul setelah PDF Kaldik dipilih.</p>
        <p className="text-xs text-[#7a8aa8]">Triwulan dan tahun dibaca otomatis dari judul PDF.</p>
      </div>
    )
  }

  const rows = sectionRows(parsed.programs)
  const phaseCount = rows.reduce((sum, row) => sum + row.phases, 0)
  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={CARD_TITLE_CLASS}>Pratinjau {quarterLabel(parsed.quarter, parsed.year)}</h2>
        <div className="flex flex-wrap gap-1.5 text-xs font-bold">
          <span className="rounded-md bg-[#dcf5e8] px-2 py-0.5 text-[#0b7a4f]">✓ Grid & nomor urut valid</span>
          <span className="rounded-md bg-[#e6eefb] px-2 py-0.5 text-[#1d5fd0]">{parsed.programs.length} program · {phaseCount} tahap</span>
        </div>
      </div>
      <p className="text-xs text-[#7a8aa8]">{parsed.title}</p>
      <DataTable rows={rows} columns={COLUMNS} getRowKey={(row) => row.id} searchable={false} paginated={false} itemLabel="jenis" dense minWidth="min-w-[520px]" />
      {parsed.warnings.length > 0 && (
        <div className="rounded-xl bg-[#fff6ea] px-3 py-2 text-[13px] text-[#9a4d00]">
          <b>Jadwal belum pasti (tampil sebagai TBA):</b>
          <ul className="mt-1 list-disc pl-5">
            {parsed.warnings.map((warning) => <li key={warning}>{warning}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
