import { IconTrash } from '../../icons/DuotoneIcons'
import { VersionHistory } from '../../master-data/VersionHistory'
import { useVersionDeletion } from '../../master-data/useVersionDeletion'
import { Button } from '../../ui/button'
import { CARD_CLASS, CARD_TITLE_CLASS } from '../../ui/cardStyles'
import { ConfirmDialog } from '../../ui/ConfirmDialog'

function QuarterChip({ partition, selected, onSelect }) {
  const programs = partition.active?.payload?.programs?.length
  return (
    <button
      type="button"
      onClick={() => onSelect(partition.dataset)}
      aria-pressed={selected}
      className={`flex flex-col items-start rounded-xl px-3 py-2 text-left text-[13px] transition-colors ${selected ? 'bg-[#1d5fd0] text-white' : 'bg-[#f1f5fb] text-[#12305f] hover:bg-[#e6eefb]'}`}
    >
      <b>{partition.versions[0]?.periodLabel || partition.period}</b>
      <span className={`text-xs ${selected ? 'text-white/80' : 'text-[#7a8aa8]'}`}>{partition.active ? `${programs} program aktif` : 'Dikosongkan'}</span>
    </button>
  )
}

// Data aktif per triwulan + riwayat versi triwulan terpilih. Setiap triwulan
// punya versi aktif, rollback, dan kosongkan sendiri.
export function DiklatQuarterHistory({ partitions, selected, onSelect, group }) {
  const current = partitions.find((partition) => partition.dataset === selected) || partitions[0] || null
  const label = current ? `Kalender Diklat ${current.versions[0]?.periodLabel || current.period}` : 'Kalender Diklat'
  const deletion = useVersionDeletion({
    versions: current?.versions || [],
    deleteVersion: (version) => group.deleteVersion(current.dataset, version),
    clear: () => group.clear(current.dataset),
    dataLabel: label
  })

  return (
    <div className={`${CARD_CLASS} gap-3`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={CARD_TITLE_CLASS}>Data Aktif per Triwulan & Riwayat Versi</h2>
        <Button variant="outline" size="sm" onClick={deletion.askClear} disabled={!current?.active} className="rounded-full text-[#c0262d]">
          <IconTrash className="h-4 w-4" /> Kosongkan triwulan ini
        </Button>
      </div>
      {partitions.length ? (
        <div className="flex flex-wrap gap-2">
          {partitions.map((partition) => (
            <QuarterChip key={partition.dataset} partition={partition} selected={partition.dataset === current?.dataset} onSelect={onSelect} />
          ))}
        </div>
      ) : <p className="text-sm text-slate-500">Belum ada Kalender Diklat. Menu Kalender Diklat masih kosong.</p>}
      {deletion.notice && <p className={`rounded-xl px-3 py-2 text-[13px] ${deletion.notice.ok ? 'bg-[#dcf5e8] text-[#0b7a4f]' : 'bg-[#fde2e2] text-[#c0262d]'}`}>{deletion.notice.text}</p>}
      {current && <VersionHistory versions={current.versions} activeId={current.active?.id} onDelete={deletion.askDelete} />}
      <ConfirmDialog
        open={Boolean(deletion.dialog)}
        title={deletion.dialog?.title}
        description={deletion.dialog?.description}
        confirmLabel={deletion.dialog?.confirmLabel}
        busyLabel="Memproses..."
        busy={deletion.busy}
        onCancel={deletion.cancel}
        onConfirm={deletion.confirm}
      />
    </div>
  )
}
