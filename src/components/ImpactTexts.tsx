import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { COLORS, FONTS, SIZES, MOTION } from '../styles'

interface ImpactWord {
  text: string
  frame: number        // when it appears
  x: number            // % from left (0-100)
  y: number            // % from top (0-100)
  size: number         // font size
  duration: number     // frames visible
  color?: string
}

interface Props {
  words: ImpactWord[]
}

/**
 * Overlay of impact words that flash across the screen at key moments.
 * Each word: scale 3→1 SLAM + hold + fade out. Creates rhythm and reinforces narrative.
 */
export const ImpactTexts: React.FC<Props> = ({ words }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', zIndex: 6 }}>
      {words.map((w, i) => {
        const elapsed = frame - w.frame
        if (elapsed < 0 || elapsed > w.duration) return null

        // SLAM entry: scale 3→1 with heavy spring
        const slamSpring = spring({
          frame: elapsed,
          fps,
          config: { damping: 14, stiffness: 200, mass: 0.7 },
        })
        const scale = interpolate(slamSpring, [0, 1], [3, 1])

        // Opacity: instant on, fade out at end
        const opacity = interpolate(elapsed, [0, 3, w.duration - 8, w.duration], [0, 1, 1, 0], {
          extrapolateRight: 'clamp',
        })

        // Subtle drift during hold
        const driftY = interpolate(elapsed, [0, w.duration], [0, -8])

        const color = w.color || COLORS.accent

        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: `translate(-50%, -50%) scale(${scale}) translateY(${driftY}px)`,
            opacity,
            fontFamily: FONTS.mono,
            fontSize: w.size,
            fontWeight: 'bold',
            color,
            textTransform: 'uppercase',
            letterSpacing: 4,
            textShadow: `0 0 30px ${color}88, 0 0 60px ${color}44, 0 0 4px rgba(255,255,255,0.2)`,
            whiteSpace: 'nowrap',
          }}>
            {w.text}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

// Pre-defined impact words for Funnels video
export const FUNNELS_IMPACT_WORDS: ImpactWord[] = [
  // During Pain scene (frames 81-230 relative to video start, ~90 offset for brand)
  { text: 'DINHEIRO PERDIDO', frame: 120, x: 50, y: 75, size: 28, duration: 25, color: COLORS.accent },
  { text: 'SEM RETORNO', frame: 160, x: 30, y: 25, size: 22, duration: 20, color: '#ff6b6b' },

  // During Feature scene (frames ~230-400)
  { text: 'IA', frame: 280, x: 20, y: 50, size: 48, duration: 20, color: COLORS.accent },
  { text: '1 CLIQUE', frame: 320, x: 80, y: 40, size: 32, duration: 22 },
  { text: 'AUTOMÁTICO', frame: 370, x: 25, y: 70, size: 26, duration: 20 },

  // During Visual/Build scene (frames ~400-630)
  { text: 'CONSTRUINDO', frame: 440, x: 18, y: 30, size: 24, duration: 22, color: COLORS.textSecondary },
  { text: 'EMAIL 1 ✓', frame: 480, x: 82, y: 35, size: 20, duration: 18, color: COLORS.success },
  { text: 'EMAIL 2 ✓', frame: 520, x: 80, y: 45, size: 20, duration: 18, color: COLORS.success },
  { text: 'EMAIL 3 ✓', frame: 560, x: 78, y: 55, size: 20, duration: 18, color: COLORS.success },
  { text: '+30%', frame: 600, x: 50, y: 80, size: 56, duration: 25, color: COLORS.success },

  // During Benefit scene (frames ~630-770)
  { text: 'PRONTO', frame: 660, x: 75, y: 30, size: 36, duration: 20 },
  { text: '24/7', frame: 700, x: 25, y: 65, size: 52, duration: 22, color: COLORS.accent },

  // Pre-CTA flash
  { text: 'EMAILHACKER', frame: 760, x: 50, y: 50, size: 40, duration: 15, color: COLORS.text },
]
