import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const TOTAL = 90

const COUNTRIES = [
  { flag: '\u{1F1E7}\u{1F1F7}', name: 'Brasil' },
  { flag: '\u{1F1E6}\u{1F1F7}', name: 'Argentina' },
]

export const MetricsScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // --- Scene entry: fade in from white in first 8 frames ---
  const sceneOpacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' })

  // --- Counter animation: 0 to 120 over 18 frames, starts at frame 0 ---
  const counterDuration = 18
  const counterStart = 0
  const counterValue = Math.round(
    interpolate(frame, [counterStart, counterStart + counterDuration], [0, 120], {
      extrapolateRight: 'clamp',
      extrapolateLeft: 'clamp',
    }),
  )

  // --- Counter scale spring ---
  const counterSpring = spring({
    frame: Math.max(0, frame - counterStart),
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.5 },
  })
  const counterScale = interpolate(counterSpring, [0, 1], [0.6, 1])
  const counterOpacity = interpolate(frame, [counterStart, counterStart + 8], [0, 1], { extrapolateRight: 'clamp' })

  // --- "M+" suffix appears right after counter finishes (~frame 20) ---
  const suffixDelay = 20
  const suffixOpacity = interpolate(frame, [suffixDelay, suffixDelay + 5], [0, 1], { extrapolateRight: 'clamp' })
  const suffixSpring = spring({
    frame: Math.max(0, frame - suffixDelay),
    fps,
    config: { damping: 8, stiffness: 200, mass: 0.6 },
  })
  const suffixScale = interpolate(suffixSpring, [0, 1], [0.5, 1])

  // --- Subtitle: "Compradores ja sabem disso." at ~frame 25 ---
  const subtitleDelay = 25
  const subtitleOpacity = interpolate(frame, [subtitleDelay, subtitleDelay + 6], [0, 1], { extrapolateRight: 'clamp' })
  const subtitleY = interpolate(
    spring({ frame: Math.max(0, frame - subtitleDelay), fps, config: { damping: 14, stiffness: 120, mass: 1.0 } }),
    [0, 1],
    [16, 0],
  )

  // --- Country badges at ~frame 30 ---
  const badgeDelay = 30

  // --- Glow pulse on the number ---
  const glowPulse = frame > suffixDelay ? 0.3 + Math.sin((frame - suffixDelay) * 0.1) * 0.15 : 0

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #1a237e 0%, #1976d2 100%)',
        opacity: sceneOpacity,
        fontFamily: FONT,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* White fade-in overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#FFFFFF',
          opacity: interpolate(frame, [0, 8], [1, 0], { extrapolateRight: 'clamp' }),
          pointerEvents: 'none',
        }}
      />

      {/* Radial light behind number */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.08) 0%, transparent 60%)',
          opacity: frame > 10 ? 1 : 0,
        }}
      />

      {/* Huge counter number */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          opacity: counterOpacity,
          transform: `scale(${counterScale})`,
          textShadow: `0 0 60px rgba(255, 215, 0, ${glowPulse})`,
        }}
      >
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#FFD700',
            lineHeight: 1,
            letterSpacing: -2,
          }}
        >
          {counterValue}
        </span>
        <span
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: '#FFD700',
            lineHeight: 1,
            opacity: suffixOpacity,
            display: 'inline-block',
          }}
        >
          M+
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          marginTop: 28,
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleY}px)`,
          fontSize: 32,
          fontWeight: 500,
          color: '#FFFFFF',
          letterSpacing: 1,
          textAlign: 'center',
        }}
      >
        Compradores ja sabem disso.
      </div>

      {/* Marketplace subtitle */}
      <div
        style={{
          marginTop: 14,
          opacity: subtitleOpacity,
          fontSize: 18,
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.6)',
          letterSpacing: 0.5,
          textAlign: 'center',
        }}
      >
        O maior marketplace da America Latina
      </div>

      {/* Country badges */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          marginTop: 36,
        }}
      >
        {COUNTRIES.map((country, i) => {
          const bDelay = badgeDelay + i * 4
          const bOpacity = interpolate(frame, [bDelay, bDelay + 10], [0, 1], { extrapolateRight: 'clamp' })
          const bSpring = spring({
            frame: Math.max(0, frame - bDelay),
            fps,
            config: { damping: 12, stiffness: 160, mass: 0.7 },
          })
          const bScale = interpolate(bSpring, [0, 1], [0.7, 1])

          return (
            <div
              key={country.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 24,
                padding: '10px 22px',
                opacity: bOpacity,
                transform: `scale(${bScale})`,
              }}
            >
              <span style={{ fontSize: 22 }}>{country.flag}</span>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                }}
              >
                {country.name}
              </span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
