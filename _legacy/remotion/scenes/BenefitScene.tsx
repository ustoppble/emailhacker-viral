import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, SIZES, MOTION } from '../styles'

interface Props {
  text: string
}

// Deterministic pseudo-random for particles/rays (seeded by index)
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

export const BenefitScene: React.FC<Props> = ({ text }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const lines = text.split('. ').map((l, i, arr) => i < arr.length - 1 ? l + '.' : l)

  // === LAYER 1: BACKGROUND EXPLOSION ===
  // Glow starts at frame 5 (synced with first text line entry)
  const explosionRadius = interpolate(frame, [5, 20], [0, 800], { extrapolateRight: 'clamp' })
  const explosionOpacity = interpolate(frame, [5, 13, 60, 130], [0, 0.7, 0.5, 0.3], { extrapolateRight: 'clamp' })

  // Continuous zoom on entire scene
  const sceneScale = interpolate(frame, [0, 150], [1.0, 1.06], { extrapolateRight: 'clamp' })

  // === LAYER 2: LIGHT STREAKS (4-5 diagonal rays behind text) ===
  const rays = Array.from({ length: 5 }, (_, i) => {
    const angle = 25 + i * 15 // 25, 40, 55, 70, 85 degrees
    const drift = interpolate(frame, [0, 150], [0, 60 + i * 20])
    const rayOpacity = interpolate(frame, [5, 20, 120, 145], [0, 0.08, 0.06, 0], { extrapolateRight: 'clamp' })
    return { angle, drift, opacity: rayOpacity, index: i }
  })

  // === LAYER 3: PARTICLE BURST (20 particles explode outward) ===
  const particles = Array.from({ length: 20 }, (_, i) => {
    const angle = seeded(i) * Math.PI * 2
    const speed = 200 + seeded(i + 50) * 400
    const size = 2 + seeded(i + 100) * 4
    const delay = Math.floor(seeded(i + 150) * 8)
    const burstFrame = Math.max(0, frame - 5 - delay)
    const progress = interpolate(burstFrame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
    const x = Math.cos(angle) * speed * progress
    const y = Math.sin(angle) * speed * progress
    const opacity = interpolate(burstFrame, [0, 5, 25, 30], [0, 0.8, 0.3, 0], { extrapolateRight: 'clamp' })
    return { x, y, size, opacity, index: i }
  })

  // === LAYER 4: TEXT WITH IMPACT SLAM ===
  // Each line scales from 2.0 to 1.0 with heavy spring (overshoot)
  const lineElements = lines.map((line, i) => {
    const delay = 5 + i * 12
    const slamSpring = spring({
      frame: Math.max(0, frame - delay),
      fps,
      config: { damping: 12, stiffness: 180, mass: 1.2 }, // heavy overshoot
    })
    const lineScale = interpolate(slamSpring, [0, 1], [2.0, 1.0])
    const lineOpacity = interpolate(frame, [delay, delay + 4], [0, 1], { extrapolateRight: 'clamp' })

    // Motion blur: vertical blur that clears over first 6 frames of appearance
    const blurFrames = Math.max(0, frame - delay)
    const motionBlur = interpolate(blurFrames, [0, 6], [4, 0], { extrapolateRight: 'clamp' })

    // Progressive size: last line is biggest
    const isLast = i === lines.length - 1
    const isMid = i === 1 && lines.length > 2
    const fontSize = isLast ? SIZES.hero : isMid ? SIZES.title + 4 : SIZES.title
    const color = isLast ? COLORS.accent : COLORS.text
    const textShadow = isLast
      ? `0 0 40px ${COLORS.accentGlow}, 0 0 80px ${COLORS.accentGlowSoft}, 0 0 4px rgba(255,255,255,0.3)`
      : `0 0 20px rgba(255,255,255,0.08)`

    return { line, lineScale, lineOpacity, fontSize, color, textShadow, delay, isLast, index: i, motionBlur }
  })

  // === LAYER 5: MICRO-SHAKE on last line appear ===
  const lastLineDelay = 5 + (lines.length - 1) * 12
  const shakeActive = frame >= lastLineDelay && frame < lastLineDelay + 4
  const shakeX = shakeActive ? (seeded(frame * 3) - 0.5) * 6 : 0
  const shakeY = shakeActive ? (seeded(frame * 7) - 0.5) * 6 : 0

  // === ENERGY BAR (underline) ===
  const barDelay = lastLineDelay + 5
  const barSpring = spring({
    frame: Math.max(0, frame - barDelay),
    fps,
    config: { damping: 14, stiffness: 300, mass: 0.6 },
  })
  const barWidth = interpolate(barSpring, [0, 1], [0, 400])
  const barGlow = interpolate(frame, [barDelay, barDelay + 6, barDelay + 20], [0, 1, 0.5], { extrapolateRight: 'clamp' })

  // === MICRO-FLASH: brightness bump on glow at each text line impact ===
  const microFlashOpacity = lineElements.reduce((acc, { delay }) => {
    const impactFrame = frame - delay
    if (impactFrame >= 0 && impactFrame < 3) {
      return acc + 0.1
    }
    return acc
  }, 0)

  // === PARTICLE TRAIL for energy bar ===
  const trailParticles = Array.from({ length: 6 }, (_, i) => {
    const trailFrame = Math.max(0, frame - barDelay - i * 2)
    const trailProgress = interpolate(trailFrame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
    const trailX = interpolate(trailProgress, [0, 1], [-200, 200])
    // Particles disperse upward and fade
    const disperseFrame = Math.max(0, trailFrame - 3)
    const disperseY = interpolate(disperseFrame, [0, 12], [0, -20 - seeded(i + 200) * 30], { extrapolateRight: 'clamp' })
    const trailOpacity = interpolate(disperseFrame, [0, 4, 12], [0.8, 0.5, 0], { extrapolateRight: 'clamp' })
    const size = 2 + seeded(i + 300) * 2
    return { x: trailX, y: disperseY, opacity: trailOpacity * (trailProgress > 0 ? 1 : 0), size, index: i }
  })

  // === EXIT: scale UP while fading (into CTA) ===
  const exitOpacity = interpolate(frame, [130, 150], [1, 0], { extrapolateRight: 'clamp' })
  const exitScale = interpolate(frame, [130, 150], [1.0, 1.3], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: COLORS.bg,
      overflow: 'hidden',
      opacity: exitOpacity,
    }}>
      {/* Continuous zoom wrapper + shake */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${sceneScale * exitScale}) translate(${shakeX}px, ${shakeY}px)`,
      }}>

        {/* LAYER 1: Background explosion glow */}
        <div style={{
          position: 'absolute',
          width: explosionRadius,
          height: explosionRadius,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, rgba(239, 68, 68, 0.15) 40%, transparent 70%)`,
          opacity: Math.min(1, explosionOpacity + microFlashOpacity),
          filter: 'blur(20px)',
        }} />

        {/* Secondary ambient glow */}
        <div style={{
          position: 'absolute',
          width: 1200,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${COLORS.accentGlowSoft} 0%, transparent 60%)`,
          opacity: explosionOpacity * 0.4,
        }} />

        {/* LAYER 2: Light streaks */}
        {rays.map(({ angle, drift, opacity, index }) => (
          <div key={`ray-${index}`} style={{
            position: 'absolute',
            width: 2000,
            height: 3,
            background: `linear-gradient(90deg, transparent 0%, rgba(239, 68, 68, 0.15) 30%, rgba(255, 255, 255, 0.1) 50%, rgba(239, 68, 68, 0.15) 70%, transparent 100%)`,
            transform: `rotate(${angle}deg) translateX(${drift}px)`,
            opacity,
            filter: 'blur(1px)',
          }} />
        ))}

        {/* LAYER 3: Particle burst */}
        {particles.map(({ x, y, size, opacity, index }) => (
          <div key={`particle-${index}`} style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: index % 3 === 0 ? COLORS.accent : 'rgba(255,255,255,0.8)',
            transform: `translate(${x}px, ${y}px)`,
            opacity,
            boxShadow: index % 3 === 0 ? `0 0 8px ${COLORS.accentGlow}` : `0 0 4px rgba(255,255,255,0.3)`,
          }} />
        ))}

        {/* LAYER 4: Text lines */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          padding: '0 100px',
          zIndex: 10,
        }}>
          {lineElements.map(({ line, lineScale, lineOpacity, fontSize, color, textShadow, isLast, index, motionBlur }) => (
            <div key={index} style={{
              transform: `scale(${lineScale})`,
              opacity: lineOpacity,
              filter: motionBlur > 0 ? `blur(${motionBlur}px)` : undefined,
            }}>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize,
                fontWeight: 'bold',
                color,
                textShadow,
                letterSpacing: isLast ? 2 : 0,
                textTransform: isLast ? 'uppercase' as const : undefined,
              }}>
                {line}
              </span>
            </div>
          ))}

          {/* LAYER 5: Energy bar underline */}
          <div style={{ position: 'relative', marginTop: 12 }}>
            <div style={{
              width: barWidth,
              height: 4,
              borderRadius: 2,
              background: `linear-gradient(90deg, transparent, ${COLORS.accent}, ${COLORS.accent}, transparent)`,
              boxShadow: `0 0 ${15 + barGlow * 25}px ${COLORS.accentGlow}, 0 0 ${5 + barGlow * 10}px ${COLORS.accent}`,
              opacity: interpolate(frame, [barDelay, barDelay + 3], [0, 1], { extrapolateRight: 'clamp' }),
            }} />
            {/* Particle trail behind the bar's growing edge */}
            {trailParticles.map(({ x, y, opacity, size, index }) => (
              <div key={`trail-${index}`} style={{
                position: 'absolute',
                left: `calc(50% + ${x}px)`,
                top: y,
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: COLORS.accent,
                boxShadow: `0 0 4px ${COLORS.accentGlow}`,
                opacity,
              }} />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
