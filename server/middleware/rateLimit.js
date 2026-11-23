const { rateLimit } = require('express-rate-limit')

const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error:
      'Terlalu banyak permintaan dalam waktu singkat. Silakan tunggu beberapa menit lalu coba lagi.',
  },
})

module.exports = {
  chatRateLimiter,
}
