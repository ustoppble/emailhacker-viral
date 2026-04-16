import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const YELLOW = '#FFE600'
const NAVY = '#1A1A6C'

const ORDER_LABELS = [
  'Fone Bluetooth', 'Capa iPhone 15', 'Tenis Nike Air', 'Cadeira Gamer',
  'Mouse Logitech', 'SSD 1TB NVMe', 'Smartwatch', 'Mochila Notebook',
  'Webcam HD', 'Carregador 65W', 'Hub USB-C', 'Teclado Mecanico',
  'Monitor 27"', 'Suporte Notebook', 'Mousepad XL', 'Echo Dot',
]

const COLS = 4
const ROWS = 4

export const OrderGridScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // --- Text scale-in ---
  const textSpring = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: { damping: 10, stiffness: 160, mass: 0.8 },
  })
  const textScale = interpolate(textSpring, [0, 1], [0.8, 1])
  const textOpacity = interpolate(frame, [4, 14], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  const cardWidth = 720 / COLS
  const cardHeight = 1280 / ROWS

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FAFAFA',
        fontFamily: FONT,
      }}
    >
      {/* Grid of yellow order cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          width: 720,
          height: 1280,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {ORDER_LABELS.map((label, i) => {
          const row = Math.floor(i / COLS)
          const col = i % COLS
          // Staggered pop-in: each card appears 1 frame after the previous
          const cardDelay = i * 1
          const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 3], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          })
          const cardSpring = spring({
            frame: Math.max(0, frame - cardDelay),
            fps,
            config: { damping: 14, stiffness: 200, mass: 0.5 },
          })
          const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1])

          // Alternate brightness for visual rhythm
          const isEven = (row + col) % 2 === 0
          const bgColor = isEven ? YELLOW : '#FFE833'

          return (
            <div
              key={i}
              style={{
                width: cardWidth,
                height: cardHeight,
                backgroundColor: bgColor,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                borderRight: col < COLS - 1 ? '1px solid rgba(26,26,108,0.06)' : 'none',
                borderBottom: row < ROWS - 1 ? '1px solid rgba(26,26,108,0.06)' : 'none',
                padding: 8,
              }}
            >
              {/* Mini order icon (rectangle placeholder) */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: 'rgba(26, 26, 108, 0.08)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 14,
                    borderRadius: 3,
                    backgroundColor: NAVY,
                    opacity: 0.3,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: NAVY,
                  textAlign: 'center',
                  opacity: 0.7,
                  lineHeight: 1.2,
                }}
              >
                {label}
              </span>
              {/* Fake price — hidden */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: '700',
                  color: NAVY,
                  opacity: 0,
                }}
              >
                R$ {(29 + i * 17).toFixed(2).replace('.', ',')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Center overlay text */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 720,
          height: 1280,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div
          style={{
            transform: `scale(${textScale})`,
            opacity: textOpacity,
            textAlign: 'center',
            padding: '0 40px',
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: '800',
              color: '#FFFFFF',
              textShadow: '0 4px 32px rgba(0,0,0,0.7), 0 2px 12px rgba(0,0,0,0.5)',
              lineHeight: 1.2,
            }}
          >
            E e tanto pedido
            <br />
            gente...
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
