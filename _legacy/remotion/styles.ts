// Design system tokens — emailhacker.ai
export const COLORS = {
  bg: '#0a0a0a',
  surface: '#111111',
  surfaceLight: '#1a1a1a',
  accent: '#ef4444',
  accentDark: '#dc2626',
  accentGlow: 'rgba(239, 68, 68, 0.4)',
  accentGlowSoft: 'rgba(239, 68, 68, 0.15)',
  success: '#16a34a',
  successGlow: 'rgba(22, 163, 74, 0.3)',
  text: '#e5e5e5',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: 'rgba(239, 68, 68, 0.2)',
  gridLine: 'rgba(255, 255, 255, 0.04)',
} as const

export const FONTS = {
  mono: "'SF Mono', 'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, Consolas, 'Courier New', monospace",
} as const

export const SIZES = {
  hero: 64,
  title: 48,
  subtitle: 36,
  body: 24,
  label: 16,
  small: 13,
} as const

// Video specs — 16:9 horizontal
export const VIDEO = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationSec: 30,
} as const

// Scene durations in frames (30fps)
export const SCENES = {
  brand: 3 * VIDEO.fps,      // 3s = 90 frames
  pain: 5 * VIDEO.fps,       // 5s = 150 frames
  feature: 6 * VIDEO.fps,    // 6s = 180 frames
  visual: 8 * VIDEO.fps,     // 8s = 240 frames
  benefit: 5 * VIDEO.fps,    // 5s = 150 frames
  cta: 3 * VIDEO.fps,        // 3s = 90 frames
} as const

export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, b) => a + b, 0)

// Motion design constants
export const MOTION = {
  // Springs com personalidade (organic, with overshoot)
  snappy: { damping: 12, stiffness: 200, mass: 0.7 },    // faster attack, slight overshoot
  bouncy: { damping: 8, stiffness: 120, mass: 0.9 },     // noticeable overshoot
  smooth: { damping: 18, stiffness: 70, mass: 1.3 },     // gentle, organic ease
  heavy:  { damping: 22, stiffness: 50, mass: 1.6 },     // weighty, cinematic
  impact: { damping: 6, stiffness: 250, mass: 0.5 },     // slam/impact effect (big overshoot)
  // Duracoes padrao em frames
  fadeIn: 8,        // ~0.27s
  fadeOut: 6,       // ~0.2s
  stagger: 4,       // ~0.13s delay entre items
  crossfade: 9,     // ~0.3s overlap entre cenas
  typewriterChar: 1, // 1 frame por char = rapido
  // Apple/Linear style cubic bezier reference (for CSS, not Remotion springs)
  EASING_APPLE: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const
