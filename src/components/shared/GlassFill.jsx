import React, { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

// ─────────────────────────────────────────────────────────
// THE POUR — the app's signature element.
// A glencairn glass that fills with amber to a percentage.
// Used for leaderboard scores, progress, and the submit moment.
// ─────────────────────────────────────────────────────────

const BOWL = 'M9 3h14c0 6.5 3.5 9 3.5 14 0 7-4.6 11.5-10.5 11.5S5.5 24 5.5 17C5.5 12 9 9.5 9 3z'

export default function GlassFill({
  pct = 0,                 // 0–100
  className = 'w-10 h-14',
  delay = 0,
  showShine = true,
}) {
  const id = useId().replace(/:/g, '')
  const reduce = useReducedMotion()
  const clamped = Math.max(0, Math.min(100, pct))
  // liquid occupies the bowl between y=6 (full) and y=28 (empty)
  const topY = 28 - (clamped / 100) * 22

  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`amber-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(42 75% 60%)" />
          <stop offset="100%" stopColor="hsl(30 70% 38%)" />
        </linearGradient>
        <clipPath id={`bowl-${id}`}>
          <path d={BOWL} />
        </clipPath>
      </defs>

      {/* liquid */}
      <g clipPath={`url(#bowl-${id})`}>
        <motion.rect
          x="0"
          width="32"
          height="40"
          fill={`url(#amber-${id})`}
          initial={reduce ? { y: topY } : { y: 30 }}
          animate={{ y: topY }}
          transition={{ duration: reduce ? 0 : 1.1, delay, ease: [0.34, 0.9, 0.4, 1] }}
        />
        {/* meniscus shine */}
        {showShine && clamped > 4 && (
          <motion.rect
            x="0"
            width="32"
            height="1.1"
            fill="hsl(45 85% 75% / 0.55)"
            initial={reduce ? { y: topY } : { y: 30 }}
            animate={{ y: topY }}
            transition={{ duration: reduce ? 0 : 1.1, delay, ease: [0.34, 0.9, 0.4, 1] }}
          />
        )}
      </g>

      {/* glass outline */}
      <path d={BOWL} fill="hsl(38 62% 55% / 0.05)" stroke="hsl(38 40% 50% / 0.75)" strokeWidth="1.3" />
      <path d="M16 28.5V33" stroke="hsl(38 40% 50% / 0.75)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 35h10" stroke="hsl(38 40% 50% / 0.75)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

/** Horizontal liquid bar — pour laid on its side, for split votes */
export function PourBar({ pct = 0, className = 'h-1.5 flex-1', delay = 0 }) {
  const reduce = useReducedMotion()
  return (
    <div className={`${className} bg-secondary rounded-full overflow-hidden relative`}>
      <motion.div
        className="h-full rounded-full relative"
        style={{ background: 'linear-gradient(90deg, hsl(30 70% 40%), hsl(42 75% 58%))' }}
        initial={reduce ? { width: `${pct}%` } : { width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduce ? 0 : 0.9, delay, ease: [0.34, 0.9, 0.4, 1] }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-px bg-[hsl(45_85%_78%/0.7)]" />
      </motion.div>
    </div>
  )
}
