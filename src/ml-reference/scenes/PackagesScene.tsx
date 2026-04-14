import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const RED = '#E53935'
const DARK = '#2D2D2D'

// Package placeholder colors (diversified palette)
const PKG_COLORS = [
  '#FFE600', '#E6C200', '#D4A017', '#C49B4A',
  '#B8860B', '#DAA520', '#FFD700', '#CC9900',
  '#E6B800', '#D2B48C', '#C4965C', '#FFE600',
  '#CC8400', '#DAA520', '#B8860B', '#D4A017',
]

const BG_COLS = 4
const BG_ROWS = 4

export const PackagesScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // --- Parallax on background ---
  const parallaxY = interpolate(frame, [0, 90], [0, -30], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  // --- Center card ---
  const cardDelay = 10
  const cardSpring = spring({
    frame: Math.max(0, frame - cardDelay),
    fps,
    config: { damping: 14, stiffness: 100, mass: 1.1 },
  })
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1])
  const cardOpacity = interpolate(frame, [cardDelay, cardDelay + 15], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  // --- Text fade ---
  const textDelay = 18
  const textOpacity = interpolate(frame, [textDelay, textDelay + 12], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })
  const textY = interpolate(
    spring({
      frame: Math.max(0, frame - textDelay),
      fps,
      config: { damping: 14, stiffness: 120, mass: 0.9 },
    }),
    [0, 1],
    [16, 0],
  )

  // --- Package icons pop-in (staggered) ---
  const icons = [
    { delay: 45, size: 56 },
    { delay: 55, size: 64 },
    { delay: 65, size: 56 },
  ]

  const cellW = 720 / BG_COLS
  const cellH = (1280 + 80) / BG_ROWS // extra height for parallax

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F5F0E8',
        fontFamily: FONT,
        overflow: 'hidden',
      }}
    >
      {/* Background grid of package placeholders */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          left: 0,
          width: 720,
          height: 1280 + 80,
          display: 'flex',
          flexWrap: 'wrap',
          transform: `translateY(${parallaxY}px)`,
          filter: 'blur(8px)',
          opacity: 0.65,
        }}
      >
        {PKG_COLORS.map((color, i) => (
          <div
            key={i}
            style={{
              width: cellW,
              height: cellH,
              padding: 6,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                width: cellW - 12,
                height: cellH - 12,
                backgroundColor: color,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </div>
        ))}
      </div>

      {/* Center card with backdrop blur */}
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
            transform: `scale(${cardScale})`,
            opacity: cardOpacity,
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 28,
            padding: '40px 44px',
            maxWidth: 600,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            boxShadow: '0 16px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          {/* Text */}
          <div
            style={{
              opacity: textOpacity,
              transform: `translateY(${textY}px)`,
              textAlign: 'center',
              lineHeight: 1.35,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: '600',
                color: DARK,
              }}
            >
              Sao{' '}
            </span>
            <span
              style={{
                fontSize: 42,
                fontWeight: '800',
                color: RED,
              }}
            >
              milhoes
            </span>
            <span
              style={{
                fontSize: 36,
                fontWeight: '600',
                color: DARK,
              }}
            >
              {' '}
              de pacotes
              <br />
              enviados todos os dias.
            </span>
          </div>

          {/* Package box icons (styled divs) */}
          <div
            style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            {icons.map((icon, i) => {
              const iconSpring = spring({
                frame: Math.max(0, frame - icon.delay),
                fps,
                config: { damping: 8, stiffness: 180, mass: 0.6 },
              })
              const iconScale = interpolate(iconSpring, [0, 1], [0, 1])
              const iconOpacity = interpolate(frame, [icon.delay, icon.delay + 8], [0, 1], {
                extrapolateRight: 'clamp',
                extrapolateLeft: 'clamp',
              })

              return (
                <div
                  key={i}
                  style={{
                    width: icon.size,
                    height: icon.size,
                    opacity: iconOpacity,
                    transform: `scale(${iconScale})`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Package box shape */}
                  <div
                    style={{
                      width: icon.size,
                      height: icon.size * 0.85,
                      borderRadius: 8,
                      backgroundColor: '#D4A017',
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {/* Tape line horizontal */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        width: '100%',
                        height: 4,
                        backgroundColor: '#A0855A',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    {/* Tape line vertical */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: 0,
                        width: 4,
                        height: '100%',
                        backgroundColor: '#A0855A',
                        transform: 'translateX(-50%)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
