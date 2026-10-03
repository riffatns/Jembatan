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

export function IconCoins(props) {
  return (
    <DuotoneSvg {...props}>
      <ellipse opacity={BACK} cx="15" cy="15.5" rx="7" ry="3" />
      <path opacity={BACK} d="M8 15.5v3c0 1.66 3.13 3 7 3s7-1.34 7-3v-3c0 1.66-3.13 3-7 3s-7-1.34-7-3Z" />
      <ellipse cx="9" cy="6" rx="7" ry="3" />
      <path d="M2 6v6c0 1.66 3.13 3 7 3 .7 0 1.37-.04 2-.12V12.4c-.63.07-1.3.1-2 .1-3.87 0-7-1.34-7-3V6Zm14 0c0 1.66-3.13 3-7 3v3.5c.7 0 1.37-.04 2-.12 1.1-.92 2.95-1.6 5-1.8Z" />
    </DuotoneSvg>
  )
}

export function IconPieChart(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M11 3.05A9 9 0 1 0 20.95 13H11Z" />
      <path d="M13 2.05V11h8.95A9 9 0 0 0 13 2.05Z" />
    </DuotoneSvg>
  )
}

export function IconPercent(props) {
  return (
    <DuotoneSvg {...props}>
      <circle opacity={BACK} cx="7" cy="7" r="3.5" />
      <circle opacity={BACK} cx="17" cy="17" r="3.5" />
      <path d="M17.3 4.3a1.4 1.4 0 0 1 2 2L6.7 19.7a1.4 1.4 0 0 1-2-2Z" />
    </DuotoneSvg>
  )
}

export function IconTarget(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M12 2a10 10 0 1 0 10 10h-2.5A7.5 7.5 0 1 1 12 4.5Z" />
      <path d="M12 7a5 5 0 1 0 5 5h-2.5A2.5 2.5 0 1 1 12 9.5Z" />
      <path d="M15.6 4.6 17 2l1.2 3.8L22 7l-2.6 1.4-3.9.1-2.8 2.8a1.2 1.2 0 0 1-1.7-1.7l2.8-2.8Z" />
    </DuotoneSvg>
  )
}

export function IconTableList(props) {
  return (
    <DuotoneSvg {...props}>
      <rect opacity={BACK} x="3" y="3" width="18" height="18" rx="3" />
      <rect x="6.5" y="7" width="11" height="2.2" rx="1.1" />
      <rect x="6.5" y="11" width="11" height="2.2" rx="1.1" />
      <rect x="6.5" y="15" width="7" height="2.2" rx="1.1" />
    </DuotoneSvg>
  )
}

export function IconInfo(props) {
  return (
    <DuotoneSvg {...props}>
      <circle opacity={BACK} cx="12" cy="12" r="10" />
      <rect x="10.75" y="10.5" width="2.5" height="7" rx="1.25" />
      <circle cx="12" cy="7.5" r="1.5" />
    </DuotoneSvg>
  )
}

export function IconUpload(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M4 14a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3a1 1 0 1 1 2 0v3a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-3a1 1 0 0 1 1-1Z" />
      <path d="M12 3a1 1 0 0 1 .7.3l4.5 4.5a1 1 0 0 1-1.4 1.4L13 6.4V15a1 1 0 1 1-2 0V6.4L8.2 9.2a1 1 0 0 1-1.4-1.4l4.5-4.5A1 1 0 0 1 12 3Z" />
    </DuotoneSvg>
  )
}

export function IconTrash(props) {
  return (
    <DuotoneSvg {...props}>
      <path opacity={BACK} d="M5 7h14l-1.1 12.2A2 2 0 0 1 15.9 21H8.1a2 2 0 0 1-2-1.8Z" />
      <path d="M9.5 3h5a1 1 0 0 1 1 1v1H19a1 1 0 1 1 0 2H5a1 1 0 0 1 0-2h3.5V4a1 1 0 0 1 1-1Z" />
      <rect x="9.25" y="10" width="1.8" height="7" rx="0.9" />
      <rect x="12.95" y="10" width="1.8" height="7" rx="0.9" />
    </DuotoneSvg>
  )
}
