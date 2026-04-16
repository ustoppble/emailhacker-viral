import { AbsoluteFill, useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion'
import { COLORS, MOTION } from '../styles'

interface Props {
  children: React.ReactNode
  enterFrame?: number
  exitFrame?: number
  totalFrames: number
}

export const PhoneMockup: React.FC<Props> = ({ children, enterFrame = 0, exitFrame, totalFrames }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada com spring bouncy — anticipation + overshoot
  const enterSpring = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: MOTION.bouncy,
  })
  const scale = interpolate(enterSpring, [0, 1], [0.7, 1])
  const opacity = interpolate(frame, [enterFrame, enterFrame + 8], [0, 1], { extrapolateRight: 'clamp' })

  // Saida com blur + zoom out
  const exitStart = exitFrame ?? totalFrames - 15
  const exitProgress = interpolate(frame, [exitStart, exitStart + 15], [0, 1], { extrapolateRight: 'clamp' })
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.85])
  const exitBlur = interpolate(exitProgress, [0, 1], [0, 12])
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0])

  const finalScale = exitProgress > 0 ? exitScale : scale
  const finalOpacity = exitProgress > 0 ? exitOpacity : opacity

  // Phone dimensions (iPhone 15 Pro ratio) — bigger
  const phoneW = 380
  const phoneH = 760
  const screenW = phoneW - 16
  const screenH = phoneH - 16
  const borderRadius = 48

  // Pulsing glow ring
  const glowPulse = interpolate(
    Math.sin((frame / fps) * Math.PI * 1.2),
    [-1, 1],
    [0.4, 0.75],
  )

  // Diagonal reflection moving slowly across screen
  const reflectionX = interpolate(
    frame % (fps * 6),
    [0, fps * 6],
    [-120, phoneW + 120],
  )

  // Screen glow projection — pulsing opacity
  const screenGlowOpacity = interpolate(
    Math.sin((frame / fps) * Math.PI * 0.8),
    [-1, 1],
    [0.1, 0.2],
  )

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div style={{
        transform: `scale(${finalScale})`,
        opacity: finalOpacity,
        filter: `blur(${exitBlur}px)`,
        position: 'relative',
      }}>
        {/* Screen glow projection — light cast outward onto background */}
        <div style={{
          position: 'absolute',
          inset: -120,
          borderRadius: borderRadius + 120,
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${COLORS.accent} 0%, transparent 70%)`,
          opacity: screenGlowOpacity,
          pointerEvents: 'none',
        }} />

        {/* Phone glow ring — pulsing */}
        <div style={{
          position: 'absolute',
          inset: -50,
          borderRadius: borderRadius + 50,
          background: `radial-gradient(ellipse, ${COLORS.accentGlowSoft} 0%, transparent 70%)`,
          opacity: glowPulse,
        }} />

        {/* Phone body */}
        <div style={{
          width: phoneW,
          height: phoneH,
          borderRadius,
          border: `2px solid ${COLORS.border}`,
          backgroundColor: COLORS.surface,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: [
            '0 4px 15px rgba(0,0,0,0.4)',
            '0 20px 50px rgba(0,0,0,0.5)',
            '0 40px 100px rgba(0,0,0,0.6)',
            '0 0 100px rgba(239,68,68,0.08)',
            `inset 0 0 40px rgba(239, 68, 68, 0.05)`,
          ].join(', '),
        }}>
          {/* Glass material — inner border highlight */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: borderRadius - 1,
            border: '1px solid rgba(255,255,255,0.05)',
            pointerEvents: 'none',
            zIndex: 15,
          }} />

          {/* Ambient light reflection — red rim on left and bottom edges */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius,
            background: `linear-gradient(135deg, rgba(239,68,68,0.08) 0%, transparent 30%, transparent 70%, rgba(239,68,68,0.06) 100%)`,
            pointerEvents: 'none',
            zIndex: 14,
          }} />
          {/* Notch — realistic with camera dot */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 130,
            height: 30,
            backgroundColor: COLORS.bg,
            borderRadius: '0 0 18px 18px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 2,
          }}>
            {/* Camera dot */}
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#1a1a2e',
              border: '1.5px solid #2a2a3e',
              boxShadow: 'inset 0 0 3px rgba(100, 100, 180, 0.3)',
            }} />
          </div>

          {/* Side buttons — left (volume up, volume down) */}
          <div style={{
            position: 'absolute',
            left: -2,
            top: 140,
            width: 1,
            height: 28,
            backgroundColor: '#333',
            borderRadius: '1px 0 0 1px',
            zIndex: 5,
          }} />
          <div style={{
            position: 'absolute',
            left: -2,
            top: 178,
            width: 1,
            height: 28,
            backgroundColor: '#333',
            borderRadius: '1px 0 0 1px',
            zIndex: 5,
          }} />

          {/* Side button — right (power) */}
          <div style={{
            position: 'absolute',
            right: -2,
            top: 160,
            width: 1,
            height: 40,
            backgroundColor: '#333',
            borderRadius: '0 1px 1px 0',
            zIndex: 5,
          }} />

          {/* Screen content */}
          <div style={{
            position: 'absolute',
            top: 8,
            left: 8,
            width: screenW,
            height: screenH,
            borderRadius: borderRadius - 8,
            overflow: 'hidden',
            backgroundColor: COLORS.bg,
            boxShadow: `inset 0 0 30px rgba(239, 68, 68, 0.04)`,
          }}>
            {children}

            {/* Screen reflection — diagonal light sweep */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 20,
              background: `linear-gradient(
                30deg,
                transparent 0%,
                transparent ${Math.max(0, ((reflectionX - 60) / phoneW) * 100)}%,
                rgba(255,255,255,0.05) ${((reflectionX) / phoneW) * 100}%,
                transparent ${Math.min(100, ((reflectionX + 60) / phoneW) * 100)}%,
                transparent 100%
              )`,
            }} />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 110,
          height: 4,
          borderRadius: 2,
          backgroundColor: COLORS.textMuted,
          opacity: 0.4,
          zIndex: 10,
        }} />
      </div>
    </AbsoluteFill>
  )
}
