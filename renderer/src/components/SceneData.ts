/**
 * Tipos que descrevem as cenas de um clip.
 * O DIRECTOR gera um SceneData[] (JSON) e o ClipTemplate renderiza.
 */

export interface ToolCallItem {
  type: 'Write' | 'Edit' | 'Read' | 'Bash' | 'Agent'
  file?: string
  added?: number
  removed?: number
  description?: string
}

export interface DiffLineItem {
  type: 'add' | 'remove' | 'context'
  text: string
  lineNumber?: number
}

export interface TerminalLineItem {
  text: string
  type?: 'command' | 'output' | 'error' | 'success' | 'info'
}

export interface CaptionWord {
  word: string
  start: number
  end: number
}

/** Formato TikTokPage — display-captions.md */
export interface CaptionToken {
  text: string
  fromMs: number
  toMs: number
}

export interface CaptionPage {
  startMs: number
  tokens: CaptionToken[]
}

// Cada cena é um dos tipos abaixo
export type Scene =
  | { type: 'prompt'; text: string; speed?: number }
  | { type: 'response'; text: string; toolCalls: ToolCallItem[] }
  | { type: 'diff'; file: string; branch?: string; lines: DiffLineItem[]; added?: number; removed?: number }
  | { type: 'terminal'; title?: string; lines: TerminalLineItem[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'text'; title: string; subtitle?: string; align?: 'center' | 'left' }

export interface ClipData {
  /** Título do projeto/app na window bar */
  windowTitle?: string
  /** Branch (ex: claude/feature-name) */
  branch?: string
  /** Cenas em sequência — cada uma recebe duração proporcional */
  scenes: Scene[]
  /** Pages pra captions TikTok-style (display-captions.md) */
  captions?: CaptionPage[]
  /** Items da status bar */
  statusItems?: string[]
  /** Modelo exibido na status bar */
  model?: string
  /** Duração total em frames (default: calculado automaticamente) */
  totalFrames?: number
}
