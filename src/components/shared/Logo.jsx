import React from 'react'
import logoSrc from '../../assets/logo.png'

export default function Logo({ className = 'w-56' }) {
  return (
    <img
      src={logoSrc}
      alt="The Slow Pour"
      className={className}
    />
  )
}
