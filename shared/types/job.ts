export interface Segment {
  index: number
  startTime: number    // segundos
  endTime: number      // segundos
  title: string        // título pro Short
  hook: string         // frase de abertura (primeiros 3 seg)
  category: 'insight' | 'humor' | 'viral' | 'tecnico' | 'reacao'
  score: number        // 0-100 (viralidade)
  justification: string // por que este trecho é viral
}

export interface JobData {
  videoId: string
  videoUrl: string
  jobDir: string       // /data/video-worker/jobs/{jobId}
}

export interface AnalyzeResult {
  segments: Segment[]
  totalDuration: number
}

export interface PublishResult {
  platform: 'youtube' | 'instagram' | 'tiktok'
  url: string
  publishedAt: string
}

export interface RenderJob {
  jobId: string
  clipId: string
  transcript: string
  context: string
  facePath: string      // path do face.mp4 (1080x960)
  outputDir: string     // onde salvar o final.mp4
}
