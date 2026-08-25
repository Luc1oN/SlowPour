import React from 'react'
import { formatEventDate, formatPrice } from '../../api/events'

function CategoryTag({ children }) {
  if (!children) return null
  return (
    <span className="inline-block rounded-full border border-primary/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
      {children}
    </span>
  )
}

function Lineup({ lineup }) {
  const items = (lineup || '').split('\n').map((s) => s.trim()).filter(Boolean)
  if (!items.length) return null

  return (
    <div className="pt-2">
      <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
        What was poured
      </p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 text-sm text-foreground/85">
            <span aria-hidden="true" className="mt-[0.55rem] h-1 w-1 flex-shrink-0 rounded-full bg-primary/50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Quiet facts that only render if they exist — a blank column in the
// dashboard should never leave an empty label on the page.
function Facts({ event }) {
  const bits = [
    event.venue,
    event.start_time,
    formatPrice(event.price) && `${formatPrice(event.price)} a head`,
    event.capacity && `${event.capacity} people`,
  ].filter(Boolean)

  if (!bits.length) return null

  return (
    <p className="text-sm text-muted-foreground">
      {bits.join(' · ')}
    </p>
  )
}

export default function EventCard({ event, past = false }) {
  return (
    <article
      className={`rounded-2xl border border-border/60 bg-card/50 p-6 sm:p-8 ${past ? 'opacity-95' : 'shadow-warm'}`}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryTag>{event.category}</CategoryTag>
          {event.sold_out && !past && (
            <span className="rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Sold out
            </span>
          )}
        </div>

        <div>
          <p className="font-heading text-xl text-primary">
            {formatEventDate(event.event_date)}
          </p>
          <h3 className="font-heading text-3xl leading-tight text-foreground sm:text-4xl">
            {event.title}
          </h3>
        </div>

        <Facts event={event} />

        {event.description && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {event.description}
          </p>
        )}

        <Lineup lineup={event.lineup} />

        {!past && event.booking_url && !event.sold_out && (
          <div className="pt-3">
            <a
              href={event.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-xl bg-primary px-6 py-3 font-heading text-lg font-semibold
                         text-primary-foreground shadow-warm transition-all hover:bg-primary/90 active:scale-[0.99]"
            >
              Book a place
            </a>
          </div>
        )}

        {!past && !event.booking_url && !event.sold_out && (
          <p className="pt-2 text-sm text-muted-foreground">
            Booking isn't open yet.{' '}
            <a href="#signup" className="text-primary underline decoration-primary/30 underline-offset-4">
              Join the list
            </a>{' '}
            and you'll be told first.
          </p>
        )}
      </div>
    </article>
  )
}
