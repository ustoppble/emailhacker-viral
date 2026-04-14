import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, SIZES, MOTION } from '../styles'
import { InsectLogo } from '../components/InsectLogo'

// Deterministic pseudo-random
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // === LAYER 1: CONVERGENCE — speed lines from edges toward center ===
  const convergenceLines = Array.from({ length: 8 }, (_, i) => {
    const angle = i * 45 // 0, 45, 90, 135, 180, 225, 270, 315
    const rad = (angle * Math.PI) / 180
    // Lines start far out and shoot toward center
    const startDist = 1200
    const progress = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' })
    const dist = startDist * (1 - progress)
    const x = Math.cos(rad) * dist
    const y = Math.sin(rad) * dist
    const opacity = interpolate(frame, [0, 5, 12, 16], [0, 0.6, 0.4, 0], { extrapolateRight: 'clamp' })
    const length = interpolate(frame, [0, 10], [300, 80], { extrapolateRight: 'clamp' })
    return { angle, x, y, opacity, length, index: i }
  })

  // === LAYER 2: GLOW — maximum intensity of entire video ===
  const glowOpacity = interpolate(frame, [10, 25, 80, 90], [0, 0.7, 0.6, 0.5], { extrapolateRight: 'clamp' })

  // Continuous zoom
  const sceneScale = interpolate(frame, [0, 90], [0.98, 1.04], { extrapolateRight: 'clamp' })

  // === HEARTBEAT PULSE on entire scene in last 20 frames ===
  // scale 1.0 -> 1.03 -> 1.0 -> 1.02 -> 1.0 over frames 70-90
  const heartbeatScale = interpolate(frame, [70, 75, 78, 83, 86, 90], [1.0, 1.03, 1.0, 1.02, 1.0, 1.0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // === LAYER 3: LOGO with double spring ===
  const logoSpring = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 8, stiffness: 120, mass: 1.1 }, // bouncy overshoot
  })
  // Double spring: 0 -> 1.15 -> 0.95 -> 1.0
  const logoScale = interpolate(logoSpring, [0, 1], [0, 1]) *
    (1 + interpolate(
      spring({ frame: Math.max(0, frame - 14), fps, config: { damping: 6, stiffness: 200, mass: 0.8 } }),
      [0, 0.3, 0.6, 1],
      [0, 0.15, -0.05, 0],
    ))
  const logoOpacity = interpolate(frame, [14, 18], [0, 1], { extrapolateRight: 'clamp' })

  // === LAYER 4: TERMINAL DOTS with pulsing red ===
  const dots = [0, 1, 2].map(i => {
    const s = spring({ frame: Math.max(0, frame - 10 - i * 3), fps, config: MOTION.snappy })
    return interpolate(s, [0, 1], [0, 1])
  })
  // Red dot pulse loop
  const pulsePhase = Math.sin((frame - 15) * 0.15) * 0.5 + 0.5
  const redDotScale = 1 + pulsePhase * 0.3

  // === LAYER 5: TAGLINE with letter-spacing convergence (MORE dramatic: 30 -> 2) ===
  const taglineDelay = 35
  const taglineSpring = spring({
    frame: Math.max(0, frame - taglineDelay),
    fps,
    config: MOTION.smooth,
  })
  const taglineOpacity = interpolate(frame, [taglineDelay, taglineDelay + 12], [0, 1], { extrapolateRight: 'clamp' })
  const taglineY = interpolate(taglineSpring, [0, 1], [20, 0])
  const taglineSpacing = interpolate(taglineSpring, [0, 1], [30, 2])

  // === FINAL FLASH — DOUBLE PULSE at frames 78 and 84, peak 0.5 ===
  const flash1 = interpolate(frame, [76, 78, 81], [0, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const flash2 = interpolate(frame, [82, 84, 87], [0, 0.5, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const flashOpacity = Math.max(flash1, flash2)

  // Floating particles (ambient, slow)
  const ambientParticles = Array.from({ length: 12 }, (_, i) => {
    const startX = (seeded(i) - 0.5) * 1600
    const startY = (seeded(i + 30) - 0.5) * 900
    const drift = Math.sin(frame * 0.03 + i * 2) * 30
    const opacity = interpolate(frame, [15, 30], [0, 0.15 + seeded(i + 60) * 0.15], { extrapolateRight: 'clamp' })
    const size = 1.5 + seeded(i + 90) * 2.5
    return { x: startX + drift, y: startY + drift * 0.5, opacity, size, index: i }
  })

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      overflow: 'hidden',
    }}>
      {/* Continuous zoom + heartbeat pulse wrapper */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${sceneScale * heartbeatScale})`,
      }}>

        {/* LAYER 1: Convergence speed lines */}
        {convergenceLines.map(({ angle, x, y, opacity, length, index }) => (
          <div key={`line-${index}`} style={{
            position: 'absolute',
            width: length,
            height: 2,
            background: `linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.5), rgba(255, 255, 255, 0.3))`,
            transform: `translate(${x}px, ${y}px) rotate(${angle + 180}deg)`,
            transformOrigin: 'right center',
            opacity,
            filter: 'blur(0.5px)',
          }} />
        ))}

        {/* LAYER 2: Maximum glow */}
        <div style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, rgba(239, 68, 68, 0.2) 35%, transparent 65%)`,
          opacity: glowOpacity,
          filter: 'blur(30px)',
        }} />

        {/* Second glow ring */}
        <div style={{
          position: 'absolute',
          width: 1100,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.accentGlowSoft} 0%, transparent 55%)`,
          opacity: glowOpacity * 0.5,
        }} />

        {/* Ambient particles */}
        {ambientParticles.map(({ x, y, opacity, size, index }) => (
          <div key={`ap-${index}`} style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: index % 4 === 0 ? COLORS.accent : 'rgba(255,255,255,0.6)',
            transform: `translate(${x}px, ${y}px)`,
            opacity,
            boxShadow: index % 4 === 0 ? `0 0 6px ${COLORS.accentGlow}` : 'none',
          }} />
        ))}

        {/* Content stack */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
        }}>
          {/* Terminal dots */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginBottom: 28,
          }}>
            {dots.map((d, i) => {
              const isRed = i === 0
              const dotScale = isRed ? d * redDotScale : d
              return (
                <div key={i} style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: isRed ? COLORS.accent : '#333',
                  transform: `scale(${dotScale})`,
                  boxShadow: isRed
                    ? `0 0 12px ${COLORS.accentGlow}, 0 0 24px ${COLORS.accentGlowSoft}`
                    : 'none',
                }} />
              )
            })}
          </div>

          {/* LAYER 3: Logo — insect + EMAILHACKER.AI inline */}
          <div style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}>
            <InsectLogo width={56} height={56} glowIntensity={0.8} />
            <span style={{
              fontFamily: FONTS.mono,
              fontSize: SIZES.hero + 16,
              fontWeight: 'bold',
              color: COLORS.text,
              letterSpacing: 4,
              textShadow: `0 0 50px ${COLORS.accentGlow}, 0 0 100px ${COLORS.accentGlowSoft}, 0 0 8px rgba(255,255,255,0.15)`,
            }}>
              EMAILHACKER
              <span style={{ color: COLORS.accent }}>.AI</span>
            </span>
          </div>

          {/* LAYER 5: Tagline with letter-spacing convergence (30 -> 2) */}
          <div style={{
            marginTop: 24,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}>
            <span style={{
              fontFamily: FONTS.mono,
              fontSize: SIZES.body,
              color: COLORS.textSecondary,
              letterSpacing: taglineSpacing,
              textTransform: 'lowercase',
            }}>
              email marketing autônomo
            </span>
          </div>
        </div>

        {/* FINAL FLASH — double pulse camera flash effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ffffff',
          opacity: flashOpacity,
          pointerEvents: 'none',
          zIndex: 20,
        }} />
      </div>
    </AbsoluteFill>
  )
}
