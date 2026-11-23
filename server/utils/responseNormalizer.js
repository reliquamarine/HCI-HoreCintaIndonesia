const VALID_VERDICTS = new Set([
  'SUPPORTED',
  'PARTIAL',
  'CONTRADICTED',
  'UNVERIFIED',
])

const VALID_STANCES = new Set(['SUPPORTS', 'NEUTRAL', 'CONTRADICTS'])

const AI_POV_FOLLOWUP_PATTERNS = [
  /^(mau|perlu|ingin|boleh)\s+(saya|aku)\b/i,
  /^apakah\s+(anda|kamu)\s+(ingin|mau|perlu)\s+(saya|aku)\b/i,
  /\b(mau saya|perlu saya|ingin saya|bisa saya bantu|struktur json|format json|prosa biasa)\b/i,
]

function cleanForbiddenSeparators(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/\u2014/g, ', ')
    .replace(/\u2013/g, ' hingga ')
    .replace(/\u2022/g, ', ')
    .replace(/\u00B7/g, ', ')
    .replace(/,\s*,+/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function cleanMarkdownReply(text) {
  if (typeof text !== 'string') return ''
  return text
    .replace(/\u2014/g, ', ')
    .replace(/\u2013/g, ' hingga ')
    .replace(/\u2022/g, '-')
    .replace(/\u00B7/g, ', ')
    .trim()
}

function clampScore(value, fallback = 0.7) {
  const num = Number(value)
  if (Number.isNaN(num) || !Number.isFinite(num)) return fallback
  const clamped = Math.min(1, Math.max(0, num))
  return Math.round(clamped * 100) / 100
}

function extractJsonObject(rawText) {
  if (typeof rawText !== 'string' || !rawText.trim()) return null

  let cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .trim()

  const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fencedMatch && fencedMatch[1]) {
    cleaned = fencedMatch[1].trim()
  }

  try {
    return JSON.parse(cleaned)
  } catch {
    // Fallback: locate outermost balanced JSON object
  }

  const startIdx = cleaned.indexOf('{')
  const endIdx = cleaned.lastIndexOf('}')
  if (startIdx === -1 || endIdx <= startIdx) return null

  const candidate = cleaned.slice(startIdx, endIdx + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    return null
  }
}

function recoverReplyFromTruncatedJson(rawText) {
  if (typeof rawText !== 'string') return ''
  const match = rawText.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  if (!match || !match[1]) return ''
  try {
    return JSON.parse(`"${match[1]}"`)
  } catch {
    return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
  }
}

function looksLikeRawJson(text) {
  const trimmed = String(text || '').trim()
  return (
    trimmed.startsWith('{') ||
    trimmed.startsWith('```json') ||
    /"claims"\s*:\s*\[/.test(trimmed)
  )
}

function buildSourceLookup(webSources = [], userSources = []) {
  const byId = new Map()
  const byUrl = new Map()

  for (const ws of webSources) {
    byId.set(ws.sourceId.toUpperCase(), { kind: 'web', data: ws })
    byUrl.set(ws.url.trim().toLowerCase(), ws)
  }

  for (const us of userSources) {
    byId.set(us.sourceId.toUpperCase(), { kind: 'user', data: us })
  }

  return { byId, byUrl }
}

function normalizeEvidenceItem(rawEvidence, idx, claimIdx, lookup) {
  if (!rawEvidence || typeof rawEvidence !== 'object') return null

  const rawId = String(rawEvidence.sourceId || rawEvidence.source_id || '')
    .trim()
    .toUpperCase()
  let resolved = rawId ? lookup.byId.get(rawId) : null

  if (!resolved && rawEvidence.url) {
    const matchedWeb = lookup.byUrl.get(
      String(rawEvidence.url).trim().toLowerCase(),
    )
    if (matchedWeb) {
      resolved = { kind: 'web', data: matchedWeb }
    }
  }

  // Tolak sumber yang tidak ada dalam daftar sumber nyata (anti halusinasi URL)
  if (!resolved) return null

  const stance = VALID_STANCES.has(String(rawEvidence.stance || '').toUpperCase())
    ? String(rawEvidence.stance).toUpperCase()
    : 'NEUTRAL'

  if (resolved.kind === 'user') {
    const doc = resolved.data
    const fallbackSnippet = doc.isImage
      ? `Informasi visual dari lampiran gambar ${doc.fileName}.`
      : String(doc.text || '').replace(/\s+/g, ' ').slice(0, 260).trim()

    return {
      id: `ev_${claimIdx}_${idx + 1}`,
      sourceType: 'USER_DOCUMENT',
      stance,
      credibility: clampScore(rawEvidence.credibility, 0.85),
      relevance: clampScore(rawEvidence.relevance, 0.9),
      title: cleanForbiddenSeparators(
        rawEvidence.title || `Kutipan dari ${doc.fileName}`,
      ),
      fileName: doc.fileName,
      locationLabel: cleanForbiddenSeparators(
        rawEvidence.locationLabel || doc.locationLabel || 'Dokumen Terlampir',
      ),
      snippet: cleanForbiddenSeparators(rawEvidence.snippet || fallbackSnippet),
    }
  }

  const web = resolved.data
  return {
    id: `ev_${claimIdx}_${idx + 1}`,
    sourceType: web.sourceType || 'WEB_SEARCH',
    stance,
    credibility: clampScore(rawEvidence.credibility, 0.78),
    relevance: clampScore(
      rawEvidence.relevance !== undefined ? rawEvidence.relevance : web.score,
      web.score || 0.8,
    ),
    title: cleanForbiddenSeparators(web.title),
    url: web.url,
    snippet: cleanForbiddenSeparators(rawEvidence.snippet || web.snippet),
  }
}

function normalizeClaims(rawClaims, mode, lookup) {
  if (!Array.isArray(rawClaims)) return []

  const normalized = []

  for (let i = 0; i < rawClaims.length; i += 1) {
    const item = rawClaims[i]
    if (!item || typeof item !== 'object') continue

    const statement = cleanForbiddenSeparators(item.statement || '')
    if (!statement) continue

    const claimIndex = normalized.length + 1
    const rawEvidenceList = Array.isArray(item.evidence) ? item.evidence : []

    const seenKeys = new Set()
    const evidence = []
    for (let j = 0; j < rawEvidenceList.length; j += 1) {
      const ev = normalizeEvidenceItem(rawEvidenceList[j], j, claimIndex, lookup)
      if (!ev) continue
      const dedupeKey = ev.url || `${ev.fileName}_${ev.snippet.slice(0, 40)}`
      if (seenKeys.has(dedupeKey)) continue
      seenKeys.add(dedupeKey)
      evidence.push(ev)
    }

    const keySources = []
    const seenKeyUrls = new Set()
    for (const ev of evidence) {
      if (ev.url && !seenKeyUrls.has(ev.url)) {
        seenKeyUrls.add(ev.url)
        keySources.push({ title: ev.title, url: ev.url })
      }
    }

    let verdict = VALID_VERDICTS.has(String(item.verdict || '').toUpperCase())
      ? String(item.verdict).toUpperCase()
      : 'UNVERIFIED'
    let confidence = clampScore(item.confidence, 0.72)

    if (evidence.length === 0) {
      verdict = 'UNVERIFIED'
      confidence = Math.min(confidence, 0.45)
    }

    normalized.push({
      id: `claim_${claimIndex}`,
      index: claimIndex,
      verdict,
      confidence,
      statement,
      summary: cleanForbiddenSeparators(
        item.summary ||
          'Klaim ini diringkas berdasarkan perbandingan bukti yang tersedia.',
      ),
      reasoning:
        mode === 'comprehensive'
          ? cleanForbiddenSeparators(item.reasoning || '')
          : '',
      keySources,
      evidence,
    })
  }

  return normalized
}

function sanitizeReplyCitations(reply, claimCount) {
  if (typeof reply !== 'string') return ''
  return reply
    .replace(/\[(\d+)\]/g, (match, numStr) => {
      const n = Number(numStr)
      if (!Number.isInteger(n) || n < 1 || n > claimCount) {
        return ''
      }
      return match
    })
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +([.,!?;:])/g, '$1')
    .trim()
}

function normalizeFollowUps(rawFollowUps) {
  if (!Array.isArray(rawFollowUps)) return []
  return rawFollowUps
    .map((q) => cleanForbiddenSeparators(String(q || '')))
    .filter((q) => {
      if (q.length < 6 || q.length > 130) return false
      return !AI_POV_FOLLOWUP_PATTERNS.some((pattern) => pattern.test(q))
    })
    .slice(0, 3)
}

function normalizeChatPayload({
  rawText,
  webSources = [],
  userSources = [],
  mode = 'basic',
}) {
  const parsed = extractJsonObject(rawText)
  const lookup = buildSourceLookup(webSources, userSources)

  if (!parsed || typeof parsed !== 'object') {
    const stripped = String(rawText || '')
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .trim()

    // Cegah JSON mentah bocor ke chat: ekstrak hanya field reply bila JSON terpotong
    let safeReply = ''
    if (looksLikeRawJson(stripped)) {
      safeReply = cleanMarkdownReply(recoverReplyFromTruncatedJson(stripped))
    } else {
      safeReply = cleanMarkdownReply(stripped)
    }

    return {
      reply:
        safeReply ||
        'Maaf, respons dari model AI terpotong sebelum selesai diformat. Silakan tekan Jawab Ulang untuk mencoba lagi.',
      mode,
      claims: [],
      followUps: [],
      parseFailed: true,
    }
  }

  const claims = normalizeClaims(parsed.claims, mode, lookup)
  const reply = sanitizeReplyCitations(
    cleanMarkdownReply(parsed.reply || ''),
    claims.length,
  )
  const followUps = normalizeFollowUps(parsed.followUps)

  return {
    reply:
      reply ||
      'Berikut hasil penelusuran dan verifikasi klaim berdasarkan sumber yang ditemukan.',
    mode,
    claims,
    followUps,
    parseFailed: false,
  }
}

module.exports = {
  cleanForbiddenSeparators,
  cleanMarkdownReply,
  sanitizeReplyCitations,
  extractJsonObject,
  recoverReplyFromTruncatedJson,
  looksLikeRawJson,
  normalizeFollowUps,
  normalizeChatPayload,
}
