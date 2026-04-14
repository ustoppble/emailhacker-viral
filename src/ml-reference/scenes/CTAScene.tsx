import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const YELLOW = '#FFE600'
const DARK = '#333333'
const BLACK = '#000000'

const ICONS = [
  { label: 'Escolha', delay: 0 },
  { label: 'Compre', delay: 10 },
  { label: 'Receba', delay: 20 },
]

// Simple SVG icons
const SearchIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
    <circle cx="16" cy="16" r="10" stroke="#333" strokeWidth="3" />
    <line x1="23" y1="23" x2="32" y2="32" stroke="#333" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const CartIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
    <path
      d="M6 6h4l3 18h14l3-12H12"
      stroke="#333"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="15" cy="30" r="2.5" fill="#333" />
    <circle cx="25" cy="30" r="2.5" fill="#333" />
  </svg>
)

const BoxIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
    <path
      d="M4 12l14-8 14 8v14l-14 8-14-8V12z"
      stroke="#333"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <path d="M4 12l14 8 14-8" stroke="white" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M18 20v16" stroke="white" strokeWidth="2.5" />
  </svg>
)

const ICON_COMPONENTS = [SearchIcon, CartIcon, BoxIcon]

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // CTA text animation
  const ctaDelay = 35
  const ctaSpring = spring({
    frame: Math.max(0, frame - ctaDelay),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  })
  const ctaY = interpolate(ctaSpring, [0, 1], [40, 0])
  const ctaOpacity = interpolate(frame, [ctaDelay, ctaDelay + 12], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: YELLOW,
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 48px',
      }}
    >
      {/* Icons row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: 0,
          position: 'relative',
        }}
      >
        {ICONS.map((icon, i) => {
          const IconComponent = ICON_COMPONENTS[i]
          const iconSpring = spring({
            frame: Math.max(0, frame - icon.delay),
            fps,
            config: { damping: 10, stiffness: 180, mass: 0.6 },
          })
          const iconScale = interpolate(iconSpring, [0, 1], [0, 1])
          const iconOpacity = interpolate(frame, [icon.delay, icon.delay + 8], [0, 1], {
            extrapolateRight: 'clamp',
            extrapolateLeft: 'clamp',
          })

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Dotted arrow connector (before icons 2 and 3) */}
              {i > 0 && (
                <div
                  style={{
                    width: 60,
                    height: 2,
                    opacity: iconOpacity,
                    position: 'relative',
                    marginTop: -20,
                  }}
                >
                  {/* Dotted line */}
                  <div
                    style={{
                      width: '100%',
                      borderTop: `3px dotted ${DARK}`,
                      position: 'absolute',
                      top: 0,
                    }}
                  />
                  {/* Arrow head */}
                  <div
                    style={{
                      position: 'absolute',
                      right: -4,
                      top: -5,
                      width: 0,
                      height: 0,
                      borderTop: '6px solid transparent',
                      borderBottom: '6px solid transparent',
                      borderLeft: `8px solid ${DARK}`,
                    }}
                  />
                </div>
              )}

              {/* Icon + label */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 14,
                  transform: `scale(${iconScale})`,
                  opacity: iconOpacity,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                    border: `2px solid ${DARK}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <IconComponent />
                </div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: '700',
                    color: BLACK,
                    letterSpacing: 1,
                  }}
                >
                  {icon.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA text */}
      <div
        style={{
          marginTop: 56,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: 'center',
          maxWidth: 580,
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: BLACK,
            lineHeight: 1.3,
          }}
        >
          Esta esperando o que para fazer o seu pedido?
        </div>
      </div>
    </AbsoluteFill>
  )
}
