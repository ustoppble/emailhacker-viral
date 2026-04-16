import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { COLORS, FONTS, SIZES, SPRINGS } from './tokens'

type ToolCallItem = {
  type: 'Write' | 'Edit' | 'Read' | 'Bash' | 'Agent'
  file?: string
  added?: number
  removed?: number
  description?: string
}

type ToolCallsProps = {
  items: ToolCallItem[]
  startFrame?: number
  /** Delay entre cada item em frames (default: 8) */
  stagger?: number
}

const TOOL_COLORS: Record<string, string> = {
  Write: '#16a34a',
  Edit: '#eab308',
  Read: '#3b82f6',
  Bash: '#9ca3af',
  Agent: '#a855f7',
}

/**
 * Lista de tool calls com animação cascade/stagger.
 *
 * Segue:
 * - timing.md: spring com delay parameter pra stagger
 * - animations.md: interpolate com clamp
 */
export const ToolCalls: React.FC<ToolCallsProps> = ({
  items,
  startFrame = 0,
  stagger = 8,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => {
        // timing.md: delay parameter pra stagger entre items
        const enter = spring({
          frame,
          fps,
          config: SPRINGS.snappy,
          delay: startFrame + i * stagger,
        })

        // timing.md: combinar spring com interpolate
        const translateX = interpolate(enter, [0, 1], [20, 0])
        const opacity = interpolate(enter, [0, 1], [0, 1], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
        })
        const color = TOOL_COLORS[item.type] || COLORS.textSecondary

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: FONTS.mono,
              fontSize: SIZES.label,
              transform: `translateX(${translateX}px)`,
              opacity,
            }}
          >
            <span style={{ color, fontWeight: 'bold', minWidth: 50 }}>
              {item.type}
            </span>
            {item.file && (
              <span style={{ color: COLORS.text }}>{item.file}</span>
            )}
            {item.added !== undefined && (
              <span style={{ color: COLORS.success, marginLeft: 6 }}>+{item.added}</span>
            )}
            {item.removed !== undefined && (
              <span style={{ color: COLORS.accent, marginLeft: 2 }}>-{item.removed}</span>
            )}
            {item.description && (
              <span style={{ color: COLORS.textMuted }}>{item.description}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
