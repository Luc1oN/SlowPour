import React from 'react'
import { Glencairn } from '../../components/icons/Icons'

// This is the normal state, not an error state. It runs about one night a
// quarter, so an empty diary is what most visitors will see — it's designed
// to be a proper part of the site rather than an apology.
export default function NothingScheduled({ compact = false }) {
  return (
    <div className={`text-center ${compact ? 'py-6' : 'py-10'}`}>
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-border/60 bg-card/40 text-primary/70">
        <Glencairn className="h-7 w-7" />
      </div>

      <p className="font-heading text-2xl text-foreground sm:text-3xl">
        Nothing in the diary yet
      </p>

      <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
        The next one's still being planned. There's usually about one a quarter, so
        the list below is the way to hear about it before it fills.
      </p>
    </div>
  )
}
