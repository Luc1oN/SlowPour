import React from 'react'
import logoSrc from '../../assets/logo.png'

// Black background version — mix-blend-mode: screen makes the black
// transparent against the dark theme, leaving only the white linework
// and amber whiskey visible. No processing needed.
export default function Logo({ className = 'w-56' }) {
  return (
    <img
      src={logoSrc}
      alt="The Slow Pour"
      className={className}
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
