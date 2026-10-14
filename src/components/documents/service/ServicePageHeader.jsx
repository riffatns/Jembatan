import { CalendarRange } from 'lucide-react'
import { BudgetDashboardHeader } from '../../budget/dashboard/BudgetDashboardHeader'
import { IconFolderDocuments } from '../../icons/DuotoneIcons'
import { Button } from '../../ui/button'

// Kepala halaman layanan, memakai BudgetDashboardHeader yang sama dengan
// Dashboard Anggaran dan menu akun Keuangan supaya seluruh halaman aplikasi
// terbaca satu keluarga.
//
// Ikonnya satu untuk semua layanan dokumen. SERVICE_META memang menyimpan ikon
// per layanan, tetapi ikon-ikon itu dari lucide (bergaris) sedangkan kepala
// halaman ini memakai ikon duotone - mencampur keduanya dalam satu komponen
// justru membuat tampilannya tidak seragam, yang merupakan hal yang sedang
// diperbaiki di sini.
//
// Penyaring tanggal dan tombol unggah dipindah ke slot actions, bukan
// dihilangkan: keduanya tetap dipakai, hanya tempatnya mengikuti bentuk baru.
export function ServicePageHeader({
  title,
  subtitle,
  dateInputId,
  selectedDate,
  selectedDateObject,
  onDateChange,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  showAction = true
}) {
  return (
    <BudgetDashboardHeader
      title={title}
      subtitle={subtitle}
      icon={IconFolderDocuments}
      showYearPicker={false}
      actions={
        <>
          <label
            htmlFor={dateInputId}
            title="Pilih tanggal filter"
            className="relative flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-[#233b84] shadow-sm transition-colors hover:border-blue-300 hover:bg-[#f8fbff] active:scale-[0.98]"
          >
            <CalendarRange className="h-4 w-4 text-[#1f63d3]" />
            {selectedDateObject.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            <input
              id={dateInputId}
              type="date"
              value={selectedDate}
              onChange={(event) => onDateChange(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
              aria-label="Filter tanggal dokumen"
            />
          </label>

          {showAction && (
            <Button variant="teal" onClick={onAction} className="rounded-full px-5 shadow-[0_14px_30px_rgba(31,99,211,0.26)]">
              {ActionIcon ? <ActionIcon className="h-4 w-4" /> : null} {actionLabel}
            </Button>
          )}
        </>
      }
    />
  )
}
