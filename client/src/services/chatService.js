import { matchMockScenario } from '../data/mockChatData.js'

// Ubah ke true saat endpoint POST /api/chat di backend Express sudah aktif
const USE_LIVE_API = false

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

    let response
    if (hasFiles) {
      const formData = new FormData()
      formData.append('message', query)
      formData.append('sessionId', sessionId)
      formData.append('mode', mode)
      formData.append('history', JSON.stringify(history || []))
      for (const file of files) {
        formData.append('files', file)
      }

      response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
        signal,
      })
    } else {
      response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, sessionId, history, mode }),
        signal,
      })
    }

    if (!response.ok) {
      throw new Error(`Permintaan gagal dengan kode ${response.status}`)
    }

    const data = await response.json()
    return {
      content: data.reply || '',
      claims: Array.isArray(data.claims) ? data.claims : [],
      followUps: Array.isArray(data.followUps) ? data.followUps : [],
      mode: data.mode || mode,
    }
  }

  // Simulasi error terencana jika pengguna mengetik "tes error" untuk QA
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

export async function upgradeVerificationMode(signal) {
  await waitWithAbort(480, signal)
  return 'comprehensive'
}
