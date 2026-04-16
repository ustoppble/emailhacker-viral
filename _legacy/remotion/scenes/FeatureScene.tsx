import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import { PhoneMockup } from '../components/PhoneMockup'
import { FunnelSelector } from '../features/funnels/FunnelSelector'
import { EmailComposer } from '../features/ghostwriter/EmailComposer'
import { RoundSelector } from '../features/email-azul/RoundSelector'
import { SendSelector } from '../features/send/SendSelector'
import { COLORS, FONTS, SIZES, MOTION, SCENES } from '../styles'

interface Props {
  feature: string
}

const FEATURE_CONFIG: Record<string, { subtitle: string; terminal: string[]; badges: { text: string; x: number; y: number; delay: number }[] }> = {
  FUNNELS: {
    subtitle: 'ESCOLHA SEU FUNIL',
    terminal: [
      'analyzing brand_dna...', 'loading segments [4322]', 'pipeline.connect(hotmart)',
      'sync_contacts: 3418 ok', 'creating automation...', 'block: trigger_webhook',
      'block: wait_24h', 'block: send_email_1', 'block: if_opened',
      'block: send_email_2', 'block: goal_purchase', 'validating funnel...',
      'status: READY', 'deploying to AC...', 'live in 3...2...1',
    ],
    badges: [
      { text: 'IA', x: -260, y: 80, delay: 25 },
      { text: '1-CLICK', x: -240, y: 340, delay: 35 },
      { text: 'AUTO', x: 260, y: 280, delay: 45 },
    ],
  },
  GHOSTWRITER: {
    subtitle: 'ESCOLHA O PRODUTO',
    terminal: [
      'loading brand_dna...', 'analyzing tone_of_voice...', 'product.load("Curso Email Pro")',
      'scanning landing_page...', 'extracting pain_points: 4', 'mapping objections: 3',
      'generating subject_lines...', 'scoring open_rate...', 'best: "tu ta perdendo vendas"',
      'writing email_body...', 'applying brand_voice...', 'checking spam_score: 2.1',
      'personalizing {nome}...', 'email_ready: true', 'copy generated in 4.2s',
    ],
    badges: [
      { text: 'IA', x: -260, y: 80, delay: 25 },
      { text: 'BRAND DNA', x: -240, y: 340, delay: 35 },
      { text: 'COPY', x: 260, y: 280, delay: 45 },
    ],
  },
  'EMAIL AZUL': {
    subtitle: 'TESTE DE ENTREGABILIDADE',
    terminal: [
      'loading email_draft...', 'generating 5 variants...', 'R1: baseline (original)',
      'R2: optimizing subject_line...', 'R3: rewriting conversational...', 'R4: stripping html...',
      'R5: full ai_rewrite...', 'dispatching to sentinel...', 'segment: 1:1 @h.emailazul',
      'campaign.create(R1)...sent', 'campaign.create(R2)...sent', 'campaign.create(R3)...sent',
      'monitoring gmail...', 'checking inbox vs promo...', 'R3 arrived: INBOX',
    ],
    badges: [
      { text: 'IA', x: -260, y: 80, delay: 25 },
      { text: '5 ROUNDS', x: -240, y: 340, delay: 35 },
      { text: 'GMAIL', x: 260, y: 280, delay: 45 },
    ],
  },
  SEND: {
    subtitle: 'WIZARD DE ENVIO',
    terminal: [
      'loading segments [4322]...', 'segment: "Ativos 30d" (3418)',
      'product.select("Curso Email Pro")', 'loading knowledge_base...',
      'extracting pain_points: 4', 'mapping objections: 3',
      'agent[estrategista].analyze...', 'agent[subject_architect].generate...',
      'best: "tu ta deixando dinheiro na mesa"', 'agent[copywriter].write...',
      'agent[editor].review...', 'spam_score: 1.8 (safe)',
      'agent[brand_voice].calibrate...', 'campaign.create...', 'dispatching to 3418...',
    ],
    badges: [
      { text: 'IA', x: -260, y: 80, delay: 25 },
      { text: '5 STEPS', x: -240, y: 340, delay: 35 },
      { text: '1 TELA', x: 260, y: 280, delay: 45 },
    ],
  },
}

// Default badges (overridden by FEATURE_CONFIG)
const DEFAULT_BADGES = [
  { text: 'IA', x: -260, y: 80, delay: 25 },
  { text: '1-CLICK', x: -240, y: 340, delay: 35 },
  { text: 'AUTO', x: 260, y: 280, delay: 45 },
]

// SVG arrow from badge toward phone center
const ArrowLine: React.FC<{
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
}> = ({ fromX, fromY, toX, toY, progress }) => {
  const dx = toX - fromX
  const dy = toY - fromY
  const len = Math.sqrt(dx * dx + dy * dy)
  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 1920 1080"
    >
      <line
        x1={fromX}
        y1={fromY}
        x2={fromX + dx * progress}
        y2={fromY + dy * progress}
        stroke={COLORS.accent}
        strokeWidth={1.5}
        strokeDasharray={`${len * progress} ${len}`}
        opacity={0.35 * progress}
      />
    </svg>
  )
}

// Scrolling terminal text on left side
const TerminalScroll: React.FC<{ frame: number; lines: string[] }> = ({ frame, lines }) => {
  const scrollY = frame * 1.2
  return (
    <div style={{
      position: 'absolute',
      left: 60,
      top: 200,
      width: 280,
      height: 500,
      overflow: 'hidden',
      opacity: interpolate(frame, [10, 30], [0, 0.18], { extrapolateRight: 'clamp' }),
    }}>
      <div style={{ transform: `translateY(-${scrollY}px)` }}>
        {lines.concat(lines).map((line, i) => (
          <div key={i} style={{
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: COLORS.textMuted,
            lineHeight: '22px',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ color: COLORS.accent, opacity: 0.5 }}>{'>'}</span> {line}
          </div>
        ))}
      </div>
    </div>
  )
}

export const FeatureScene: React.FC<Props> = ({ feature }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const config = FEATURE_CONFIG[feature] || FEATURE_CONFIG.FUNNELS
  const BADGES = config.badges

  // === NARRATIVE CAMERA on phone ONLY ===
  // Phase 1 (0-30): see whole phone
  // Phase 2 (30-120): zoom IN on phone + pan DOWN to follow card selection
  // Phase 3 (120-180): slight zoom out after selection
  const phoneZoom = interpolate(frame, [0, 40, 120, 180], [1.0, 1.0, 1.06, 1.04], { extrapolateRight: 'clamp' })
  const phonePanY = interpolate(frame, [0, 40, 80, 180], [0, 0, -20, -15], { extrapolateRight: 'clamp' })

  // Label entry
  const labelOpacity = interpolate(frame, [0, 5], [0, 1], { extrapolateRight: 'clamp' })
  const labelY = 0 // instant, no slide

  // Animated underline — wider, bolder
  const lineWidth = interpolate(
    spring({ frame: Math.max(0, frame - 8), fps, config: MOTION.snappy }),
    [0, 1], [0, 220]
  )

  // Glow ring around phone — pulses (positioned relative to phone wrapper)
  const glowPulse = Math.sin(frame * 0.08) * 0.15 + 0.55

  // Ripple effect when card selected (frame > 80)
  const rippleActive = frame > 80
  const rippleProgress = rippleActive
    ? interpolate(frame, [80, 120], [0, 1], { extrapolateRight: 'clamp' })
    : 0
  const rippleScale = interpolate(rippleProgress, [0, 1], [0.3, 2.5])
  const rippleOpacity = interpolate(rippleProgress, [0, 0.3, 1], [0, 0.25, 0])

  // Phone center for badge arrow calculations (phone is at x=960, top=160, phone ~700px tall at 1.5 scale)
  const phoneCenterX = 960
  const phoneCenterY = 520

  return (
    <AbsoluteFill style={{
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '30px 0 0 0',
    }}>
      {/* Background terminal scroll */}
      <TerminalScroll frame={frame} lines={config.terminal} />

      {/* Title — top, never zoomed */}
      <div style={{
        transform: `translateY(${labelY}px)`,
        opacity: labelOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 20,
        marginBottom: 20,
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 28,
          color: COLORS.accent,
          textTransform: 'uppercase',
          letterSpacing: 8,
          fontWeight: 'bold',
          textShadow: `0 0 30px ${COLORS.accentGlow}`,
        }}>
          {feature}
        </div>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 16,
          color: COLORS.textSecondary,
          letterSpacing: 4,
          marginTop: 6,
          textTransform: 'uppercase',
        }}>
          {config.subtitle}
        </div>
        <div style={{
          width: lineWidth,
          height: 3,
          backgroundColor: COLORS.accent,
          marginTop: 10,
          borderRadius: 2,
          boxShadow: `0 0 20px ${COLORS.accentGlow}, 0 0 40px ${COLORS.accentGlowSoft}`,
        }} />
      </div>

      {/* Phone — fills remaining space */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'visible',
        transform: `scale(${1.2 * phoneZoom}) translateY(${phonePanY}px)`,
        transformOrigin: 'center top',
        zIndex: 2,
      }}>
        {/* Glow ring — behind phone, relative to phone */}
        <div style={{
          position: 'absolute',
          top: -20,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 360,
          height: 560,
          borderRadius: 50,
          border: `2px solid ${COLORS.accent}`,
          opacity: glowPulse * 0.25,
          boxShadow: `0 0 60px ${COLORS.accentGlow}, inset 0 0 60px ${COLORS.accentGlowSoft}`,
          pointerEvents: 'none',
        }} />

        {/* Ripple from selected card — centered on phone */}
        {rippleActive && (
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            width: 200,
            height: 200,
            marginLeft: -100,
            marginTop: -100,
            borderRadius: '50%',
            border: `2px solid ${COLORS.accent}`,
            transform: `scale(${rippleScale})`,
            opacity: rippleOpacity,
            pointerEvents: 'none',
          }} />
        )}

        <PhoneMockup totalFrames={SCENES.feature}>
          {feature === 'GHOSTWRITER'
            ? <EmailComposer selectedIndex={0} selectFrame={80} />
            : feature === 'EMAIL AZUL'
            ? <RoundSelector selectedIndex={2} selectFrame={80} />
            : feature === 'SEND'
            ? <SendSelector selectedIndex={3} selectFrame={80} />
            : <FunnelSelector selectedIndex={0} selectFrame={80} />
          }
        </PhoneMockup>
      </div>

      {/* Floating badges — positioned absolutely in scene, NOT inside phone zoom */}
      {BADGES.map((badge, i) => {
        const badgeSpring = spring({
          frame: Math.max(0, frame - badge.delay),
          fps,
          config: MOTION.bouncy,
        })
        const badgeScale = interpolate(badgeSpring, [0, 1], [0.3, 1])
        const badgeOpacity = interpolate(frame, [badge.delay, badge.delay + 10], [0, 1], { extrapolateRight: 'clamp' })
        const badgeY = interpolate(badgeSpring, [0, 1], [20, 0])
        // Subtle float animation
        const floatY = Math.sin((frame + i * 40) * 0.06) * 4
        // Pulse for IA badge
        const isPulse = badge.text === 'IA'
        const pulseScale = isPulse ? 1 + Math.sin(frame * 0.12) * 0.06 : 1

        // Position relative to phone center in scene coords
        const cx = phoneCenterX + badge.x
        const cy = phoneCenterY + badge.y

        return (
          <div key={i} style={{
            position: 'absolute',
            left: cx,
            top: cy,
            transform: `translate(-50%, -50%) scale(${badgeScale * pulseScale}) translateY(${badgeY + floatY}px)`,
            opacity: badgeOpacity,
            zIndex: 5,
          }}>
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 14,
              fontWeight: 'bold',
              color: COLORS.text,
              backgroundColor: isPulse ? COLORS.accent : COLORS.surface,
              border: `1.5px solid ${isPulse ? COLORS.accent : COLORS.border}`,
              borderRadius: 8,
              padding: '6px 16px',
              letterSpacing: 2,
              textTransform: 'uppercase',
              boxShadow: isPulse
                ? `0 0 20px ${COLORS.accentGlow}, 0 0 40px ${COLORS.accentGlowSoft}`
                : `0 0 15px rgba(0,0,0,0.4)`,
              ...(isPulse ? { color: '#fff' } : {}),
            }}>
              {badge.text}
            </div>
          </div>
        )
      })}

      {/* SVG arrow lines from badges toward phone */}
      {BADGES.map((badge, i) => {
        const arrowDelay = badge.delay + 15
        const arrowProgress = interpolate(frame, [arrowDelay, arrowDelay + 20], [0, 1], { extrapolateRight: 'clamp' })
        const cx = phoneCenterX + badge.x
        const cy = phoneCenterY + badge.y
        const toX = phoneCenterX
        const toY = phoneCenterY
        const dx = toX - cx
        const dy = toY - cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const normX = dx / len
        const normY = dy / len
        const startX = cx + normX * 50
        const startY = cy + normY * 20
        const endX = cx + normX * (len * 0.45)
        const endY = cy + normY * (len * 0.45)

        return (
          <ArrowLine
            key={`arrow-${i}`}
            fromX={startX}
            fromY={startY}
            toX={endX}
            toY={endY}
            progress={arrowProgress}
          />
        )
      })}

      {/* Subtle scanline overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        pointerEvents: 'none',
        zIndex: 10,
      }} />
    </AbsoluteFill>
  )
}
