import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const NAVY = '#1A1A6C'
const YELLOW = '#FFE600'
const GRAY = '#666666'

export const StatsScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // --- Word-by-word fade for left column ---
  const words = [
    { text: 'Voce sabia que', size: 28, weight: '400', color: GRAY, delay: 15 },
    { text: 'a cada', size: 40, weight: '500', color: NAVY, delay: 25 },
    { text: '1 segundo...', size: 72, weight: '800', color: NAVY, delay: 35 },
  ]

  const subtitleDelay = 38
  const subtitleOpacity = interpolate(frame, [subtitleDelay, subtitleDelay + 12], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const subtitleY = interpolate(
    spring({ frame: Math.max(0, frame - subtitleDelay), fps, config: { damping: 14, stiffness: 120, mass: 0.8 } }),
    [0, 1],
    [20, 0],
  )

  // --- Counter animation (right card) ---
  const counterDelay = 12
  const counterElapsed = Math.max(0, frame - counterDelay)
  const counterProgress = interpolate(counterElapsed, [0, 50], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const counterEased = 1 - Math.pow(1 - counterProgress, 3)
  const counterValue = Math.round(1247 * counterEased)
  const counterOpacity = interpolate(counterElapsed, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  // --- Subtitle counter (orders processed) ---
  const ordersCounterDelay = 25
  const ordersElapsed = Math.max(0, frame - ordersCounterDelay)
  const ordersProgress = interpolate(ordersElapsed, [0, 40], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const ordersEased = 1 - Math.pow(1 - ordersProgress, 3)
  const ordersValue = Math.round(1200 * ordersEased)

  // --- Card spring ---
  const cardSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 12, stiffness: 100, mass: 1 },
  })
  const cardScale = interpolate(cardSpring, [0, 1], [0.8, 1])
  const cardOpacity = interpolate(frame, [15, 25], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  // --- Yellow bar slide in ---
  const barWidth = interpolate(
    spring({ frame, fps, config: { damping: 18, stiffness: 80, mass: 1 } }),
    [0, 1],
    [0, 720],
  )

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Yellow top bar */}
      <div
        style={{
          width: barWidth,
          height: 40,
          backgroundColor: YELLOW,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* Main content: two columns side by side */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flex: 1,
          padding: '160px 48px',
          alignItems: 'center',
          gap: 48,
        }}
      >
        {/* Left column: text (~60%) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '0 0 60%' }}>
          {words.map((word, i) => {
            const wordOpacity = interpolate(frame, [word.delay, word.delay + 10], [0, 1], {
              extrapolateRight: 'clamp',
              extrapolateLeft: 'clamp',
            })
            const wordY = interpolate(
              spring({
                frame: Math.max(0, frame - word.delay),
                fps,
                config: { damping: 14, stiffness: 140, mass: 0.7 },
              }),
              [0, 1],
              [24, 0],
            )
            return (
              <div
                key={i}
                style={{
                  fontSize: word.size,
                  fontWeight: word.weight,
                  color: word.color,
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  lineHeight: 1.1,
                }}
              >
                {word.text}
              </div>
            )
          })}

          {/* Subtitle with counter */}
          <div
            style={{
              fontSize: 26,
              fontWeight: '400',
              color: GRAY,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              marginTop: 16,
              lineHeight: 1.4,
            }}
          >
            mais de{' '}
            <span style={{ fontWeight: '700', color: NAVY, fontSize: 30 }}>
              {ordersValue.toLocaleString('pt-BR')}
            </span>{' '}
            pedidos sao processados
            <br />
            no Mercado Livre
          </div>
        </div>

        {/* Right column: card with counter (~40%) */}
        <div
          style={{
            flex: '0 0 35%',
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
          }}
        >
          <div
            style={{
              backgroundColor: '#F8F8FC',
              borderRadius: 20,
              padding: '36px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 8px 32px rgba(26, 26, 108, 0.15)',
              border: '2px solid rgba(26, 26, 108, 0.06)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 6,
                backgroundColor: YELLOW,
                borderRadius: 3,
                marginBottom: 8,
              }}
            />
            <span
              style={{
                fontFamily: FONT,
                fontSize: 64,
                fontWeight: '800',
                color: NAVY,
                letterSpacing: -1,
                opacity: counterOpacity,
              }}
            >
              {counterValue.toLocaleString('pt-BR')}
            </span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 16,
                fontWeight: '500',
                color: GRAY,
                textTransform: 'uppercase',
                letterSpacing: 3,
              }}
            >
              pedidos/segundo
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
