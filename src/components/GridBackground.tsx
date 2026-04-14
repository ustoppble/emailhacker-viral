import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import { COLORS, VIDEO } from '../styles'

const GRID_SIZE = 60
const COLS = Math.ceil(VIDEO.width / GRID_SIZE) + 2
const ROWS = Math.ceil(VIDEO.height / GRID_SIZE) + 2

// Center of the frame for distance calculations
const CX = VIDEO.width / 2
const CY = VIDEO.height / 2
// Max distance from center to corner (normalization factor)
const MAX_DIST = Math.sqrt(CX * CX + CY * CY)

// Deterministic film grain — 800 tiny circles with unique seeds
const GRAIN_DOTS = Array.from({ length: 800 }).map((_, i) => ({
  x: (i * 7919 + 31) % VIDEO.width,
  y: (i * 6271 + 17) % VIDEO.height,
  r: 0.5 + (i % 3) * 0.5, // radius 0.5 - 1.5px
  seed: (i * 3.17) % (Math.PI * 2),
  seed2: (i * 1.43) % (Math.PI * 2),
}))

// Scanline counts
const V_SCAN_COUNT = 6
const H_SCAN_COUNT = 4

// Pre-compute grid line opacity based on distance from center (vignette)
function gridLineOpacity(x: number, y: number): number {
  const dx = (x - CX) / CX
  const dy = (y - CY) / CY
  const dist = Math.sqrt(dx * dx + dy * dy) // 0 at center, ~1.41 at corners
  const falloff = 1 - Math.min(dist / 1.2, 1) // fade to 0 at ~1.2 normalized distance
  return 0.06 * falloff * falloff // quadratic falloff for smooth vignette
}

export const GridBackground: React.FC = () => {
  const frame = useCurrentFrame()

  // Grid vertical drift (parallax: grid moves slowly like a floor receding)
  const offsetY = (frame * 0.4) % GRID_SIZE

  // Slow zoom: 1.0 -> 1.03 over 900 frames, then hold
  const zoom = interpolate(frame, [0, 900], [1.0, 1.03], {
    extrapolateRight: 'clamp',
  })

  // Subtle horizontal camera drift (parallax)
  const cameraDriftX = Math.sin(frame * 0.008) * 12
  const cameraDriftY = Math.cos(frame * 0.006) * 6

  // Pulsing center glow opacity (sin wave, period ~4s)
  const glowOpacity = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.04, 0.12],
  )

  // Bottom glow subtle pulse (offset phase)
  const bottomGlowOpacity = interpolate(
    Math.sin(frame * 0.03 + 1.2),
    [-1, 1],
    [0.03, 0.06],
  )

  // Scanline sweep cycles
  const vScanCycle = 90  // vertical sweep every 3s
  const hScanCycle = 120 // horizontal sweep every 4s

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: 'hidden' }}>
      {/* Grid with strong 3D perspective — infinite floor plane */}
      <div
        style={{
          position: 'absolute',
          width: VIDEO.width,
          height: VIDEO.height,
          transform: `translate(${cameraDriftX}px, ${cameraDriftY}px) scale(${zoom})`,
          transformOrigin: 'center center',
          perspective: '800px',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(12deg)',
            transformOrigin: 'center 60%',
          }}
        >
          <svg
            width={VIDEO.width}
            height={VIDEO.height}
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Horizontal lines with vignette fade */}
            {Array.from({ length: ROWS }).map((_, i) => {
              const y = i * GRID_SIZE + offsetY - GRID_SIZE
              const opacity = gridLineOpacity(CX, y)
              if (opacity < 0.002) return null
              return (
                <line
                  key={`h${i}`}
                  x1={0}
                  y1={y}
                  x2={VIDEO.width}
                  y2={y}
                  stroke={`rgba(255, 255, 255, ${opacity})`}
                  strokeWidth={1}
                />
              )
            })}
            {/* Vertical lines with vignette fade */}
            {Array.from({ length: COLS }).map((_, i) => {
              const x = i * GRID_SIZE
              const opacity = gridLineOpacity(x, CY)
              if (opacity < 0.002) return null
              return (
                <line
                  key={`v${i}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={VIDEO.height}
                  stroke={`rgba(255, 255, 255, ${opacity})`}
                  strokeWidth={1}
                />
              )
            })}
          </svg>
        </div>
      </div>

      {/* CENTER glow — pulsing radial */}
      <div
        style={{
          position: 'absolute',
          top: VIDEO.height / 2 - 500,
          left: VIDEO.width / 2 - 500,
          width: 1000,
          height: 1000,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent} 0%, transparent 70%)`,
          opacity: glowOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* BOTTOM glow — warm red, prevents dead black at bottom */}
      <div
        style={{
          position: 'absolute',
          top: 900 - 600,
          left: VIDEO.width / 2 - 600,
          width: 1200,
          height: 1200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 60%)',
          opacity: bottomGlowOpacity / 0.05, // normalize so peak = 1.0 * 0.05 effective
          pointerEvents: 'none',
        }}
      />

      {/* TOP-RIGHT glow — cool subtle fill, prevents dead corner */}
      <div
        style={{
          position: 'absolute',
          top: 200 - 400,
          left: 1400 - 400,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.03) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
      />

      {/* Vertical scanlines — CRT sweep top to bottom (slightly more visible) */}
      {Array.from({ length: V_SCAN_COUNT }).map((_, i) => {
        const stagger = (i / V_SCAN_COUNT) * vScanCycle
        const localFrame = (frame + stagger) % vScanCycle
        const yPos = interpolate(localFrame, [0, vScanCycle], [-4, VIDEO.height + 4])
        return (
          <div
            key={`vscan${i}`}
            style={{
              position: 'absolute',
              top: yPos,
              left: 0,
              width: VIDEO.width,
              height: 2,
              background: 'rgba(255, 255, 255, 0.04)',
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* Horizontal scanlines — sweep left to right (cross-hatch) */}
      {Array.from({ length: H_SCAN_COUNT }).map((_, i) => {
        const stagger = (i / H_SCAN_COUNT) * hScanCycle
        const localFrame = (frame + stagger) % hScanCycle
        const xPos = interpolate(localFrame, [0, hScanCycle], [-4, VIDEO.width + 4])
        return (
          <div
            key={`hscan${i}`}
            style={{
              position: 'absolute',
              top: 0,
              left: xPos,
              width: 2,
              height: VIDEO.height,
              background: 'rgba(255, 255, 255, 0.025)',
              pointerEvents: 'none',
            }}
          />
        )
      })}

      {/* Film grain — 800 flickering circles with organic texture */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      >
        {GRAIN_DOTS.map((dot, i) => {
          // Two independent flicker sources for organic randomness
          const flicker1 = Math.sin(frame * 0.47 + dot.seed)
          const flicker2 = Math.cos(frame * 0.31 + dot.seed2)
          const combined = (flicker1 + flicker2) / 2
          const opacity = interpolate(combined, [-1, 1], [0.02, 0.12])
          // Subtle positional jitter each frame
          const dx = Math.sin(frame * 0.11 + dot.seed) * 1.5
          const dy = Math.cos(frame * 0.14 + dot.seed2) * 1.5
          return (
            <circle
              key={`g${i}`}
              cx={dot.x + dx}
              cy={dot.y + dy}
              r={dot.r}
              fill="white"
              opacity={opacity}
            />
          )
        })}
      </svg>
    </AbsoluteFill>
  )
}
