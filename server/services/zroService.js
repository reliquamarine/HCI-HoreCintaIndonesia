const { config } = require('../config/env')
const {
  cleanForbiddenSeparators,
  cleanMarkdownReply,
  extractJsonObject,
  normalizeChatPayload,
} = require('../utils/responseNormalizer')

async function callZroChat({
  messages,
  maxTokens = 4096,
  temperature = 0.2,
  timeoutMs = 55000,
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

  let response
  try {
    response = await fetch(`${config.zroBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.zroApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.zroModel,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
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
      const error = new Error('API key model AI (Zro) tidak valid atau kedaluwarsa.')
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

  const data = await response.json()
  const message = data?.choices?.[0]?.message || {}
  return {
    content: String(message.content || '').trim(),
    reasoningContent: String(message.reasoning_content || '').trim(),
    finishReason: data?.choices?.[0]?.finish_reason || '',
  }
}

function formatHistoryContext(history = []) {
  if (!Array.isArray(history) || history.length === 0) return ''
  return history
    .slice(-6)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .map((m) => {
      const speaker = m.role === 'user' ? 'Pengguna' : 'FritoGrafi'
      return `${speaker}: ${String(m.content).slice(0, 500)}`
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
        'Kamu adalah FritoGrafi, asisten percakapan cerdas berbahasa Indonesia yang membantu menjawab pertanyaan dan memverifikasi klaim beserta sumber rujukan yang jelas. Jawab sapaan pengguna secara singkat, hangat, dan natural dalam Bahasa Indonesia. Jangan gunakan simbol titik tengah atau em dash.',
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
    maxTokens: 1024,
    temperature: 0.5,
    timeoutMs: 25000,
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
        `[${doc.sourceId}] ${doc.fileName}:\n${String(doc.text || '').slice(0, 2200)}`,
    )
    .join('\n\n')

  const promptParts = [
    'Tugasmu: buat 1 sampai 2 kueri pencarian web yang singkat, faktual, dan spesifik (maksimal 12 kata per kueri) untuk memverifikasi pertanyaan atau isi dokumen/gambar pengguna.',
    'Kembalikan HANYA JSON valid dengan format: {"queries": ["kueri 1", "kueri 2"]}. Jangan menulis penjelasan lain.',
  ]

  if (historyText) {
    promptParts.push(`Riwayat percakapan sebelumnya:\n${historyText}`)
  }
  if (docSummary) {
    promptParts.push(`Cuplikan dokumen pengguna:\n${docSummary}`)
  }
  if (images.length > 0) {
    promptParts.push(
      `Pengguna juga melampirkan ${images.length} gambar. Baca klaim/teks penting di gambar tersebut untuk menyusun kueri verifikasi.`,
    )
  }
  promptParts.push(`Pertanyaan pengguna saat ini: ${query}`)

  try {
    const result = await callZroChat({
      messages: [
        {
          role: 'system',
          content:
            'Kamu adalah generator kueri pencarian web untuk verifikasi fakta. Jawab hanya dalam format JSON {"queries": [...]}.',
        },
        {
          role: 'user',
          content: buildMultimodalUserContent(promptParts.join('\n\n'), images),
        },
      ],
      maxTokens: 1024,
      temperature: 0.1,
      timeoutMs: 25000,
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
    // Fallback ke pertanyaan asli bila ekstraksi kueri gagal
  }

  return [query]
}

function formatSourcePool(webSources = [], documents = [], images = []) {
  const sections = []

  if (documents.length > 0) {
    sections.push(
      'SUMBER DOKUMEN PENGGUNA:\n' +
        documents
          .map(
            (doc) =>
              `[${doc.sourceId}] File: ${doc.fileName} (${doc.locationLabel})\nIsi:\n${doc.text || '(Dokumen tidak berisi teks terbaca)'}`,
          )
          .join('\n\n'),
    )
  }

  if (images.length > 0) {
    sections.push(
      'SUMBER GAMBAR PENGGUNA:\n' +
        images
          .map(
            (img) =>
              `[${img.sourceId}] Gambar terlampir: ${img.fileName} (lihat gambar yang disertakan pada pesan ini)`,
          )
          .join('\n'),
    )
  }

  if (webSources.length > 0) {
    sections.push(
      'SUMBER PENCARIAN WEB NYATA (TAVILY):\n' +
        webSources
          .map(
            (ws) =>
              `[${ws.sourceId}] Judul: ${ws.title}\nURL: ${ws.url}\nTipe: ${ws.sourceType}\nSkor Relevansi Awal: ${ws.score.toFixed(2)}\nKutipan: ${ws.snippet}`,
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
    'Kamu adalah FritoGrafi, asisten percakapan cerdas berbahasa Indonesia yang memverifikasi setiap klaim faktual secara transparan berdasarkan sumber nyata.',
    'ATURAN WAJIB:',
    '1. Gunakan Bahasa Indonesia yang natural, akurat, dan mudah dibaca di seluruh teks jawaban, pernyataan klaim, ringkasan, penalaran, dan pertanyaan lanjutan.',
    '2. JANGAN gunakan simbol titik tengah atau tanda em dash sebagai pemisah teks.',
    '3. Dalam field "reply", tulis jawaban informatif (boleh pakai Markdown seperti bold atau poin) dan sisipkan penanda sitasi inline [1], [2], dst. tepat di akhir kalimat/klaim yang sesuai dengan nomor klaim pada array "claims".',
    '4. Pecah pernyataan faktual utama dari jawabanmu menjadi 1 sampai 4 objek pada array "claims".',
    '5. ANTI HALUSINASI: Setiap item pada "evidence" WAJIB memakai "sourceId" yang benar-benar ada di daftar sumber yang diberikan (misalnya "W1", "W2", atau "D1"). DILARANG mengarang URL atau sumber baru.',
    '6. Nilai enum yang diizinkan:',
    '   - verdict: "SUPPORTED" (didukung kuat), "PARTIAL" (sebagian didukung atau bersyarat), "CONTRADICTED" (bertentangan dengan bukti), atau "UNVERIFIED" (tidak cukup bukti).',
    '   - stance: "SUPPORTS", "NEUTRAL", atau "CONTRADICTS".',
    '   - confidence, credibility, relevance: angka desimal antara 0.00 sampai 1.00.',
    isComprehensive
      ? '7. Mode aktif adalah MENDALAM: isi field "reasoning" pada setiap klaim dengan analisis penalaran mendalam 2 sampai 4 poin bernomor (konsistensi antar sumber, kualitas/kredibilitas bukti, serta keterbatasan atau konteks penting).'
      : '7. Mode aktif adalah DASAR: isi field "reasoning" dengan string kosong "" agar respons ringkas dan cepat.',
    '8. Kembalikan HANYA JSON valid (tanpa teks pembuka atau penutup di luar JSON) dengan struktur persis berikut:',
    JSON.stringify(
      {
        reply: 'Teks jawaban Markdown dengan penanda [1] dan [2].',
        claims: [
          {
            statement: 'Pernyataan klaim faktual yang lengkap dan jelas.',
            verdict: 'SUPPORTED',
            confidence: 0.85,
            summary: 'Ringkasan singkat seberapa kuat bukti mendukung klaim ini.',
            reasoning: isComprehensive
              ? '1) Langkah analisis pertama. 2) Perbandingan antar sumber. 3) Keterbatasan konteks.'
              : '',
            evidence: [
              {
                sourceId: 'W1',
                stance: 'SUPPORTS',
                credibility: 0.85,
                relevance: 0.9,
                snippet: 'Kutipan ringkas relevan dari sumber dalam Bahasa Indonesia atau bahasa asli sumber.',
                locationLabel: 'Opsional khusus D1 seperti Halaman 1',
              },
            ],
          },
        ],
        followUps: [
          'Pertanyaan lanjutan relevan 1?',
          'Pertanyaan lanjutan relevan 2?',
        ],
      },
      null,
      2,
    ),
  ].join('\n')

  const userParts = []
  if (historyText) {
    userParts.push(`Riwayat percakapan sebelumnya:\n${historyText}`)
  }
  userParts.push(`Pertanyaan pengguna:\n${query}`)
  userParts.push(
    sourcePool ||
      'Tidak ada hasil pencarian web yang tersedia. Tandai klaim faktual sebagai UNVERIFIED secara jujur jika tidak dapat diverifikasi.',
  )

  const result = await callZroChat({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: buildMultimodalUserContent(userParts.join('\n\n'), images),
      },
    ],
    maxTokens: isComprehensive ? 6144 : 4096,
    temperature: 0.2,
    timeoutMs: 55000,
    signal,
  })

  const userSources = [...documents, ...images]
  return normalizeChatPayload({
    rawText: result.content,
    webSources,
    userSources,
    mode,
  })
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
    'Tugasmu: susun penalaran mendalam langkah demi langkah dalam Bahasa Indonesia untuk setiap klaim berdasarkan bukti yang sudah ada.',
    'Jangan gunakan simbol titik tengah atau em dash.',
    'Setiap penalaran terdiri dari 2 sampai 4 poin bernomor singkat yang membahas kekuatan bukti, kredibilitas sumber, serta batasan atau nuansa klaim.',
    'Kembalikan HANYA JSON valid dengan format: {"reasoningByClaimId": {"claim_1": "1) ... 2) ..."}}.',
  ].join('\n')

  const result = await callZroChat({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Konteks pertanyaan: ${query}\n\nDaftar klaim dan bukti:\n${JSON.stringify(compactClaims, null, 2)}`,
      },
    ],
    maxTokens: 4096,
    temperature: 0.2,
    timeoutMs: 45000,
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

module.exports = {
  callZroChat,
  handleSmallTalk,
  generateSearchQueries,
  synthesizeVerifiedAnswer,
  deepenClaimsReasoning,
}
