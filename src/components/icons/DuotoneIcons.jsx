// Ikon duotone JEMBATAN: bentuk terisi (fill), tanpa garis tepi dan tanpa
// bingkai. Lapisan belakang memakai warna yang sama dengan opasitas rendah,
// lapisan depan penuh, jadi ikon mengikuti `color` induknya (text-*).
// Grid 24x24. Ikon baru ditambahkan di sini dengan aturan yang sama.

const BACK = 0.35

function DuotoneSvg({ children, className, ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className} {...props}>
      {children}
    </svg>
  )
}

export function IconDatabase(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M4 5.5v13c0 1.66 3.58 3 8 3s8-1.34 8-3v-13c0 1.66-3.58 3-8 3s-8-1.34-8-3Z" />
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 11.2c0 1.66 3.58 3 8 3s8-1.34 8-3v1.8c0 1.66-3.58 3-8 3s-8-1.34-8-3Z" />
    </DuotoneSvg>
  )
}

export function IconChartBars(props) {
  return (
    <DuotoneSvg {...props}>
      <rect opacity={BACK} x="3" y="12" width="4.5" height="9" rx="1.5" />
      <rect x="9.75" y="7" width="4.5" height="14" rx="1.5" />
      <rect x="16.5" y="3" width="4.5" height="18" rx="1.5" />
    </DuotoneSvg>
  )
}

export function IconDocument(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4Z" />
      <rect x="7.5" y="12" width="9" height="2" rx="1" />
      <rect x="7.5" y="16" width="6" height="2" rx="1" />
    </DuotoneSvg>
  )
}

export function IconCalendar(props) {
  return (
    <DuotoneSvg {...props}>
      <rect opacity={BACK} x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v2H3Z" />
      <rect x="7" y="2.5" width="2" height="5" rx="1" />
      <rect x="15" y="2.5" width="2" height="5" rx="1" />
      <rect x="7" y="13" width="3" height="3" rx="0.8" />
      <rect x="14" y="13" width="3" height="3" rx="0.8" />
    </DuotoneSvg>
  )
}

export function IconTrendUp(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M3 21v-4.6l6-6 4 4 8-8V21Z" />
      <path d="M14.5 4H21v6.5l-2.4-2.4-5.6 5.6-4-4-4.6 4.6a1.4 1.4 0 0 1-2-2l5.6-5.6a1.4 1.4 0 0 1 2 0l4 4 4.6-4.6Z" />
    </DuotoneSvg>
  )
}

export function IconFolderDocuments(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M3 7a2 2 0 0 1 2-2h4.2l2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 10.5h18V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </DuotoneSvg>
  )
}

export function IconChevronDown(props) {
  return (
    <DuotoneSvg {...props}>
      <path d="M6.3 8.8a1 1 0 0 1 1.4 0l4.3 4.3 4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4Z" />
    </DuotoneSvg>
  )
}
