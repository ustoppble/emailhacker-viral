import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"
const NAVY = '#2D3277'
const YELLOW = '#FFE600'
const GRAY = '#555555'
const BADGE_BG = '#1A1A1A'

// Simplified ML handshake logo — two clasped curves in a circle
const HandshakeLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Outer circle */}
    <circle cx="60" cy="60" r="54" fill={YELLOW} />
    {/* Left hand curve — sweeps from left to center-right */}
    <path
      d="M30 62 C36 52, 48 46, 58 50 C64 52, 68 56, 72 54"
      stroke="#2D3277"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Right hand curve — sweeps from right to center-left */}
    <path
      d="M90 62 C84 52, 72 46, 62 50 C56 52, 52 56, 48 54"
      stroke="#2D3277"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Clasp accent — small bump at meeting point */}
    <ellipse cx="60" cy="52" rx="5" ry="3" fill="#2D3277" />
    {/* Left wrist */}
    <path
      d="M26 68 C28 64, 30 62, 30 62"
      stroke="#2D3277"
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* Right wrist */}
    <path
      d="M94 68 C92 64, 90 62, 90 62"
      stroke="#2D3277"
      strokeWidth="6"
      strokeLinecap="round"
    />
  </svg>
)

// App store badge component
const AppBadge: React.FC<{ store: 'apple' | 'google'; opacity: number }> = ({
  store,
  opacity,
}) => {
  const isApple = store === 'apple'
  return (
    <div
      style={{
        opacity,
        backgroundColor: BADGE_BG,
        borderRadius: 12,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Store icon */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {isApple ? (
          // Apple icon
          <path
            d="M20.5 21.5c-1 1.5-2.1 2.9-3.6 2.9s-2-.9-3.8-.9-2.4.9-3.8.9-2.4-1.3-3.6-2.9C3.5 18.5 2 14.5 2 11c0-4 2.5-6.2 5-6.2 1.3 0 2.4.9 3.2.9.8 0 2-.9 3.5-.9 1.2 0 3.5.5 4.8 2.7-3 1.8-2.5 6.2.5 7.5-.7 1.8-1.5 3.5-2.5 4.5zM17 4.5c-1.5-1.8-1.3-3.5-1.2-4 1.4.1 3 1 3.9 2.2 1 1.3 1.2 2.8 1 3.5-1.3-.2-2.7-.9-3.7-1.7z"
            fill="white"
          />
        ) : (
          // Play triangle icon
          <path d="M8 5v18l14-9L8 5z" fill="white" />
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 10,
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: 0.5,
          }}
        >
          {isApple ? 'Baixe na' : 'Disponivel no'}
        </span>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 18,
            fontWeight: '700',
            color: 'white',
            letterSpacing: -0.3,
          }}
        >
          {isApple ? 'App Store' : 'Google Play'}
        </span>
      </div>
    </div>
  )
}

export const BrandCloseScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Logo scale-up spring — completes by frame 12
  const logoSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 220, mass: 0.5 },
  })
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1])
  const logoOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  // CTA text — appears at frame 10
  const ctaDelay = 10
  const ctaSpring = spring({
    frame: Math.max(0, frame - ctaDelay),
    fps,
    config: { damping: 12, stiffness: 200, mass: 0.5 },
  })
  const ctaY = interpolate(ctaSpring, [0, 1], [30, 0])
  const ctaOpacity = interpolate(frame, [ctaDelay, ctaDelay + 12], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  // App badges — appears at frame 14
  const badgeDelay = 14
  const badgeOpacity = interpolate(frame, [badgeDelay, badgeDelay + 8], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily: FONT,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 48px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          transform: `scale(${logoScale})`,
          opacity: logoOpacity,
        }}
      >
        <HandshakeLogo size={140} />
        <div
          style={{
            fontSize: 42,
            fontWeight: '700',
            color: NAVY,
            letterSpacing: -0.5,
            textTransform: 'lowercase',
          }}
        >
          mercado livre
        </div>
      </div>

      {/* CTA text */}
      <div
        style={{
          marginTop: 48,
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: '500',
            color: GRAY,
            lineHeight: 1.4,
          }}
        >
          Baixe o aplicativo e comece a comprar!
        </div>
      </div>

      {/* App store badges */}
      <div
        style={{
          marginTop: 40,
          display: 'flex',
          gap: 16,
          opacity: badgeOpacity,
        }}
      >
        <AppBadge store="apple" opacity={1} />
        <AppBadge store="google" opacity={1} />
      </div>
    </AbsoluteFill>
  )
}
