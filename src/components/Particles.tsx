import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { COLORS, VIDEO } from '../styles'

type ParticleType = 'dot' | 'orb' | 'flare'

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  phase: number
  type: ParticleType
  color: string
  glowRadius: number
  opacity: number
  driftStrength: number
}

// Deterministic seeded random
const seed = (i: number, salt: number) => ((i * 7919 + salt * 6271 + 1) % 10000) / 10000

const PARTICLES: Particle[] = Array.from({ length: 80 }).map((_, i) => {
  const r = seed(i, 0)
  const type: ParticleType = r < 0.55 ? 'dot' : r < 0.85 ? 'orb' : 'flare'

  // Color distribution: 85% red, 10% white, 5% green
  const colorRoll = seed(i, 7)
  const color =
    colorRoll < 0.85
      ? COLORS.accent
      : colorRoll < 0.95
        ? COLORS.text
        : COLORS.success

  const colorOpacityBase =
    colorRoll < 0.85 ? 1.0 : colorRoll < 0.95 ? 0.10 : 0.05

  const size =
    type === 'dot' ? 2 : type === 'orb' ? 4 + seed(i, 1) * 2 : 8 + seed(i, 2) * 4

  const glowRadius =
    type === 'dot' ? size * 2 : type === 'orb' ? size * 4 : size * 8

  return {
    x: seed(i, 3) * VIDEO.width,
    y: seed(i, 4) * VIDEO.height,
    size,
    speed: type === 'flare' ? 0.05 + seed(i, 5) * 0.1 : 0.1 + seed(i, 5) * 0.5,
    phase: seed(i, 6) * Math.PI * 2,
    type,
    color,
    glowRadius,
    opacity: colorOpacityBase * (type === 'dot' ? 0.15 : type === 'orb' ? 0.2 : 0.35),
    driftStrength: 0.3 + seed(i, 8) * 0.7,
  }
})

// Center of the canvas for vortex drift
const CX = VIDEO.width / 2
const CY = VIDEO.height / 2

export const Particles: React.FC = () => {
  const frame = useCurrentFrame()

  // Compute all particle positions for this frame (needed for connecting lines)
  const positions = PARTICLES.map((p) => {
    // Base movement: vertical drift + horizontal oscillation
    const baseX = p.x + Math.sin(frame * 0.02 + p.phase) * 40
    const baseY = (p.y + frame * p.speed) % (VIDEO.height + 40) - 20

    // Vortex drift toward center
    const dx = CX - baseX
    const dy = CY - baseY
    const dist = Math.sqrt(dx * dx + dy * dy) || 1
    const pullX = (dx / dist) * p.driftStrength * 0.15
    const pullY = (dy / dist) * p.driftStrength * 0.15

    const x = baseX + pullX * Math.sin(frame * 0.008 + p.phase)
    const y = baseY + pullY * Math.sin(frame * 0.008 + p.phase * 0.7)

    // Opacity pulsing
    const pulse = Math.sin(frame * 0.03 + p.phase) * 0.4
    const opacity = Math.max(0.02, p.opacity + p.opacity * pulse)

    return { x, y, opacity }
  })

  // Find connecting lines (pairs within 150px)
  const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = []
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x
      const dy = positions[i].y - positions[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        // Fade line opacity based on distance
        const lineOpacity = interpolate(dist, [0, 150], [0.04, 0], {
          extrapolateRight: 'clamp',
        })
        lines.push({
          x1: positions[i].x,
          y1: positions[i].y,
          x2: positions[j].x,
          y2: positions[j].y,
          opacity: lineOpacity,
        })
      }
    }
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Constellation connecting lines */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {lines.map((line, i) => (
          <line
            key={`line${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={COLORS.accent}
            strokeWidth={0.5}
            opacity={line.opacity}
          />
        ))}
      </svg>

      {/* Particle dots/orbs/flares */}
      {PARTICLES.map((p, i) => {
        const pos = positions[i]

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: pos.x - p.size / 2,
              top: pos.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              backgroundColor: p.color,
              opacity: pos.opacity,
              boxShadow:
                p.type === 'dot'
                  ? `0 0 ${p.glowRadius}px ${p.color}`
                  : p.type === 'orb'
                    ? `0 0 ${p.glowRadius}px ${p.color}, 0 0 ${p.glowRadius * 0.5}px ${p.color}`
                    : `0 0 ${p.glowRadius}px ${p.color}, 0 0 ${p.glowRadius * 0.6}px ${p.color}, 0 0 ${p.glowRadius * 0.3}px white`,
              filter: p.type === 'orb' ? `blur(0.5px)` : p.type === 'flare' ? `blur(1px)` : undefined,
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}
