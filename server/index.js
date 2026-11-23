const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { config, validateConfig } = require('./config/env')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const chatRoutes = require('./routes/chatRoutes')

const app = express()

// Diperlukan agar express-rate-limit membaca IP asli di belakang proxy Render
app.set('trust proxy', 1)

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
)

app.use(
  cors((req, callback) => {
    const origin = req.headers.origin
    if (!origin) {
      callback(null, {
        origin: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
      return
    }

    const normalized = origin.replace(/\/$/, '')
    let isSameHost = false
    try {
      const originHost = new URL(normalized).host
      const requestHost = req.headers['x-forwarded-host'] || req.headers.host
      if (originHost && requestHost && originHost === requestHost) {
        isSameHost = true
      }
    } catch {
      // Abaikan URL origin tidak valid
    }

    const vercelUrls = [
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : '',
    ].filter(Boolean)

    if (
      isSameHost ||
      config.allowedOrigins.includes('*') ||
      config.allowedOrigins.includes(normalized) ||
      vercelUrls.includes(normalized)
    ) {
      callback(null, {
        origin: true,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
      return
    }

    const err = new Error('Origin tidak diizinkan oleh kebijakan CORS.')
    err.statusCode = 403
    callback(err)
  }),
)

app.use(express.json({ limit: '2mb' }))

app.get('/', (_req, res) => {
  res.json({
    service: 'fritografi-api',
    status: 'ok',
    health: '/api/health',
  })
})

app.get('/api/health', (_req, res) => {
  const missingEnv = validateConfig()
  res.json({
    status: missingEnv.length === 0 ? 'ok' : 'degraded',
    service: 'fritografi-api',
    model: config.zroModel,
    configured: missingEnv.length === 0,
    timestamp: new Date().toISOString(),
  })
})

app.get('/api/pesan', (_req, res) => {
  res.json({ pesan: 'Halo dari Express.js FritoGrafi!' })
})

app.use('/api', chatRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

if (require.main === module) {
  app.listen(config.port, (err) => {
    if (err) {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${config.port} sudah digunakan proses lain.`)
      } else {
        console.error('Gagal menjalankan server:', err.message)
      }
      process.exit(1)
    }

    const missingEnv = validateConfig()
    if (missingEnv.length > 0) {
      console.warn(
        `[Peringatan] Variabel lingkungan belum lengkap: ${missingEnv.join(', ')}`,
      )
    }

    console.log(`Server FritoGrafi jalan di http://localhost:${config.port}`)
  })
}

module.exports = app
