import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { PhoneMockup } from '../components/PhoneMockup'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { FunnelBuilder } from '../features/funnels/FunnelBuilder'
import { EmailBuilder } from '../features/ghostwriter/EmailBuilder'
import { InboxTester } from '../features/email-azul/InboxTester'
import { SendBuilder } from '../features/send/SendBuilder'
import { COLORS, FONTS, SIZES, MOTION, SCENES } from '../styles'

interface Props {
  feature: string
  counterValue: number
  counterLabel: string
}

// Block appearance frames per feature
const FUNNELS_CONFIG = {
  blockFrames: [0, 12, 24, 36, 48, 60, 72],
  blockLabels: ['Trigger', 'Email 1', 'Wait 24h', 'Email 2', 'Wait 48h', 'Email 3', 'Venda'],
  timestamps: ['0:00', '0:00', '24h', '24h', '48h', '72h', '96h'],
  toasts: [null, 'Email de lembrete enviado', null, 'Email de urgencia enviado', null, 'Oferta especial enviada', null],
}

const GHOSTWRITER_CONFIG = {
  blockFrames: [0, 18, 36, 54, 72, 90],
  blockLabels: ['Brand DNA', 'Subject', 'Corpo', 'Tom de Voz', 'Revisao', 'Pronto'],
  timestamps: ['0s', '2s', '4s', '6s', '8s', '10s'],
  toasts: ['Brand DNA carregado', null, 'Subject line gerada', null, 'Copy finalizada', 'Email pronto pra enviar'],
}

const EMAIL_AZUL_CONFIG = {
  blockFrames: [0, 18, 36, 54, 72, 90],
  blockLabels: ['Disparar R1-R5', 'Monitor Gmail', 'R1: Promo', 'R2: Promo', 'R3: INBOX', 'Vencedor Aplicado'],
  timestamps: ['0s', '5s', '30s', '45s', '1:20', '1:30'],
  toasts: ['5 variantes enviadas', null, 'R1 caiu em Promocoes', null, 'R3 chegou na Inbox!', 'Subject vencedor aplicado'],
}

const SEND_CONFIG = {
  blockFrames: [0, 15, 30, 45, 60, 75],
  blockLabels: ['Segmento selecionado', 'Produto carregado', 'Subject gerada', 'Corpo escrito', 'Revisao OK', 'Disparado!'],
  timestamps: ['0s', '1s', '3s', '5s', '8s', '10s'],
  toasts: ['Segmento: 3.418 contatos', null, 'Subject gerada pela IA', null, 'Email pronto', 'Campanha disparada!'],
}

// Legacy constants for backward compat
const BLOCK_FRAMES = FUNNELS_CONFIG.blockFrames
const BLOCK_LABELS = FUNNELS_CONFIG.blockLabels
const TIMESTAMPS = FUNNELS_CONFIG.timestamps
const TOAST_MESSAGES = FUNNELS_CONFIG.toasts

// Circular progress ring (SVG)
const ProgressRing: React.FC<{ progress: number; size: number; stroke: number; color: string }> = ({
  progress, size, stroke, color,
}) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)
  return (
    <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={COLORS.surfaceLight}
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
      />
    </svg>
  )
}

// Notification toast component
const Toast: React.FC<{ message: string; frame: number; appearFrame: number; yOffset: number }> = ({
  message, frame, appearFrame, yOffset,
}) => {
  const elapsed = frame - appearFrame
  if (elapsed < 0 || elapsed > 50) return null
  const slideX = interpolate(elapsed, [0, 10], [200, 0], { extrapolateRight: 'clamp' })
  const opacity = elapsed < 40
    ? interpolate(elapsed, [0, 8], [0, 1], { extrapolateRight: 'clamp' })
    : interpolate(elapsed, [40, 50], [1, 0], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      transform: `translateX(${slideX}px)`,
      opacity,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      backgroundColor: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 10,
      padding: '10px 18px',
      boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
      marginBottom: 8,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 18 }}>{'📧'}</span>
      <span style={{
        fontFamily: FONTS.mono,
        fontSize: 13,
        color: COLORS.text,
      }}>
        {message}
      </span>
    </div>
  )
}

export const VisualScene: React.FC<Props> = ({ feature, counterValue, counterLabel }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Feature-specific config
  const cfg = feature === 'GHOSTWRITER' ? GHOSTWRITER_CONFIG : feature === 'EMAIL AZUL' ? EMAIL_AZUL_CONFIG : feature === 'SEND' ? SEND_CONFIG : FUNNELS_CONFIG
  const activeBlockFrames = cfg.blockFrames
  const activeTimestamps = cfg.timestamps
  const activeToasts = cfg.toasts

  // Label
  const labelOpacity = interpolate(frame, [0, 3], [0, 1], { extrapolateRight: 'clamp' })

  // === NARRATIVE CAMERA on phone ONLY ===
  // Phase 1 (0-20): see whole phone
  // Phase 2 (20-150): gentle zoom as blocks build
  // Phase 3 (150-240): zoom out to reveal counter
  const phoneZoom = interpolate(frame, [0, 20, 150, 240], [1.0, 1.0, 1.25, 1.1], { extrapolateRight: 'clamp' })

  // Pan Y follows block construction — camera moves DOWN as blocks appear
  const stepInterval = feature === 'GHOSTWRITER' ? 18 : 12
  const currentBlockIndex = Math.min(activeBlockFrames.length - 1, Math.floor(Math.max(0, frame - 8) / stepInterval))
  const targetPanY = currentBlockIndex * 18 // gentle pan per block
  const phonePanY = interpolate(frame, [0, 20, 150, 240], [0, 0, -targetPanY, -targetPanY * 0.6], { extrapolateRight: 'clamp' })

  // Slight X drift for organic feel
  const phonePanX = Math.sin(frame * 0.03) * 3

  // Progress bar at top — fills as blocks appear
  const lastBlockFrame = activeBlockFrames[activeBlockFrames.length - 1] + 12
  const progressFill = interpolate(frame, [0, lastBlockFrame + 20], [0, 100], { extrapolateRight: 'clamp' })

  // Counter appears after blocks finish building
  const counterAppearFrame = 100
  const counterOpacity = interpolate(frame, [counterAppearFrame, counterAppearFrame + 15], [0, 1], { extrapolateRight: 'clamp' })
  const counterScale = interpolate(
    spring({ frame: Math.max(0, frame - counterAppearFrame), fps, config: MOTION.bouncy }),
    [0, 1], [0.7, 1]
  )

  // Counter ring progress
  const counterRingProgress = interpolate(frame, [counterAppearFrame, counterAppearFrame + 60], [0, 1], { extrapolateRight: 'clamp' })

  // Green flash when "Venda Recuperada" appears (block index 6, frame ~72+8=80)
  const vendaFrame = activeBlockFrames[activeBlockFrames.length - 1] + 8
  // DOUBLE PULSE: two quick flashes at vendaFrame and vendaFrame+6
  const greenFlashPulse1 = frame >= vendaFrame
    ? interpolate(frame, [vendaFrame, vendaFrame + 2, vendaFrame + 5], [0, 0.25, 0], { extrapolateRight: 'clamp' })
    : 0
  const greenFlashPulse2 = frame >= vendaFrame + 6
    ? interpolate(frame, [vendaFrame + 6, vendaFrame + 8, vendaFrame + 12], [0, 0.20, 0], { extrapolateRight: 'clamp' })
    : 0
  const greenFlashOpacity = Math.max(greenFlashPulse1, greenFlashPulse2)

  // CAMERA FLASH: full-screen white flash at vendaFrame (4 frames)
  const cameraFlashOpacity = frame >= vendaFrame
    ? interpolate(frame, [vendaFrame, vendaFrame + 1, vendaFrame + 4], [0, 0.08, 0], { extrapolateRight: 'clamp' })
    : 0

  // LENS FLARE: bright point + streaks + halo at vendaFrame (12 frames)
  const flareElapsed = frame - vendaFrame
  const flareOpacity = frame >= vendaFrame
    ? interpolate(flareElapsed, [0, 3, 6, 12], [0, 0.8, 0.6, 0], { extrapolateRight: 'clamp' })
    : 0
  const haloRadius = frame >= vendaFrame
    ? interpolate(flareElapsed, [0, 12], [20, 100], { extrapolateRight: 'clamp' })
    : 20
  const haloOpacity = frame >= vendaFrame
    ? interpolate(flareElapsed, [0, 3, 12], [0, 0.6, 0], { extrapolateRight: 'clamp' })
    : 0

  // PARTICLE SHOWER: 15 particles raining down from top
  const particleSeed = [
    { x: 0.12, speed: 3.2, drift: 25, size: 3, color: COLORS.success },
    { x: 0.25, speed: 2.5, drift: 35, size: 2, color: '#ffffff' },
    { x: 0.38, speed: 4.1, drift: 20, size: 4, color: COLORS.success },
    { x: 0.52, speed: 2.8, drift: 40, size: 2, color: '#ffffff' },
    { x: 0.65, speed: 3.6, drift: 30, size: 3, color: COLORS.success },
    { x: 0.78, speed: 4.5, drift: 22, size: 3, color: '#ffffff' },
    { x: 0.08, speed: 2.2, drift: 38, size: 2, color: COLORS.success },
    { x: 0.92, speed: 3.9, drift: 28, size: 4, color: '#ffffff' },
    { x: 0.45, speed: 2.6, drift: 33, size: 3, color: COLORS.success },
    { x: 0.18, speed: 4.8, drift: 25, size: 2, color: '#ffffff' },
    { x: 0.72, speed: 3.0, drift: 36, size: 3, color: COLORS.success },
    { x: 0.33, speed: 3.4, drift: 22, size: 4, color: COLORS.success },
    { x: 0.58, speed: 2.3, drift: 40, size: 2, color: '#ffffff' },
    { x: 0.85, speed: 4.2, drift: 28, size: 3, color: COLORS.success },
    { x: 0.03, speed: 3.7, drift: 32, size: 3, color: '#ffffff' },
  ]

  // Checkmarks for completed blocks
  const completedBlocks = activeBlockFrames.map((f, _i) => frame >= f + 18)

  // Phone wrapper position — below title area
  const phoneTop = 120

  return (
    <AbsoluteFill style={{
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '10px 0 0 0',
    }}>
      {/* Progress bar — very top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        backgroundColor: COLORS.surfaceLight,
        zIndex: 25,
      }}>
        <div style={{
          width: `${progressFill}%`,
          height: '100%',
          backgroundColor: COLORS.accent,
          boxShadow: `0 0 10px ${COLORS.accentGlow}`,
        }} />
      </div>

      {/* Title — flex top, never zoomed */}
      <div style={{
        opacity: labelOpacity,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 15,
        flexShrink: 0,
        marginTop: 15,
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 14,
          color: COLORS.accent,
          textTransform: 'uppercase',
          letterSpacing: 6,
          textShadow: `0 0 20px ${COLORS.accentGlowSoft}`,
        }}>
          {feature} em acao
        </div>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 18,
          color: COLORS.textSecondary,
          letterSpacing: 4,
          marginTop: 4,
          textTransform: 'uppercase',
        }}>
          {feature === 'GHOSTWRITER' ? 'ESCREVENDO EMAIL' : feature === 'EMAIL AZUL' ? 'TESTANDO ENTREGABILIDADE' : feature === 'SEND' ? 'DISPARANDO EMAIL' : 'CONSTRUINDO AUTOMACAO'}
        </div>
      </div>

      {/* Counter — LEFT side, NOT affected by phone zoom */}
      <div style={{
        position: 'absolute',
        left: 100,
        top: '50%',
        transform: `translateY(-50%) scale(${counterScale})`,
        opacity: counterOpacity,
        zIndex: 5,
      }}>
        {/* Circular progress ring behind counter */}
        <div style={{ position: 'relative', width: 160, height: 160 }}>
          <ProgressRing
            progress={counterRingProgress}
            size={160}
            stroke={4}
            color={COLORS.success}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <AnimatedCounter
              to={counterValue}
              label={counterLabel}
              startFrame={counterAppearFrame}
              durationFrames={50}
            />
          </div>
        </div>
      </div>

      {/* Notification toasts — RIGHT side, NOT affected by phone zoom */}
      <div style={{
        position: 'absolute',
        right: 60,
        top: 260,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {activeToasts.map((msg, i) => {
          if (!msg) return null
          const toastFrame = activeBlockFrames[i] + 14
          return (
            <Toast
              key={`toast-${i}`}
              message={msg}
              frame={frame}
              appearFrame={toastFrame}
              yOffset={0}
            />
          )
        })}
      </div>

      {/* Phone — fills remaining space, same pattern as FeatureScene */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'visible',
        transform: `scale(${1.2 * phoneZoom}) translate(${phonePanX}px, ${phonePanY}px)`,
        transformOrigin: 'center top',
        zIndex: 2,
      }}>
        <PhoneMockup
          totalFrames={SCENES.visual}
          exitFrame={SCENES.visual - 20}
        >
          {feature === 'GHOSTWRITER' ? <EmailBuilder /> : feature === 'EMAIL AZUL' ? <InboxTester /> : feature === 'SEND' ? <SendBuilder /> : <FunnelBuilder />}
        </PhoneMockup>

        {/* Timestamps — right side of phone, aligned with blocks (zoom with phone) */}
        {activeTimestamps.map((ts, i) => {
          const blockFrame = activeBlockFrames[i]
          const tsDelay = blockFrame + 10
          const tsOpacity = interpolate(frame, [tsDelay, tsDelay + 8], [0, 1], { extrapolateRight: 'clamp' })
          const tsX = interpolate(frame, [tsDelay, tsDelay + 12], [20, 0], { extrapolateRight: 'clamp' })
          // Stagger vertical positioning to match phone blocks inside the phone wrapper
          const blockSpacing = 52 + 8 + 20 // blockH + gap + connector from FunnelBuilder
          const baseY = 80 + i * blockSpacing * 0.32

          return (
            <div key={`ts-${i}`} style={{
              position: 'absolute',
              right: -80,
              top: baseY,
              opacity: tsOpacity,
              transform: `translateX(${tsX}px)`,
              zIndex: 4,
            }}>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: 11,
                color: COLORS.textMuted,
                letterSpacing: 1,
                backgroundColor: COLORS.surface,
                padding: '3px 8px',
                borderRadius: 4,
                border: `1px solid ${COLORS.border}`,
              }}>
                {ts}
              </span>
            </div>
          )
        })}

        {/* Success checkmarks — left side of phone, next to completed blocks (zoom with phone) */}
        {completedBlocks.map((done, i) => {
          if (!done) return null
          const checkDelay = activeBlockFrames[i] + 18
          const checkSpring = spring({
            frame: Math.max(0, frame - checkDelay),
            fps,
            config: MOTION.snappy,
          })
          const checkScale = interpolate(checkSpring, [0, 1], [0, 1])
          const blockSpacing = 52 + 8 + 20
          const baseY = 80 + i * blockSpacing * 0.32

          return (
            <div key={`check-${i}`} style={{
              position: 'absolute',
              left: -40,
              top: baseY,
              transform: `scale(${checkScale})`,
              zIndex: 4,
            }}>
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                color: i === activeBlockFrames.length - 1 ? COLORS.success : COLORS.textMuted,
                textShadow: i === activeBlockFrames.length - 1 ? `0 0 10px ${COLORS.successGlow}` : 'none',
              }}>
                {'✓'}
              </span>
            </div>
          )
        })}
      </div>

      {/* CAMERA FLASH — full screen white flash (NOT affected by zoom) */}
      {cameraFlashOpacity > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#ffffff',
          opacity: cameraFlashOpacity,
          pointerEvents: 'none',
          zIndex: 19,
        }} />
      )}

      {/* Green flash — full screen overlay on "Venda Recuperada" (double pulse) */}
      {greenFlashOpacity > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: COLORS.success,
          opacity: greenFlashOpacity,
          pointerEvents: 'none',
          zIndex: 20,
        }} />
      )}

      {/* LENS FLARE — bright point + streaks + halo */}
      {flareOpacity > 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 21,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {/* Central bright point */}
          <div style={{
            position: 'absolute',
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            opacity: flareOpacity,
            boxShadow: `0 0 12px 4px ${COLORS.success}, 0 0 30px 8px ${COLORS.successGlow}`,
          }} />
          {/* Flare streaks — 4 directions */}
          {[0, 45, 90, 135].map((angle) => (
            <div key={`streak-${angle}`} style={{
              position: 'absolute',
              width: 200,
              height: 2,
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 30%, ${COLORS.success} 50%, rgba(255,255,255,0.6) 70%, transparent 100%)`,
              opacity: flareOpacity * 0.7,
              transform: `rotate(${angle}deg)`,
              filter: 'blur(1px)',
            }} />
          ))}
          {/* Halo ring — expanding */}
          <div style={{
            position: 'absolute',
            width: haloRadius * 2,
            height: haloRadius * 2,
            borderRadius: '50%',
            border: `1.5px solid ${COLORS.success}`,
            opacity: haloOpacity,
            boxShadow: `0 0 8px ${COLORS.successGlow}, inset 0 0 8px ${COLORS.successGlow}`,
          }} />
        </div>
      )}

      {/* PARTICLE SHOWER — confetti raining down */}
      {frame >= vendaFrame && frame <= vendaFrame + 50 && particleSeed.map((p, i) => {
        const pElapsed = frame - vendaFrame
        const pY = -20 + p.speed * pElapsed
        const pX = p.x * 1920 + Math.sin(pElapsed * 0.15 + i * 1.2) * p.drift
        const pOpacity = interpolate(pElapsed, [0, 5, 40, 50], [0, 0.9, 0.4, 0], { extrapolateRight: 'clamp' })
        if (pY > 1100) return null
        return (
          <div key={`particle-${i}`} style={{
            position: 'absolute',
            left: pX,
            top: pY,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            backgroundColor: p.color,
            opacity: pOpacity,
            boxShadow: `0 0 4px ${p.color}`,
            pointerEvents: 'none',
            zIndex: 22,
          }} />
        )
      })}

      {/* Subtle scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
        zIndex: 15,
      }} />
    </AbsoluteFill>
  )
}
