import React from 'react'
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion'
import { COLORS, FONTS } from './tokens'

/**
 * Captions TikTok-style — seguindo display-captions.md da skill.
 *
 * Padrão:
 * - Pages com startMs + tokens[] (formato TikTokPage)
 * - Word highlighting: token ativo em HIGHLIGHT_COLOR
 * - whiteSpace: 'pre' pra preservar espaços
 * - Cada page em um <Sequence> com timing calculado
 * - Componente separado (CaptionPageView) pra cada page
 */

const HIGHLIGHT_COLOR = COLORS.caption // #facc15
const SWITCH_CAPTIONS_EVERY_MS = 1200

type CaptionToken = {
  text: string
  fromMs: number
  toMs: number
}

type CaptionPage = {
  startMs: number
  tokens: CaptionToken[]
}

type CaptionsProps = {
  pages: CaptionPage[]
}

/**
 * Renderiza uma página de captions com word highlighting.
 * Segue display-captions.md: CaptionPage pattern com absoluteTimeMs.
 */
const CaptionPageView: React.FC<{ page: CaptionPage }> = ({ page }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // display-captions.md: current time relative to sequence start
  const currentTimeMs = (frame / fps) * 1000
  // display-captions.md: convert to absolute time by adding page start
  const absoluteTimeMs = page.startMs + currentTimeMs

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
      }}
    >
      {/* display-captions.md: whiteSpace 'pre' pra preservar espaços */}
      <div
        style={{
          fontSize: 44,
          fontWeight: 'bold',
          fontFamily: FONTS.mono,
          textAlign: 'center',
          whiteSpace: 'pre',
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          textTransform: 'uppercase',
          padding: '0 40px',
        }}
      >
        {page.tokens.map((token) => {
          // display-captions.md: highlight word ativo
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs

          return (
            <span
              key={token.fromMs}
              style={{ color: isActive ? HIGHLIGHT_COLOR : COLORS.text }}
            >
              {token.text}
            </span>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

/**
 * Componente principal de Captions.
 * display-captions.md: map pages → Sequences com timing calculado.
 */
export const Captions: React.FC<CaptionsProps> = ({ pages }) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null
        // display-captions.md: calcular start/end frame do timing
        const startFrame = Math.floor((page.startMs / 1000) * fps)
        const endFrame = Math.min(
          nextPage ? Math.floor((nextPage.startMs / 1000) * fps) : Infinity,
          startFrame + Math.floor((SWITCH_CAPTIONS_EVERY_MS / 1000) * fps),
        )
        const durationInFrames = endFrame - startFrame

        if (durationInFrames <= 0) return null

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <CaptionPageView page={page} />
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
