import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface RingSVGProps {
  size?: number
  strokeWidth?: number
  color?: string
  progress: number // 0-1
  delay?: number
  duration?: number
}

export const RingSVG: React.FC<RingSVGProps> = ({
  size = 80,
  strokeWidth = 4,
  color = '#ef4444',
  progress,
  delay = 0,
  duration = 60,
}) => {
  const frame = useCurrentFrame()
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const animatedProgress = interpolate(frame - delay, [0, duration], [0, progress], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const offset = circumference * (1 - animatedProgress)

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}
