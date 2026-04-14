import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion'
import { COLORS, FONTS } from '../../../styles'

const PRODUCTS = [
  { name: 'Cozinha de Panela So', price: 'R$ 97,00', selected: false },
  { name: 'Cafe Minuto', price: 'R$ 47,00', selected: true },
  { name: 'Receitas Fit', price: 'R$ 67,00', selected: false },
]

const BADGES = [
  { label: '1-CLICK', x: -280, y: -60 },
  { label: 'IA', x: 280, y: -20 },
  { label: 'AUTO', x: -260, y: 80 },
]

export const FeatureScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Title entrance (0.2s delay, smooth spring)
  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.2 * fps) })

  // Press animation on selected card at 2.7s
  const pressFrame = Math.round(2.7 * fps)
  const pressScale = frame > pressFrame && frame < pressFrame + Math.round(0.4 * fps)
    ? (frame < pressFrame + Math.round(0.13 * fps) ? 0.97 : frame < pressFrame + Math.round(0.27 * fps) ? 1.02 : 1.0)
    : 1.0

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Title top — fades in with spring */}
      <div style={{
        position: 'absolute',
        top: 60,
        width: '100%',
        textAlign: 'center',
        zIndex: 20,
        opacity: titleSpring,
        transform: `translateY(${interpolate(titleSpring, [0, 1], [15, 0])}px)`,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 28, color: '#ef4444', fontWeight: 700, letterSpacing: 4 }}>
          FUNNELS
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textSecondary, marginTop: 6 }}>
          funis de recuperacao com ia
        </div>
      </div>

      {/* Phone mockup */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -45%) scale(1.2)',
        width: 320,
        zIndex: 15,
      }}>
        <div style={{
          background: '#0d0d0d',
          border: '2px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '40px 16px 20px',
          boxShadow: '0 0 60px rgba(239, 68, 68, 0.1)',
        }}>
          {PRODUCTS.map((p, i) => {
            // Each card enters with staggered spring (Remotion native delay)
            const s = spring({
              frame,
              fps,
              config: { damping: 20, stiffness: 200 }, // snappy
              delay: Math.round((0.7 + i * 0.25) * fps),
            })
            const isSelected = p.selected
            const scale = isSelected ? pressScale : 1
            return (
              <div key={i} style={{
                background: isSelected ? 'rgba(239, 68, 68, 0.08)' : '#111',
                border: `1px solid ${isSelected ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255,255,255,0.05)'}`,
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: i < PRODUCTS.length - 1 ? 8 : 0,
                transform: `scale(${(0.8 + s * 0.2) * scale})`,
                opacity: Math.min(1, s * 2),
              }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.text, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.textMuted, marginTop: 3 }}>{p.price}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating badges — premounted, spring delay in seconds */}
      {BADGES.map((b, i) => {
        const badgeSpring = spring({
          frame,
          fps,
          config: { damping: 20, stiffness: 200 },
          delay: Math.round((1.3 + i * 0.3) * fps),
        })
        const floatY = Math.sin((frame + i * 20) * 0.06) * 4

        return (
          <div key={i} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(calc(-50% + ${b.x}px), calc(-50% + ${b.y + floatY}px)) scale(${0.8 + badgeSpring * 0.2})`,
            opacity: Math.min(1, badgeSpring * 2),
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 4,
            padding: '4px 10px',
            letterSpacing: 2,
            zIndex: 20,
          }}>
            {b.label}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}
