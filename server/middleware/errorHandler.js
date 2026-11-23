function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`,
  })
}

function errorHandler(err, _req, res, _next) {
  const statusCode = Number(err?.statusCode) || Number(err?.status) || 500
  const isClientError = statusCode >= 400 && statusCode < 500

  if (!isClientError) {
    console.error('[ServerError]', err?.message || err)
  }

  res.status(statusCode).json({
    error: isClientError
      ? err.message
      : err?.publicMessage ||
        'Terjadi kendala pada server saat memproses permintaan. Silakan coba lagi.',
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}
