const express = require('express')
const { chatRateLimiter } = require('../middleware/rateLimit')
const { uploadMiddleware } = require('../middleware/upload')
const { processUploadedFiles } = require('../services/fileProcessor')
const {
  isSmallTalkMessage,
  searchWebSources,
} = require('../services/tavilyService')
const {
  deepenClaimsReasoning,
  generateSearchQueries,
  handleSmallTalk,
  synthesizeVerifiedAnswer,
} = require('../services/zroService')

const router = express.Router()

const MAX_MESSAGE_LENGTH = 2500
const DEFAULT_ATTACHMENT_PROMPT =
  'Ringkas dan verifikasi klaim utama pada dokumen terlampir.'

function parseHistory(rawHistory) {
  if (Array.isArray(rawHistory)) return rawHistory
  if (typeof rawHistory === 'string' && rawHistory.trim()) {
    try {
      const parsed = JSON.parse(rawHistory)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function normalizeMode(rawMode) {
  return rawMode === 'comprehensive' ? 'comprehensive' : 'basic'
}

router.post('/chat', chatRateLimiter, uploadMiddleware, async (req, res, next) => {
  const abortController = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort()
    }
  })

  try {
    const uploadedFiles = Array.isArray(req.files) ? req.files : []
    const rawMessage = typeof req.body?.message === 'string' ? req.body.message.trim() : ''
    const hasFiles = uploadedFiles.length > 0

    if (!rawMessage && !hasFiles) {
      res.status(400).json({
        error: 'Pertanyaan atau file lampiran tidak boleh kosong.',
      })
      return
    }

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({
        error: `Panjang pertanyaan melebihi batas maksimal ${MAX_MESSAGE_LENGTH} karakter.`,
      })
      return
    }

    const query = rawMessage || DEFAULT_ATTACHMENT_PROMPT
    const mode = normalizeMode(req.body?.mode)
    const history = parseHistory(req.body?.history)

    // Jalur cepat untuk sapaan ringan tanpa file (hemat kuota Tavily)
    if (isSmallTalkMessage(query, hasFiles)) {
      const smallTalkResult = await handleSmallTalk({
        query,
        history,
        signal: abortController.signal,
      })
      res.json({
        ...smallTalkResult,
        mode,
      })
      return
    }

    // 1. Proses file lampiran di memori (jika ada)
    const { documents, images } = await processUploadedFiles(uploadedFiles)

    // 2. Susun kueri pencarian fokus bila ada file/gambar atau riwayat percakapan
    let searchQueries = [query]
    if (documents.length > 0 || images.length > 0 || history.length > 0) {
      searchQueries = await generateSearchQueries({
        query,
        history,
        documents,
        images,
        signal: abortController.signal,
      })
    }

    // 3. Cari sumber web nyata melalui Tavily
    const webSources = await searchWebSources({
      queries: searchQueries,
      mode,
      signal: abortController.signal,
    })

    // 4. Sintesis jawaban dan verifikasi klaim lewat Zro (deepseek-v4.1-flash)
    const result = await synthesizeVerifiedAnswer({
      query,
      history,
      mode,
      webSources,
      documents,
      images,
      signal: abortController.signal,
    })

    res.json(result)
  } catch (err) {
    if (err?.name === 'AbortError' && abortController.signal.aborted) {
      return
    }
    next(err)
  }
})

router.post('/chat/deepen', chatRateLimiter, async (req, res, next) => {
  const abortController = new AbortController()
  res.on('close', () => {
    if (!res.writableEnded) {
      abortController.abort()
    }
  })

  try {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : ''
    const claims = Array.isArray(req.body?.claims) ? req.body.claims : []

    if (claims.length === 0) {
      res.status(400).json({
        error: 'Daftar klaim untuk dianalisis lebih mendalam tidak ditemukan.',
      })
      return
    }

    const result = await deepenClaimsReasoning({
      query,
      claims: claims.slice(0, 8),
      signal: abortController.signal,
    })

    res.json(result)
  } catch (err) {
    if (err?.name === 'AbortError' && abortController.signal.aborted) {
      return
    }
    next(err)
  }
})

module.exports = router
