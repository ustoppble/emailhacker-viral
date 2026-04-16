import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Sequence } from 'remotion'
import { COLORS, FONTS } from '../../../styles'
import { FunnelBlock } from '../assets/FunnelBlock'
import { FunnelConnector } from '../assets/FunnelConnector'
import { RingSVG } from '../assets/RingSVG'
import { MailIcon, ClockIcon, CheckIcon, ShoppingCartIcon } from '../assets/Icons'
import { CountUp } from '../motion/CountUp'
import { Confetti } from '../motion/Confetti'

const BLOCKS = [
  { icon: <ShoppingCartIcon size={16} color="#f59e0b" />, label: 'CARRINHO', sublabel: 'abandono detectado', variant: 'default' as const },
  { icon: <ClockIcon size={16} color="#6b7280" />, label: 'WAIT 24H', variant: 'wait' as const },
  { icon: <MailIcon size={16} color="#ef4444" />, label: 'EMAIL 1', sublabel: 'lembrete', variant: 'email' as const },
  { icon: <ClockIcon size={16} color="#6b7280" />, label: 'WAIT 48H', variant: 'wait' as const },
  { icon: <MailIcon size={16} color="#ef4444" />, label: 'EMAIL 2', sublabel: 'urgencia', variant: 'email' as const },
  { icon: <CheckIcon size={16} color="#16a34a" />, label: 'GOAL', sublabel: 'venda recuperada', variant: 'goal' as const },
]

const TOASTS = [
  { text: 'email 1 escrito', delaySec: 2.7 },
  { text: 'email 2 escrito', delaySec: 4.0 },
  { text: 'automacao publicada', delaySec: 6.0 },
]

export const BuildScene: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Title entrance (0.1s delay, smooth)
  const titleSpring = spring({ frame, fps, config: { damping: 200 }, delay: Math.round(0.1 * fps) })

  // Progress bar (0 to 1 over 6.7s)
  const progress = interpolate(frame, [0, Math.round(6.7 * fps)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  // Confetti at 6.3s
  const confettiStart = Math.round(6.3 * fps)

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 50,
        width: '100%',
        textAlign: 'center',
        zIndex: 20,
        opacity: titleSpring,
        transform: `translateY(${interpolate(titleSpring, [0, 1], [12, 0])}px)`,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 28, color: '#ef4444', fontWeight: 700, letterSpacing: 4 }}>FUNNELS</div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textSecondary, marginTop: 6 }}>a ia monta o funil inteiro</div>
      </div>

      {/* Progress bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.03)', zIndex: 25 }}>
        <div style={{ height: '100%', width: `${progress * 100}%`, background: '#ef4444', borderRadius: 2 }} />
      </div>

      {/* Phone with funnel blocks — staggered spring entrance */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -42%) scale(1.15)',
        width: 320,
        zIndex: 15,
      }}>
        <div style={{
          background: '#0d0d0d',
          border: '2px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '36px 16px 20px',
          boxShadow: '0 0 60px rgba(239, 68, 68, 0.1)',
        }}>
          {BLOCKS.map((block, i) => {
            // Each block enters with stagger (0.5s base + 0.6s per block)
            const blockDelay = Math.round((0.5 + i * 0.6) * fps)
            const s = spring({ frame, fps, config: { damping: 20, stiffness: 200 }, delay: blockDelay })

            return (
              <React.Fragment key={i}>
                <div style={{ transform: `scale(${0.8 + s * 0.2})`, opacity: Math.min(1, s * 2) }}>
                  <FunnelBlock icon={block.icon} label={block.label} sublabel={block.sublabel} variant={block.variant} width={280} />
                </div>
                {i < BLOCKS.length - 1 && (
                  <FunnelConnector height={16} delay={blockDelay + Math.round(0.3 * fps)} drawDuration={Math.round(0.3 * fps)} />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* Counter left — premounted */}
      <Sequence from={Math.round(1 * fps)} layout="none" premountFor={fps}>
        <div style={{
          position: 'absolute',
          left: 100,
          top: '50%',
          transform: 'translateY(-50%)',
          textAlign: 'center',
          zIndex: 20,
        }}>
          <RingSVG size={90} progress={1} delay={0} duration={Math.round(5 * fps)} color="#ef4444" />
          <div style={{ marginTop: 8 }}>
            <CountUp to={5} delay={0} duration={Math.round(3.3 * fps)} style={{ fontFamily: FONTS.mono, fontSize: 28, color: '#ef4444', fontWeight: 700 }} />
            <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>emails</div>
          </div>
        </div>
      </Sequence>

      {/* Toasts right — spring with native delay */}
      <div style={{
        position: 'absolute',
        right: 60,
        top: '40%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 20,
      }}>
        {TOASTS.map((toast, i) => {
          const toastSpring = spring({
            frame,
            fps,
            config: { damping: 20, stiffness: 200 },
            delay: Math.round(toast.delaySec * fps),
          })
          return (
            <div key={i} style={{
              fontFamily: FONTS.mono,
              fontSize: 11,
              color: '#16a34a',
              background: 'rgba(22, 163, 74, 0.08)',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              borderRadius: 6,
              padding: '6px 12px',
              transform: `scale(${0.8 + toastSpring * 0.2})`,
              opacity: Math.min(1, toastSpring * 2),
            }}>
              {toast.text}
            </div>
          )
        })}
      </div>

      {/* Confetti — premounted */}
      <Sequence from={confettiStart} layout="none" premountFor={fps}>
        <Confetti count={50} delay={0} />
      </Sequence>
    </AbsoluteFill>
  )
}
