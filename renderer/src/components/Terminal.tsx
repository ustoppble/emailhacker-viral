import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { COLORS, FONTS, SIZES, SPRINGS } from './tokens'

type TerminalLineItem = {
  text: string
  type?: 'command' | 'output' | 'error' | 'success' | 'info'
}

type TerminalProps = {
  lines: TerminalLineItem[]
  title?: string
  startFrame?: number
  /** Delay entre cada linha em frames (default: 6) */
  stagger?: number
}

const LINE_COLORS: Record<string, string> = {
  command: COLORS.text,
  output: COLORS.textSecondary,
  error: COLORS.accent,
  success: COLORS.success,
  info: '#3b82f6',
}

/**
 * Terminal output com linhas aparecendo em sequência.
 *
 * Segue:
 * - timing.md: spring com delay pra stagger entre linhas
 * - animations.md: interpolate com clamp
 */
export const Terminal: React.FC<TerminalProps> = ({
  lines,
  title = 'Terminal',
  startFrame = 0,
  stagger = 6,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        backgroundColor: COLORS.bg,
        borderRadius: 8,
        border: `1px solid ${COLORS.borderSubtle}`,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '6px 14px',
          borderBottom: `1px solid ${COLORS.borderSubtle}`,
          backgroundColor: COLORS.surface,
        }}
      >
        <span style={{ color: COLORS.textMuted, fontSize: SIZES.micro }}>{title}</span>
      </div>

      <div style={{ padding: '10px 14px' }}>
        {lines.map((line, i) => {
          // timing.md: spring com delay parameter
          const enter = spring({
            frame,
            fps,
            config: SPRINGS.snappy,
            delay: startFrame + i * stagger,
          })
          const opacity = interpolate(enter, [0, 1], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          })
          const color = LINE_COLORS[line.type || 'output']

          return (
            <div
              key={i}
              style={{
                fontSize: SIZES.small,
                lineHeight: 1.6,
                opacity,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {line.type === 'command' && (
                <span style={{ color: COLORS.accent, marginRight: 8 }}>$</span>
              )}
              <span style={{ color }}>{line.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
