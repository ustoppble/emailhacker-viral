import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface DecliningGraphProps {
  width?: number
  height?: number
  color?: string
  delay?: number
}

export const DecliningGraph: React.FC<DecliningGraphProps> = ({
  width = 400,
  height = 200,
  color = '#f59e0b',
  delay = 0,
}) => {
  const frame = useCurrentFrame()
  const draw = interpolate(frame - delay, [0, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const points = [
    [0, 30],
    [60, 40],
    [120, 55],
    [180, 80],
    [240, 110],
    [300, 150],
    [360, 175],
    [400, 190],
  ]

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ')
  const totalLength = 600

  return (
    <svg width={width} height={height} style={{ opacity: 0.15 }}>
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray={totalLength}
        strokeDashoffset={totalLength * (1 - draw)}
      />
    </svg>
  )
}
