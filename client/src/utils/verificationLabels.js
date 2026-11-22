export const VERDICT_META = {
  SUPPORTED: {
    label: 'Didukung',
    shortLabel: 'Didukung',
    bgVar: 'var(--status-supported-bg)',
    textVar: 'var(--status-supported-text)',
    borderVar: 'var(--status-supported-border)',
    barColor: '#16a34a',
  },
  PARTIAL: {
    label: 'Sebagian Didukung',
    shortLabel: 'Sebagian',
    bgVar: 'var(--status-partial-bg)',
    textVar: 'var(--status-partial-text)',
    borderVar: 'var(--status-partial-border)',
    barColor: '#d97706',
  },
  CONTRADICTED: {
    label: 'Bertentangan',
    shortLabel: 'Bertentangan',
    bgVar: 'var(--status-contradicted-bg)',
    textVar: 'var(--status-contradicted-text)',
    borderVar: 'var(--status-contradicted-border)',
    barColor: '#dc2626',
  },
  UNVERIFIED: {
    label: 'Belum Terverifikasi',
    shortLabel: 'Belum Terverifikasi',
    bgVar: 'var(--status-neutral-bg)',
    textVar: 'var(--status-neutral-text)',
    borderVar: 'var(--status-neutral-border)',
    barColor: '#78716c',
  },
}

export const STANCE_META = {
  SUPPORTS: {
    label: 'Mendukung',
    bgVar: 'var(--status-supported-bg)',
    textVar: 'var(--status-supported-text)',
    borderVar: 'var(--status-supported-border)',
  },
  NEUTRAL: {
    label: 'Netral',
    bgVar: 'var(--status-neutral-bg)',
    textVar: 'var(--status-neutral-text)',
    borderVar: 'var(--status-neutral-border)',
  },
  CONTRADICTS: {
    label: 'Membantah',
    bgVar: 'var(--status-contradicted-bg)',
    textVar: 'var(--status-contradicted-text)',
    borderVar: 'var(--status-contradicted-border)',
  },
}

export const SOURCE_TYPE_LABELS = {
  WEB_SEARCH: 'Pencarian Web',
  JOURNAL: 'Jurnal Ilmiah',
  OFFICIAL: 'Dokumen Resmi',
  ENCYCLOPEDIA: 'Ensiklopedia',
}

export const MODE_META = {
  basic: {
    label: 'Dasar',
    badgeLabel: 'Mode: Dasar',
    description:
      'Mode Dasar menampilkan fakta inti dan ringkasan bukti utama. Beralih ke Mode Mendalam untuk melihat penalaran lengkap.',
  },
  comprehensive: {
    label: 'Mendalam',
    badgeLabel: 'Mode: Mendalam',
    description:
      'Mode Mendalam menampilkan analisis penalaran lengkap beserta keterbatasan dan konteks tiap sumber.',
  },
}

export function getVerdictMeta(verdict) {
  return VERDICT_META[verdict] || VERDICT_META.UNVERIFIED
}

export function getStanceMeta(stance) {
  return STANCE_META[stance] || STANCE_META.NEUTRAL
}

export function getSourceTypeLabel(sourceType) {
  return SOURCE_TYPE_LABELS[sourceType] || 'Sumber Web'
}

export function formatScore(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '0.00'
  return value.toFixed(2)
}
