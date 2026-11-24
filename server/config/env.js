import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

function parseOrigins(raw) {
  if (!raw || typeof raw !== 'string') {
    return ['http://localhost:5173']
  }
  return raw
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  allowedOrigins: parseOrigins(process.env.ALLOWED_ORIGIN),
  zroBaseUrl: (process.env.ZRO_BASE_URL || 'https://zro.moonmath.ai/v1').replace(
    /\/$/,
    '',
  ),
  zroModel: process.env.ZRO_MODEL || 'deepseek-v4.1-flash',
  zroApiKey: (process.env.ZRO_API_KEY || '').trim(),
  tavilyApiKey: (process.env.TAVILY_API_KEY || '').trim(),
  tavilyBaseUrl: (process.env.TAVILY_BASE_URL || 'https://api.tavily.com').replace(
    /\/$/,
    '',
  ),
}

function validateConfig() {
  const missing = []
  if (!config.zroApiKey) missing.push('ZRO_API_KEY')
  if (!config.tavilyApiKey) missing.push('TAVILY_API_KEY')
  return missing
}

export { config, validateConfig }
