import React from 'react'
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from 'remotion'
import { COLORS, FONTS, SIZES, SPRINGS } from './tokens'

// type em vez de interface (compositions.md)
type AppWindowProps = {
  title?: string
  branch?: string
  showSemaphores?: boolean
  children: React.ReactNode
  enterDelay?: number
}

/**
 * Janela de app estilo terminal/IDE — design system EmailHacker.
 *
 * Segue:
 * - animations.md: useCurrentFrame + interpolate com clamp
 * - timing.md: spring com config do design system + delay parameter
 */
export const AppWindow: React.FC<AppWindowProps> = ({
  title = 'emailhacker-ai',
  branch,
  showSemaphores = true,
  children,
  enterDelay = 0,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // timing.md: spring com delay parameter (não frame - delay manual)
  const enter = spring({
    frame,
    fps,
    config: SPRINGS.snappy,
    delay: enterDelay,
  })

  // timing.md: combinar spring com interpolate pra custom ranges
  const scale = interpolate(enter, [0, 1], [0.92, 1])
  // animations.md: sempre clamp
  const opacity = interpolate(enter, [0, 1], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    // animations.md: AbsoluteFill como wrapper
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1000,
          backgroundColor: COLORS.surface,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
          transform: `scale(${scale})`,
          opacity,
          fontFamily: FONTS.mono,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: `1px solid ${COLORS.borderSubtle}`,
            gap: 12,
          }}
        >
          {showSemaphores && (
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#eab308' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            </div>
          )}
          <span style={{ color: COLORS.textSecondary, fontSize: SIZES.small }}>
            {title}
          </span>
          {branch && (
            <span style={{ color: COLORS.accent, fontSize: SIZES.micro, marginLeft: 'auto' }}>
              {branch}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 24, minHeight: 200 }}>
          {children}
        </div>
      </div>
    </AbsoluteFill>
  )
}
