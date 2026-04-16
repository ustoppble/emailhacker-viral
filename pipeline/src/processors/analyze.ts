import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config.js'
import type { Segment } from '../../../shared/types/job.js'

const client = new Anthropic({ apiKey: config.anthropicApiKey })

/**
 * Analisa transcrição com Claude Haiku e identifica TODOS os trechos virais.
 * Usa threshold de score (0-100) em vez de cap fixo.
 * Retorna Segment[] ordenados por score de viralidade (melhor primeiro).
 */
export async function analyzeTranscript(transcript: string): Promise<Segment[]> {
  // Proteção contra transcript muito longo (causa crash no worker)
  const maxChars = config.maxTranscriptChars
  const textChunk = transcript.length > maxChars
    ? transcript.substring(0, maxChars)
    : transcript

  if (transcript.length > maxChars) {
    console.log(`[analyze] Transcript truncado: ${transcript.length} → ${maxChars} chars`)
  }

  console.log(`[analyze] Enviando transcrição pro Haiku (${textChunk.length} chars)...`)

  const minScore = config.minViralityScore

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Você é um editor de vídeo especialista em conteúdo viral para YouTube Shorts.

Analise esta transcrição de uma live de programação/vibe coding e identifique TODOS os segmentos virais adequados para Shorts.

CRITÉRIOS DE INCLUSÃO (todos devem ser atendidos):
1. Hook forte nos primeiros 3 segundos — frase que prende atenção imediata
2. Pensamento completo — o trecho faz sentido sozinho, sem contexto externo
3. Duração ideal: 30-90 segundos
4. Alta energia, emoção ou valor prático
5. Virality Score >= ${minScore} (escala 0-100)

PRIORIZE:
- Momentos com energia alta ou reação expressiva
- Insights claros e práticos sobre programação/negócios
- Humor natural ou situações engraçadas
- Demonstrações visuais de código funcionando
- Opiniões fortes ou controversas

EVITE:
- Momentos de silêncio ou leitura de código
- Conversas técnicas muito específicas sem contexto
- Trechos que dependem de contexto anterior pra fazer sentido

INSTRUÇÕES:
- NÃO há limite de clips. Extraia 1, 5, 10 ou mais se atenderem os critérios (score >= ${minScore}).
- Se a transcrição for fraca, retorne lista vazia.
- Para cada clip, justifique POR QUE ele é viral.
- Retorne um JSON com o campo "segments" contendo um array.

Formato JSON:
{
  "segments": [
    {
      "startTime": 1234,
      "endTime": 1294,
      "title": "Título curto e chamativo",
      "hook": "Frase de abertura dos primeiros 3 segundos",
      "category": "insight|humor|viral|tecnico|reacao",
      "score": 85,
      "justification": "Por que este trecho é viral"
    }
  ]
}

TRANSCRIÇÃO:
${textChunk}`
      },
      {
        role: 'assistant',
        content: '{'
      }
    ],
  })

  // Prefill garante que resposta começa com JSON
  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const json = JSON.parse('{' + text)
  const rawSegments = (json.segments || []) as Segment[]

  // Filtrar por score mínimo (defesa em profundidade)
  // Ordenar por score decrescente (melhor primeiro)
  // Re-indexar sequencialmente (1, 2, 3...)
  const segments = rawSegments
    .filter(s => s.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, index: i + 1 }))

  console.log(`[analyze] ${segments.length} trechos selecionados (threshold: ${minScore}/100)`)

  if (segments.length > 0) {
    console.log(`[analyze] Scores: [${segments.map(s => s.score).join(', ')}]`)
    console.log(`[analyze] Melhor: "${segments[0].title}" (${segments[0].score}/100)`)
  }

  return segments
}
