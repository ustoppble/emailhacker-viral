import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'

const FONT = "'Inter', 'SF Pro Display', -apple-system, sans-serif"

export const POVOverlay: React.FC = () => {
  const frame = useCurrentFrame()

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 40,
          right: 40,
          opacity,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 22,
            fontWeight: '700',
            color: '#FFFFFF',
            textShadow:
              '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
            lineHeight: 1.4,
          }}
        >
          POV: você tá fazendo Motion sem abrir o After Effects só direcionando
          seus agentes. 🤯
        </div>
      </div>
    </AbsoluteFill>
  )
}
