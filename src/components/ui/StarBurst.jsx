import React, { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export function triggerStarBurst() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'],
    shapes: ['star', 'circle'],
  })
}

export default function StarBurst({ trigger }) {
  const ran = useRef(false)
  useEffect(() => {
    if (trigger && !ran.current) {
      ran.current = true
      triggerStarBurst()
    }
    if (!trigger) ran.current = false
  }, [trigger])
  return null
}
