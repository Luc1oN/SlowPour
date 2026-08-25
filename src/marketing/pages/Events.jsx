import React from 'react'
import GoldDivider from '../../components/shared/GoldDivider'
import Reveal from '../components/Reveal'
import EventCard from '../components/EventCard'
import NothingScheduled from '../components/NothingScheduled'
import { useEvents } from '../useEvents'
import { useTitle } from '../useTitle'

export default function Events() {
  const { upcoming, past, loading } = useEvents()
  useTitle('Events — The Slow Pour', 'Upcoming and past tasting nights from The Slow Pour, in Cork.')

  return (
    <>
      <section className="candle-glow px-6 pb-16 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-heading text-4xl text-foreground sm:text-5xl">Events</h1>
          <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Roughly one a quarter, in Cork. Small rooms and small numbers, so they don't
            take long to fill.
          </p>
        </div>
      </section>

      {/* ── Upcoming ─────────────────────────────────────── */}
      <section className="border-t border-border/40 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl text-foreground">Coming up</h2>
            <GoldDivider />
          </Reveal>

          <Reveal>
            {loading ? (
              <div className="h-40 rounded-2xl border border-border/40 bg-card/30" aria-hidden="true" />
            ) : upcoming.length > 0 ? (
              <div className="space-y-6">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <NothingScheduled />
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Past ─────────────────────────────────────────── */}
      {!loading && past.length > 0 && (
        <section className="border-t border-border/40 px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <Reveal className="text-center">
              <h2 className="font-heading text-3xl text-foreground">
                {past.length === 1 ? 'The one that’s been' : 'Previously'}
              </h2>
              <GoldDivider />
            </Reveal>

            <div className="space-y-6">
              {past.map((event, i) => (
                <Reveal key={event.id}>
                  <EventCard event={event} past />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
