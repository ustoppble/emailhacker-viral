/**
 * Design tokens do EmailHacker — fonte de verdade pra todos os componentes.
 * Baseado no VIDEO-DESIGN-SYSTEM.md + styles do projeto principal.
 */

export const COLORS = {
  bg: '#0a0a0a',
  surface: '#111111',
  surfaceLight: '#1a1a1a',
  accent: '#ef4444',
  success: '#16a34a',
  text: '#e5e5e5',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  border: 'rgba(239, 68, 68, 0.2)',
  borderSubtle: 'rgba(255, 255, 255, 0.06)',
  caption: '#facc15',
  diffAdd: '#16a34a',
  diffAddBg: 'rgba(22, 163, 106, 0.12)',
  diffRemove: '#ef4444',
  diffRemoveBg: 'rgba(239, 68, 68, 0.12)',
} as const

export const FONTS = {
  mono: 'SF Mono, Fira Code, JetBrains Mono, Menlo, monospace',
} as const

export const SIZES = {
  hero: 64,
  title: 48,
  subtitle: 36,
  body: 24,
  label: 16,
  small: 13,
  micro: 11,
} as const

export const SPRINGS = {
  snappy: { damping: 12, stiffness: 200, mass: 0.7 },
  bouncy: { damping: 8, stiffness: 120, mass: 0.9 },
  smooth: { damping: 18, stiffness: 70, mass: 1.3 },
  heavy: { damping: 22, stiffness: 50, mass: 1.6 },
  impact: { damping: 6, stiffness: 250, mass: 0.5 },
} as const
