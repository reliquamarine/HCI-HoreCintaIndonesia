import { getExtension } from '../middleware/upload.js'

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp'])
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'csv'])
const MAX_CHARS_PER_DOCUMENT = 20000

const MIME_BY_EXTENSION = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

function truncateText(text, maxChars = MAX_CHARS_PER_DOCUMENT) {
  const cleaned = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .trim()
  if (cleaned.length <= maxChars) {
    return { text: cleaned, truncated: false }
  }
  return {
    text: `${cleaned.slice(0, maxChars).trimEnd()}\n[Sebagian isi dokumen dipotong karena panjang dokumen melebihi batas konteks ringkas.]`,
    truncated: true,
  }
}

async function extractPdfText(buffer, fileName) {
  let pdf = null
  try {
    const { extractText, getDocumentProxy } = await import('unpdf')
    pdf = await getDocumentProxy(new Uint8Array(buffer))
    const result = await extractText(pdf, { mergePages: true })
    const rawText = Array.isArray(result?.text)
      ? result.text.join('\n')
      : result?.text || ''
    const { text, truncated } = truncateText(rawText)
    return {
      text,
      truncated,
      pageCount:
        typeof result?.totalPages === 'number' ? result.totalPages : null,
    }
  } catch (err) {
    const message = String(err?.message || '').toLowerCase()
    if (message.includes('password')) {
      const error = new Error(
        `File PDF "${fileName}" dilindungi kata sandi dan tidak dapat dibaca.`,
      )
      error.statusCode = 400
      throw error
    }
    const error = new Error(
      `Gagal membaca isi PDF "${fileName}". Pastikan file PDF tidak rusak.`,
    )
    error.statusCode = 400
    throw error
  } finally {
    if (pdf && typeof pdf.destroy === 'function') {
      await pdf.destroy().catch(() => {})
    }
  }
}

async function extractDocxText(buffer, fileName) {
  try {
    const mammothModule = await import('mammoth')
    const mammoth = mammothModule.default || mammothModule
    const result = await mammoth.extractRawText({ buffer })
    const { text, truncated } = truncateText(result?.value || '')
    return { text, truncated, pageCount: null }
  } catch {
    const error = new Error(
      `Gagal membaca isi dokumen DOCX "${fileName}". Pastikan file valid dan tidak rusak.`,
    )
    error.statusCode = 400
    throw error
  }
}

async function processUploadedFiles(files = []) {
  const documents = []
  const images = []
  const userSources = []

  if (!Array.isArray(files) || files.length === 0) {
    return { documents, images, userSources }
  }

  let docCounter = 0

  for (const file of files) {
    const ext = getExtension(file.originalname)
    docCounter += 1
    const sourceId = `D${docCounter}`

    if (IMAGE_EXTENSIONS.has(ext)) {
      const mimeType =
        file.mimetype && file.mimetype.startsWith('image/')
          ? file.mimetype
          : MIME_BY_EXTENSION[ext] || 'image/png'
      const base64 = file.buffer.toString('base64')
      const dataUrl = `data:${mimeType};base64,${base64}`

      const imageItem = {
        sourceId,
        fileName: file.originalname,
        extension: ext,
        mimeType,
        size: file.size,
        dataUrl,
        isImage: true,
        locationLabel: 'Lampiran Gambar',
      }
      images.push(imageItem)
      userSources.push(imageItem)
      continue
    }

    let extracted = { text: '', truncated: false, pageCount: null }

    if (TEXT_EXTENSIONS.has(ext)) {
      const { text, truncated } = truncateText(file.buffer.toString('utf8'))
      extracted = { text, truncated, pageCount: null }
    } else if (ext === 'pdf') {
      extracted = await extractPdfText(file.buffer, file.originalname)
    } else if (ext === 'docx') {
      extracted = await extractDocxText(file.buffer, file.originalname)
    }

    const docItem = {
      sourceId,
      fileName: file.originalname,
      extension: ext,
      size: file.size,
      text: extracted.text,
      truncated: extracted.truncated,
      pageCount: extracted.pageCount,
      isImage: false,
      locationLabel: extracted.pageCount
        ? `PDF (${extracted.pageCount} halaman)`
        : `Dokumen ${ext.toUpperCase()}`,
    }

    documents.push(docItem)
    userSources.push(docItem)
  }

  return { documents, images, userSources }
}

export { processUploadedFiles }
