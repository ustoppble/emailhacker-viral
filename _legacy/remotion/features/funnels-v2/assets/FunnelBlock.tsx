import React from 'react'
import { COLORS, FONTS } from '../../../styles'

interface FunnelBlockProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  variant?: 'default' | 'email' | 'wait' | 'goal'
  width?: number
}

const VARIANT_COLORS = {
  default: { border: 'rgba(239, 68, 68, 0.3)', bg: '#111111' },
  email: { border: 'rgba(239, 68, 68, 0.4)', bg: '#111111' },
  wait: { border: 'rgba(107, 114, 128, 0.3)', bg: '#0d0d0d' },
  goal: { border: 'rgba(22, 163, 74, 0.4)', bg: '#111111' },
}

export const FunnelBlock: React.FC<FunnelBlockProps> = ({
  icon,
  label,
  sublabel,
  variant = 'default',
  width = 280,
}) => {
  const colors = VARIANT_COLORS[variant]
  return (
    <div
      style={{
        width,
        padding: '10px 16px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: FONTS.mono,
      }}
    >
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{label}</div>
        {sublabel && (
          <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 2 }}>{sublabel}</div>
        )}
      </div>
    </div>
  )
}
