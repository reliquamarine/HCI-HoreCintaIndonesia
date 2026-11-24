import { config } from '../config/env.js'
import {
  cleanForbiddenSeparators,
  cleanMarkdownReply,
  extractJsonObject,
  looksLikeRawJson,
  normalizeChatPayload,
} from '../utils/responseNormalizer.js'

async function callZroChat({
  messages,
  maxTokens = 8192,
  temperature = 0.2,
  reasoningEffort = 'low',
  jsonMode = false,
  timeoutMs = 85000,
  signal,
}) {
  if (!config.zroApiKey) {
    const error = new Error('ZRO_API_KEY belum dikonfigurasi di server.')
    error.statusCode = 500
    throw error
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const combinedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  const body = {
    model: config.zroModel,
    messages,
    max_tokens: maxTokens,
    temperature,
    reasoning_effort: reasoningEffort,
    stream: true,
  }

  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  let response
  try {
    response = await fetch(`${config.zroBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.zroApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: combinedSignal,
    })
  } catch (err) {
    if (err?.name === 'AbortError' && signal?.aborted) {
      throw err
    }
    const error = new Error(
      'Koneksi ke model AI (Zro) melebihi batas waktu atau terputus. Silakan coba lagi.',
    )
    error.statusCode = 504
    throw error
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      const error = new Error(
        'API key model AI (Zro) tidak valid atau kedaluwarsa.',
      )
      error.statusCode = 502
      throw error
    }
    if (response.status === 429) {
      const error = new Error(
        'Kuota harian gratis model AI (Zro) sedang penuh. Silakan coba lagi beberapa saat lagi atau setelah kuota direset.',
      )
      error.statusCode = 429
      throw error
    }
    const error = new Error(
      `Layanan model AI mengembalikan galat (${response.status}). Silakan coba lagi.`,
    )
    error.statusCode = 502
    throw error
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/event-stream') || !response.body) {
    const data = await response.json()
    const message = data?.choices?.[0]?.message || {}
    return {
      content: String(message.content || '').trim(),
      reasoningContent: String(message.reasoning_content || '').trim(),
      finishReason: data?.choices?.[0]?.finish_reason || '',
    }
  }

  // Baca SSE stream untuk menjaga koneksi tetap aktif pada model penalaran
  let content = ''
  let reasoningContent = ''
  let finishReason = ''

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for await (const chunk of response.body) {
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const rawLine of lines) {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const parsed = JSON.parse(payload)
          const choice = parsed?.choices?.[0]
          if (choice?.finish_reason) {
            finishReason = choice.finish_reason
          }
          const delta = choice?.delta
          if (typeof delta?.content === 'string') {
            content += delta.content
          }
          if (typeof delta?.reasoning_content === 'string') {
            reasoningContent += delta.reasoning_content
          }
        } catch {
          // Abaikan potongan chunk non-JSON
        }
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError' && signal?.aborted) {
      throw err
    }
    if (!content.trim()) {
      const error = new Error(
        'Koneksi streaming ke model AI terputus sebelum jawaban selesai. Silakan coba lagi.',
      )
      error.statusCode = 504
      throw error
    }
  }

  return {
    content: content.trim(),
    reasoningContent: reasoningContent.trim(),
    finishReason,
  }
}

function formatHistoryContext(history = []) {
  if (!Array.isArray(history) || history.length === 0) return ''
  return history
    .slice(-6)
    .filter((m) => {
      if (!m || (m.role !== 'user' && m.role !== 'assistant') || !m.content) {
        return false
      }
      if (
        m.role === 'assistant' &&
        (looksLikeRawJson(m.content) ||
          m.content.includes('kesulitan memformat hasil verifikasi') ||
          m.content.includes('terpotong sebelum selesai diformat'))
      ) {
        return false
      }
      return true
    })
    .map((m) => {
      const speaker = m.role === 'user' ? 'Pengguna' : 'FritoGrafi'
      return `${speaker}: ${String(m.content).slice(0, 420)}`
    })
    .join('\n')
}

function buildMultimodalUserContent(textPrompt, images = []) {
  if (!Array.isArray(images) || images.length === 0) {
    return textPrompt
  }
  return [
    { type: 'text', text: textPrompt },
    ...images.map((img) => ({
      type: 'image_url',
      image_url: { url: img.dataUrl },
    })),
  ]
}

async function handleSmallTalk({ query, history, signal }) {
  const historyText = formatHistoryContext(history)
  const messages = [
    {
      role: 'system',
      content:
        'Kamu adalah FritoGrafi, asisten percakapan berbahasa Indonesia untuk menjawab pertanyaan dan memverifikasi klaim beserta sumber rujukan. Jawab sapaan pengguna secara singkat, ramah, dan natural dalam Bahasa Indonesia. Jangan pakai simbol titik tengah atau em dash.',
    },
    {
      role: 'user',
      content: historyText
        ? `Riwayat singkat:\n${historyText}\n\nPesan terbaru pengguna: ${query}`
        : query,
    },
  ]

  const result = await callZroChat({
    messages,
    maxTokens: 1536,
    temperature: 0.4,
    reasoningEffort: 'low',
    timeoutMs: 30000,
    signal,
  })

  return {
    reply:
      cleanMarkdownReply(result.content) ||
      'Halo! Aku FritoGrafi. Silakan ajukan pertanyaan atau lampirkan dokumen yang ingin kamu cek kebenarannya.',
    mode: 'basic',
    claims: [],
    followUps: [
      'Benarkah jalan kaki 10.000 langkah per hari menurunkan risiko demensia?',
      'Apakah kendaraan listrik lebih rendah emisi daripada mobil bensin?',
    ],
  }
}

async function generateSearchQueries({
  query,
  history = [],
  documents = [],
  images = [],
  signal,
}) {
  const historyText = formatHistoryContext(history)
  const docSummary = documents
    .map(
      (doc) =>
        `[${doc.sourceId}] ${doc.fileName}:\n${String(doc.text || '').slice(0, 1800)}`,
    )
    .join('\n\n')

  const promptParts = [
    'Buat 1 sampai 2 kueri pencarian web singkat dan faktual (maksimal 12 kata) dalam Bahasa Indonesia atau Bahasa Inggris (jangan gunakan bahasa lain) untuk memverifikasi pertanyaan atau isi dokumen/gambar pengguna.',
    'Jawab HANYA JSON: {"queries": ["kueri 1"]}.',
  ]

  if (historyText) {
    promptParts.push(`Riwayat sebelumnya:\n${historyText}`)
  }
  if (docSummary) {
    promptParts.push(`Cuplikan dokumen pengguna:\n${docSummary}`)
  }
  if (images.length > 0) {
    promptParts.push(
      `Pengguna melampirkan ${images.length} gambar. Identifikasi subjek, teks, atau karakter utama pada gambar untuk menyusun kueri pencarian yang tepat.`,
    )
  }
  promptParts.push(`Pertanyaan pengguna: ${query}`)

  try {
    const result = await callZroChat({
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah generator kueri pencarian verifikasi fakta. Kembalikan hanya JSON {"queries": [...]}.',
        },
        {
          role: 'user',
          content: buildMultimodalUserContent(promptParts.join('\n\n'), images),
        },
      ],
      maxTokens: 1536,
      temperature: 0.1,
      reasoningEffort: 'low',
      jsonMode: true,
      timeoutMs: 30000,
      signal,
    })

    const parsed = extractJsonObject(result.content)
    if (Array.isArray(parsed?.queries) && parsed.queries.length > 0) {
      const valid = parsed.queries
        .map((q) => String(q || '').trim())
        .filter((q) => q.length >= 3)
        .slice(0, 2)
      if (valid.length > 0) return valid
    }
  } catch (err) {
    if (err?.name === 'AbortError' && signal?.aborted) {
      throw err
    }
  }

  return [query]
}

function formatSourcePool(webSources = [], documents = [], images = []) {
  const sections = []

  if (documents.length > 0) {
    sections.push(
      'DOKUMEN PENGGUNA:\n' +
        documents
          .map(
            (doc) =>
              `[${doc.sourceId}] ${doc.fileName} (${doc.locationLabel}):\n${doc.text || '(Kosong)'}`,
          )
          .join('\n\n'),
    )
  }

  if (images.length > 0) {
    sections.push(
      'GAMBAR PENGGUNA:\n' +
        images
          .map((img) => `[${img.sourceId}] Gambar: ${img.fileName}`)
          .join('\n'),
    )
  }

  if (webSources.length > 0) {
    sections.push(
      'SUMBER WEB NYATA:\n' +
        webSources
          .map(
            (ws) =>
              `[${ws.sourceId}] ${ws.title} (${ws.sourceType}, skor ${ws.score.toFixed(2)})\nURL: ${ws.url}\nKutipan: ${ws.snippet}`,
          )
          .join('\n\n'),
    )
  }

  return sections.join('\n\n---\n\n')
}

async function synthesizeVerifiedAnswer({
  query,
  history = [],
  mode = 'basic',
  webSources = [],
  documents = [],
  images = [],
  signal,
}) {
  const isComprehensive = mode === 'comprehensive'
  const historyText = formatHistoryContext(history)
  const sourcePool = formatSourcePool(webSources, documents, images)

  const systemPrompt = [
    'Kamu adalah FritoGrafi, asisten verifikasi fakta berbahasa Indonesia.',
    'Aturan wajib:',
    '1. BAHASA WAJIB 100% BAHASA INDONESIA: Meskipun sumber web berbahasa Inggris, Turki, Mandarin, atau bahasa asing lain, seluruh teks "reply", "statement", "summary", "reasoning", dan "followUps" WAJIB ditulis dalam Bahasa Indonesia yang alami (hanya nama karakter, judul karya, atau istilah resmi yang boleh tetap asli). Jangan gunakan titik tengah atau em dash. Jangan tulis kode internal W1/D1 di teks narasi.',
    '2. Tulis "reply" dalam Markdown ringkas dan sisipkan penanda sitasi inline [1], [2], dst. HANYA sesuai nomor urut array "claims" (jika ada 2 klaim, HANYA gunakan [1] dan [2], JANGAN pernah menulis [3] atau [5] yang merujuk jumlah sumber web).',
    '3. Buat 1 sampai 3 objek pada "claims". Setiap item "evidence" WAJIB merujuk "sourceId" valid dari daftar sumber ("W1", "W2", atau "D1"). Jika ada dokumen atau gambar pengguna (D1, dst.), sertakan juga sebagai salah satu evidence pada klaim yang membahas isinya. Dilarang mengarang URL.',
    '4. Enum valid: verdict ("SUPPORTED"|"PARTIAL"|"CONTRADICTED"|"UNVERIFIED"), stance ("SUPPORTS"|"NEUTRAL"|"CONTRADICTS"), skor 0.00 sampai 1.00.',
    isComprehensive
      ? '5. Mode MENDALAM: isi "reasoning" tiap klaim dengan 2 sampai 4 poin bernomor singkat tentang kekuatan bukti, kredibilitas, dan batasan konteks.'
      : '5. Mode DASAR: isi "reasoning" dengan string kosong "".',
    '6. PENTING untuk "followUps": tulis 2 sampai 3 pertanyaan lanjutan singkat (maksimal 12 kata) dari SUDUT PANDANG PENGGUNA yang akan diklik untuk bertanya ke AI (contoh: "Bagaimana perbandingan hasil studi ini dengan riset lain?", "Jelaskan istilah Microk8s dengan bahasa sederhana"). DILARANG menulis penawaran AI seperti "Mau saya...", "Perlu saya...", atau "Apakah Anda ingin saya...".',
    '7. Kembalikan HANYA JSON valid: {"reply":"...","claims":[{"statement":"...","verdict":"SUPPORTED","confidence":0.85,"summary":"...","reasoning":"","evidence":[{"sourceId":"W1","stance":"SUPPORTS","credibility":0.85,"relevance":0.9,"snippet":"...","locationLabel":""}]}],"followUps":["...","..."]}.',
  ].join('\n')

  const userParts = []
  if (historyText) {
    userParts.push(`Riwayat:\n${historyText}`)
  }
  userParts.push(`Pertanyaan pengguna:\n${query}`)
  userParts.push(
    sourcePool ||
      'Tidak ada sumber web ditemukan. Tandai klaim faktual sebagai UNVERIFIED bila tidak cukup bukti.',
  )
  userParts.push(
    'Pengingat penting: Balas HANYA dalam Bahasa Indonesia dan pastikan penanda [1], [2] pada "reply" tidak melebihi jumlah objek di "claims".',
  )

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: buildMultimodalUserContent(userParts.join('\n\n'), images),
    },
  ]

  const userSources = [...documents, ...images]
  let result = await callZroChat({
    messages,
    maxTokens: isComprehensive ? 10240 : 8192,
    temperature: 0.2,
    reasoningEffort: 'low',
    jsonMode: true,
    timeoutMs: 85000,
    signal,
  })

  let normalized = normalizeChatPayload({
    rawText: result.content,
    webSources,
    userSources,
    mode,
  })

  // Retry 1 kali otomatis bila output kosong atau JSON gagal terurai
  if (normalized.parseFailed && !signal?.aborted) {
    result = await callZroChat({
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\nPastikan output berupa 1 objek JSON lengkap dan ringkas agar tidak terpotong.`,
        },
        messages[1],
      ],
      maxTokens: 10240,
      temperature: 0.1,
      reasoningEffort: 'low',
      jsonMode: true,
      timeoutMs: 85000,
      signal,
    })

    normalized = normalizeChatPayload({
      rawText: result.content,
      webSources,
      userSources,
      mode,
    })
  }

  return {
    reply: normalized.reply,
    mode: normalized.mode,
    claims: normalized.claims,
    followUps: normalized.followUps,
  }
}

async function deepenClaimsReasoning({ query = '', claims = [], signal }) {
  if (!Array.isArray(claims) || claims.length === 0) {
    return { mode: 'comprehensive', reasoningByClaimId: {} }
  }

  const compactClaims = claims.map((c) => ({
    id: c.id,
    statement: c.statement,
    verdict: c.verdict,
    confidence: c.confidence,
    summary: c.summary,
    evidence: (Array.isArray(c.evidence) ? c.evidence : []).map((ev) => ({
      sourceType: ev.sourceType,
      stance: ev.stance,
      title: ev.title,
      credibility: ev.credibility,
      relevance: ev.relevance,
      snippet: ev.snippet,
    })),
  }))

  const systemPrompt = [
    'Kamu adalah analis verifikasi fakta FritoGrafi.',
    'Susun penalaran mendalam 2 sampai 4 poin bernomor dalam Bahasa Indonesia untuk setiap klaim berdasarkan bukti yang tersedia. Jangan pakai titik tengah, em dash, atau kode internal seperti W1/D1.',
    'Kembalikan HANYA JSON: {"reasoningByClaimId": {"claim_1": "1) ... 2) ..."}}.',
  ].join('\n')

  const result = await callZroChat({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Pertanyaan: ${query}\n\nKlaim dan bukti:\n${JSON.stringify(compactClaims)}`,
      },
    ],
    maxTokens: 6144,
    temperature: 0.2,
    reasoningEffort: 'low',
    jsonMode: true,
    timeoutMs: 60000,
    signal,
  })

  const parsed = extractJsonObject(result.content)
  const rawMap = parsed?.reasoningByClaimId || {}
  const reasoningByClaimId = {}

  for (const claim of claims) {
    const text = cleanForbiddenSeparators(String(rawMap[claim.id] || ''))
    reasoningByClaimId[claim.id] =
      text ||
      '1) Bukti utama telah ditinjau ulang berdasarkan kesesuaian isi kutipan dengan pernyataan klaim. 2) Tingkat keyakinan mencerminkan konsistensi dan kredibilitas sumber yang tersedia.'
  }

  return {
    mode: 'comprehensive',
    reasoningByClaimId,
  }
}

export {
  callZroChat,
  handleSmallTalk,
  generateSearchQueries,
  synthesizeVerifiedAnswer,
  deepenClaimsReasoning,
}
