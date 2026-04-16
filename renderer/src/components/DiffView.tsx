import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { COLORS, FONTS, SIZES, SPRINGS } from './tokens'

type DiffLineItem = {
  type: 'add' | 'remove' | 'context'
  text: string
  lineNumber?: number
}

type DiffViewProps = {
  file: string
  branch?: string
  lines: DiffLineItem[]
  startFrame?: number
  /** Delay entre cada linha em frames (default: 3) */
  stagger?: number
  added?: number
  removed?: number
}

/**
 * Visualização de diff estilo git — linhas verdes (+) e vermelhas (-).
 *
 * Segue:
 * - timing.md: spring com delay parameter pra stagger
 * - animations.md: interpolate com clamp, tempos em segundos * fps
 */
export const DiffView: React.FC<DiffViewProps> = ({
  file,
  branch,
  lines,
  startFrame = 0,
  stagger = 3,
  added,
  removed,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // animations.md: fade em segundos * fps com clamp
  const headerOpacity = interpolate(frame, [0, 0.3 * fps], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

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
      {/* Header do arquivo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: `1px solid ${COLORS.borderSubtle}`,
          backgroundColor: COLORS.surface,
          opacity: headerOpacity,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {branch && (
            <span style={{ color: COLORS.accent, fontSize: SIZES.micro }}>{branch}</span>
          )}
          <span style={{ color: COLORS.textSecondary, fontSize: SIZES.small }}>{file}</span>
        </div>
        {(added !== undefined || removed !== undefined) && (
          <div style={{ display: 'flex', gap: 8, fontSize: SIZES.micro }}>
            {added !== undefined && <span style={{ color: COLORS.success }}>+{added}</span>}
            {removed !== undefined && <span style={{ color: COLORS.accent }}>-{removed}</span>}
          </div>
        )}
      </div>

      {/* Linhas do diff */}
      <div style={{ padding: '6px 0' }}>
        {lines.map((line, i) => {
          // timing.md: spring com delay pra stagger
          const enter = spring({
            frame,
            fps,
            config: SPRINGS.snappy,
            delay: startFrame + Math.round(0.2 * fps) + i * stagger,
          })
          const opacity = interpolate(enter, [0, 1], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          })

          const bgColor =
            line.type === 'add' ? COLORS.diffAddBg :
            line.type === 'remove' ? COLORS.diffRemoveBg :
            'transparent'

          const borderColor =
            line.type === 'add' ? COLORS.diffAdd :
            line.type === 'remove' ? COLORS.diffRemove :
            'transparent'

          const prefix =
            line.type === 'add' ? '+' :
            line.type === 'remove' ? '-' :
            ' '

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '2px 14px',
                backgroundColor: bgColor,
                borderLeft: `3px solid ${borderColor}`,
                opacity,
                fontSize: SIZES.small,
              }}
            >
              {line.lineNumber !== undefined && (
                <span style={{ color: COLORS.textMuted, width: 32, textAlign: 'right', marginRight: 12 }}>
                  {line.lineNumber}
                </span>
              )}
              <span style={{ color: COLORS.textMuted, marginRight: 8 }}>{prefix}</span>
              <span style={{ color: COLORS.text }}>{line.text}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
