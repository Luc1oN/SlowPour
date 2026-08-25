import React from 'react'
import { Link } from 'react-router-dom'

function InstagramIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-border/40 px-6 py-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <a
          href="https://instagram.com/slowpour.ie"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <InstagramIcon />
          @slowpour.ie
        </a>

        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground/60">
          Over 18s only. Please enjoy what's in the glass responsibly — there's never
          any pressure to finish a pour, and there's always water on the table.{' '}
          <a
            href="https://www.drinkaware.ie"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-muted-foreground/30 underline-offset-2 hover:text-muted-foreground"
          >
            drinkaware.ie
          </a>
        </p>

        <div className="flex flex-col items-center gap-3 pt-2">
          <p className="text-xs text-muted-foreground/50">
            The Slow Pour · Cork, Ireland
          </p>
          <Link
            to="/app"
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            Guest app
          </Link>
        </div>
      </div>
    </footer>
  )
}
