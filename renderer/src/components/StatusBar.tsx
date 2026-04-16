import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { COLORS, FONTS, SIZES, SPRINGS } from './tokens'

// type em vez de interface (compositions.md)
type StatusBarProps = {
  items: string[]
  model?: string
  tokenCount?: string
  elapsed?: string
  startFrame?: number
}

/**
 * Status bar inferior — mostra contexto (branch, dir, modelo).
 * Estilo: surface com text muted, itens separados por dot.
 */
export const StatusBar: React.FC<StatusBarProps> = ({
  items,
  model = 'Opus 4.6',
  tokenCount,
  elapsed,
  startFrame = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // timing.md: spring com delay parameter
  const enter = spring({
    frame,
    fps,
    config: SPRINGS.snappy,
    delay: startFrame,
  })
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const translateY = interpolate(enter, [0, 1], [10, 0])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: COLORS.surface,
        borderTop: `1px solid ${COLORS.borderSubtle}`,
        fontFamily: FONTS.mono,
        fontSize: SIZES.micro,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: COLORS.textMuted }}>·</span>}
            <span style={{ color: COLORS.textSecondary }}>{item}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {elapsed && (
          <span style={{ color: COLORS.textMuted }}>{elapsed}</span>
        )}
        {tokenCount && (
          <span style={{ color: COLORS.textMuted }}>↓ {tokenCount}</span>
        )}
        <span style={{ color: COLORS.accent }}>{model}</span>
      </div>
    </div>
  )
}
