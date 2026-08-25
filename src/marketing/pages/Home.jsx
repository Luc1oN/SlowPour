import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../components/shared/Logo'
import GoldDivider from '../../components/shared/GoldDivider'
import { Glencairn, Decanter, PocketWatch, Laurel } from '../../components/icons/Icons'
import Reveal from '../components/Reveal'
import EventCard from '../components/EventCard'
import NothingScheduled from '../components/NothingScheduled'
import { useEvents } from '../useEvents'
import { useTitle } from '../useTitle'

const BEATS = [
  {
    icon: Glencairn,
    title: 'You sit down to a set of glasses',
    body: "Small group, one table, everything poured and waiting. No queue, no standing around, no one handing you a clipboard.",
  },
  {
    icon: Decanter,
    title: "Someone tells you what's in them",
    body: "Where it came from, why it's in the lineup, and what's worth noticing. In plain English — nobody says the words oak and leather all evening.",
  },
  {
    icon: PocketWatch,
    title: "There's a break in the middle",
    body: "Something to eat, a chance to talk, and then back round the table to revisit the ones that stuck with you.",
  },
  {
    icon: Laurel,
    title: 'You score them, and one wins',
    body: "Everyone rates what they've tried on their phone and the room picks a favourite. It's rarely the one people expect.",
  },
]

export default function Home() {
  const { upcoming, loading } = useEvents()
  useTitle(
    'The Slow Pour — tasting nights in Cork',
    "Guided tasting nights in Cork. You don't dislike it. You just haven't been poured the right one.",
  )

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="candle-glow px-6 pb-20 pt-14 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rise mb-9 flex justify-center">
            <Logo className="w-44 sm:w-60" />
          </div>

          <h1 className="rise rise-1 font-heading text-4xl leading-[1.15] text-foreground sm:text-5xl">
            You don't dislike it.
            <span className="mt-2 block text-primary">
              You just haven't been poured the right one.
            </span>
          </h1>

          <p className="rise rise-2 mx-auto mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
            Guided tasting nights in Cork, for people who are curious rather than expert.
            A few glasses, someone to talk you through them, and nobody testing you.
          </p>

          <div className="rise rise-3 mt-9 flex flex-col items-center gap-5">
            <a
              href="#signup"
              className="w-full max-w-xs rounded-xl bg-primary px-8 py-4 font-heading text-xl font-semibold
                         text-primary-foreground shadow-warm-lg transition-all hover:bg-primary/90 active:scale-[0.99]"
            >
              Join the list
            </a>
            <Link
              to="/events"
              className="text-sm text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:text-foreground"
            >
              See what's been poured
            </Link>
          </div>
        </div>
      </section>

      {/* ── What a night is actually like ────────────────── */}
      <section className="border-t border-border/40 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl text-foreground sm:text-4xl">
              What a night actually looks like
            </h2>
            <GoldDivider />
          </Reveal>

          <div className="mt-4 space-y-12">
            {BEATS.map((beat, i) => {
              const Icon = beat.icon
              return (
                <Reveal key={beat.title}>
                  <div className="flex gap-5">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/50 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="pt-1.5">
                      <h3 className="font-heading text-2xl leading-tight text-foreground">
                        {beat.title}
                      </h3>
                      <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                        {beat.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <Reveal>
            <p className="mt-14 text-center font-heading text-2xl leading-snug text-foreground/90">
              By the end you'll know which one was yours.
              <span className="block text-muted-foreground">That's the whole point.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Where this is up to. Honest, on purpose. ─────── */}
      <section className="border-t border-border/40 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.3em] text-primary">One night in</p>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              The first one ran in Cobh in August 2026 — twelve people, four whiskeys and a
              charcuterie board in the middle. That's the entire history so far. This is early,
              which is rather the point: you'd be getting in near the start.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Next event ───────────────────────────────────── */}
      <section className="border-t border-border/40 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <Reveal className="text-center">
            <h2 className="font-heading text-3xl text-foreground sm:text-4xl">What's next</h2>
            <GoldDivider />
          </Reveal>

          <Reveal>
            {loading ? (
              <div className="h-40 rounded-2xl border border-border/40 bg-card/30" aria-hidden="true" />
            ) : upcoming.length > 0 ? (
              <div className="space-y-6">
                {upcoming.slice(0, 2).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                {upcoming.length > 2 && (
                  <p className="text-center">
                    <Link to="/events" className="text-sm text-primary underline decoration-primary/30 underline-offset-4">
                      See all {upcoming.length} nights
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <NothingScheduled />
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
