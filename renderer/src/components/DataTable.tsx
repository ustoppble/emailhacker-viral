import React from 'react'
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion'
import { COLORS, FONTS, SIZES, SPRINGS } from './tokens'

// type em vez de interface (compositions.md)
type DataTableProps = {
  headers: string[]
  rows: string[][]
  startFrame?: number
  stagger?: number
}

/**
 * Tabela de dados animada — headers + rows com stagger.
 *
 * Segue:
 * - timing.md: spring com delay parameter
 * - animations.md: interpolate com clamp
 */
export const DataTable: React.FC<DataTableProps> = ({
  headers,
  rows,
  startFrame = 0,
  stagger = 4,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // timing.md: spring com delay parameter
  const headerEnter = spring({
    frame,
    fps,
    config: SPRINGS.snappy,
    delay: startFrame,
  })
  const headerOpacity = interpolate(headerEnter, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: SIZES.label,
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${COLORS.borderSubtle}`,
          paddingBottom: 8,
          marginBottom: 4,
          opacity: headerOpacity,
        }}
      >
        {headers.map((h, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              color: COLORS.textSecondary,
              fontWeight: 'bold',
              fontSize: SIZES.small,
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {rows.map((row, rowIdx) => {
        // timing.md: spring com delay parameter pra stagger
        const enter = spring({
          frame,
          fps,
          config: SPRINGS.snappy,
          delay: startFrame + 6 + rowIdx * stagger,
        })
        const opacity = interpolate(enter, [0, 1], [0, 1], {
          extrapolateRight: 'clamp',
          extrapolateLeft: 'clamp',
        })
        const translateY = interpolate(enter, [0, 1], [6, 0])

        return (
          <div
            key={rowIdx}
            style={{
              display: 'flex',
              padding: '6px 0',
              borderBottom: `1px solid ${COLORS.borderSubtle}`,
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {row.map((cell, cellIdx) => (
              <span
                key={cellIdx}
                style={{
                  flex: 1,
                  color: cellIdx === 0 ? COLORS.text : COLORS.textSecondary,
                }}
              >
                {cell}
              </span>
            ))}
          </div>
        )
      })}
    </div>
  )
}
