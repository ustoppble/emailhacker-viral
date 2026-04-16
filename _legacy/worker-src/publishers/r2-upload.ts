import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { createHash, createHmac } from 'node:crypto'
import { config } from '../config.js'

/**
 * Upload arquivo pro Cloudflare R2 e retorna URL pública.
 * Usa S3-compatible API (sem SDK pesado).
 */
export async function uploadToR2(filePath: string, key?: string): Promise<string> {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } = config.r2

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 não configurado (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)')
  }

  const fileContent = readFileSync(filePath)
  const fileName = key || `shorts/${Date.now()}-${basename(filePath)}`
  const host = `${bucket}.${accountId}.r2.cloudflarestorage.com`
  const url = `https://${host}/${fileName}`

  const now = new Date()
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '')
  const amzDate = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const region = 'auto'
  const service = 's3'

  const contentHash = createHash('sha256').update(fileContent).digest('hex')

  // AWS Signature V4
  const canonicalHeaders = `content-type:video/mp4\nhost:${host}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = `PUT\n/${fileName}\n\n${canonicalHeaders}\n${signedHeaders}\n${contentHash}`
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${createHash('sha256').update(canonicalRequest).digest('hex')}`

  const signingKey = [dateStamp, region, service, 'aws4_request'].reduce(
    (key, msg) => createHmac('sha256', key).update(msg).digest(),
    Buffer.from(`AWS4${secretAccessKey}`)
  )
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  const authorization = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Host': host,
      'x-amz-content-sha256': contentHash,
      'x-amz-date': amzDate,
      'Authorization': authorization,
    },
    body: fileContent,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 upload falhou (${res.status}): ${text.substring(0, 200)}`)
  }

  // Retornar URL pública
  if (publicUrl) {
    return `${publicUrl}/${fileName}`
  }
  return url
}
