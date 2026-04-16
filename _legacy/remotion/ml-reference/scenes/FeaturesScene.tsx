import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const TOTAL = 105

const FEATURES = [
  {
    title: 'Fácil',
    description: 'Compre em poucos cliques, sem complicação.',
    highlightColor: '#FFC107',
    icon: 'lock',
  },
  {
    title: 'Rápido',
    description: 'Entrega expressa no prazo ou antes.',
    highlightColor: '#4CAF50',
    icon: 'lightning',
  },
  {
    title: 'Seguro',
    description: 'Seu dinheiro protegido do início ao fim.',
    highlightColor: '#1976d2',
    icon: 'shield',
  },
]

const LockIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect x="8" y="16" width="20" height="14" rx="3" stroke="#283593" strokeWidth="2.5" />
    <path d="M12 16V12C12 8.69 14.69 6 18 6C21.31 6 24 8.69 24 12V16" stroke="#283593" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="18" cy="23" r="2" fill="#283593" />
  </svg>
)

const LightningIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M20 4L8 20H18L16 32L28 16H18L20 4Z" stroke="#283593" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
)

const ShieldIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <path d="M18 4L6 10V18C6 25.18 11.16 31.84 18 34C24.84 31.84 30 25.18 30 18V10L18 4Z" stroke="#283593" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M13 18L16.5 21.5L23 15" stroke="#283593" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const ICONS = [LockIcon, LightningIcon, ShieldIcon]

export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // --- Scene entry ---
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  // --- Title ---
  const titleDelay = 0
  const titleOpacity = interpolate(frame, [titleDelay, titleDelay + 8], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(
    spring({ frame: Math.max(0, frame - titleDelay), fps, config: { damping: 14, stiffness: 140, mass: 0.9 } }),
    [0, 1],
    [20, 0],
  )

  // --- Cards slide-up stagger ---
  const cardBaseDelay = 10
  const cardStagger = 6 // ~200ms at 30fps

  // --- Highlight border migration ---
  // f0-f40: card 0 | f40-f80: card 1 | f80-f120: card 2
  const getHighlightPhase = (cardIndex: number): number => {
    const phaseStart = cardIndex * 35
    const phaseEnd = phaseStart + 35
    if (frame < phaseStart || frame >= phaseEnd) return 0
    // Fade in first 8 frames, hold, fade out last 8 frames
    const fadeIn = interpolate(frame, [phaseStart, phaseStart + 8], [0, 1], { extrapolateRight: 'clamp' })
    const fadeOut = interpolate(frame, [phaseEnd - 8, phaseEnd], [1, 0], { extrapolateRight: 'clamp' })
    return fadeIn * fadeOut
  }

  // --- Exit: fade out only (no slide) ---
  const exitOpacity = interpolate(frame, [TOTAL - 15, TOTAL], [1, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        opacity: sceneOpacity * exitOpacity,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Subtle bg pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(25, 118, 210, 0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 193, 7, 0.04) 0%, transparent 50%)',
        }}
      />

      {/* Title */}
      <div
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          marginBottom: 60,
          zIndex: 2,
          paddingTop: 120,
        }}
      >
        <div style={{ fontSize: 44, lineHeight: 1.3, color: '#9E9E9E', fontWeight: 400 }}>
          Porque é{' '}
          <span style={{ color: '#1a237e', fontWeight: 800 }}>fácil, rápido</span>
          {' '}e{' '}
          <span style={{ color: '#1a237e', fontWeight: 800 }}>seguro</span>.
        </div>
      </div>

      {/* Feature cards row */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          zIndex: 2,
          justifyContent: 'center',
        }}
      >
        {FEATURES.map((feat, i) => {
          const cDelay = cardBaseDelay + i * cardStagger
          const cSpring = spring({
            frame: Math.max(0, frame - cDelay),
            fps,
            config: { damping: 12, stiffness: 150, mass: 0.8 },
          })
          const cY = interpolate(cSpring, [0, 1], [60, 0])
          const cOpacity = interpolate(frame, [cDelay, cDelay + 10], [0, 1], { extrapolateRight: 'clamp' })

          const highlightIntensity = getHighlightPhase(i)
          const borderColor = highlightIntensity > 0
            ? feat.highlightColor
            : 'rgba(0,0,0,0.08)'
          const borderWidth = interpolate(highlightIntensity, [0, 1], [1, 3])
          const shadowOpacity = interpolate(highlightIntensity, [0, 1], [0.05, 0.2])
          const cardScale = interpolate(highlightIntensity, [0, 1], [1, 1.03])

          const Icon = ICONS[i]

          return (
            <div
              key={feat.title}
              style={{
                width: 170,
                backgroundColor: '#FAFAFA',
                borderRadius: 20,
                padding: '32px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
                opacity: cOpacity,
                transform: `translateY(${cY}px) scale(${cardScale})`,
                border: `${borderWidth}px solid ${borderColor}`,
                boxShadow: `0 8px 30px rgba(0,0,0,${shadowOpacity})`,
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: `${feat.highlightColor}18`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon />
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#283593',
                  textAlign: 'center',
                }}
              >
                {feat.title}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: 13,
                  color: '#757575',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                {feat.description}
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
