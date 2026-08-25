import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Glencairn } from '../../components/icons/Icons'

const linkClass = ({ isActive }) =>
  [
    'py-2 text-sm tracking-wide transition-colors',
    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
  ].join(' ')

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-6 px-6"
      >
        <Link to="/" className="flex items-center gap-2.5 py-2" aria-label="The Slow Pour — home">
          <Glencairn className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg leading-none text-foreground">The Slow Pour</span>
        </Link>

        <div className="flex items-center gap-5">
          <NavLink to="/events" className={linkClass}>Events</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
        </div>
      </nav>
    </header>
  )
}
