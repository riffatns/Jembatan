import { useState } from 'react'
import { downloadMasterFile } from '../../lib/masterFileStorage'

// Unduh ulang berkas asli satu versi Master Data. notice hanya diisi bila gagal.
export function useSourceDownload() {
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)

  const download = async (row) => {
    setBusyId(row.id)
    setNotice(null)
    const result = await downloadMasterFile(row.sourceFilePath, row.sourceFileName)
    setBusyId(null)
    if (!result.ok) setNotice({ ok: false, text: result.message })
  }

  return { busyId, notice, download, clearNotice: () => setNotice(null) }
}
