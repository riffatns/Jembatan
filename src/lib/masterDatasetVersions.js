// Aturan versi Master Data generik (murni, tanpa Supabase, diuji dengan Node).
// - Versi diurutkan terbaru dulu (createdAt, lalu id sebagai penentu seri).
// - Data aktif = versi terbaru bila action 'upload'; 'clear' = kosong.
// - Hanya satu versi yang bisa aktif.

export function sortVersions(versions) {
  return [...versions].sort((a, b) => {
    const byTime = new Date(b.createdAt) - new Date(a.createdAt)
    return byTime || String(b.id).localeCompare(String(a.id))
  })
}

export function activeVersion(versions) {
  const top = sortVersions(versions)[0]
  return top?.action === 'upload' ? top : null
}

// Akibat menghapus satu versi, dihitung dari daftar sebelum dan sesudah:
// 'removed' (bukan versi terbaru, data tetap), 'restored' (kembali ke versi
// sebelumnya), atau 'emptied' (tidak ada versi unggahan di bawahnya).
export function deletionOutcome(before, deletedId, after = before.filter((version) => version.id !== deletedId)) {
  const wasTop = sortVersions(before)[0]?.id === deletedId
  if (!wasTop) return { outcome: 'removed', current: activeVersion(after) }
  const current = activeVersion(after)
  return { outcome: current ? 'restored' : 'emptied', current }
}
