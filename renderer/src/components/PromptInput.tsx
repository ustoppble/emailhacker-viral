import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { COLORS, FONTS, SIZES } from './tokens'

// type em vez de interface (compositions.md)
type PromptInputProps = {
  text: string
  /** Frames por caractere (default: 2) — text-animations.md */
  charFrames?: number
  startFrame?: number
  showCursor?: boolean
}

/**
 * Input com efeito typewriter — simula o usuário digitando.
 *
 * Segue text-animations.md:
 * - String slicing (NUNCA per-character opacity)
 * - Cursor blinking com interpolate(frame % blinkFrames)
 * - Padrão do asset text-animations-typewriter.tsx
 */

const CURSOR_BLINK_FRAMES = 16

/** Cursor blinking — padrão do asset typewriter da skill */
const Cursor: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = interpolate(
    frame % CURSOR_BLINK_FRAMES,
    [0, CURSOR_BLINK_FRAMES / 2, CURSOR_BLINK_FRAMES],
    [1, 0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  return (
    <span
      style={{
        display: 'inline-block',
        width: 2,
        height: 18,
        backgroundColor: COLORS.accent,
        opacity,
        marginLeft: 1,
        verticalAlign: 'middle',
      }}
    />
  )
}

export const PromptInput: React.FC<PromptInputProps> = ({
  text,
  charFrames = 2,
  startFrame = 0,
  showCursor = true,
}) => {
  const frame = useCurrentFrame()

  // text-animations.md: string slicing baseado em frame
  const elapsed = Math.max(0, frame - startFrame)
  const typedChars = Math.min(text.length, Math.floor(elapsed / charFrames))
  const visibleText = text.slice(0, typedChars)

  return (
    <div
      style={{
        backgroundColor: COLORS.surfaceLight,
        borderRadius: 8,
        border: `1px solid ${COLORS.borderSubtle}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        fontFamily: FONTS.mono,
      }}
    >
      <span style={{ color: COLORS.textMuted, fontSize: SIZES.label, marginRight: 8 }}>
        $
      </span>
      <span style={{ color: COLORS.text, fontSize: SIZES.label }}>
        {visibleText}
      </span>
      {showCursor && <Cursor frame={frame} />}
    </div>
  )
}
