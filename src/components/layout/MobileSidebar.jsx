import { useEffect } from 'react'
import { cn } from '../../lib/utils'
import { IconMenu } from '../icons/DuotoneIcons'
import { UserAccountMenu } from './UserAccountMenu'

export const MOBILE_SIDEBAR_ID = 'sidebar-ponsel'

// Kelas, bukan style: dialog juga mengatur body.style.overflow, dan keduanya
// tidak boleh saling menimpa. Varian lg melepas kunci bila layar diputar sampai
// lebar desktop saat menu masih terbuka.
const BODY_LOCK_CLASSES = ['overflow-hidden', 'lg:overflow-visible']

// Tanpa bilah ini sidebar selalu terbuka di atas halaman, dan di ponsel isi
// halaman baru terlihat setelah digulir lebih dari satu layar.
export function MobileTopBar({ open, onOpen }) {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center gap-3 bg-[#0b2d5a] px-4 text-white shadow-[0_6px_18px_rgba(11,45,90,0.25)] lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        title="Buka menu"
        aria-label="Buka menu"
        aria-expanded={open}
        aria-controls={MOBILE_SIDEBAR_ID}
        className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/10 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
      >
        <IconMenu className="h-6 w-6" />
      </button>
      <img src="/favicon-jembatan.png" alt="" className="h-7 w-7 object-contain" />
      <span className="flex-1 text-sm font-semibold">JEMBATAN</span>
      <UserAccountMenu compact />
    </div>
  )
}

// Di bawah lg sidebar menjadi laci yang tertutup secara bawaan. Mulai lg pembungkus
// ini memakai display: contents, jadi sidebar kembali menjadi anak langsung tata
// letak desktop seperti sebelumnya.
export function MobileSidebarDrawer({ open, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add(...BODY_LOCK_CLASSES)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove(...BODY_LOCK_CLASSES)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <>
      {open && <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-[#061a35]/55 lg:hidden" />}
      <div
        id={MOBILE_SIDEBAR_ID}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[290px] max-w-[85vw] transition-[transform,visibility] duration-200 motion-reduce:transition-none lg:contents',
          // invisible supaya menu yang tertutup tidak ikut terjangkau papan ketik.
          open ? 'translate-x-0' : 'invisible -translate-x-full lg:visible'
        )}
      >
        {children}
      </div>
    </>
  )
}
