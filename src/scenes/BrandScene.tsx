import React from 'react'
import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, FONTS, SIZES, MOTION, VIDEO } from '../styles'

// --- INSECT LOGO (extracted from emailhacker-icon.svg) ---

const InsectLogo: React.FC<{ width?: number; height?: number; glowIntensity?: number }> = ({
  width = 120,
  height = 120,
  glowIntensity = 0.6,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 566 566"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter: `drop-shadow(0 0 ${12 * glowIntensity}px ${COLORS.accentGlow}) drop-shadow(0 0 ${24 * glowIntensity}px ${COLORS.accentGlowSoft})`,
    }}
  >
    <g fill={COLORS.accent}>
      <rect x="295.78" y="497.14" width="28.15" height="68.19" />
      <rect x="227.49" y="497.14" width="28.15" height="68.19" />
      <rect x="364.07" y="0" width="28.15" height="68.19" />
      <rect x="227.49" y="0" width="28.15" height="68.19" />
      <path d="M471.35,166.15v-56.81c0-8.31-6.76-15.08-15.08-15.08h-132.35V0h-28.15v94.27h-108.43V0h-28.15v94.27h-49.55c-8.31,0-15.08,6.76-15.08,15.08v56.81H0v28.15h94.56v108.43H0v28.15h94.56v40.14H0v28.15h94.56v56.8c0,8.31,6.76,15.08,15.08,15.08h49.55v94.27h28.15v-94.27h176.72v94.27h28.15v-94.27h64.05c8.31,0,15.08-6.76,15.08-15.08v-125.1h94.56v-28.15h-94.56v-108.43h94.56v-28.15h-94.56ZM130.37,112.3c10.45,0,18.92,8.47,18.92,18.92s-8.47,18.92-18.92,18.92-18.92-8.47-18.92-18.92,8.47-18.92,18.92-18.92ZM340.4,341.41c-3.27-1.83-7.85-8.19-9.62-8.33-2.53-.19-14.96,10.17-19.72,12.17-58.13,24.46-117.03-33.7-91.49-91.25,24.08-54.27,104.64-53.84,127.15.23,6.27,15.05,3.08,50.53,11.74,57.58,14.91,12.13,29.18-2.72,29.22-19.7.34-149.3-201.84-144.48-208.73-16.26-2.96,55.13,44.24,109.83,100.83,109.83,0,0,51.76.42,65.97-21.53,15.99,6.87,24.03,7.4,37.32,6.57-27.88,47.93-82.54,51.56-122.55,46.28-100.32-13.24-151.36-133.34-89.39-215.93,82.1-109.42,249.99-50.48,251.27,86.4.46,48.38-36.51,79.34-82.01,53.94Z" />
      <rect x="497.72" y="234.44" width="68.19" height="28.15" />
      <rect x="497.72" y="371.03" width="68.19" height="28.19" />
      <rect x="0" y="234.44" width="68.19" height="28.15" />
      <path d="M282.65,246.26c-19.77,0-35.8,15.99-35.8,35.7s16.03,35.7,35.8,35.7,35.8-15.98,35.8-35.7-16.03-35.7-35.8-35.7Z" />
    </g>
  </svg>
)

// Deterministic seed helper
const seed = (i: number, salt: number) => ((i * 7919 + salt * 6271 + 1) % 10000) / 10000

// --- PRE-COMPUTED DATA (outside render) ---

// 8 geometric shapes scattered across screen
interface GeoShape {
  x: number
  y: number
  size: number
  rotSpeed: number
  enterDelay: number
  type: 'square' | 'circle' | 'triangle' | 'hexagon' | 'diamond'
  opacity: number
}

const GEO_SHAPES: GeoShape[] = [
  { x: 0.08, y: 0.12, size: 120, rotSpeed: 0.7, enterDelay: 0, type: 'hexagon', opacity: 0.12 },
  { x: 0.88, y: 0.18, size: 90, rotSpeed: -0.5, enterDelay: 2, type: 'square', opacity: 0.18 },
  { x: 0.15, y: 0.75, size: 60, rotSpeed: 1.0, enterDelay: 3, type: 'triangle', opacity: 0.15 },
  { x: 0.82, y: 0.72, size: 100, rotSpeed: -0.3, enterDelay: 1, type: 'circle', opacity: 0.20 },
  { x: 0.05, y: 0.45, size: 45, rotSpeed: 0.9, enterDelay: 4, type: 'diamond', opacity: 0.10 },
  { x: 0.92, y: 0.48, size: 70, rotSpeed: -0.8, enterDelay: 2, type: 'square', opacity: 0.14 },
  { x: 0.35, y: 0.08, size: 55, rotSpeed: 0.6, enterDelay: 5, type: 'circle', opacity: 0.12 },
  { x: 0.65, y: 0.88, size: 150, rotSpeed: -0.2, enterDelay: 1, type: 'hexagon', opacity: 0.08 },
]

// Terminal lines for background texture
const TERMINAL_LINES = [
  '> connecting activecampaign...',
  '> syncing hotmart webhooks...',
  '> pulse engine active',
  '> initializing email ai...',
  '> brand dna loaded',
  '> attribution tracking online',
  '> segment builder ready',
  '> automations deployed',
  '> credits: 1,247',
  '> revenue: R$ 47.832,00',
  '> open rate: 42.7%',
  '> click rate: 8.3%',
]

// Light ray definitions
interface LightRay {
  angle: number
  width: number
  offset: number
  speed: number
}

const LIGHT_RAYS: LightRay[] = [
  { angle: -25, width: 180, offset: -200, speed: 0.8 },
  { angle: 15, width: 120, offset: 100, speed: 1.2 },
  { angle: -45, width: 90, offset: 300, speed: 0.5 },
]

// Letters of "EMAILHACKER" for staggered reveal
const LOGO_LETTERS = 'EMAILHACKER'.split('')

// --- SVG SHAPE RENDERERS ---

const renderShapeSvg = (type: GeoShape['type'], size: number) => {
  const s = size
  const half = s / 2
  const stroke = COLORS.accent
  const sw = 1.5

  switch (type) {
    case 'square':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x={sw} y={sw} width={s - sw * 2} height={s - sw * 2} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
    case 'circle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - sw} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},${sw} ${s - sw},${s - sw} ${sw},${s - sw}`} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
    case 'hexagon': {
      const r = half - sw
      const pts = Array.from({ length: 6 }).map((_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 2
        return `${half + r * Math.cos(a)},${half + r * Math.sin(a)}`
      }).join(' ')
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={pts} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
    }
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},${sw} ${s - sw},${half} ${half},${s - sw} ${sw},${half}`} fill="none" stroke={stroke} strokeWidth={sw} />
        </svg>
      )
  }
}

// --- MAIN COMPONENT ---

export const BrandScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Continuous zoom across entire scene (parallax base)
  const sceneZoom = interpolate(frame, [0, 90], [0.98, 1.02], { extrapolateRight: 'clamp' })

  // --- PHASE 1: Shapes converge AGGRESSIVELY toward center (0-25 frames) ---
  const convergeProgress = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: 'clamp' })

  // --- PHASE 2: Logo build-up sequence ---
  // Step 1: Terminal dots appear FIRST (fast burst, frames 12-18)
  const dotsDelay = 12
  const dots = [0, 1, 2].map(i => {
    const d = dotsDelay + i * 2 // 2-frame stagger = fast burst
    const s = spring({ frame: Math.max(0, frame - d), fps, config: MOTION.snappy })
    return interpolate(s, [0, 1], [0, 1])
  })

  // Step 1.5: Insect logo appears — scales 0 -> 1.2 -> 1.0 with overshoot + rotation (starts frame 15)
  const insectDelay = 15
  const insectSpring = spring({
    frame: Math.max(0, frame - insectDelay),
    fps,
    config: { damping: 8, stiffness: 180, mass: 0.6 }, // overshoot spring
  })
  const insectScale = interpolate(insectSpring, [0, 1], [0, 1.0])
  const insectRotation = interpolate(
    spring({ frame: Math.max(0, frame - insectDelay), fps, config: MOTION.smooth }),
    [0, 1],
    [-10, 0],
  )
  const insectOpacity = interpolate(frame, [insectDelay, insectDelay + 4], [0, 1], { extrapolateRight: 'clamp' })

  // Step 2: "EMAILHACKER" letters reveal — each scales from 0 with 2-frame stagger (starts frame 20)
  const lettersDelay = 20
  const letterScales = LOGO_LETTERS.map((_, i) => {
    const d = lettersDelay + i * 2
    const s = spring({ frame: Math.max(0, frame - d), fps, config: MOTION.snappy })
    return interpolate(s, [0, 1], [0, 1])
  })

  // Step 3: ".ai" SLAMS in with impact spring (scale 2->1 with big overshoot)
  // Starts after all letters have begun (lettersDelay + LOGO_LETTERS.length * 2 = 20 + 22 = 42)
  const aiDelay = lettersDelay + LOGO_LETTERS.length * 2
  const aiSpring = spring({ frame: Math.max(0, frame - aiDelay), fps, config: MOTION.impact })
  const aiScale = interpolate(aiSpring, [0, 1], [2.0, 1.0])
  const aiOpacity = interpolate(frame, [aiDelay, aiDelay + 4], [0, 1], { extrapolateRight: 'clamp' })

  // --- ASSEMBLY FLASH at frame ~40: white overlay 0 -> 0.15 -> 0 in 6 frames ---
  const flashFrame = 40
  const flashOpacity = interpolate(frame, [flashFrame, flashFrame + 2, flashFrame + 6], [0, 0.15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // --- Logo group opacity (fades in with dots) ---
  const logoGroupOpacity = interpolate(frame, [dotsDelay, dotsDelay + 6], [0, 1], { extrapolateRight: 'clamp' })

  // --- Glow pulse (heartbeat feel) ---
  const glowPulse = 0.3 + Math.sin(frame * 0.12) * 0.15 + Math.sin(frame * 0.25) * 0.05

  // --- Terminal text scroll (background texture) ---
  const terminalScroll = frame * 1.8 // px per frame scroll speed

  // --- EXIT: zoom-in dive + fade (frames 72-90) ---
  const exitProgress = interpolate(frame, [72, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const exitScale = interpolate(exitProgress, [0, 1], [1, 1.5])
  const exitOpacity = interpolate(exitProgress, [0, 0.6, 1], [1, 0.8, 0])

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      opacity: exitOpacity,
      transform: `scale(${sceneZoom * exitScale})`,
      overflow: 'hidden',
    }}>

      {/* LAYER 1: Terminal ASCII background — very faint scrolling text */}
      <div style={{
        position: 'absolute',
        width: VIDEO.width,
        height: VIDEO.height,
        overflow: 'hidden',
        opacity: 0.06,
        transform: `scale(${1 + convergeProgress * 0.02})`, // parallax 0.3x
      }}>
        {/* Left column */}
        <div style={{
          position: 'absolute',
          left: 80,
          top: -terminalScroll % 600,
          fontFamily: FONTS.mono,
          fontSize: 13,
          color: COLORS.accent,
          lineHeight: '22px',
          whiteSpace: 'pre',
          letterSpacing: 1,
        }}>
          {TERMINAL_LINES.concat(TERMINAL_LINES).map((line, i) => (
            <div key={`tl${i}`}>{line}</div>
          ))}
        </div>
        {/* Right column */}
        <div style={{
          position: 'absolute',
          right: 80,
          top: -(terminalScroll * 0.7) % 600,
          fontFamily: FONTS.mono,
          fontSize: 13,
          color: COLORS.text,
          lineHeight: '22px',
          whiteSpace: 'pre',
          letterSpacing: 1,
          textAlign: 'right',
        }}>
          {[...TERMINAL_LINES].reverse().concat([...TERMINAL_LINES].reverse()).map((line, i) => (
            <div key={`tr${i}`}>{line}</div>
          ))}
        </div>
      </div>

      {/* LAYER 2: Light rays from behind logo */}
      {LIGHT_RAYS.map((ray, i) => {
        const logoDelay = 25
        const rayWidth = interpolate(frame, [logoDelay, logoDelay + 30], [0, ray.width], { extrapolateRight: 'clamp' })
        const rayOpacity = interpolate(frame, [logoDelay, logoDelay + 15, 70, 85], [0, 0.05, 0.05, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        })
        // Subtle breathing
        const breathe = 1 + Math.sin(frame * ray.speed * 0.05 + i) * 0.15
        return (
          <div key={`ray${i}`} style={{
            position: 'absolute',
            width: rayWidth * breathe,
            height: VIDEO.height * 1.5,
            background: `linear-gradient(180deg, transparent 0%, ${COLORS.accentGlow} 40%, ${COLORS.accentGlow} 60%, transparent 100%)`,
            opacity: rayOpacity,
            transform: `rotate(${ray.angle}deg) translateX(${ray.offset}px)`,
            transformOrigin: 'center center',
            filter: 'blur(20px)',
          }} />
        )
      })}

      {/* LAYER 3: Geometric shapes — converge AGGRESSIVELY then scatter */}
      {GEO_SHAPES.map((shape, i) => {
        // Each shape starts at its position, converges toward center, then holds
        const shapeEnterSpring = spring({
          frame: Math.max(0, frame - shape.enterDelay),
          fps,
          config: MOTION.heavy,
        })
        const shapeScale = interpolate(shapeEnterSpring, [0, 1], [0, 1])

        // Converge: shape moves toward center — MORE AGGRESSIVELY (0.8 factor)
        const targetX = VIDEO.width * shape.x
        const targetY = VIDEO.height * shape.y
        const centerX = VIDEO.width / 2
        const centerY = VIDEO.height / 2

        // Before logo: converge aggressively toward center (0.8 factor). After: drift back outward
        const convergeX = interpolate(convergeProgress, [0, 1], [targetX, targetX + (centerX - targetX) * 0.8])
        const convergeY = interpolate(convergeProgress, [0, 1], [targetY, targetY + (centerY - targetY) * 0.8])

        // After logo explosion, shapes push back outward
        const logoDelay = 25
        const pushBack = interpolate(frame, [logoDelay, logoDelay + 15], [0, 1], { extrapolateRight: 'clamp' })
        const finalX = interpolate(pushBack, [0, 1], [convergeX, targetX + (targetX - centerX) * 0.15])
        const finalY = interpolate(pushBack, [0, 1], [convergeY, targetY + (targetY - centerY) * 0.15])

        const rotation = frame * shape.rotSpeed

        // Parallax: background shapes move slower
        const parallaxOffset = Math.sin(frame * 0.02 + i) * 8 * 0.3

        return (
          <div key={`shape${i}`} style={{
            position: 'absolute',
            left: finalX - shape.size / 2 + parallaxOffset,
            top: finalY - shape.size / 2 + parallaxOffset * 0.5,
            width: shape.size,
            height: shape.size,
            transform: `scale(${shapeScale}) rotate(${rotation}deg)`,
            opacity: shape.opacity,
            filter: shape.size > 100 ? 'blur(0.5px)' : undefined,
          }}>
            {renderShapeSvg(shape.type, shape.size)}
          </div>
        )
      })}

      {/* LAYER 4: Central glow — pulsing */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${COLORS.accentGlow} 0%, transparent 55%)`,
        opacity: glowPulse * logoGroupOpacity,
        filter: 'blur(10px)',
      }} />

      {/* LAYER 5: Logo BUILD-UP — dots first, then letters, then .ai slam */}
      <div style={{
        opacity: logoGroupOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        zIndex: 10,
      }}>
        {/* Terminal dots — burst entry FIRST */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          {dots.map((d, i) => (
            <div key={i} style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: i === 0 ? COLORS.accent : '#333',
              transform: `scale(${d})`,
              boxShadow: i === 0 ? `0 0 16px ${COLORS.accentGlow}` : 'none',
            }} />
          ))}
        </div>

        {/* Logo — insect + EMAILHACKER.AI on same line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}>
          {/* Insect icon */}
          <div style={{
            transform: `scale(${insectScale}) rotate(${insectRotation}deg)`,
            opacity: insectOpacity,
            display: 'flex',
            alignItems: 'center',
          }}>
            <InsectLogo
              width={70}
              height={70}
              glowIntensity={0.4 + glowPulse}
            />
          </div>

          {/* EMAILHACKER text */}
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 64,
            fontWeight: 'bold',
            color: COLORS.text,
            letterSpacing: 6,
            textShadow: `0 0 60px rgba(255,255,255,0.15), 0 0 120px ${COLORS.accentGlowSoft}`,
            display: 'flex',
            alignItems: 'center',
          }}>
            {LOGO_LETTERS.map((letter, i) => (
              <span key={i} style={{
                display: 'inline-block',
                transform: `scale(${letterScales[i]})`,
                opacity: letterScales[i],
              }}>
                {letter}
              </span>
            ))}
            {/* .ai inline */}
            <span style={{
              color: COLORS.accent,
              fontSize: 64,
              fontWeight: 'bold',
              letterSpacing: 4,
              transform: `scale(${aiScale})`,
              opacity: aiOpacity,
              textShadow: `0 0 30px ${COLORS.accentGlow}, 0 0 60px ${COLORS.accentGlowSoft}`,
              marginLeft: 2,
            }}>
              .AI
            </span>
          </div>
        </div>
      </div>

      {/* LAYER 6: Assembly FLASH — brief white overlay at frame ~40 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: '#ffffff',
        opacity: flashOpacity,
        pointerEvents: 'none',
        zIndex: 15,
      }} />

      {/* LAYER 7: Subtle ring burst from logo on explosion */}
      {(() => {
        const logoDelay = 25
        const ringFrame = Math.max(0, frame - logoDelay)
        const ringScale = interpolate(ringFrame, [0, 20], [0.3, 2.5], { extrapolateRight: 'clamp' })
        const ringOpacity = interpolate(ringFrame, [0, 5, 20], [0, 0.15, 0], { extrapolateRight: 'clamp' })
        return (
          <div style={{
            position: 'absolute',
            width: 400,
            height: 400,
            borderRadius: '50%',
            border: `2px solid ${COLORS.accent}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
            pointerEvents: 'none',
          }} />
        )
      })()}

      {/* Second ring, slightly delayed */}
      {(() => {
        const logoDelay = 25
        const ringFrame = Math.max(0, frame - logoDelay - 4)
        const ringScale = interpolate(ringFrame, [0, 25], [0.2, 2.0], { extrapolateRight: 'clamp' })
        const ringOpacity = interpolate(ringFrame, [0, 5, 25], [0, 0.10, 0], { extrapolateRight: 'clamp' })
        return (
          <div style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: `1px solid ${COLORS.accent}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
            pointerEvents: 'none',
          }} />
        )
      })()}
    </AbsoluteFill>
  )
}
