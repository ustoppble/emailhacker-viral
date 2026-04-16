import { createServer, type IncomingMessage } from 'node:http'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { execFile } from 'node:child_process'
import {
  existsSync,
  createReadStream,
  statSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from 'node:fs'
import { resolve, basename } from 'node:path'
import { config } from './config.js'

// Pasta temporária pra servir vídeos (cleanup automático após 1h)
const TMP_DIR = resolve(config.dataDir, 'tmp-serve')
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true })

let deploying = false

// --- Helpers ---

function verifySignature(payload: string, signature: string | undefined): boolean {
  if (!config.webhookSecret || !signature) return false
  const expected =
    'sha256=' + createHmac('sha256', config.webhookSecret).update(payload).digest('hex')
  if (expected.length !== signature.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function deploy() {
  if (deploying) return
  deploying = true
  console.log('[deploy] Iniciando auto-deploy...')

  // Script de deploy fica na raiz do monorepo: ../scripts/deploy.sh
  const deployScript = resolve(process.cwd(), '..', 'scripts/deploy.sh')
  execFile(
    'bash',
    [deployScript],
    { cwd: resolve(process.cwd(), '..'), timeout: 120_000 },
    (err, stdout, stderr) => {
      deploying = false
      if (err) {
        console.error('[deploy] Falhou:', err.message)
        if (stderr) console.error(stderr)
        return
      }
      console.log('[deploy] Concluído:', stdout.trim())
    },
  )
}

// --- Server ---

const server = createServer(async (req, res) => {
  const url = req.url || ''
  const method = req.method || 'GET'

  // Health check
  if (url === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        status: 'ok',
        deploying,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    )
    return
  }

  // GitHub Webhook — auto-deploy com verificação HMAC-SHA256
  if (url === '/webhook/deploy' && method === 'POST') {
    const body = await readBody(req)
    const sig = req.headers['x-hub-signature-256'] as string | undefined

    if (!verifySignature(body, sig)) {
      res.writeHead(401)
      res.end('Signature inválida')
      return
    }

    const event = req.headers['x-github-event']
    if (event === 'push') {
      try {
        const payload = JSON.parse(body)
        if (payload.ref === 'refs/heads/main') {
          console.log(`[webhook] Push em main por ${payload.pusher?.name}`)
          deploy()
          res.writeHead(200)
          res.end('Deploy iniciado')
          return
        }
      } catch {
        res.writeHead(400)
        res.end('JSON inválido')
        return
      }
    }

    res.writeHead(200)
    res.end('OK (ignorado)')
    return
  }

  // Upload de vídeo temporário — POST /tmp/upload (body = raw MP4)
  if (url === '/tmp/upload' && method === 'POST') {
    const data = await readRawBody(req)
    const filename = `${Date.now()}.mp4`
    const filepath = resolve(TMP_DIR, filename)
    writeFileSync(filepath, data)
    console.log(`[tmp] Arquivo salvo: ${filename} (${(data.length / 1e6).toFixed(1)}MB)`)

    // Auto-cleanup após 1h
    setTimeout(() => {
      try {
        unlinkSync(filepath)
      } catch {
        // arquivo já pode ter sido removido
      }
      console.log(`[tmp] Cleanup: ${filename}`)
    }, 3600_000)

    const domain = process.env.PUBLIC_DOMAIN || `localhost:${config.port}`
    const protocol = process.env.PUBLIC_DOMAIN ? 'https' : 'http'
    const publicUrl = `${protocol}://${domain}/tmp/${filename}`

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ url: publicUrl, filename, expiresIn: '1h' }))
    return
  }

  // Servir arquivo temporário — GET /tmp/:filename
  if (url.startsWith('/tmp/') && url !== '/tmp/upload' && (method === 'GET' || method === 'HEAD')) {
    const filename = basename(url.split('?')[0].replace('/tmp/', ''))
    const filepath = resolve(TMP_DIR, filename)

    if (!existsSync(filepath)) {
      res.writeHead(404)
      res.end('File not found')
      return
    }

    const stat = statSync(filepath)
    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size,
    })

    if (method === 'HEAD') {
      res.end()
      return
    }

    createReadStream(filepath).pipe(res)
    return
  }

  // 404 fallback
  res.writeHead(404)
  res.end()
})

server.listen(config.port, () => {
  console.log(`[pipeline] Rodando na porta ${config.port}`)
  console.log(`[pipeline] Health: http://localhost:${config.port}/health`)
})
