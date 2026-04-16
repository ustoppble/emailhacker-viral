import React from 'react'
import { useCurrentFrame, interpolate } from 'remotion'

interface CountUpProps {
  from?: number
  to: number
  delay?: number
  duration?: number
  prefix?: string
  suffix?: string
  style?: React.CSSProperties
}

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  delay = 0,
  duration = 40,
  prefix = '',
  suffix = '',
  style,
}) => {
  const frame = useCurrentFrame()
  const value = interpolate(frame - delay, [0, duration], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return <span style={style}>{prefix}{Math.round(value)}{suffix}</span>
}
