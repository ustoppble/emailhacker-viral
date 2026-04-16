import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const BLOCKS = [
  { label: 'Segmento: 3.418 ativos', type: 'segment' },
  { label: 'Produto: Curso Email Pro', type: 'product' },
  { label: 'IA gerando subject...', type: 'ai' },
  { label: 'IA escrevendo corpo...', type: 'ai' },
  { label: 'Revisao: spam score 1.8', type: 'check' },
  { label: 'Campanha disparada!', type: 'success' },
]

const LEFT_BORDER_COLORS: Record<string, string> = {
  segment: '#6366f1',
  product: '#f59e0b',
  ai: '#ef4444',
  check: '#6b7ea8',
  success: '#22c55e',
}

const BLOCK_ICONS: Record<string, string> = {
  segment: '\u{1F465}',
  product: '\u{1F4E6}',
  ai: '\u{1F916}',
  check: '\u{2705}',
  success: '\u{1F680}',
}

// Seeded random for confetti
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const CONFETTI_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  x: seededRandom(i * 3 + 1) * 200 - 100,
  vy: -(seededRandom(i * 3 + 2) * 4 + 3),
  size: seededRandom(i * 3 + 3) * 3 + 2,
  hue: 130 + seededRandom(i * 7) * 40,
}))

export const SendBuilder: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const blockH = 48
  const connectorH = 22
  const totalBlocks = BLOCKS.length

  // Progress
  const lastBlockDelay = (totalBlocks - 1) * 15
  const progressRaw = interpolate(frame, [0, lastBlockDelay + 15], [0, 100], { extrapolateRight: 'clamp' })
  const progressPct = Math.round(progressRaw)

  return (
    <div style={{
      position: 'relative',
      padding: '36px 16px 16px',
      height: '100%',
    }}>
      {/* Title */}
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 12,
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span>disparando email...</span>
        <span style={{
          color: COLORS.textMuted,
          fontSize: 10,
          fontWeight: 'normal',
          letterSpacing: 0,
        }}>
          {progressPct}%
        </span>
      </div>

      {BLOCKS.map((block, i) => {
        const delay = i * 15
        const blockSpring = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: MOTION.snappy,
        })
        const blockScale = interpolate(blockSpring, [0, 1], [0.6, 1])
        const blockOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' })
        const blockY = interpolate(blockSpring, [0, 1], [15, 0])

        const isSuccess = block.type === 'success'
        const isAi = block.type === 'ai'
        const bgColor = isSuccess ? 'rgba(34, 197, 94, 0.1)' : isAi ? 'rgba(239, 68, 68, 0.05)' : COLORS.surface
        const borderCol = isSuccess ? COLORS.success : isAi ? COLORS.accent : COLORS.border
        const textCol = isSuccess ? COLORS.success : isAi ? COLORS.accent : COLORS.text
        const leftBorderColor = LEFT_BORDER_COLORS[block.type] || COLORS.border

        // Connector
        const connectorDelay = delay + 6
        const connectorProgress = interpolate(frame, [connectorDelay, connectorDelay + 8], [0, 1], { extrapolateRight: 'clamp' })

        // Shine sweep
        const shineDelay = delay + 8
        const shineProgress = interpolate(frame, [shineDelay, shineDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
        const shineX = interpolate(shineProgress, [0, 1], [-30, 110])

        // AI typing dots animation
        const aiDotsFrame = Math.max(0, frame - delay)
        const dotCount = isAi ? Math.floor(aiDotsFrame / 4) % 4 : 0

        // Pulse ring on entry
        const pulseRingAge = Math.max(0, frame - delay - 4)
        const pulseRingProgress = interpolate(pulseRingAge, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
        const pulseRingScale = interpolate(pulseRingProgress, [0, 1], [1, 2.5])
        const pulseRingOpacity = interpolate(pulseRingProgress, [0, 0.1, 1], [0, 0.5, 0])
        const glowColor = LEFT_BORDER_COLORS[block.type] || COLORS.accent

        // Confetti for success
        const successAppearFrame = delay + 6
        const confettiAge = Math.max(0, frame - successAppearFrame)

        // Volumetric glow for success
        const successGlowAge = Math.max(0, frame - delay)
        const successVolumetricOpacity = isSuccess
          ? interpolate(successGlowAge, [0, 4, 10, 20], [0, 0.4, 0.25, 0.25], { extrapolateRight: 'clamp' })
          : 0

        // AI block glow
        const aiGlowAge = Math.max(0, frame - delay)
        const aiGlowOpacity = isAi
          ? interpolate(aiGlowAge, [0, 4, 15, 30], [0, 0.25, 0.15, 0.08], { extrapolateRight: 'clamp' })
          : 0

        // Traveling dot on connector
        const dotTravelDelay = connectorDelay + 4
        const dotTravel = interpolate(frame, [dotTravelDelay, dotTravelDelay + 10], [0, 1], { extrapolateRight: 'clamp' })

        return (
          <div key={i} style={{ position: 'relative', overflow: 'visible' }}>
            {/* Volumetric success glow */}
            {isSuccess && successVolumetricOpacity > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 300,
                height: 200,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(ellipse at center, ${COLORS.success} 0%, rgba(22, 163, 74, 0.15) 40%, transparent 70%)`,
                opacity: successVolumetricOpacity,
                filter: 'blur(40px)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            )}

            {/* AI red glow */}
            {isAi && aiGlowOpacity > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 220,
                height: 120,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(ellipse at center, ${COLORS.accent} 0%, rgba(239, 68, 68, 0.1) 45%, transparent 70%)`,
                opacity: aiGlowOpacity,
                filter: 'blur(25px)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            )}

            {/* Pulse ring */}
            {pulseRingAge > 0 && pulseRingAge < 10 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: blockH,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pointerEvents: 'none',
                zIndex: 5,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: `2px solid ${glowColor}`,
                  transform: `scale(${pulseRingScale})`,
                  opacity: pulseRingOpacity,
                }} />
              </div>
            )}

            {/* Block */}
            <div style={{
              transform: `scale(${blockScale}) translateY(${blockY}px)`,
              opacity: blockOpacity,
              position: 'relative',
              overflow: 'hidden',
              backgroundColor: bgColor,
              border: `1px solid ${borderCol}`,
              borderLeft: `3px solid ${leftBorderColor}`,
              borderRadius: 8,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isSuccess
                ? `0 0 15px ${COLORS.successGlow}`
                : isAi
                  ? `0 0 10px ${COLORS.accentGlowSoft}`
                  : 'none',
            }}>
              {/* Icon */}
              <span style={{ fontSize: 16, flexShrink: 0 }}>
                {BLOCK_ICONS[block.type] || '\u25CF'}
              </span>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: textCol,
                fontWeight: isSuccess || isAi ? 'bold' : 'normal',
              }}>
                {isSuccess ? '\u2713 ' : ''}{block.label}
                {isAi && dotCount > 0 ? '.'.repeat(dotCount) : ''}
              </span>

              {/* Shine sweep */}
              {shineProgress > 0 && shineProgress < 1 && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  background: `linear-gradient(
                    105deg,
                    transparent ${shineX - 15}%,
                    rgba(255,255,255,0.08) ${shineX}%,
                    transparent ${shineX + 15}%
                  )`,
                }} />
              )}
            </div>

            {/* Confetti for success */}
            {isSuccess && confettiAge > 0 && confettiAge < 40 && (
              <div style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
              }}>
                {CONFETTI_PARTICLES.map((p, pi) => {
                  const t = confettiAge / fps
                  const gravity = 9
                  const py = p.vy * t + 0.5 * gravity * t * t
                  const px = p.x * t * 0.6
                  const particleOpacity = interpolate(confettiAge, [0, 10, 30, 40], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
                  return (
                    <div key={pi} style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: 20,
                      width: p.size,
                      height: p.size,
                      borderRadius: '50%',
                      backgroundColor: `hsl(${p.hue}, 70%, 55%)`,
                      transform: `translate(${px}px, ${py}px)`,
                      opacity: particleOpacity,
                    }} />
                  )
                })}
              </div>
            )}

            {/* Connector */}
            {i < BLOCKS.length - 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                height: connectorH,
                position: 'relative',
              }}>
                <div style={{
                  width: 3,
                  height: connectorH * connectorProgress,
                  backgroundColor: COLORS.accent,
                  opacity: 0.5,
                  borderRadius: 2,
                  filter: `drop-shadow(0 0 4px ${COLORS.accentGlow}) drop-shadow(0 0 8px ${COLORS.accentGlowSoft})`,
                }} />

                {/* Traveling dot */}
                {dotTravel > 0 && dotTravel < 1 && connectorProgress > 0.5 && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: connectorH * dotTravel,
                    transform: 'translate(-50%, -50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: COLORS.accent,
                    opacity: 0.9,
                    boxShadow: `0 0 8px ${COLORS.accentGlow}, 0 0 16px ${COLORS.accentGlowSoft}`,
                  }} />
                )}

                {/* Arrow tip */}
                {connectorProgress > 0.8 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    width: 0,
                    height: 0,
                    borderLeft: '4px solid transparent',
                    borderRight: '4px solid transparent',
                    borderTop: `6px solid ${COLORS.accent}`,
                    opacity: 0.4,
                  }} />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
