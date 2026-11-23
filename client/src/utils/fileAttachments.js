export const MAX_FILES_PER_MESSAGE = 3
export const MAX_FILE_SIZE_MB = 4
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MAX_TOTAL_UPLOAD_BYTES = MAX_FILE_SIZE_BYTES

export const ALLOWED_DOCUMENT_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'csv']
export const ALLOWED_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp']
export const ALLOWED_EXTENSIONS = [
  ...ALLOWED_DOCUMENT_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
]

export const TEXT_READABLE_EXTENSIONS = ['txt', 'md', 'csv']

export const FILE_INPUT_ACCEPT = [
  '.pdf',
  '.docx',
  '.txt',
  '.md',
  '.csv',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/webp',
].join(',')

export const DEFAULT_ATTACHMENT_PROMPT =
  'Ringkas dan verifikasi klaim utama pada dokumen terlampir.'

export function getFileExtension(fileName = '') {
  const idx = fileName.lastIndexOf('.')
  if (idx === -1 || idx === fileName.length - 1) return ''
  return fileName.slice(idx + 1).toLowerCase()
}

export function isImageExtension(ext) {
  return ALLOWED_IMAGE_EXTENSIONS.includes(ext)
}

export function isTextReadableExtension(ext) {
  return TEXT_READABLE_EXTENSIONS.includes(ext)
}

export function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes < 0) {
    return '0 B'
  }
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

export function validateIncomingFiles(fileList, existingItems = []) {
  const incoming = Array.from(fileList || [])
  const accepted = []
  const errors = []

  let remainingSlots = Math.max(0, MAX_FILES_PER_MESSAGE - existingItems.length)
  let currentTotalBytes = existingItems.reduce(
    (sum, item) => sum + (Number(item.size) || 0),
    0,
  )

  for (const file of incoming) {
    const ext = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.push(
        `Format file "${file.name}" tidak didukung. Gunakan PDF, DOCX, TXT, MD, CSV, atau gambar.`,
      )
      continue
    }

    if (file.size === 0) {
      errors.push(`File "${file.name}" kosong dan tidak dapat diproses.`)
      continue
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(
        `Ukuran "${file.name}" melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB.`,
      )
      continue
    }

    const isDuplicate =
      existingItems.some(
        (item) => item.name === file.name && item.size === file.size,
      ) ||
      accepted.some(
        (item) => item.name === file.name && item.size === file.size,
      )

    if (isDuplicate) {
      errors.push(`File "${file.name}" sudah terlampir.`)
      continue
    }

    if (remainingSlots <= 0) {
      errors.push(
        `Maksimal ${MAX_FILES_PER_MESSAGE} file dapat dilampirkan dalam satu pesan.`,
      )
      break
    }

    if (currentTotalBytes + file.size > MAX_TOTAL_UPLOAD_BYTES) {
      errors.push(
        `Total ukuran lampiran dalam satu pesan maksimal ${MAX_FILE_SIZE_MB} MB.`,
      )
      continue
    }

    accepted.push(file)
    remainingSlots -= 1
    currentTotalBytes += file.size
  }

  return { accepted, errors }
}

export function readTextExcerpt(file, maxChars = 1500) {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : ''
        const cleaned = text.replace(/\r\n/g, '\n').trim()
        resolve(
          cleaned.length > maxChars
            ? `${cleaned.slice(0, maxChars).trimEnd()}...`
            : cleaned,
        )
      }
      reader.onerror = () => resolve('')
      reader.readAsText(file.slice(0, maxChars * 4), 'UTF-8')
    } catch {
      resolve('')
    }
  })
}

function createAttachmentId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `att_${crypto.randomUUID().slice(0, 8)}`
  }
  return `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
}

export async function prepareAttachmentItem(file) {
  const extension = getFileExtension(file.name)
  const isImage = isImageExtension(extension)
  const previewUrl = isImage ? URL.createObjectURL(file) : null
  const textExcerpt = isTextReadableExtension(extension)
    ? await readTextExcerpt(file)
    : ''

  return {
    id: createAttachmentId(),
    file,
    name: file.name,
    size: file.size,
    mimeType: file.type || '',
    extension,
    isImage,
    previewUrl,
    textExcerpt,
  }
}

export function toSerializableAttachment(item) {
  return {
    id: item.id,
    name: item.name,
    size: item.size,
    mimeType: item.mimeType || '',
    extension: item.extension || getFileExtension(item.name),
    isImage: Boolean(item.isImage),
    textExcerpt: item.textExcerpt || '',
  }
}
