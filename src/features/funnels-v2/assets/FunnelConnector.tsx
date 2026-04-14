import React from 'react'
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'

interface FunnelConnectorProps {
  height?: number
  color?: string
  delay?: number
  drawDuration?: number
}

export const FunnelConnector: React.FC<FunnelConnectorProps> = ({
  height = 24,
  color = 'rgba(239, 68, 68, 0.3)',
  delay = 0,
  drawDuration = 12,
}) => {
  const frame = useCurrentFrame()
  const progress = interpolate(frame - delay, [0, drawDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <svg width={2} height={height} style={{ display: 'block', margin: '0 auto' }}>
      <line
        x1={1}
        y1={0}
        x2={1}
        y2={height}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={height}
        strokeDashoffset={height * (1 - progress)}
      />
    </svg>
  )
}
