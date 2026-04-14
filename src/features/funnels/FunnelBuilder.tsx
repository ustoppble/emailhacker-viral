import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, MOTION } from '../../styles'

const BLOCKS = [
  { label: 'Carrinho Abandonado', type: 'trigger' },
  { label: 'Email 1: Lembrete', type: 'email' },
  { label: 'Wait 24h', type: 'wait' },
  { label: 'Email 2: Urgencia', type: 'email' },
  { label: 'Wait 48h', type: 'wait' },
  { label: 'Email 3: Oferta', type: 'email' },
  { label: 'Venda Recuperada', type: 'success' },
]

const LEFT_BORDER_COLORS: Record<string, string> = {
  trigger: '#ef4444',
  email: '#6b7ea8',
  wait: '#4b5563',
  success: '#22c55e',
}

// Simple seeded random for confetti
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

// Confetti particle config (deterministic)
const CONFETTI_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  x: seededRandom(i * 3 + 1) * 200 - 100,       // horizontal spread
  vy: -(seededRandom(i * 3 + 2) * 4 + 3),        // initial upward velocity
  size: seededRandom(i * 3 + 3) * 3 + 2,         // 2-5px
  hue: 130 + seededRandom(i * 7) * 40,           // green-ish hues
}))

export const FunnelBuilder: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const blockH = 52
  const connectorH = 26
  const totalBlocks = BLOCKS.length

  // Progress percentage based on how many blocks have appeared
  const lastBlockDelay = (totalBlocks - 1) * 12
  const progressRaw = interpolate(frame, [0, lastBlockDelay + 12], [0, 100], { extrapolateRight: 'clamp' })
  const progressPct = Math.round(progressRaw)

  return (
    <div style={{
      position: 'relative',
      padding: '36px 18px 16px',
      height: '100%',
    }}>
      {/* Title with progress */}
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 11,
        color: COLORS.accent,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 14,
        opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span>construindo funil...</span>
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
        const delay = i * 12
        const blockSpring = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: MOTION.snappy,
        })
        const blockScale = interpolate(blockSpring, [0, 1], [0.6, 1])
        const blockOpacity = interpolate(frame, [delay, delay + 6], [0, 1], { extrapolateRight: 'clamp' })
        const blockY = interpolate(blockSpring, [0, 1], [15, 0])

        const isSuccess = block.type === 'success'
        const isWait = block.type === 'wait'
        const isTrigger = block.type === 'trigger'

        const bgColor = isSuccess ? 'rgba(34, 197, 94, 0.1)' : isWait ? COLORS.bg : COLORS.surface
        const borderCol = isSuccess ? COLORS.success : isTrigger ? COLORS.accent : COLORS.border
        const textCol = isSuccess ? COLORS.success : isTrigger ? COLORS.accent : COLORS.text
        const leftBorderColor = LEFT_BORDER_COLORS[block.type] || COLORS.border

        // Connector line between blocks
        const connectorDelay = delay + 6
        const connectorProgress = interpolate(frame, [connectorDelay, connectorDelay + 8], [0, 1], { extrapolateRight: 'clamp' })

        // Shine effect: sweeps after block fully appears
        const shineDelay = delay + 8
        const shineProgress = interpolate(frame, [shineDelay, shineDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
        const shineX = interpolate(shineProgress, [0, 1], [-30, 110])

        // Trigger dot pulse (scale 1 -> 1.3 -> 1, looping)
        const triggerDotScale = isTrigger && blockOpacity > 0.9
          ? interpolate(Math.sin(((frame - delay) / fps) * Math.PI * 2), [-1, 1], [1, 1.3])
          : 1

        // Animated dot traveling along connector
        const dotTravelDelay = connectorDelay + 4
        const dotTravel = interpolate(frame, [dotTravelDelay, dotTravelDelay + 10], [0, 1], { extrapolateRight: 'clamp' })

        // Success confetti
        const successAppearFrame = delay + 6
        const confettiAge = Math.max(0, frame - successAppearFrame)

        // Pulse ring that expands outward from block on entry (sonar ping)
        const pulseRingAge = Math.max(0, frame - delay - 4)
        const pulseRingProgress = interpolate(pulseRingAge, [0, 10], [0, 1], { extrapolateRight: 'clamp' })
        const pulseRingScale = interpolate(pulseRingProgress, [0, 1], [1, 2.5])
        const pulseRingOpacity = interpolate(pulseRingProgress, [0, 0.1, 1], [0, 0.5, 0])

        // Block glow that fades from strong to subtle on entry
        const glowAge = Math.max(0, frame - delay)
        const glowOpacity = interpolate(glowAge, [0, 4, 15], [0, 0.3, 0.1], { extrapolateRight: 'clamp' })
        const glowColor = LEFT_BORDER_COLORS[block.type] || COLORS.accent

        // --- VOLUMETRIC LIGHTING ---

        // 1) Success block: large green volumetric glow (flash then settle)
        const successGlowAge = Math.max(0, frame - delay)
        const successVolumetricOpacity = isSuccess
          ? interpolate(successGlowAge, [0, 4, 10, 20], [0, 0.4, 0.25, 0.25], { extrapolateRight: 'clamp' })
          : 0

        // 2) Trigger block: persistent subtle red glow, pulsing with trigger dot
        const triggerGlowPulse = isTrigger && blockOpacity > 0.9
          ? interpolate(Math.sin(((frame - delay) / fps) * Math.PI * 2), [-1, 1], [0.1, 0.2])
          : 0

        // 3) Email blocks: brief blue-gray flash on appear (0->0.2->0 over 8 frames)
        const emailFlashOpacity = block.type === 'email'
          ? interpolate(glowAge, [0, 3, 8], [0, 0.2, 0], { extrapolateRight: 'clamp' })
          : 0

        // 4) Energy pulse on connectors: after dot reaches end, line brightens briefly
        const dotArriveFrame = dotTravelDelay + 10
        const energyPulseAge = Math.max(0, frame - dotArriveFrame)
        const energyPulseOpacity = i < BLOCKS.length - 1
          ? interpolate(energyPulseAge, [0, 3, 6], [0.5, 0.8, 0.5], { extrapolateRight: 'clamp' })
          : 0.5
        const energyPulseActive = i < BLOCKS.length - 1 && energyPulseAge >= 0 && energyPulseAge <= 6

        return (
          <div key={i} style={{ position: 'relative', overflow: 'visible' }}>
            {/* VOLUMETRIC: Success block large green glow */}
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

            {/* VOLUMETRIC: Trigger block persistent red glow */}
            {isTrigger && triggerGlowPulse > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 220,
                height: 140,
                transform: 'translate(-50%, -50%)',
                background: `radial-gradient(ellipse at center, ${COLORS.accent} 0%, rgba(239, 68, 68, 0.1) 45%, transparent 70%)`,
                opacity: triggerGlowPulse,
                filter: 'blur(30px)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            )}

            {/* VOLUMETRIC: Email block brief blue-gray flash */}
            {block.type === 'email' && emailFlashOpacity > 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 240,
                height: 120,
                transform: 'translate(-50%, -50%)',
                background: 'radial-gradient(ellipse at center, rgba(107, 126, 168, 0.6) 0%, rgba(107, 126, 168, 0.1) 50%, transparent 70%)',
                opacity: emailFlashOpacity,
                filter: 'blur(25px)',
                pointerEvents: 'none',
                zIndex: 0,
              }} />
            )}

            {/* Pulse ring — sonar ping on block entry */}
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
              padding: isWait ? '6px 14px' : '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: isSuccess
                ? `0 0 15px ${COLORS.successGlow}`
                : isTrigger
                  ? `0 0 10px ${COLORS.accentGlowSoft}`
                  : glowAge < 15
                    ? `0 0 ${20 * glowOpacity}px ${glowColor}, 0 0 ${40 * glowOpacity}px ${glowColor}`
                    : 'none',
            }}>
              {/* Dot */}
              <div style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: isSuccess ? COLORS.success : isTrigger ? COLORS.accent : COLORS.textMuted,
                flexShrink: 0,
                transform: `scale(${triggerDotScale})`,
              }} />
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: isWait ? 10 : 12,
                color: textCol,
                fontWeight: isTrigger || isSuccess ? 'bold' : 'normal',
              }}>
                {isSuccess ? '\u2713 ' : ''}{block.label}
              </span>

              {/* Shine sweep effect */}
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

            {/* Confetti for success block */}
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
                      bottom: 30,
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
                  opacity: energyPulseActive ? energyPulseOpacity : 0.5,
                  borderRadius: 2,
                  filter: energyPulseActive
                    ? `drop-shadow(0 0 8px ${COLORS.accentGlow}) drop-shadow(0 0 16px ${COLORS.accentGlowSoft}) drop-shadow(0 0 24px ${COLORS.accentGlowSoft})`
                    : `drop-shadow(0 0 4px ${COLORS.accentGlow}) drop-shadow(0 0 8px ${COLORS.accentGlowSoft})`,
                }} />

                {/* Animated traveling dot with trail */}
                {dotTravel > 0 && dotTravel < 1 && connectorProgress > 0.5 && (
                  <>
                    {/* Trail dots (behind main dot) */}
                    {[0.06, 0.12, 0.18].map((offset, ti) => {
                      const trailPos = dotTravel - offset
                      if (trailPos < 0) return null
                      return (
                        <div key={ti} style={{
                          position: 'absolute',
                          left: '50%',
                          top: connectorH * trailPos,
                          transform: 'translate(-50%, -50%)',
                          width: 4 - ti,
                          height: 4 - ti,
                          borderRadius: '50%',
                          backgroundColor: COLORS.accent,
                          opacity: 0.4 - ti * 0.12,
                          boxShadow: `0 0 4px ${COLORS.accentGlow}`,
                        }} />
                      )
                    })}
                    {/* Main dot */}
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
                  </>
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
