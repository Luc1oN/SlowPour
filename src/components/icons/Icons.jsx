import React from 'react'

// ─────────────────────────────────────────────────────────
// The Slow Pour icon set — replaces emoji throughout.
// Consistent 1.5 stroke, designed for the candlelight theme.
// ─────────────────────────────────────────────────────────

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

/** Glencairn tasting glass */
export function Glencairn({ className = 'w-5 h-5', filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 3h8c0 4 1.5 5.5 1.5 8.5 0 3.5-2.2 6-5.5 6s-5.5-2.5-5.5-6C6.5 8.5 8 7 8 3z" fill={filled ? 'currentColor' : 'none'} fillOpacity={filled ? 0.25 : 0} />
      <path d="M12 17.5V20" />
      <path d="M8.5 21h7" />
      {filled && <path d="M7.1 10.5h9.8" strokeWidth="0" fill="currentColor" fillOpacity="0.0" />}
    </svg>
  )
}

/** Decanter — for the mystery dram */
export function Decanter({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M10 3h4" />
      <path d="M10.5 3v3.5L7 11c-1.2 1.6-1.5 3-1.5 4.5C5.5 19 8 21 12 21s6.5-2 6.5-5.5c0-1.5-.3-2.9-1.5-4.5l-3.5-4.5V3" />
      <path d="M7.2 14h9.6" />
    </svg>
  )
}

/** Pocket watch — breaks, taking it slow */
export function PocketWatch({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 9.5v4l2.6 1.6" />
      <path d="M10 3.5h4M12 3.5v3" />
    </svg>
  )
}

/** Wax seal — the mystery, sealed until revealed */
export function WaxSeal({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M12 3.5c1 0 1.6 1 2.7 1s1.7-.8 2.7-.4c1 .4.9 1.6 1.7 2.3.8.8 2 .7 2.3 1.7.4 1-.4 1.7-.4 2.7s.8 1.7.4 2.7c-.3 1-1.5.9-2.3 1.7-.8.7-.7 1.9-1.7 2.3-1 .4-1.6-.4-2.7-.4s-1.7 1-2.7 1-1.6-1-2.7-1-1.7.8-2.7.4c-1-.4-.9-1.6-1.7-2.3-.8-.8-2-.7-2.3-1.7-.4-1 .4-1.7.4-2.7s-.8-1.7-.4-2.7c.3-1 1.5-.9 2.3-1.7.8-.7.7-1.9 1.7-2.3 1-.4 1.6.4 2.7.4s1.7-1 2.7-1z" />
      <path d="M9.8 13.8c0-2.6 4.4-2.4 4.4-4.6 0-1-.9-1.7-2.2-1.7-1.2 0-2 .6-2.3 1.4M12 16.8v.2" strokeWidth="1.3" />
    </svg>
  )
}

/** Laurel trophy — final results */
export function Laurel({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <path d="M8 4h8v5a4 4 0 01-8 0V4z" />
      <path d="M8 5.5H5.5a0 0 0 000 0c0 2.5 1 4 2.5 4.5M16 5.5h2.5c0 2.5-1 4-2.5 4.5" />
      <path d="M12 13v4M9 20h6M12 17c-1.5 0-2.5 1-3 3M12 17c1.5 0 2.5 1 3 3" />
    </svg>
  )
}

/** Pass — a polite decline */
export function PassMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 18L18 6" />
    </svg>
  )
}

/** Engraved rank badge — replaces medal emoji */
export function RankBadge({ rank, className = 'w-8 h-8' }) {
  const tones = {
    1: { ring: 'hsl(40 70% 58%)', fill: 'hsl(40 60% 50% / 0.18)', text: 'hsl(42 80% 70%)' },
    2: { ring: 'hsl(36 8% 62%)',  fill: 'hsl(36 8% 55% / 0.14)',  text: 'hsl(36 10% 78%)' },
    3: { ring: 'hsl(25 45% 45%)', fill: 'hsl(25 45% 40% / 0.16)', text: 'hsl(25 55% 62%)' },
  }
  const t = tones[rank] || { ring: 'hsl(28 20% 28%)', fill: 'transparent', text: 'hsl(33 12% 62%)' }
  return (
    <svg viewBox="0 0 36 36" className={className}>
      <circle cx="18" cy="18" r="15.5" fill={t.fill} stroke={t.ring} strokeWidth="1.4" />
      <circle cx="18" cy="18" r="12.5" fill="none" stroke={t.ring} strokeWidth="0.6" opacity="0.5" />
      <text x="18" y="24" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontWeight="600" fontSize="17" fill={t.text}>{rank}</text>
    </svg>
  )
}
