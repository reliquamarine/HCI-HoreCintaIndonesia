import { matchMockScenario } from '../data/mockChatData.js'

const API_BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '')
const USE_LIVE_API = import.meta.env.VITE_USE_MOCK !== 'true'

function waitWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Dibatalkan', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Dibatalkan', 'AbortError'))
      },
      { once: true },
    )
  })
}

async function parseErrorMessage(response) {
  try {
    const body = await response.json()
    if (body && typeof body.error === 'string' && body.error.trim()) {
      return body.error.trim()
    }
  } catch {
    // Ignore JSON parse errors
  }
  if (response.status === 429) {
    return 'Terlalu banyak permintaan dalam waktu singkat. Silakan tunggu sebentar lalu coba lagi.'
  }
  if (response.status === 413) {
    return 'Ukuran file lampiran melebihi batas yang diizinkan server.'
  }
  return `Permintaan ke server gagal dengan kode ${response.status}.`
}

async function revealTextSmoothly(fullText, onToken, signal) {
  const tokens = String(fullText || '').split(/(\s+)/)
  if (tokens.length <= 12) {
    onToken?.(fullText)
    return
  }

  let accumulated = ''
  const step = Math.max(4, Math.ceil(tokens.length / 26))
  for (let i = 0; i < tokens.length; i += step) {
    accumulated += tokens.slice(i, i + step).join('')
    onToken?.(accumulated)
    await waitWithAbort(12, signal)
  }
}

export async function sendChatMessage({
  query,
  sessionId,
  history,
  mode = 'basic',
  attachments = [],
  files = [],
  signal,
  onPhaseChange,
  onToken,
}) {
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0
  const hasFiles = Array.isArray(files) && files.length > 0

  if (USE_LIVE_API) {
    onPhaseChange?.(hasFiles ? 'reading_files' : 'verifying')

    const slowTimer = setTimeout(() => {
      onPhaseChange?.('waking_server')
    }, 14000)

    let response
    try {
      const endpoint = `${API_BASE}/api/chat`
      if (hasFiles) {
        const formData = new FormData()
        formData.append('message', query)
        formData.append('sessionId', sessionId || '')
        formData.append('mode', mode)
        formData.append('history', JSON.stringify(history || []))
        for (const file of files) {
          formData.append('files', file)
        }

        response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          signal,
        })
      } else {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, sessionId, history, mode }),
          signal,
        })
      }
    } catch (err) {
      if (err?.name === 'AbortError') {
        throw err
      }
      throw new Error(
        'Tidak dapat terhubung ke server FritoGrafi. Pastikan server backend aktif atau periksa koneksi internetmu.',
      )
    } finally {
      clearTimeout(slowTimer)
    }

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response))
    }

    const data = await response.json()
    const replyText = String(data?.reply || '')

    onPhaseChange?.('streaming')
    await revealTextSmoothly(replyText, onToken, signal)

    return {
      content: replyText,
      claims: Array.isArray(data?.claims) ? data.claims : [],
      followUps: Array.isArray(data?.followUps) ? data.followUps : [],
      mode: data?.mode || mode,
    }
  }

  // Mode simulasi offline (jika VITE_USE_MOCK=true)
  if (query.trim().toLowerCase() === 'tes error') {
    onPhaseChange?.('verifying')
    await waitWithAbort(500, signal)
    throw new Error(
      'Simulasi gangguan koneksi ke layanan pencarian sumber. Tekan Coba Lagi untuk mengulang.',
    )
  }

  if (hasAttachments) {
    onPhaseChange?.('reading_files')
    await waitWithAbort(550, signal)
  }

  onPhaseChange?.('verifying')
  await waitWithAbort(mode === 'comprehensive' ? 850 : 600, signal)

  const scenario = matchMockScenario(query, attachments)
  const tokens = scenario.reply.split(/(\s+)/)
  let accumulated = ''

  onPhaseChange?.('streaming')

  for (let i = 0; i < tokens.length; i += 2) {
    const chunk = tokens.slice(i, i + 2).join('')
    accumulated += chunk
    onToken?.(accumulated)
    await waitWithAbort(22, signal)
  }

  return {
    content: scenario.reply,
    claims: scenario.claims,
    followUps: scenario.followUps,
    mode,
  }
}

export async function upgradeVerificationMode({ query = '', claims = [], signal } = {}) {
  if (!USE_LIVE_API) {
    await waitWithAbort(480, signal)
    return { mode: 'comprehensive', reasoningByClaimId: {} }
  }

  let response
  try {
    response = await fetch(`${API_BASE}/api/chat/deepen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, claims }),
      signal,
    })
  } catch (err) {
    if (err?.name === 'AbortError') throw err
    throw new Error(
      'Tidak dapat terhubung ke server untuk memuat penalaran mendalam.',
    )
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  const data = await response.json()
  return {
    mode: data?.mode || 'comprehensive',
    reasoningByClaimId: data?.reasoningByClaimId || {},
  }
}
