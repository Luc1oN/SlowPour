import React from 'react'

// ─────────────────────────────────────────────────────────
// The Slow Pour wordmark — lives in the repo, no external CDN.
// To use your own logo image instead: drop logo.png into
// src/assets/ and swap this component's contents for
//   <img src={logo} alt="The Slow Pour" className={className} />
// ─────────────────────────────────────────────────────────

export default function Logo({ className = 'w-56' }) {
  return (
    <svg viewBox="0 0 320 150" className={className} role="img" aria-label="The Slow Pour">
      {/* pour stream into glass */}
      <g stroke="hsl(38 62% 55%)" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* tilted bottle neck hint */}
        <path d="M138 8 l14 7" opacity="0.85" />
        <path d="M136 12 l13 6.5" opacity="0.85" />
        {/* the slow stream */}
        <path d="M152 17 C 156 26, 158 32, 159 40" strokeWidth="1.2" opacity="0.9" />
        <circle cx="159.4" cy="45" r="0.9" fill="hsl(38 62% 55%)" stroke="none" opacity="0.8" />
        {/* glencairn */}
        <path d="M150 44 h19 c0 7 3 9.5 3 14.5 0 6.5-4.2 10.5-12.5 10.5 S147 65 147 58.5 c0-5 3-7.5 3-14.5z" />
        <path d="M159.5 69 v4 M153 75 h13" />
        {/* liquid line */}
        <path d="M149.4 56 h20.2" strokeWidth="1.1" opacity="0.75" />
      </g>
      {/* wordmark */}
      <text x="160" y="108" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontWeight="600" fontSize="34" letterSpacing="6" fill="hsl(36 30% 92%)">THE SLOW POUR</text>
      <g stroke="hsl(38 62% 55% / 0.5)" strokeWidth="1">
        <line x1="40" y1="124" x2="138" y2="124" />
        <line x1="182" y1="124" x2="280" y2="124" />
      </g>
      <circle cx="160" cy="124" r="1.8" fill="hsl(38 62% 55% / 0.7)" />
      <text x="160" y="141" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="9" letterSpacing="4.5" fill="hsl(33 12% 62%)">WHISKEY TASTING NIGHTS</text>
    </svg>
  )
}
