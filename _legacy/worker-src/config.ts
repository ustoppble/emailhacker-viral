import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

// Carregar secrets do arquivo central (local/VPS) ou env vars (Coolify/Docker)
function loadSecrets(): Record<string, string> {
  const paths = [
    resolve(process.env.HOME || '~', '.secrets/emailhacker'),
    '/root/.secrets/emailhacker',
  ]

  for (const p of paths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf-8')
      const vars: Record<string, string> = {}
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq > 0) {
          const key = trimmed.slice(0, eq).trim()
          const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
          vars[key] = val
        }
      }
      return vars
    }
  }

  return {}
}

const secrets = loadSecrets()

// Env var primeiro (Docker/Coolify), depois secrets file (local/VPS)
function env(key: string, fallback = ''): string {
  return process.env[key] || secrets[key] || fallback
}

export const config = {
  port: Number(env('PORT', '3200')),
  webhookSecret: env('WEBHOOK_SECRET'),
  redis: env('REDIS_URL', 'redis://localhost:6379'),
  dataDir: env('DATA_DIR', resolve(process.cwd(), 'data')),
  cleanupAfterHours: Number(env('CLEANUP_AFTER_HOURS', '24')),
  maxShortsPerLive: Number(env('MAX_SHORTS_PER_LIVE', '8')),
  anthropicApiKey: env('ANTHROPIC_API_KEY'),
  r2: {
    accountId: env('R2_ACCOUNT_ID'),
    accessKeyId: env('R2_ACCESS_KEY_ID'),
    secretAccessKey: env('R2_SECRET_ACCESS_KEY'),
    bucket: env('R2_BUCKET', 'video-worker'),
    publicUrl: env('R2_PUBLIC_URL'),
  },
  youtube: {
    clientId: env('YOUTUBE_CLIENT_ID'),
    clientSecret: env('YOUTUBE_CLIENT_SECRET'),
    tokenFile: env('YOUTUBE_TOKEN_FILE', '.youtube-token-videocutter.json'),
  },
  meta: {
    accessToken: env('META_ACCESS_TOKEN'),
    igAccountId: env('META_IG_ACCOUNT_ID'),
    pageId: env('META_PAGE_ID'),
  },
}
