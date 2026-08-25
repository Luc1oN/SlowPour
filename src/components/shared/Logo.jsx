import React from 'react'
import logoSrc from '../../assets/logo.webp'

// WebP at the size it's actually displayed — the original PNG was 482 KB
// for something that never renders above 240px. logo.png is kept in the
// repo as the source file; nothing imports it, so it isn't shipped.
export default function Logo({ className = 'w-56' }) {
  return (
    <img
      src={logoSrc}
      alt="The Slow Pour"
      width={768}
      height={768}
      className={className}
    />
  )
}
