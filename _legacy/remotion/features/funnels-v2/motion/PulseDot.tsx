import React from 'react'
import { useCurrentFrame } from 'remotion'

interface PulseDotProps {
  size?: number
  color?: string
}

export const PulseDot: React.FC<PulseDotProps> = ({
  size = 8,
  color = '#ef4444',
}) => {
  const frame = useCurrentFrame()
  const scale = 1 + Math.sin(frame * 0.12) * 0.06

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        transform: `scale(${scale})`,
        boxShadow: `0 0 ${size * 2}px ${color}`,
      }}
    />
  )
}
