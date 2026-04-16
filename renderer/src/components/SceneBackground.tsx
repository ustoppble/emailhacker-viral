import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'
import { COLORS } from './tokens'

// type em vez de interface (compositions.md)
type SceneBackgroundProps = {
  children: React.ReactNode
  /** Mostrar grid sutil no fundo (default: true) */
  showGrid?: boolean
  /** Vignette nas bordas (default: true) */
  showVignette?: boolean
}

/**
 * Background base pra todas as cenas — fundo escuro com grid sutil e vignette.
 * Canvas: 1080x960 (metade superior do Short 9:16).
 */
export const SceneBackground: React.FC<SceneBackgroundProps> = ({
  children,
  showGrid = true,
  showVignette = true,
}) => {
  const frame = useCurrentFrame()

  // Grid sutil com leve drift
  const gridOffset = interpolate(frame, [0, 1800], [0, 30], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        width: 1080,
        height: 960,
        backgroundColor: COLORS.bg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid background */}
      {showGrid && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${COLORS.borderSubtle} 1px, transparent 1px),
              linear-gradient(90deg, ${COLORS.borderSubtle} 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            backgroundPosition: `0 ${gridOffset}px`,
            opacity: 0.4,
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%' }}>
        {children}
      </div>

      {/* Vignette */}
      {showVignette && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      )}
    </div>
  )
}
