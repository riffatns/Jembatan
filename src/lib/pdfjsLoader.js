// pdf.js (Apache-2.0) dimuat malas hanya saat admin memilih berkas PDF, supaya
// tidak membebani halaman lain. Worker dari paket yang sama (lewat ?url Vite);
// eval dimatikan di readPdfTablePages (isEvalSupported: false).
let loading = null

export function loadPdfjs() {
  loading ||= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([pdfjs, worker]) => {
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default
    return pdfjs
  }).catch((error) => {
    loading = null
    throw error
  })
  return loading
}
