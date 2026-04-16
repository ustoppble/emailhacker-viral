import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const FPS = 30
const TOTAL = 105

const WORDS_LINE1 = ['Por', 'que', 'tanta?']
const WORDS_LINE2 = ['gente', 'escolhe']
const WORDS_LINE3 = ['Pedir', 'conosco?']

const BADGES = [
  { label: '1500+', color: '#4CAF50', bg: 'rgba(76, 175, 80, 0.15)' },
  { label: '4.5k', color: '#1976d2', bg: 'rgba(25, 118, 210, 0.15)' },
  { label: '99%', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' },
]

export const SocialProofScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // --- Background opacity for scene entry ---
  const sceneOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' })

  // --- Exit fade ---
  const exitOpacity = interpolate(frame, [TOTAL - 15, TOTAL], [1, 0], { extrapolateRight: 'clamp' })

  // --- Word-by-word text (each word ~3 frames apart, starts immediately) ---
  const allWords = [...WORDS_LINE1, ...WORDS_LINE2, ...WORDS_LINE3]
  const wordStartFrame = 0
  const wordStagger = 3

  const renderWord = (word: string, index: number, color: string, fontWeight: string | number = 400) => {
    const wordFrame = wordStartFrame + index * wordStagger
    const opacity = interpolate(frame, [wordFrame, wordFrame + 6], [0, 1], { extrapolateRight: 'clamp' })
    const y = interpolate(
      spring({ frame: Math.max(0, frame - wordFrame), fps, config: { damping: 12, stiffness: 260, mass: 0.5 } }),
      [0, 1],
      [12, 0],
    )
    return (
      <span
        key={`${word}-${index}`}
        style={{
          opacity,
          transform: `translateY(${y}px)`,
          display: 'inline-block',
          marginRight: 12,
          color,
          fontWeight: fontWeight as React.CSSProperties['fontWeight'],
        }}
      >
        {word}
      </span>
    )
  }

  // --- Phone mockup ---
  const phoneDelay = 5
  const phoneSpring = spring({
    frame: Math.max(0, frame - phoneDelay),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.7 },
  })
  const phoneX = interpolate(phoneSpring, [0, 1], [300, 0])
  const phoneOpacity = interpolate(frame, [phoneDelay, phoneDelay + 12], [0, 1], { extrapolateRight: 'clamp' })

  // --- Metric badges ---
  const badgeBaseDelay = 35

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #1a237e 0%, #1976d2 100%)',
        opacity: sceneOpacity * exitOpacity,
        fontFamily: FONT,
      }}
    >
      {/* Subtle radial highlight */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Left side: Text */}
      <div
        style={{
          position: 'absolute',
          left: 50,
          top: 320,
          width: 350,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {/* Line 1 */}
        <div style={{ fontSize: 42, lineHeight: 1.2 }}>
          {WORDS_LINE1.map((w, i) => renderWord(w, i, '#FFFFFF'))}
        </div>
        {/* Line 2 */}
        <div style={{ fontSize: 42, lineHeight: 1.2 }}>
          {WORDS_LINE2.map((w, i) => renderWord(w, WORDS_LINE1.length + i, '#FFFFFF'))}
        </div>
        {/* Line 3 — yellow bold */}
        <div style={{ fontSize: 46, lineHeight: 1.2 }}>
          {WORDS_LINE3.map((w, i) => renderWord(w, WORDS_LINE1.length + WORDS_LINE2.length + i, '#FFD700', 800))}
        </div>

        {/* Metric badges */}
        <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
          {BADGES.map((badge, i) => {
            const bDelay = badgeBaseDelay + i * 8
            const bSpring = spring({
              frame: Math.max(0, frame - bDelay),
              fps,
              config: { damping: 10, stiffness: 160, mass: 0.7 },
            })
            const bScale = interpolate(bSpring, [0, 1], [0, 1])
            const bOpacity = interpolate(frame, [bDelay, bDelay + 8], [0, 1], { extrapolateRight: 'clamp' })

            return (
              <div
                key={badge.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: badge.bg,
                  border: `1px solid ${badge.color}40`,
                  borderRadius: 16,
                  padding: '6px 12px',
                  opacity: bOpacity,
                  transform: `scale(${bScale})`,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: badge.color,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', letterSpacing: 0.3 }}>
                  {badge.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right side: iPhone mockup */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          top: 220,
          opacity: phoneOpacity,
          transform: `translateX(${phoneX}px)`,
        }}
      >
        {/* Phone frame */}
        <div
          style={{
            width: 280,
            height: 560,
            borderRadius: 36,
            backgroundColor: '#1a1a2e',
            border: '3px solid rgba(255,255,255,0.15)',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 120,
              height: 28,
              backgroundColor: '#1a1a2e',
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              zIndex: 10,
            }}
          />

          {/* Status bar dots */}
          <div
            style={{
              position: 'absolute',
              top: 8,
              right: 18,
              display: 'flex',
              gap: 4,
              zIndex: 11,
            }}
          >
            <div style={{ width: 14, height: 8, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }} />
          </div>

          {/* ML blue navigation bar */}
          <div
            style={{
              position: 'absolute',
              top: 28,
              left: 0,
              right: 0,
              height: 36,
              backgroundColor: '#3483FA',
              zIndex: 5,
            }}
          />

          {/* Screen content — e-commerce page */}
          <div
            style={{
              position: 'absolute',
              top: 64,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#FFE600',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '28px 20px 20px',
            }}
          >
            {/* Product image placeholder — headphone circle */}
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                backgroundColor: '#2c2c54',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              {/* Headphone icon — simplified SVG */}
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                <path
                  d="M12 38V30C12 20.06 20.06 12 30 12C39.94 12 48 20.06 48 30V38"
                  stroke="#FFD700"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <rect x="8" y="34" width="10" height="16" rx="4" fill="#FFD700" />
                <rect x="42" y="34" width="10" height="16" rx="4" fill="#FFD700" />
              </svg>
            </div>

            {/* Product title */}
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#2c2c54',
                textAlign: 'center',
                marginBottom: 8,
                fontFamily: FONT,
              }}
            >
              Fone Bluetooth Pro
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  style={{
                    width: 14,
                    height: 14,
                    backgroundColor: s <= 4 ? '#FF9800' : '#E0C068',
                    clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                  }}
                />
              ))}
            </div>

            {/* Price */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#1a237e',
                fontFamily: FONT,
                marginBottom: 16,
              }}
            >
              R$ 200,00
            </div>

            {/* Buy button */}
            <div
              style={{
                backgroundColor: '#39B54A',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 40px',
                borderRadius: 24,
                textAlign: 'center',
                fontFamily: FONT,
                letterSpacing: 0.5,
              }}
            >
              COMPRAR
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  color: '#4CAF50',
                  fontWeight: 600,
                  fontFamily: FONT,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#4CAF50" strokeWidth="1.5" />
                  <path d="M3.5 6L5.5 8L8.5 4.5" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Frete Gratis
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                  color: '#1976d2',
                  fontWeight: 600,
                  fontFamily: FONT,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1L7.5 4H10.5L8 6.5L9 10L6 7.5L3 10L4 6.5L1.5 4H4.5L6 1Z" fill="#1976d2" />
                </svg>
                MercadoLider
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
