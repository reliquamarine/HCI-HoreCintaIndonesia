const path = require('node:path')
const multer = require('multer')

const MAX_FILES_PER_REQUEST = 3
const MAX_FILE_SIZE_MB = 4
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'docx',
  'txt',
  'md',
  'csv',
  'png',
  'jpg',
  'jpeg',
  'webp',
])

function getExtension(fileName = '') {
  const ext = path.extname(fileName).replace(/^\./, '').toLowerCase()
  return ext
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_FILES_PER_REQUEST,
    fileSize: MAX_FILE_SIZE_BYTES,
    fields: 15,
    fieldSize: 2 * 1024 * 1024,
  },
  fileFilter(_req, file, cb) {
    const ext = getExtension(file.originalname)
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      const error = new Error(
        `Format file "${file.originalname}" tidak didukung. Gunakan PDF, DOCX, TXT, MD, CSV, atau gambar.`,
      )
      error.statusCode = 400
      cb(error)
      return
    }
    cb(null, true)
  },
})

function uploadMiddleware(req, res, next) {
  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data')) {
    next()
    return
  }

  upload.array('files', MAX_FILES_PER_REQUEST)(req, res, (err) => {
    if (!err) {
      next()
      return
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({
          error: `Ukuran file melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB per file.`,
        })
        return
      }
      if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
        res.status(400).json({
          error: `Maksimal ${MAX_FILES_PER_REQUEST} file dapat dilampirkan dalam satu pesan.`,
        })
        return
      }
      res.status(400).json({
        error: 'Gagal membaca file lampiran. Pastikan format dan ukuran file sesuai.',
      })
      return
    }

    next(err)
  })
}

module.exports = {
  uploadMiddleware,
  MAX_FILES_PER_REQUEST,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
  getExtension,
}
