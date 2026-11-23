const { config } = require('../config/env')

const SMALL_TALK_PATTERNS = [
  /^(halo|hai|hi|hello|hey|pagi|siang|sore|malam|selamat\s+(pagi|siang|sore|malam)|assalamualaikum|p|tes|test)[\s!?.]*$/i,
  /^(terima\s+kasih|makasih|thanks|thank\s+you|oke|ok|siap|mantap|keren|baik)[\s!?.]*$/i,
  /^(siapa\s+kamu|kamu\s+siapa|apa\s+itu\s+fritografi|kamu\s+bisa\s+apa|bantuan|help)[\s!?.]*$/i,
]

function isSmallTalkMessage(message = '', hasFiles = false) {
  if (hasFiles) return false
  const trimmed = String(message || '').trim()
  if (!trimmed || trimmed.length > 60) return false
  return SMALL_TALK_PATTERNS.some((pattern) => pattern.test(trimmed))
}

function inferSourceType(url = '') {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (
      host.includes('wikipedia.org') ||
      host.includes('britannica.com') ||
      host.includes('kbbi.')
    ) {
      return 'ENCYCLOPEDIA'
    }
    if (
      host.includes('pubmed') ||
      host.includes('ncbi.nlm.nih.gov') ||
      host.includes('nih.gov') ||
      host.includes('thelancet.com') ||
      host.includes('jamanetwork.com') ||
      host.includes('nature.com') ||
      host.includes('sciencedirect.com') ||
      host.includes('springer.com') ||
      host.includes('arxiv.org') ||
      host.includes('ieee.org') ||
      host.includes('nejm.org') ||
      host.includes('bmj.com') ||
      host.includes('ahajournals.org') ||
      host.includes('scholar.google') ||
      host.includes('doi.org')
    ) {
      return 'JOURNAL'
    }
    if (
      host.endsWith('.go.id') ||
      host.endsWith('.gov') ||
      host.includes('.gov.') ||
      host.endsWith('.edu') ||
      host.endsWith('.ac.id') ||
      host.includes('who.int') ||
      host.includes('un.org') ||
      host.includes('worldbank.org') ||
      host.includes('iea.org') ||
      host.includes('escardio.org')
    ) {
      return 'OFFICIAL'
    }
  } catch {
    // Fallback to WEB_SEARCH
  }
  return 'WEB_SEARCH'
}

function normalizeUrlKey(url = '') {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    return `${parsed.hostname.replace(/^www\./, '').toLowerCase()}${parsed.pathname.replace(/\/$/, '')}${parsed.search}`
  } catch {
    return String(url || '').trim().toLowerCase()
  }
}

async function searchSingleQuery({ query, mode = 'basic', maxResults, signal }) {
  if (!config.tavilyApiKey) {
    const error = new Error('TAVILY_API_KEY belum dikonfigurasi di server.')
    error.statusCode = 500
    throw error
  }

  const isComprehensive = mode === 'comprehensive'
  const searchDepth = isComprehensive ? 'advanced' : 'basic'
  const limit = maxResults || (isComprehensive ? 6 : 5)

  const timeoutSignal = AbortSignal.timeout(18000)
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  let response
  try {
    response = await fetch(`${config.tavilyBaseUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: config.tavilyApiKey,
        query: String(query || '').slice(0, 380),
        search_depth: searchDepth,
        max_results: limit,
        include_answer: false,
        include_raw_content: false,
      }),
      signal: combinedSignal,
    })
  } catch (err) {
    if (err?.name === 'AbortError' && signal?.aborted) {
      throw err
    }
    const error = new Error(
      'Koneksi ke layanan pencarian web (Tavily) sedang lambat atau terputus. Silakan coba lagi.',
    )
    error.statusCode = 504
    throw error
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const error = new Error('API key layanan pencarian web (Tavily) tidak valid.')
      error.statusCode = 502
      throw error
    }
    if (response.status === 429 || response.status === 432) {
      const error = new Error(
        'Kuota pencarian web Tavily saat ini sedang penuh. Silakan coba beberapa saat lagi.',
      )
      error.statusCode = 429
      throw error
    }
    const error = new Error(
      `Layanan pencarian web mengembalikan galat (${response.status}).`,
    )
    error.statusCode = 502
    throw error
  }

  const data = await response.json()
  const results = Array.isArray(data?.results) ? data.results : []

  return results
    .filter((item) => item && item.url && item.title)
    .map((item) => ({
      title: String(item.title || '').trim(),
      url: String(item.url || '').trim(),
      snippet: String(item.content || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 360),
      score:
        typeof item.score === 'number' && !Number.isNaN(item.score)
          ? Math.min(1, Math.max(0, item.score))
          : 0.7,
      sourceType: inferSourceType(item.url),
    }))
}

async function searchWebSources({ queries, mode = 'basic', signal }) {
  const cleanQueries = (Array.isArray(queries) ? queries : [queries])
    .map((q) => String(q || '').trim())
    .filter(Boolean)
    .slice(0, 2)

  if (cleanQueries.length === 0) return []

  const isComprehensive = mode === 'comprehensive'
  const targetTotal = isComprehensive ? 6 : 5
  const perQueryLimit =
    cleanQueries.length > 1
      ? Math.ceil(targetTotal / cleanQueries.length) + 1
      : targetTotal

  const settled = await Promise.allSettled(
    cleanQueries.map((q) =>
      searchSingleQuery({
        query: q,
        mode,
        maxResults: perQueryLimit,
        signal,
      }),
    ),
  )

  const merged = []
  let firstFatalError = null

  for (const outcome of settled) {
    if (outcome.status === 'fulfilled') {
      merged.push(...outcome.value)
    } else if (!firstFatalError) {
      firstFatalError = outcome.reason
    }
  }

  if (merged.length === 0 && firstFatalError) {
    throw firstFatalError
  }

  const seenUrls = new Set()
  const deduped = []

  merged.sort((a, b) => b.score - a.score)

  for (const item of merged) {
    const key = normalizeUrlKey(item.url)
    if (seenUrls.has(key)) continue
    seenUrls.add(key)
    deduped.push(item)
    if (deduped.length >= targetTotal) break
  }

  return deduped.map((item, idx) => ({
    ...item,
    sourceId: `W${idx + 1}`,
  }))
}

module.exports = {
  isSmallTalkMessage,
  inferSourceType,
  searchWebSources,
}
