import { getServiceContent } from './serviceContent'
import { USE_NEW_ACCOUNT_VIEWS, USE_NEW_HR_VIEWS } from '../lib/tampilan'

// Tampilan sidebar per bidang yang sudah memakai Master Data. Bidang yang tidak
// tercantum memakai sidebar bawaan (semua layanan, Monitoring, Integrasi).
//
// - categoryFilter: layanan yang ditampilkan (bawaan: semua)
// - hideCountFor: layanan tanpa angka hitungan dokumen
// - hideMonitoring / hideIntegration: sembunyikan Kalender Bersama / JASMIN
// - masterData: tautan Master Data (hanya untuk admin)
const DIVISION_SIDEBAR = {
  finance: {
    enabled: USE_NEW_ACCOUNT_VIEWS,
    categoryFilter: (category) => Boolean(getServiceContent(category.id).budgetCode),
    hideCountFor: () => true,
    hideMonitoring: true,
    hideIntegration: true,
    masterData: { label: 'Master Data Anggaran', path: '/dashboard/master-anggaran' }
  },
  hr: {
    enabled: USE_NEW_HR_VIEWS,
    // MCU tidak dipakai: disembunyikan dari menu, datanya tidak dihapus.
    categoryFilter: (category) => category.id !== 'mcu',
    hideCountFor: (category) => ['bezetting', 'diklat'].includes(category.id),
    hideMonitoring: true,
    hideIntegration: true,
    masterData: { label: 'Master Data SDM', path: '/dashboard/master-sdm' }
  }
}

const DEFAULT_SIDEBAR = { categoryFilter: () => true, hideCountFor: () => false, hideMonitoring: false, hideIntegration: false, masterData: null }

export function getDivisionSidebar(divisionId) {
  const config = DIVISION_SIDEBAR[divisionId]
  return config?.enabled ? { ...DEFAULT_SIDEBAR, ...config } : DEFAULT_SIDEBAR
}

export const MASTER_DATA_ROUTES = Object.values(DIVISION_SIDEBAR).map((config) => config.masterData.path)
