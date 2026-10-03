import { IconChevronDown } from '../icons/DuotoneIcons'

const BUTTON = 'grid h-8 min-w-8 cursor-pointer place-items-center rounded-lg px-2 text-[13px] font-semibold transition-colors disabled:cursor-default disabled:opacity-40'

// Nomor halaman yang ditampilkan: pertama, terakhir, dan sekitar halaman aktif.
function visiblePages(page, pageCount) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1])
  return [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)
}

export function TablePagination({ page, pageCount, onPage, firstIndex, lastIndex, total, totalAll, itemLabel }) {
  const pages = visiblePages(page, pageCount)

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px] text-[#3f557d]">
      <p>
        Menampilkan <b className="text-[#12305f]">{firstIndex}–{lastIndex}</b> dari <b className="text-[#12305f]">{total}</b> {itemLabel}
        {total !== totalAll && <span className="text-[#7a8aa8]"> (disaring dari {totalAll})</span>}
      </p>
      {pageCount > 1 && (
        <nav className="flex items-center gap-1" aria-label="Halaman tabel">
          <button type="button" className={`${BUTTON} hover:bg-[#eef4fd]`} onClick={() => onPage(page - 1)} disabled={page === 1} aria-label="Halaman sebelumnya">
            <IconChevronDown className="h-4 w-4 rotate-90" />
          </button>
          {pages.map((value, index) => (
            <span key={value} className="flex items-center gap-1">
              {index > 0 && value - pages[index - 1] > 1 && <span className="px-1">…</span>}
              <button
                type="button"
                onClick={() => onPage(value)}
                aria-current={value === page ? 'page' : undefined}
                className={`${BUTTON} ${value === page ? 'bg-[#1f63d3] text-white' : 'text-[#12305f] hover:bg-[#eef4fd]'}`}
              >
                {value}
              </button>
            </span>
          ))}
          <button type="button" className={`${BUTTON} hover:bg-[#eef4fd]`} onClick={() => onPage(page + 1)} disabled={page === pageCount} aria-label="Halaman berikutnya">
            <IconChevronDown className="h-4 w-4 -rotate-90" />
          </button>
        </nav>
      )}
    </div>
  )
}
